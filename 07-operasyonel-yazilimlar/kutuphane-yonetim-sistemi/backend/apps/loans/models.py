from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class Loan(models.Model):
    """Book loan/borrowing records"""
    STATUS_CHOICES = [
        ('BORROWED', 'Ödünç'),
        ('RETURNED', 'İade Edildi'),
        ('OVERDUE', 'Gecikmiş'),
        ('LOST', 'Kayıp'),
    ]
    
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.PROTECT,
        related_name='loans',
        verbose_name='Üye'
    )
    book_copy = models.ForeignKey(
        'books.BookCopy',
        on_delete=models.PROTECT,
        related_name='loans',
        verbose_name='Kitap Kopyası'
    )
    borrowed_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='Ödünç Alma Tarihi'
    )
    due_date = models.DateField(verbose_name='İade Tarihi')
    returned_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Teslim Tarihi'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='BORROWED',
        verbose_name='Durum'
    )
    fine_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Ceza Tutarı'
    )
    fine_paid = models.BooleanField(default=False, verbose_name='Ceza Ödendi')
    notes = models.TextField(blank=True, verbose_name='Notlar')
    borrowed_by = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_loans',
        verbose_name='İşlemi Yapan'
    )
    returned_to = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_returns',
        verbose_name='İade Alan'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Ödünç Alma'
        verbose_name_plural = 'Ödünç Almalar'
        ordering = ['-borrowed_date']
        indexes = [
            models.Index(fields=['member', 'status']),
            models.Index(fields=['book_copy', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def save(self, *args, **kwargs):
        # Set due date if not set
        if not self.due_date:
            self.due_date = (
                self.borrowed_date + timedelta(days=settings.LOAN_PERIOD_DAYS)
            ).date()
        
        # Update status based on dates
        if self.status == 'BORROWED' and not self.returned_date:
            if timezone.now().date() > self.due_date:
                self.status = 'OVERDUE'
                # Calculate fine
                days_overdue = (timezone.now().date() - self.due_date).days
                self.fine_amount = Decimal(days_overdue * settings.FINE_PER_DAY)
        
        super().save(*args, **kwargs)
        
        # Update book copy status
        if self.status == 'BORROWED':
            self.book_copy.status = 'BORROWED'
            self.book_copy.save()
        elif self.status == 'RETURNED':
            self.book_copy.status = 'AVAILABLE'
            self.book_copy.save()
    
    @property
    def is_overdue(self):
        """Check if loan is overdue"""
        return (
            self.status in ['BORROWED', 'OVERDUE'] and
            timezone.now().date() > self.due_date
        )
    
    @property
    def days_overdue(self):
        """Calculate days overdue"""
        if self.is_overdue:
            return (timezone.now().date() - self.due_date).days
        return 0
    
    def return_book(self, user):
        """Process book return"""
        self.returned_date = timezone.now()
        self.status = 'RETURNED'
        self.returned_to = user
        
        # Calculate final fine if overdue
        if self.is_overdue:
            self.fine_amount = Decimal(self.days_overdue * settings.FINE_PER_DAY)
        
        self.save()
        
        # Update book copy status
        self.book_copy.status = 'AVAILABLE'
        self.book_copy.save()
        
        # Create history record
        LoanHistory.objects.create(
            loan=self,
            action='RETURNED',
            notes=f'Returned after {self.days_overdue} days overdue' if self.is_overdue else 'Returned on time',
            created_by=user
        )
    
    def __str__(self):
        return f"{self.member.full_name} - {self.book_copy.book.title}"


class Reservation(models.Model):
    """Book reservations"""
    STATUS_CHOICES = [
        ('ACTIVE', 'Aktif'),
        ('FULFILLED', 'Karşılandı'),
        ('CANCELLED', 'İptal Edildi'),
        ('EXPIRED', 'Süresi Doldu'),
    ]
    
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name='Üye'
    )
    book = models.ForeignKey(
        'books.Book',
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name='Kitap'
    )
    reserved_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Rezervasyon Tarihi'
    )
    expiry_date = models.DateField(verbose_name='Son Geçerlilik Tarihi')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name='Durum'
    )
    notification_sent = models.BooleanField(
        default=False,
        verbose_name='Bildirim Gönderildi'
    )
    fulfilled_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Karşılanma Tarihi'
    )
    notes = models.TextField(blank=True, verbose_name='Notlar')
    created_by = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Oluşturan'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Rezervasyon'
        verbose_name_plural = 'Rezervasyonlar'
        ordering = ['reserved_date']
        unique_together = [['member', 'book', 'status']]
    
    def save(self, *args, **kwargs):
        # Set expiry date if not set
        if not self.expiry_date:
            self.expiry_date = (
                timezone.now() + timedelta(days=settings.RESERVATION_EXPIRY_DAYS)
            ).date()
        
        # Check if expired
        if self.status == 'ACTIVE' and timezone.now().date() > self.expiry_date:
            self.status = 'EXPIRED'
        
        super().save(*args, **kwargs)
    
    @property
    def position_in_queue(self):
        """Get position in reservation queue for this book"""
        return Reservation.objects.filter(
            book=self.book,
            status='ACTIVE',
            reserved_date__lt=self.reserved_date
        ).count() + 1
    
    def __str__(self):
        return f"{self.member.full_name} - {self.book.title} ({self.status})"


class Fine(models.Model):
    """Fine/penalty records"""
    FINE_TYPE_CHOICES = [
        ('OVERDUE', 'Gecikme Cezası'),
        ('DAMAGE', 'Hasar Cezası'),
        ('LOST', 'Kayıp Cezası'),
        ('OTHER', 'Diğer'),
    ]
    
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='fines',
        verbose_name='Üye'
    )
    loan = models.ForeignKey(
        Loan,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fines',
        verbose_name='Ödünç Alma'
    )
    fine_type = models.CharField(
        max_length=20,
        choices=FINE_TYPE_CHOICES,
        verbose_name='Ceza Tipi'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Tutar'
    )
    paid = models.BooleanField(default=False, verbose_name='Ödendi')
    paid_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Ödeme Tarihi'
    )
    description = models.TextField(verbose_name='Açıklama')
    created_by = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fines',
        verbose_name='Oluşturan'
    )
    paid_to = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_fines',
        verbose_name='Tahsil Eden'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Ceza'
        verbose_name_plural = 'Cezalar'
        ordering = ['-created_at']
    
    def pay(self, user):
        """Mark fine as paid"""
        self.paid = True
        self.paid_date = timezone.now()
        self.paid_to = user
        self.save()
        
        # Update loan if applicable
        if self.loan and self.fine_type == 'OVERDUE':
            self.loan.fine_paid = True
            self.loan.save()
    
    def __str__(self):
        return f"{self.member.full_name} - {self.get_fine_type_display()} - {self.amount} TL"


class LoanHistory(models.Model):
    """Loan transaction history"""
    loan = models.ForeignKey(
        Loan,
        on_delete=models.CASCADE,
        related_name='history'
    )
    action = models.CharField(max_length=50, verbose_name='İşlem')
    notes = models.TextField(blank=True, verbose_name='Notlar')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'members.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    class Meta:
        verbose_name = 'Ödünç Alma Geçmişi'
        verbose_name_plural = 'Ödünç Alma Geçmişleri'
        ordering = ['-created_at']