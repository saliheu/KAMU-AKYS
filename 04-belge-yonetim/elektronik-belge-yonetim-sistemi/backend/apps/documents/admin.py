from django.contrib import admin
from .models import Document, DocumentVersion, DocumentAccess, DocumentLog


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'file_type', 'category', 'status', 'version', 'created_by', 'created_at']
    list_filter = ['status', 'file_type', 'category', 'created_at']
    search_fields = ['title', 'description', 'file_name']
    readonly_fields = ['file_hash', 'file_size', 'file_type', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version_number', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['document__title', 'change_notes']
    readonly_fields = ['file_hash', 'file_size', 'created_at']
    ordering = ['-created_at']


@admin.register(DocumentAccess)
class DocumentAccessAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'department', 'access_level', 'granted_by', 'granted_at']
    list_filter = ['access_level', 'granted_at']
    search_fields = ['document__title', 'user__username', 'department__name']
    ordering = ['-granted_at']


@admin.register(DocumentLog)
class DocumentLogAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'action', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['document__title', 'user__username', 'details']
    readonly_fields = ['created_at']
    ordering = ['-created_at']