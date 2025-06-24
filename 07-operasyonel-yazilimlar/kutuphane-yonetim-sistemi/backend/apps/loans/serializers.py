from rest_framework import serializers
from django.utils import timezone
from .models import Loan, Reservation, Fine, LoanHistory
from apps.books.serializers import BookListSerializer
from apps.members.serializers import MemberListSerializer


class LoanSerializer(serializers.ModelSerializer):
    """Loan serializer"""
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    member_id = serializers.CharField(source='member.member_id', read_only=True)
    book_title = serializers.CharField(source='book_copy.book.title', read_only=True)
    book_isbn = serializers.CharField(source='book_copy.book.isbn', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    borrowed_by_name = serializers.CharField(
        source='borrowed_by.get_full_name',
        read_only=True
    )
    returned_to_name = serializers.CharField(
        source='returned_to.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Loan
        fields = [
            'id', 'member', 'member_name', 'member_id', 'book_copy',
            'book_title', 'book_isbn', 'borrowed_date', 'due_date',
            'returned_date', 'status', 'fine_amount', 'fine_paid',
            'notes', 'is_overdue', 'days_overdue', 'borrowed_by_name',
            'returned_to_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'borrowed_date', 'fine_amount', 'created_at', 'updated_at'
        ]


class LoanCreateSerializer(serializers.ModelSerializer):
    """Loan creation serializer"""
    class Meta:
        model = Loan
        fields = ['member', 'book_copy', 'due_date', 'notes']
    
    def validate_member(self, value):
        if not value.can_borrow:
            raise serializers.ValidationError(
                "Üye kitap ödünç alamaz. Üyelik durumunu kontrol edin."
            )
        return value
    
    def validate_book_copy(self, value):
        if value.status != 'AVAILABLE':
            raise serializers.ValidationError(
                "Bu kitap kopyası ödünç verilemez. Durum: " + value.get_status_display()
            )
        return value
    
    def create(self, validated_data):
        validated_data['borrowed_by'] = self.context['request'].user
        return super().create(validated_data)


class LoanReturnSerializer(serializers.Serializer):
    """Loan return serializer"""
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        instance.return_book(self.context['request'].user)
        if validated_data.get('notes'):
            instance.notes = validated_data['notes']
            instance.save()
        return instance


class ReservationSerializer(serializers.ModelSerializer):
    """Reservation serializer"""
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    member_id = serializers.CharField(source='member.member_id', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    position_in_queue = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'member', 'member_name', 'member_id', 'book',
            'book_title', 'book_isbn', 'reserved_date', 'expiry_date',
            'status', 'notification_sent', 'fulfilled_date', 'notes',
            'position_in_queue', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reserved_date', 'notification_sent', 'fulfilled_date',
            'created_at', 'updated_at'
        ]


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Reservation creation serializer"""
    class Meta:
        model = Reservation
        fields = ['member', 'book', 'notes']
    
    def validate(self, attrs):
        member = attrs['member']
        book = attrs['book']
        
        # Check if member already has active reservation for this book
        if Reservation.objects.filter(
            member=member,
            book=book,
            status='ACTIVE'
        ).exists():
            raise serializers.ValidationError(
                "Üye bu kitap için zaten aktif bir rezervasyona sahip."
            )
        
        # Check if book has available copies
        if book.available_copies > 0:
            raise serializers.ValidationError(
                "Bu kitabın mevcut kopyaları var, rezervasyon yerine ödünç alabilirsiniz."
            )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FineSerializer(serializers.ModelSerializer):
    """Fine serializer"""
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    member_id = serializers.CharField(source='member.member_id', read_only=True)
    loan_book = serializers.CharField(
        source='loan.book_copy.book.title',
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    paid_to_name = serializers.CharField(
        source='paid_to.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Fine
        fields = [
            'id', 'member', 'member_name', 'member_id', 'loan',
            'loan_book', 'fine_type', 'amount', 'paid', 'paid_date',
            'description', 'created_by_name', 'paid_to_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'paid_date', 'created_at', 'updated_at'
        ]


class FinePaymentSerializer(serializers.Serializer):
    """Fine payment serializer"""
    payment_note = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        instance.pay(self.context['request'].user)
        if validated_data.get('payment_note'):
            instance.description += f"\nÖdeme notu: {validated_data['payment_note']}"
            instance.save()
        return instance


class LoanHistorySerializer(serializers.ModelSerializer):
    """Loan history serializer"""
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = LoanHistory
        fields = [
            'id', 'action', 'notes', 'created_at', 'created_by_name'
        ]


class MemberLoanSummarySerializer(serializers.Serializer):
    """Member loan summary serializer"""
    active_loans = LoanSerializer(many=True, read_only=True)
    overdue_loans = LoanSerializer(many=True, read_only=True)
    total_fines = serializers.DecimalField(max_digits=10, decimal_places=2)
    unpaid_fines = serializers.DecimalField(max_digits=10, decimal_places=2)
    loan_history_count = serializers.IntegerField()
    can_borrow = serializers.BooleanField()
    max_loans = serializers.IntegerField()