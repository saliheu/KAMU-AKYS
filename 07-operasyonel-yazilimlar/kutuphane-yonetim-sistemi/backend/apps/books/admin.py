from django.contrib import admin
from .models import Category, Publisher, Author, Book, BookCopy


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'slug']
    list_filter = ['parent']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'website']
    search_fields = ['name', 'email']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'birth_date', 'nationality']
    list_filter = ['nationality']
    search_fields = ['first_name', 'last_name']
    prepopulated_fields = {'slug': ('first_name', 'last_name')}
    ordering = ['last_name', 'first_name']


class BookCopyInline(admin.TabularInline):
    model = BookCopy
    extra = 1
    readonly_fields = ['copy_number', 'acquisition_date']
    fields = ['copy_number', 'status', 'location', 'condition_notes']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['isbn', 'title', 'publisher', 'publication_year', 'language', 
                   'available_copies', 'total_copies']
    list_filter = ['language', 'publication_year', 'categories', 'publisher']
    search_fields = ['isbn', 'title', 'authors__first_name', 'authors__last_name']
    filter_horizontal = ['authors', 'categories']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['barcode_image', 'qr_code', 'created_at', 'updated_at']
    inlines = [BookCopyInline]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('isbn', 'title', 'slug', 'authors', 'publisher', 'categories')
        }),
        ('Yayın Bilgileri', {
            'fields': ('publication_year', 'language', 'pages', 'edition', 'dewey_code')
        }),
        ('Açıklama ve Görseller', {
            'fields': ('description', 'cover_image', 'tags')
        }),
        ('Barkod ve QR', {
            'fields': ('barcode_image', 'qr_code'),
            'classes': ('collapse',)
        }),
        ('Sistem Bilgileri', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = ['copy_number', 'book', 'status', 'location', 'acquisition_date']
    list_filter = ['status', 'acquisition_date']
    search_fields = ['copy_number', 'book__title', 'book__isbn']
    readonly_fields = ['copy_number', 'acquisition_date']
    ordering = ['-acquisition_date']