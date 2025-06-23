from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer, CategoryTreeSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            # Only admins can create categories
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # Only admins can update/delete categories
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()
    
    def perform_destroy(self, instance):
        # Soft delete - just deactivate
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def category_tree_view(request):
    """Get category tree structure"""
    categories = Category.objects.filter(
        is_active=True,
        level=0  # Root categories
    ).prefetch_related('children')
    
    serializer = CategoryTreeSerializer(categories, many=True)
    return Response(serializer.data)