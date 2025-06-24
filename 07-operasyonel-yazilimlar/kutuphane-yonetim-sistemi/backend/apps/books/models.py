from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.utils.text import slugify
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from barcode import ISBN13
from barcode.writer import ImageWriter


class Category(models.Model):
    """Book categories"""
    name = models.CharField(max_length=100, unique=True, verbose_name='Kategori Adı')
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name='Açıklama')
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name='Üst Kategori'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kategori'
        verbose_name_plural = 'Kategoriler'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Publisher(models.Model):
    """Book publishers"""
    name = models.CharField(max_length=200, unique=True, verbose_name='Yayınevi Adı')
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    address = models.TextField(blank=True, verbose_name='Adres')
    phone = models.CharField(max_length=15, blank=True, verbose_name='Telefon')
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Yayınevi'
        verbose_name_plural = 'Yayınevleri'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Author(models.Model):
    """Book authors"""
    first_name = models.CharField(max_length=100, verbose_name='Ad')
    last_name = models.CharField(max_length=100, verbose_name='Soyad')
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    biography = models.TextField(blank=True, verbose_name='Biyografi')
    birth_date = models.DateField(null=True, blank=True, verbose_name='Doğum Tarihi')
    death_date = models.DateField(null=True, blank=True, verbose_name='Ölüm Tarihi')
    nationality = models.CharField(max_length=50, blank=True, verbose_name='Milliyet')
    photo = models.ImageField(
        upload_to='author_photos/',
        blank=True,
        null=True,
        verbose_name='Fotoğraf'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Yazar'
        verbose_name_plural = 'Yazarlar'
        ordering = ['last_name', 'first_name']
        unique_together = [['first_name', 'last_name']]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.first_name}-{self.last_name}")
        super().save(*args, **kwargs)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return self.full_name


class Book(models.Model):
    """Book model"""
    LANGUAGE_CHOICES = [
        ('TR', 'Türkçe'),
        ('EN', 'İngilizce'),
        ('DE', 'Almanca'),
        ('FR', 'Fransızca'),
        ('AR', 'Arapça'),
        ('OTHER', 'Diğer'),
    ]
    
    isbn = models.CharField(
        max_length=13,
        unique=True,
        validators=[RegexValidator(r'^\d{13}$', 'ISBN 13 haneli olmalıdır.')],
        verbose_name='ISBN'
    )
    title = models.CharField(max_length=300, verbose_name='Kitap Adı')
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    authors = models.ManyToManyField(Author, related_name='books', verbose_name='Yazarlar')
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.PROTECT,
        related_name='books',
        verbose_name='Yayınevi'
    )
    categories = models.ManyToManyField(
        Category,
        related_name='books',
        verbose_name='Kategoriler'
    )
    publication_year = models.PositiveIntegerField(
        validators=[MinValueValidator(1000)],
        verbose_name='Yayın Yılı'
    )
    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default='TR',
        verbose_name='Dil'
    )
    pages = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Sayfa Sayısı'
    )
    description = models.TextField(blank=True, verbose_name='Açıklama')
    cover_image = models.ImageField(
        upload_to='book_covers/',
        blank=True,
        null=True,
        verbose_name='Kapak Resmi'
    )
    edition = models.CharField(max_length=50, blank=True, verbose_name='Baskı')
    dewey_code = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Dewey Kodu',
        help_text='Dewey Onlu Sınıflama Kodu'
    )
    tags = models.TextField(
        blank=True,
        verbose_name='Etiketler',
        help_text='Virgülle ayrılmış etiketler'
    )
    barcode_image = models.ImageField(
        upload_to='barcodes/',
        blank=True,
        null=True,
        verbose_name='Barkod'
    )
    qr_code = models.ImageField(
        upload_to='qrcodes/',
        blank=True,
        null=True,
        verbose_name='QR Kod'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_books'
    )
    
    class Meta:
        verbose_name = 'Kitap'
        verbose_name_plural = 'Kitaplar'
        ordering = ['title']
        indexes = [
            models.Index(fields=['isbn']),
            models.Index(fields=['title']),
            models.Index(fields=['publication_year']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Generate barcode if not exists
        if not self.barcode_image and self.isbn:
            self.generate_barcode()
        
        # Generate QR code if not exists
        if not self.qr_code:
            self.generate_qr_code()
            
        super().save(*args, **kwargs)
    
    def generate_barcode(self):
        """Generate barcode from ISBN"""
        try:
            barcode = ISBN13(self.isbn, writer=ImageWriter())
            buffer = BytesIO()
            barcode.write(buffer)
            self.barcode_image.save(
                f'barcode_{self.isbn}.png',
                File(buffer),
                save=False
            )
        except:
            pass
    
    def generate_qr_code(self):
        """Generate QR code for book"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(f"BOOK:{self.isbn}")
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        buffer = BytesIO()
        img.save(buffer, 'PNG')
        self.qr_code.save(
            f'qr_{self.isbn}.png',
            File(buffer),
            save=False
        )
    
    @property
    def available_copies(self):
        """Get number of available copies"""
        return self.copies.filter(status='AVAILABLE').count()
    
    @property
    def total_copies(self):
        """Get total number of copies"""
        return self.copies.count()
    
    def __str__(self):
        return f"{self.title} ({self.isbn})"


class BookCopy(models.Model):
    """Individual book copies"""
    STATUS_CHOICES = [
        ('AVAILABLE', 'Mevcut'),
        ('BORROWED', 'Ödünç Verildi'),
        ('RESERVED', 'Rezerve'),
        ('LOST', 'Kayıp'),
        ('DAMAGED', 'Hasarlı'),
        ('MAINTENANCE', 'Bakımda'),
    ]
    
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='copies',
        verbose_name='Kitap'
    )
    copy_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name='Kopya No'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='AVAILABLE',
        verbose_name='Durum'
    )
    location = models.CharField(
        max_length=50,
        verbose_name='Konum',
        help_text='Raf konumu (örn: A-12-3)'
    )
    acquisition_date = models.DateField(
        auto_now_add=True,
        verbose_name='Alım Tarihi'
    )
    condition_notes = models.TextField(
        blank=True,
        verbose_name='Durum Notları'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kitap Kopyası'
        verbose_name_plural = 'Kitap Kopyaları'
        ordering = ['book', 'copy_number']
        unique_together = [['book', 'copy_number']]
    
    def save(self, *args, **kwargs):
        if not self.copy_number:
            # Generate unique copy number
            count = BookCopy.objects.filter(book=self.book).count() + 1
            self.copy_number = f"{self.book.isbn}-{count:03d}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.book.title} - Kopya {self.copy_number}"