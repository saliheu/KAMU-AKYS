from django.contrib import admin
from .models import Loan, Reservation, Fine, LoanHistory


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'book_copy', 'borrowed_date', 'due_date', 
                   'status', 'fine_amount', 'fine_paid']
    list_filter = ['status', 'borrowed_date', 'due_date', 'fine_paid']
    search_fields = ['member__member_id', 'member__first_name', 'member__last_name',
                    'book_copy__copy_number', 'book_copy__book__title']
    readonly_fields = ['borrowed_date', 'fine_amount', 'created_at', 'updated_at']
    date_hierarchy = 'borrowed_date'
    ordering = ['-borrowed_date']
    
    fieldsets = (
        ('Ödünç Bilgileri', {
            'fields': ('member', 'book_copy', 'borrowed_date', 'due_date', 'status')
        }),
        ('İade Bilgileri', {
            'fields': ('returned_date', 'returned_to')
        }),
        ('Ceza Bilgileri', {
            'fields': ('fine_amount', 'fine_paid')
        }),
        ('Notlar ve İşlem Bilgileri', {
            'fields': ('notes', 'borrowed_by', 'created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('member', 'book_copy__book', 'borrowed_by', 'returned_to')


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'book', 'reserved_date', 'expiry_date', 
                   'status', 'position_in_queue']
    list_filter = ['status', 'reserved_date', 'expiry_date', 'notification_sent']
    search_fields = ['member__member_id', 'member__first_name', 'member__last_name',
                    'book__title', 'book__isbn']
    readonly_fields = ['reserved_date', 'created_at', 'updated_at']
    date_hierarchy = 'reserved_date'
    ordering = ['-reserved_date']


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'fine_type', 'amount', 'paid', 'paid_date']
    list_filter = ['fine_type', 'paid', 'created_at']
    search_fields = ['member__member_id', 'member__first_name', 'member__last_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Ceza Bilgileri', {
            'fields': ('member', 'loan', 'fine_type', 'amount', 'description')
        }),
        ('Ödeme Bilgileri', {
            'fields': ('paid', 'paid_date', 'paid_to')
        }),
        ('Sistem Bilgileri', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(LoanHistory)
class LoanHistoryAdmin(admin.ModelAdmin):
    list_display = ['loan', 'action', 'created_at', 'created_by']
    list_filter = ['action', 'created_at']
    search_fields = ['loan__member__member_id', 'loan__book_copy__book__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']