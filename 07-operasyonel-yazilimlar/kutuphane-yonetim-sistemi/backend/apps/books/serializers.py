from rest_framework import serializers
from django.utils import timezone
from .models import Category, Publisher, Author, Book, BookCopy


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    children_count = serializers.IntegerField(
        source='children.count',
        read_only=True
    )
    books_count = serializers.IntegerField(
        source='books.count',
        read_only=True
    )
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent',
            'parent_name', 'children_count', 'books_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class PublisherSerializer(serializers.ModelSerializer):
    """Publisher serializer"""
    books_count = serializers.IntegerField(
        source='books.count',
        read_only=True
    )
    
    class Meta:
        model = Publisher
        fields = [
            'id', 'name', 'slug', 'address', 'phone', 'email',
            'website', 'books_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class AuthorSerializer(serializers.ModelSerializer):
    """Author serializer"""
    full_name = serializers.CharField(read_only=True)
    books_count = serializers.IntegerField(
        source='books.count',
        read_only=True
    )
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Author
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'slug',
            'biography', 'birth_date', 'death_date', 'nationality',
            'photo', 'books_count', 'age', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_age(self, obj):
        if obj.birth_date:
            end_date = obj.death_date or timezone.now().date()
            return (end_date - obj.birth_date).days // 365
        return None


class BookCopySerializer(serializers.ModelSerializer):
    """Book copy serializer"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    
    class Meta:
        model = BookCopy
        fields = [
            'id', 'copy_number', 'book', 'book_title', 'book_isbn',
            'status', 'location', 'acquisition_date', 'condition_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'copy_number', 'acquisition_date',
            'created_at', 'updated_at'
        ]


class BookSerializer(serializers.ModelSerializer):
    """Book serializer"""
    authors = AuthorSerializer(many=True, read_only=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Author.objects.all(),
        source='authors',
        write_only=True
    )
    publisher_name = serializers.CharField(
        source='publisher.name',
        read_only=True
    )
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        source='categories',
        write_only=True
    )
    available_copies = serializers.IntegerField(read_only=True)
    total_copies = serializers.IntegerField(read_only=True)
    copies = BookCopySerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'slug', 'authors', 'author_ids',
            'publisher', 'publisher_name', 'categories', 'category_ids',
            'publication_year', 'language', 'pages', 'description',
            'cover_image', 'edition', 'dewey_code', 'tags',
            'barcode_image', 'qr_code', 'available_copies',
            'total_copies', 'copies', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'barcode_image', 'qr_code',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        authors = validated_data.pop('authors', [])
        categories = validated_data.pop('categories', [])
        validated_data['created_by'] = self.context['request'].user
        
        book = Book.objects.create(**validated_data)
        book.authors.set(authors)
        book.categories.set(categories)
        
        return book
    
    def update(self, instance, validated_data):
        authors = validated_data.pop('authors', None)
        categories = validated_data.pop('categories', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if authors is not None:
            instance.authors.set(authors)
        if categories is not None:
            instance.categories.set(categories)
        
        return instance


class BookListSerializer(serializers.ModelSerializer):
    """Simplified book serializer for lists"""
    authors_display = serializers.SerializerMethodField()
    publisher_name = serializers.CharField(
        source='publisher.name',
        read_only=True
    )
    available_copies = serializers.IntegerField(read_only=True)
    total_copies = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'authors_display', 'publisher_name',
            'publication_year', 'language', 'available_copies',
            'total_copies', 'cover_image'
        ]
    
    def get_authors_display(self, obj):
        return ', '.join([author.full_name for author in obj.authors.all()])


class BookSearchSerializer(serializers.ModelSerializer):
    """Book search result serializer"""
    authors_display = serializers.SerializerMethodField()
    categories_display = serializers.SerializerMethodField()
    availability = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'authors_display',
            'categories_display', 'publication_year',
            'language', 'availability', 'cover_image'
        ]
    
    def get_authors_display(self, obj):
        return ', '.join([author.full_name for author in obj.authors.all()])
    
    def get_categories_display(self, obj):
        return ', '.join([cat.name for cat in obj.categories.all()])
    
    def get_availability(self, obj):
        return {
            'available': obj.available_copies,
            'total': obj.total_copies
        }