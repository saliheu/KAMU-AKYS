from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime
from django.http import HttpResponse
import openpyxl
from io import BytesIO
from apps.books.models import Book, BookCopy, Category, Author, Publisher
from apps.members.models import Member
from apps.loans.models import Loan, Fine, Reservation


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    today = timezone.now().date()
    
    stats = {
        'books': {
            'total': Book.objects.count(),
            'total_copies': BookCopy.objects.count(),
            'available_copies': BookCopy.objects.filter(status='AVAILABLE').count(),
            'categories': Category.objects.count(),
            'authors': Author.objects.count(),
            'publishers': Publisher.objects.count(),
        },
        'members': {
            'total': Member.objects.count(),
            'active': Member.objects.filter(status='ACTIVE').count(),
            'suspended': Member.objects.filter(status='SUSPENDED').count(),
            'expired': Member.objects.filter(status='EXPIRED').count(),
            'new_this_month': Member.objects.filter(
                registration_date__gte=today - timedelta(days=30)
            ).count(),
        },
        'loans': {
            'active': Loan.objects.filter(status__in=['BORROWED', 'OVERDUE']).count(),
            'overdue': Loan.objects.filter(status='OVERDUE').count(),
            'today': Loan.objects.filter(borrowed_date__date=today).count(),
            'returns_today': Loan.objects.filter(returned_date__date=today).count(),
            'this_month': Loan.objects.filter(
                borrowed_date__gte=today - timedelta(days=30)
            ).count(),
        },
        'fines': {
            'total_amount': Fine.objects.aggregate(total=Sum('amount'))['total'] or 0,
            'unpaid_amount': Fine.objects.filter(paid=False).aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'unpaid_count': Fine.objects.filter(paid=False).count(),
        },
        'reservations': {
            'active': Reservation.objects.filter(status='ACTIVE').count(),
            'today': Reservation.objects.filter(reserved_date__date=today).count(),
        }
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def loan_report(request):
    """Generate loan report"""
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    loans = Loan.objects.all()
    
    if date_from:
        loans = loans.filter(borrowed_date__date__gte=date_from)
    if date_to:
        loans = loans.filter(borrowed_date__date__lte=date_to)
    
    # Group by status
    status_summary = loans.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Group by member type
    member_type_summary = loans.values(
        'member__member_type'
    ).annotate(
        count=Count('id')
    ).order_by('member__member_type')
    
    # Daily loan trends
    daily_loans = loans.values('borrowed_date__date').annotate(
        loans=Count('id')
    ).order_by('borrowed_date__date')
    
    # Most borrowed books
    popular_books = Book.objects.filter(
        copies__loans__in=loans
    ).annotate(
        loan_count=Count('copies__loans')
    ).order_by('-loan_count')[:10].values(
        'title', 'isbn', 'loan_count'
    )
    
    # Top borrowers
    top_borrowers = Member.objects.filter(
        loans__in=loans
    ).annotate(
        loan_count=Count('loans')
    ).order_by('-loan_count')[:10].values(
        'member_id', 'first_name', 'last_name', 'loan_count'
    )
    
    return Response({
        'summary': {
            'total_loans': loans.count(),
            'active_loans': loans.filter(status__in=['BORROWED', 'OVERDUE']).count(),
            'returned_loans': loans.filter(status='RETURNED').count(),
            'overdue_loans': loans.filter(status='OVERDUE').count(),
        },
        'status_summary': list(status_summary),
        'member_type_summary': list(member_type_summary),
        'daily_loans': list(daily_loans),
        'popular_books': list(popular_books),
        'top_borrowers': list(top_borrowers),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_report(request):
    """Generate inventory report"""
    # Book statistics by category
    category_stats = Category.objects.annotate(
        book_count=Count('books'),
        total_copies=Count('books__copies'),
        available_copies=Count(
            'books__copies',
            filter=Q(books__copies__status='AVAILABLE')
        )
    ).values(
        'name', 'book_count', 'total_copies', 'available_copies'
    ).order_by('-book_count')
    
    # Book statistics by language
    language_stats = Book.objects.values('language').annotate(
        count=Count('id'),
        total_copies=Count('copies'),
        available_copies=Count('copies', filter=Q(copies__status='AVAILABLE'))
    ).order_by('-count')
    
    # Book statistics by publisher
    publisher_stats = Publisher.objects.annotate(
        book_count=Count('books'),
        total_copies=Count('books__copies')
    ).values(
        'name', 'book_count', 'total_copies'
    ).order_by('-book_count')[:20]
    
    # Copy status distribution
    copy_status = BookCopy.objects.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Books by publication year
    year_stats = Book.objects.values('publication_year').annotate(
        count=Count('id')
    ).order_by('-publication_year')[:20]
    
    return Response({
        'summary': {
            'total_books': Book.objects.count(),
            'total_copies': BookCopy.objects.count(),
            'available_copies': BookCopy.objects.filter(status='AVAILABLE').count(),
            'borrowed_copies': BookCopy.objects.filter(status='BORROWED').count(),
            'lost_copies': BookCopy.objects.filter(status='LOST').count(),
            'damaged_copies': BookCopy.objects.filter(status='DAMAGED').count(),
        },
        'category_stats': list(category_stats),
        'language_stats': list(language_stats),
        'publisher_stats': list(publisher_stats),
        'copy_status': list(copy_status),
        'year_stats': list(year_stats),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_report(request):
    """Generate member report"""
    # Member statistics by type
    type_stats = Member.objects.values('member_type').annotate(
        count=Count('id'),
        active_count=Count('id', filter=Q(status='ACTIVE'))
    ).order_by('member_type')
    
    # Member statistics by status
    status_stats = Member.objects.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Registration trends (last 12 months)
    today = timezone.now().date()
    registration_trends = []
    for i in range(12):
        month_start = today - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        count = Member.objects.filter(
            registration_date__date__gte=month_start,
            registration_date__date__lt=month_end
        ).count()
        registration_trends.append({
            'month': month_start.strftime('%Y-%m'),
            'count': count
        })
    
    # Members with most loans
    active_borrowers = Member.objects.annotate(
        total_loans=Count('loans'),
        active_loans=Count('loans', filter=Q(loans__status__in=['BORROWED', 'OVERDUE'])),
        overdue_loans=Count('loans', filter=Q(loans__status='OVERDUE'))
    ).filter(
        total_loans__gt=0
    ).order_by('-total_loans')[:20].values(
        'member_id', 'first_name', 'last_name', 'member_type',
        'total_loans', 'active_loans', 'overdue_loans'
    )
    
    # Members with unpaid fines
    members_with_fines = Member.objects.filter(
        fines__paid=False
    ).annotate(
        total_fines=Sum('fines__amount'),
        fine_count=Count('fines')
    ).order_by('-total_fines')[:20].values(
        'member_id', 'first_name', 'last_name', 'total_fines', 'fine_count'
    )
    
    return Response({
        'summary': {
            'total_members': Member.objects.count(),
            'active_members': Member.objects.filter(status='ACTIVE').count(),
            'suspended_members': Member.objects.filter(status='SUSPENDED').count(),
            'expired_members': Member.objects.filter(status='EXPIRED').count(),
        },
        'type_stats': list(type_stats),
        'status_stats': list(status_stats),
        'registration_trends': registration_trends,
        'active_borrowers': list(active_borrowers),
        'members_with_fines': list(members_with_fines),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_report(request):
    """Generate overdue loans report"""
    overdue_loans = Loan.objects.filter(status='OVERDUE').select_related(
        'member', 'book_copy__book'
    )
    
    # Group by days overdue
    overdue_summary = []
    for loan in overdue_loans:
        days = loan.days_overdue
        if days <= 7:
            category = '1-7 gün'
        elif days <= 14:
            category = '8-14 gün'
        elif days <= 30:
            category = '15-30 gün'
        else:
            category = '30+ gün'
        
        overdue_summary.append({
            'member_id': loan.member.member_id,
            'member_name': loan.member.full_name,
            'book_title': loan.book_copy.book.title,
            'isbn': loan.book_copy.book.isbn,
            'borrowed_date': loan.borrowed_date,
            'due_date': loan.due_date,
            'days_overdue': days,
            'category': category,
            'fine_amount': loan.fine_amount,
        })
    
    # Summary by category
    category_summary = {}
    for item in overdue_summary:
        cat = item['category']
        if cat not in category_summary:
            category_summary[cat] = {
                'count': 0,
                'total_fine': 0
            }
        category_summary[cat]['count'] += 1
        category_summary[cat]['total_fine'] += float(item['fine_amount'])
    
    return Response({
        'summary': {
            'total_overdue': len(overdue_loans),
            'total_fine_amount': sum(loan.fine_amount for loan in overdue_loans),
            'category_summary': category_summary,
        },
        'details': overdue_summary,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def popular_books_report(request):
    """Generate popular books report"""
    days = int(request.query_params.get('days', 30))
    limit = int(request.query_params.get('limit', 50))
    
    start_date = timezone.now() - timedelta(days=days)
    
    # Most borrowed books
    popular_books = Book.objects.filter(
        copies__loans__borrowed_date__gte=start_date
    ).annotate(
        loan_count=Count('copies__loans'),
        unique_borrowers=Count('copies__loans__member', distinct=True),
        avg_loan_days=Avg(
            models.F('copies__loans__returned_date') - models.F('copies__loans__borrowed_date')
        )
    ).order_by('-loan_count')[:limit]
    
    result = []
    for book in popular_books:
        result.append({
            'isbn': book.isbn,
            'title': book.title,
            'authors': ', '.join([a.full_name for a in book.authors.all()]),
            'publisher': book.publisher.name,
            'loan_count': book.loan_count,
            'unique_borrowers': book.unique_borrowers,
            'total_copies': book.total_copies,
            'available_copies': book.available_copies,
        })
    
    return Response({
        'period': f'Son {days} gün',
        'books': result,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_report(request, report_type):
    """Export report to Excel"""
    # Create workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    
    if report_type == 'inventory':
        ws.title = 'Envanter Raporu'
        
        # Headers
        headers = ['ISBN', 'Başlık', 'Yazarlar', 'Yayınevi', 'Yıl', 'Dil', 
                  'Toplam Kopya', 'Mevcut Kopya', 'Ödünç', 'Kayıp', 'Hasarlı']
        ws.append(headers)
        
        # Data
        books = Book.objects.all().prefetch_related('authors', 'copies')
        for book in books:
            authors = ', '.join([a.full_name for a in book.authors.all()])
            copies = book.copies.all()
            
            row = [
                book.isbn,
                book.title,
                authors,
                book.publisher.name,
                book.publication_year,
                book.get_language_display(),
                copies.count(),
                copies.filter(status='AVAILABLE').count(),
                copies.filter(status='BORROWED').count(),
                copies.filter(status='LOST').count(),
                copies.filter(status='DAMAGED').count(),
            ]
            ws.append(row)
    
    elif report_type == 'members':
        ws.title = 'Üye Raporu'
        
        # Headers
        headers = ['Üye No', 'Ad', 'Soyad', 'E-posta', 'Telefon', 'Üye Tipi', 
                  'Durum', 'Kayıt Tarihi', 'Bitiş Tarihi', 'Aktif Ödünç', 'Toplam Ödünç']
        ws.append(headers)
        
        # Data
        members = Member.objects.all().annotate(
            active_loans_count=Count('loans', filter=Q(loans__status__in=['BORROWED', 'OVERDUE'])),
            total_loans_count=Count('loans')
        )
        
        for member in members:
            row = [
                member.member_id,
                member.first_name,
                member.last_name,
                member.email,
                member.phone,
                member.get_member_type_display(),
                member.get_status_display(),
                member.registration_date.strftime('%Y-%m-%d'),
                member.expiry_date.strftime('%Y-%m-%d'),
                member.active_loans_count,
                member.total_loans_count,
            ]
            ws.append(row)
    
    elif report_type == 'loans':
        ws.title = 'Ödünç Raporu'
        
        # Headers
        headers = ['Üye No', 'Üye Adı', 'Kitap', 'ISBN', 'Ödünç Tarihi', 
                  'İade Tarihi', 'Teslim Tarihi', 'Durum', 'Gecikme (gün)', 'Ceza']
        ws.append(headers)
        
        # Data
        loans = Loan.objects.all().select_related('member', 'book_copy__book')
        
        for loan in loans:
            row = [
                loan.member.member_id,
                loan.member.full_name,
                loan.book_copy.book.title,
                loan.book_copy.book.isbn,
                loan.borrowed_date.strftime('%Y-%m-%d %H:%M'),
                loan.due_date.strftime('%Y-%m-%d'),
                loan.returned_date.strftime('%Y-%m-%d %H:%M') if loan.returned_date else '-',
                loan.get_status_display(),
                loan.days_overdue if loan.is_overdue else 0,
                float(loan.fine_amount),
            ]
            ws.append(row)
    
    # Create response
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{report_type}_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
    
    return response