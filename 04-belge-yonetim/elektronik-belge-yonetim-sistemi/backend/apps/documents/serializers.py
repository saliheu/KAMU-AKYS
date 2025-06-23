from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from django.conf import settings
from .models import Document, DocumentVersion, DocumentAccess, DocumentLog
from apps.authentication.serializers import UserSerializer
from apps.categories.serializers import CategorySerializer


class DocumentVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'version_number', 'file', 'file_name', 'file_size',
            'change_notes', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['file_name', 'file_size', 'created_by', 'created_at']


class DocumentAccessSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    granted_by_name = serializers.CharField(source='granted_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentAccess
        fields = [
            'id', 'user', 'user_detail', 'department', 'department_name',
            'access_level', 'granted_by', 'granted_by_name', 'granted_at', 'expires_at'
        ]
        read_only_fields = ['granted_by', 'granted_at']


class DocumentLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = DocumentLog
        fields = [
            'id', 'user', 'user_name', 'action', 'action_display',
            'details', 'ip_address', 'created_at'
        ]
        read_only_fields = ['user', 'ip_address', 'created_at']


class DocumentSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    latest_version = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file', 'file_name', 'file_size',
            'file_type', 'category', 'category_detail', 'tags', 'status',
            'version', 'is_public', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'metadata', 'latest_version',
            'can_edit', 'can_delete'
        ]
        read_only_fields = [
            'file_name', 'file_size', 'file_type', 'file_hash',
            'version', 'created_by', 'created_at', 'updated_at'
        ]
    
    def get_latest_version(self, obj):
        latest = obj.versions.first()
        if latest:
            return DocumentVersionSerializer(latest).data
        return None
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Owner and admins can always edit
        if obj.created_by == request.user or request.user.role == 'admin':
            return True
        
        # Check access permissions
        return obj.access_permissions.filter(
            user=request.user,
            access_level__in=['edit', 'delete']
        ).exists()
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Only owner and admins can delete
        return obj.created_by == request.user or request.user.role == 'admin'


class DocumentCreateSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField(required=False)
    
    class Meta:
        model = Document
        fields = [
            'title', 'description', 'file', 'category', 'tags',
            'is_public', 'metadata'
        ]
    
    def validate_file(self, value):
        if value.size > settings.DOCUMENT_MAX_SIZE:
            raise serializers.ValidationError(
                f"Dosya boyutu {settings.DOCUMENT_MAX_SIZE / (1024*1024):.0f} MB'dan büyük olamaz."
            )
        return value


class DocumentUpdateSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField(required=False)
    new_version_file = serializers.FileField(write_only=True, required=False)
    version_notes = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Document
        fields = [
            'title', 'description', 'category', 'tags', 'status',
            'is_public', 'metadata', 'new_version_file', 'version_notes'
        ]
    
    def update(self, instance, validated_data):
        new_file = validated_data.pop('new_version_file', None)
        version_notes = validated_data.pop('version_notes', '')
        
        if new_file:
            # Create new version
            instance.version += 1
            DocumentVersion.objects.create(
                document=instance,
                version_number=instance.version,
                file=instance.file,
                file_name=instance.file_name,
                file_size=instance.file_size,
                file_hash=instance.file_hash,
                change_notes=version_notes,
                created_by=self.context['request'].user
            )
            
            # Update document with new file
            instance.file = new_file
            
        return super().update(instance, validated_data)