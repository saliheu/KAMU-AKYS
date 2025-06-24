from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import uuid


class User(AbstractUser):
    """Custom User model for library staff"""
    ROLE_CHOICES = [
        ('ADMIN', 'Yönetici'),
        ('LIBRARIAN', 'Kütüphaneci'),
        ('ASSISTANT', 'Kütüphane Asistanı'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ASSISTANT')
    phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'
        
    def __str__(self):
        return f"{self.get_full_name()} ({self.username})"


class Member(models.Model):
    """Library member model"""
    MEMBER_TYPE_CHOICES = [
        ('STUDENT', 'Öğrenci'),
        ('TEACHER', 'Öğretmen'),
        ('STAFF', 'Personel'),
        ('PUBLIC', 'Halk'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Aktif'),
        ('SUSPENDED', 'Askıda'),
        ('EXPIRED', 'Süresi Dolmuş'),
        ('BLOCKED', 'Engellenmiş'),
    ]
    
    member_id = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        help_text='Otomatik oluşturulur'
    )
    first_name = models.CharField(max_length=100, verbose_name='Ad')
    last_name = models.CharField(max_length=100, verbose_name='Soyad')
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Geçerli bir telefon numarası giriniz.')],
        verbose_name='Telefon'
    )
    tc_no = models.CharField(
        max_length=11,
        unique=True,
        validators=[RegexValidator(r'^\d{11}$', 'TC Kimlik No 11 haneli olmalıdır.')],
        verbose_name='TC Kimlik No'
    )
    address = models.TextField(verbose_name='Adres')
    birth_date = models.DateField(verbose_name='Doğum Tarihi')
    member_type = models.CharField(
        max_length=20, 
        choices=MEMBER_TYPE_CHOICES,
        verbose_name='Üye Tipi'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name='Durum'
    )
    registration_date = models.DateTimeField(auto_now_add=True, verbose_name='Kayıt Tarihi')
    expiry_date = models.DateField(verbose_name='Üyelik Bitiş Tarihi')
    photo = models.ImageField(
        upload_to='member_photos/',
        blank=True,
        null=True,
        verbose_name='Fotoğraf'
    )
    notes = models.TextField(blank=True, verbose_name='Notlar')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_members'
    )
    
    class Meta:
        verbose_name = 'Üye'
        verbose_name_plural = 'Üyeler'
        ordering = ['-registration_date']
        indexes = [
            models.Index(fields=['tc_no']),
            models.Index(fields=['email']),
            models.Index(fields=['member_id']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.member_id:
            # Generate unique member ID
            year = str(self.registration_date.year if self.registration_date else 2024)
            prefix = self.member_type[0]
            count = Member.objects.filter(
                member_id__startswith=f"{prefix}{year}"
            ).count() + 1
            self.member_id = f"{prefix}{year}{count:05d}"
        super().save(*args, **kwargs)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_active(self):
        from django.utils import timezone
        return (
            self.status == 'ACTIVE' and 
            self.expiry_date >= timezone.now().date()
        )
    
    @property
    def current_loans_count(self):
        return self.loans.filter(
            status__in=['BORROWED', 'OVERDUE']
        ).count()
    
    @property
    def can_borrow(self):
        """Check if member can borrow books"""
        from django.conf import settings
        return (
            self.is_active and 
            self.current_loans_count < settings.MAX_LOANS_PER_MEMBER
        )
    
    def __str__(self):
        return f"{self.full_name} ({self.member_id})"


class MembershipHistory(models.Model):
    """Track membership status changes"""
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='history'
    )
    action = models.CharField(max_length=50)
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    
    class Meta:
        verbose_name = 'Üyelik Geçmişi'
        verbose_name_plural = 'Üyelik Geçmişleri'
        ordering = ['-created_at']