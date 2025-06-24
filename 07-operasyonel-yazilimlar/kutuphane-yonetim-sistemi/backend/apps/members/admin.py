from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Member, MembershipHistory


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['username']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Ek Bilgiler', {'fields': ('role', 'phone')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Ek Bilgiler', {'fields': ('email', 'role', 'phone')}),
    )


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['member_id', 'full_name', 'email', 'member_type', 'status', 
                   'registration_date', 'expiry_date']
    list_filter = ['member_type', 'status', 'registration_date']
    search_fields = ['member_id', 'first_name', 'last_name', 'email', 'tc_no', 'phone']
    readonly_fields = ['member_id', 'registration_date', 'created_at', 'updated_at']
    ordering = ['-registration_date']
    
    fieldsets = (
        ('Kişisel Bilgiler', {
            'fields': ('member_id', 'first_name', 'last_name', 'tc_no', 'birth_date', 'photo')
        }),
        ('İletişim Bilgileri', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Üyelik Bilgileri', {
            'fields': ('member_type', 'status', 'registration_date', 'expiry_date', 'notes')
        }),
        ('Sistem Bilgileri', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MembershipHistory)
class MembershipHistoryAdmin(admin.ModelAdmin):
    list_display = ['member', 'action', 'old_status', 'new_status', 'created_at', 'created_by']
    list_filter = ['action', 'created_at']
    search_fields = ['member__member_id', 'member__first_name', 'member__last_name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']