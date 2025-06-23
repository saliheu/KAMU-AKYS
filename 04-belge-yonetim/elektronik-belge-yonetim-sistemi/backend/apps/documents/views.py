from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
import magic
from .models import Document, DocumentVersion, DocumentAccess, DocumentLog
from .serializers import (
    DocumentSerializer, DocumentCreateSerializer, DocumentUpdateSerializer,
    DocumentVersionSerializer, DocumentAccessSerializer, DocumentLogSerializer
)
from .permissions import DocumentPermission


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags__name']
    ordering_fields = ['created_at', 'updated_at', 'title']
    filterset_fields = ['category', 'status', 'created_by']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        queryset = Document.objects.select_related(
            'category', 'created_by'
        ).prefetch_related('tags')
        
        # Filter based on user permissions
        if self.request.user.role != 'admin':
            queryset = queryset.filter(
                Q(created_by=self.request.user) |
                Q(is_public=True) |
                Q(access_permissions__user=self.request.user) |
                Q(access_permissions__department=self.request.user.department)
            ).distinct()
        
        # Additional filters
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__name=tag)
        
        return queryset
    
    def perform_create(self, serializer):
        document = serializer.save(created_by=self.request.user)
        
        # Log creation
        DocumentLog.objects.create(
            document=document,
            user=self.request.user,
            action='created',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, DocumentPermission]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DocumentUpdateSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        return Document.objects.select_related(
            'category', 'created_by'
        ).prefetch_related('tags', 'versions')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Log view
        DocumentLog.objects.create(
            document=instance,
            user=request.user,
            action='viewed',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        document = serializer.save()
        
        # Log edit
        DocumentLog.objects.create(
            document=document,
            user=self.request.user,
            action='edited',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.status = 'deleted'
        instance.save()
        
        # Log deletion
        DocumentLog.objects.create(
            document=instance,
            user=self.request.user,
            action='deleted',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def document_download(request, pk):
    document = get_object_or_404(Document, pk=pk)
    
    # Check permissions
    if not document.is_public and document.created_by != request.user:
        if request.user.role != 'admin':
            has_access = document.access_permissions.filter(
                Q(user=request.user) | Q(department=request.user.department)
            ).exists()
            if not has_access:
                return Response({'error': 'Bu belgeye erişim yetkiniz yok.'}, 
                              status=status.HTTP_403_FORBIDDEN)
    
    # Log download
    DocumentLog.objects.create(
        document=document,
        user=request.user,
        action='downloaded',
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    # Return file URL
    return Response({
        'url': request.build_absolute_uri(document.file.url),
        'filename': document.file_name,
        'content_type': magic.from_file(document.file.path, mime=True)
    })


class DocumentVersionListView(generics.ListAPIView):
    serializer_class = DocumentVersionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs['document_id']
        return DocumentVersion.objects.filter(
            document_id=document_id
        ).select_related('created_by')


class DocumentAccessListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentAccessSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs['document_id']
        document = get_object_or_404(Document, pk=document_id)
        
        # Only document owner and admins can view/manage access
        if document.created_by != self.request.user and self.request.user.role != 'admin':
            return DocumentAccess.objects.none()
        
        return DocumentAccess.objects.filter(
            document_id=document_id
        ).select_related('user', 'department', 'granted_by')
    
    def perform_create(self, serializer):
        document_id = self.kwargs['document_id']
        document = get_object_or_404(Document, pk=document_id)
        
        # Only document owner and admins can grant access
        if document.created_by != self.request.user and self.request.user.role != 'admin':
            raise permissions.PermissionDenied('Bu belge için erişim yetkisi veremezsiniz.')
        
        access = serializer.save(
            document=document,
            granted_by=self.request.user
        )
        
        # Log sharing
        DocumentLog.objects.create(
            document=document,
            user=self.request.user,
            action='shared',
            details=f"Access granted to {access.user or access.department}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class DocumentLogListView(generics.ListAPIView):
    serializer_class = DocumentLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        document_id = self.kwargs['document_id']
        document = get_object_or_404(Document, pk=document_id)
        
        # Check permissions
        if document.created_by != self.request.user and self.request.user.role != 'admin':
            has_access = document.access_permissions.filter(
                Q(user=self.request.user) | Q(department=self.request.user.department),
                access_level__in=['edit', 'delete']
            ).exists()
            if not has_access:
                return DocumentLog.objects.none()
        
        return DocumentLog.objects.filter(
            document_id=document_id
        ).select_related('user')