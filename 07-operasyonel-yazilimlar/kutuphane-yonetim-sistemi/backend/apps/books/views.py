from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import models
from .models import Category, Publisher, Author, Book, BookCopy
from .serializers import (
    CategorySerializer, PublisherSerializer, AuthorSerializer,
    BookSerializer, BookListSerializer, BookSearchSerializer,
    BookCopySerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """Category management viewset"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['parent']
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get category tree"""
        root_categories = Category.objects.filter(parent=None)
        
        def get_children(category):
            data = CategorySerializer(category).data
            children = category.children.all()
            if children:
                data['children'] = [get_children(child) for child in children]
            return data
        
        tree_data = [get_children(cat) for cat in root_categories]
        return Response(tree_data)


class PublisherViewSet(viewsets.ModelViewSet):
    """Publisher management viewset"""
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    search_fields = ['name']


class AuthorViewSet(viewsets.ModelViewSet):
    """Author management viewset"""
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    search_fields = ['first_name', 'last_name']
    
    @action(detail=True, methods=['get'])
    def books(self, request, pk=None):
        """Get author's books"""
        author = self.get_object()
        books = author.books.all()
        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)


class BookFilter(filters.FilterSet):
    """Book filter"""
    search = filters.CharFilter(method='search_books')
    year_min = filters.NumberFilter(field_name='publication_year', lookup_expr='gte')
    year_max = filters.NumberFilter(field_name='publication_year', lookup_expr='lte')
    available = filters.BooleanFilter(method='filter_available')
    
    class Meta:
        model = Book
        fields = ['search', 'language', 'publisher', 'categories', 'authors',
                 'year_min', 'year_max', 'available']
    
    def search_books(self, queryset, name, value):
        return queryset.filter(
            models.Q(title__icontains=value) |
            models.Q(isbn__icontains=value) |
            models.Q(authors__first_name__icontains=value) |
            models.Q(authors__last_name__icontains=value) |
            models.Q(publisher__name__icontains=value) |
            models.Q(tags__icontains=value)
        ).distinct()
    
    def filter_available(self, queryset, name, value):
        if value:
            return queryset.filter(
                copies__status='AVAILABLE'
            ).distinct()
        return queryset


class BookViewSet(viewsets.ModelViewSet):
    """Book management viewset"""
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = BookFilter
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookListSerializer
        elif self.action == 'search':
            return BookSearchSerializer
        return BookSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced book search"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Additional search logic
        dewey_code = request.query_params.get('dewey_code')
        if dewey_code:
            queryset = queryset.filter(dewey_code__startswith=dewey_code)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_copy(self, request, pk=None):
        """Add new copy of book"""
        book = self.get_object()
        
        data = request.data.copy()
        data['book'] = book.id
        
        serializer = BookCopySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def copies(self, request, pk=None):
        """Get all copies of a book"""
        book = self.get_object()
        copies = book.copies.all()
        serializer = BookCopySerializer(copies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular books"""
        from django.db.models import Count
        
        popular_books = Book.objects.annotate(
            loan_count=Count('copies__loans')
        ).order_by('-loan_count')[:10]
        
        serializer = BookListSerializer(popular_books, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrivals"""
        from datetime import timedelta
        from django.utils import timezone
        
        last_month = timezone.now() - timedelta(days=30)
        new_books = Book.objects.filter(
            created_at__gte=last_month
        ).order_by('-created_at')[:20]
        
        serializer = BookListSerializer(new_books, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """Get book recommendations"""
        book = self.get_object()
        
        # Get books by same authors
        same_author_books = Book.objects.filter(
            authors__in=book.authors.all()
        ).exclude(id=book.id).distinct()[:5]
        
        # Get books in same categories
        same_category_books = Book.objects.filter(
            categories__in=book.categories.all()
        ).exclude(id=book.id).distinct()[:5]
        
        # Combine and remove duplicates
        recommendations = list(same_author_books) + list(same_category_books)
        recommendations = list(dict.fromkeys(recommendations))[:10]
        
        serializer = BookListSerializer(recommendations, many=True)
        return Response(serializer.data)


class BookCopyViewSet(viewsets.ModelViewSet):
    """Book copy management viewset"""
    queryset = BookCopy.objects.all()
    serializer_class = BookCopySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['book', 'status', 'location']
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update copy status"""
        copy = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(BookCopy.STATUS_CHOICES):
            return Response(
                {'error': 'Geçersiz durum'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if status can be changed
        if copy.status == 'BORROWED' and new_status != 'RETURNED':
            return Response(
                {'error': 'Ödünç verilen kitap önce iade edilmelidir'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        copy.status = new_status
        if 'condition_notes' in request.data:
            copy.condition_notes = request.data['condition_notes']
        copy.save()
        
        return Response({'status': 'Durum güncellendi'})
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get copy loan history"""
        copy = self.get_object()
        from apps.loans.serializers import LoanSerializer
        
        loans = copy.loans.all().order_by('-borrowed_date')
        serializer = LoanSerializer(loans, many=True)
        return Response(serializer.data)