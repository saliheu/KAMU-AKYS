from django.db import models
from mptt.models import MPTTModel, TreeForeignKey


class Category(MPTTModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    parent = TreeForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    icon = models.CharField(max_length=50, blank=True)  # For storing icon class names
    color = models.CharField(max_length=7, default='#2196F3')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class MPTTMeta:
        order_insertion_by = ['name']
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['tree_id', 'lft']
    
    def __str__(self):
        return self.name
    
    def get_full_path(self):
        """Return the full path of the category"""
        ancestors = self.get_ancestors(include_self=True)
        return ' / '.join([cat.name for cat in ancestors])