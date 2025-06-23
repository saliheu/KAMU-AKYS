from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    full_path = serializers.CharField(source='get_full_path', read_only=True)
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent', 'children',
            'icon', 'color', 'is_active', 'full_path', 'document_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_children(self, obj):
        if obj.get_children():
            return CategorySerializer(obj.get_children(), many=True).data
        return []
    
    def get_document_count(self, obj):
        return obj.documents.filter(status='active').count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'children', 'icon', 'color']
    
    def get_children(self, obj):
        children = obj.get_children().filter(is_active=True)
        if children:
            return CategoryTreeSerializer(children, many=True).data
        return []