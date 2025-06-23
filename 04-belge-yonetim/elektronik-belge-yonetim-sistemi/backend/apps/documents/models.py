from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from taggit.managers import TaggableManager
import os
import hashlib
from apps.categories.models import Category


class Document(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Taslak'),
        ('active', 'Aktif'),
        ('archived', 'Arşivlenmiş'),
        ('deleted', 'Silinmiş'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=settings.DOCUMENT_ALLOWED_EXTENSIONS)]
    )
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()  # in bytes
    file_type = models.CharField(max_length=50)
    file_hash = models.CharField(max_length=64, unique=True)  # SHA256 hash
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='documents')
    tags = TaggableManager(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    version = models.IntegerField(default=1)
    is_public = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    metadata = models.JSONField(default=dict, blank=True)  # Store additional metadata
    
    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('can_approve_document', 'Can approve document'),
            ('can_archive_document', 'Can archive document'),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_name = os.path.basename(self.file.name)
            self.file_size = self.file.size
            self.file_type = os.path.splitext(self.file_name)[1][1:].lower()
            
            # Calculate file hash
            if not self.file_hash:
                sha256_hash = hashlib.sha256()
                for chunk in self.file.chunks():
                    sha256_hash.update(chunk)
                self.file_hash = sha256_hash.hexdigest()
        
        super().save(*args, **kwargs)


class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    file = models.FileField(upload_to='document_versions/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_hash = models.CharField(max_length=64)
    
    change_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-version_number']
        unique_together = ['document', 'version_number']
    
    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"


class DocumentAccess(models.Model):
    ACCESS_LEVELS = [
        ('view', 'Görüntüleme'),
        ('edit', 'Düzenleme'),
        ('delete', 'Silme'),
        ('share', 'Paylaşma'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='access_permissions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    department = models.ForeignKey('authentication.Department', on_delete=models.CASCADE, null=True, blank=True)
    access_level = models.CharField(max_length=20, choices=ACCESS_LEVELS)
    granted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='granted_accesses')
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['document', 'user', 'department']
    
    def __str__(self):
        if self.user:
            return f"{self.document.title} - {self.user.username} ({self.access_level})"
        return f"{self.document.title} - {self.department.name} ({self.access_level})"


class DocumentLog(models.Model):
    ACTION_CHOICES = [
        ('created', 'Oluşturuldu'),
        ('viewed', 'Görüntülendi'),
        ('downloaded', 'İndirildi'),
        ('edited', 'Düzenlendi'),
        ('deleted', 'Silindi'),
        ('restored', 'Geri Yüklendi'),
        ('shared', 'Paylaşıldı'),
        ('archived', 'Arşivlendi'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.document.title} - {self.action} - {self.user.username if self.user else 'Unknown'}"