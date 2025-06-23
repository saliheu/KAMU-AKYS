from rest_framework import permissions
from django.db.models import Q


class DocumentPermission(permissions.BasePermission):
    """
    Custom permission to only allow owners and authorized users to edit documents.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for public documents
        if request.method in permissions.SAFE_METHODS:
            if obj.is_public:
                return True
            
            # Check if user has access
            if request.user.role == 'admin' or obj.created_by == request.user:
                return True
            
            # Check access permissions
            return obj.access_permissions.filter(
                Q(user=request.user) | Q(department=request.user.department)
            ).exists()
        
        # Write permissions are only allowed to the owner and admins
        if request.user.role == 'admin' or obj.created_by == request.user:
            return True
        
        # Check if user has edit/delete access
        return obj.access_permissions.filter(
            user=request.user,
            access_level__in=['edit', 'delete']
        ).exists()