from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.books.models import Book
from apps.members.models import Member
from apps.members.serializers import MemberSerializer
from .models import Loan, Reservation, Fine, LoanHistory
from .serializers import (
    LoanSerializer, LoanCreateSerializer, LoanReturnSerializer,
    ReservationSerializer, ReservationCreateSerializer,
    FineSerializer, FinePaymentSerializer,
    LoanHistorySerializer, MemberLoanSummarySerializer
)


class LoanFilter(filters.FilterSet):
    """Loan filter"""
    overdue = filters.BooleanFilter(method='filter_overdue')
    member_search = filters.CharFilter(method='search_member')
    book_search = filters.CharFilter(method='search_book')
    date_from = filters.DateFilter(field_name='borrowed_date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='borrowed_date', lookup_expr='lte')
    
    class Meta:
        model = Loan
        fields = ['status', 'member', 'overdue', 'member_search', 
                 'book_search', 'date_from', 'date_to']
    
    def filter_overdue(self, queryset, name, value):
        if value:
            from django.utils import timezone
            return queryset.filter(
                status__in=['BORROWED', 'OVERDUE'],
                due_date__lt=timezone.now().date()
            )
        return queryset
    
    def search_member(self, queryset, name, value):
        return queryset.filter(
            models.Q(member__first_name__icontains=value) |
            models.Q(member__last_name__icontains=value) |
            models.Q(member__member_id__icontains=value)
        )
    
    def search_book(self, queryset, name, value):
        return queryset.filter(
            models.Q(book_copy__book__title__icontains=value) |
            models.Q(book_copy__book__isbn__icontains=value)
        )


class LoanViewSet(viewsets.ModelViewSet):
    """Loan management viewset"""
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = LoanFilter
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LoanCreateSerializer
        elif self.action == 'return_book':
            return LoanReturnSerializer
        return LoanSerializer
    
    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        """Return borrowed book"""
        loan = self.get_object()
        
        if loan.status == 'RETURNED':
            return Response(
                {'error': 'Kitap zaten iade edilmiş'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(loan, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({'status': 'Kitap başarıyla iade edildi'})
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew loan"""
        loan = self.get_object()
        
        if loan.status != 'BORROWED':
            return Response(
                {'error': 'Sadece ödünç alınmış kitaplar yenilenebilir'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if there are reservations for this book
        if Reservation.objects.filter(
            book=loan.book_copy.book,
            status='ACTIVE'
        ).exists():
            return Response(
                {'error': 'Bu kitap için rezervasyon var, yenilenemez'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extend due date
        from datetime import timedelta
        loan.due_date = loan.due_date + timedelta(days=settings.LOAN_PERIOD_DAYS)
        loan.save()
        
        # Create history
        LoanHistory.objects.create(
            loan=loan,
            action='RENEWED',
            notes=f'Due date extended to {loan.due_date}',
            created_by=request.user
        )
        
        return Response({'status': 'Ödünç süresi yenilendi', 'new_due_date': loan.due_date})
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue loans"""
        overdue_loans = self.filter_queryset(
            self.get_queryset()
        ).filter(status='OVERDUE')
        
        page = self.paginate_queryset(overdue_loans)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(overdue_loans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get loan statistics"""
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        last_month = today - timedelta(days=30)
        
        stats = {
            'total_active_loans': Loan.objects.filter(
                status__in=['BORROWED', 'OVERDUE']
            ).count(),
            'overdue_loans': Loan.objects.filter(status='OVERDUE').count(),
            'loans_today': Loan.objects.filter(
                borrowed_date__date=today
            ).count(),
            'returns_today': Loan.objects.filter(
                returned_date__date=today
            ).count(),
            'loans_last_month': Loan.objects.filter(
                borrowed_date__date__gte=last_month
            ).count(),
            'most_borrowed_books': list(
                Book.objects.annotate(
                    loan_count=models.Count('copies__loans')
                ).order_by('-loan_count')[:5].values('title', 'isbn', 'loan_count')
            ),
            'top_borrowers': list(
                Member.objects.annotate(
                    loan_count=models.Count('loans')
                ).order_by('-loan_count')[:5].values(
                    'member_id', 'first_name', 'last_name', 'loan_count'
                )
            )
        }
        
        return Response(stats)


class ReservationViewSet(viewsets.ModelViewSet):
    """Reservation management viewset"""
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['status', 'member', 'book']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReservationCreateSerializer
        return ReservationSerializer
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel reservation"""
        reservation = self.get_object()
        
        if reservation.status != 'ACTIVE':
            return Response(
                {'error': 'Sadece aktif rezervasyonlar iptal edilebilir'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservation.status = 'CANCELLED'
        reservation.save()
        
        return Response({'status': 'Rezervasyon iptal edildi'})
    
    @action(detail=True, methods=['post'])
    def fulfill(self, request, pk=None):
        """Fulfill reservation"""
        reservation = self.get_object()
        
        if reservation.status != 'ACTIVE':
            return Response(
                {'error': 'Sadece aktif rezervasyonlar karşılanabilir'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if book is available
        available_copy = reservation.book.copies.filter(status='AVAILABLE').first()
        if not available_copy:
            return Response(
                {'error': 'Mevcut kopya yok'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create loan
        loan = Loan.objects.create(
            member=reservation.member,
            book_copy=available_copy,
            borrowed_by=request.user,
            notes=f'Rezervasyon #{reservation.id} karşılandı'
        )
        
        # Update reservation
        reservation.status = 'FULFILLED'
        reservation.fulfilled_date = timezone.now()
        reservation.save()
        
        return Response({
            'status': 'Rezervasyon karşılandı',
            'loan_id': loan.id
        })
    
    @action(detail=False, methods=['get'])
    def queue(self, request):
        """Get reservation queue for a book"""
        book_id = request.query_params.get('book_id')
        if not book_id:
            return Response(
                {'error': 'book_id parametresi gerekli'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservations = Reservation.objects.filter(
            book_id=book_id,
            status='ACTIVE'
        ).order_by('reserved_date')
        
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)


class FineViewSet(viewsets.ModelViewSet):
    """Fine management viewset"""
    queryset = Fine.objects.all()
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['fine_type', 'paid', 'member']
    
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Pay fine"""
        fine = self.get_object()
        
        if fine.paid:
            return Response(
                {'error': 'Ceza zaten ödenmiş'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FinePaymentSerializer(fine, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({'status': 'Ceza ödendi'})
    
    @action(detail=False, methods=['get'])
    def unpaid(self, request):
        """Get unpaid fines"""
        unpaid_fines = self.filter_queryset(
            self.get_queryset()
        ).filter(paid=False)
        
        # Group by member if requested
        group_by_member = request.query_params.get('group_by_member', False)
        
        if group_by_member:
            from django.db.models import Sum
            member_fines = unpaid_fines.values(
                'member__id', 'member__member_id',
                'member__first_name', 'member__last_name'
            ).annotate(
                total_amount=Sum('amount'),
                fine_count=models.Count('id')
            ).order_by('-total_amount')
            
            return Response(list(member_fines))
        
        page = self.paginate_queryset(unpaid_fines)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(unpaid_fines, many=True)
        return Response(serializer.data)


class MemberLoanSummaryView(viewsets.GenericViewSet):
    """Member loan summary view"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='member/(?P<member_id>[^/.]+)')
    def summary(self, request, member_id=None):
        """Get member loan summary"""
        from apps.members.models import Member
        from django.db.models import Sum
        
        try:
            member = Member.objects.get(
                models.Q(id=member_id) | models.Q(member_id=member_id)
            )
        except Member.DoesNotExist:
            return Response(
                {'error': 'Üye bulunamadı'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        active_loans = member.loans.filter(status__in=['BORROWED', 'OVERDUE'])
        overdue_loans = member.loans.filter(status='OVERDUE')
        
        total_fines = member.fines.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        unpaid_fines = member.fines.filter(paid=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        data = {
            'member': MemberSerializer(member).data,
            'active_loans': LoanSerializer(active_loans, many=True).data,
            'overdue_loans': LoanSerializer(overdue_loans, many=True).data,
            'total_fines': total_fines,
            'unpaid_fines': unpaid_fines,
            'loan_history_count': member.loans.count(),
            'can_borrow': member.can_borrow,
            'max_loans': settings.MAX_LOANS_PER_MEMBER
        }
        
        return Response(data)