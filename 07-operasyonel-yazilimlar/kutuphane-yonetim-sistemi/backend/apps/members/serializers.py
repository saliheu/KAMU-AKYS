from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Member, MembershipHistory


class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'phone', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """User creation serializer"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Şifreler eşleşmiyor.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Geçersiz kullanıcı adı veya şifre.')
            if not user.is_active:
                raise serializers.ValidationError('Kullanıcı hesabı aktif değil.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Kullanıcı adı ve şifre gereklidir.')


class MemberSerializer(serializers.ModelSerializer):
    """Member serializer"""
    full_name = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    current_loans_count = serializers.IntegerField(read_only=True)
    can_borrow = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Member
        fields = [
            'id', 'member_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'tc_no', 'address', 'birth_date',
            'member_type', 'status', 'registration_date', 'expiry_date',
            'photo', 'notes', 'is_active', 'current_loans_count',
            'can_borrow', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'member_id', 'registration_date', 'created_at', 'updated_at'
        ]


class MemberCreateSerializer(serializers.ModelSerializer):
    """Member creation serializer"""
    class Meta:
        model = Member
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'tc_no',
            'address', 'birth_date', 'member_type', 'expiry_date',
            'photo', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MemberListSerializer(serializers.ModelSerializer):
    """Simplified member serializer for lists"""
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Member
        fields = [
            'id', 'member_id', 'full_name', 'email', 'phone',
            'member_type', 'status', 'expiry_date'
        ]


class MembershipHistorySerializer(serializers.ModelSerializer):
    """Membership history serializer"""
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = MembershipHistory
        fields = [
            'id', 'action', 'old_status', 'new_status',
            'notes', 'created_at', 'created_by_name'
        ]
        read_only_fields = ['id', 'created_at']