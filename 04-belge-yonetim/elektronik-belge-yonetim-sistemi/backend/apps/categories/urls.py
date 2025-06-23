from django.urls import path
from .views import CategoryListCreateView, CategoryDetailView, category_tree_view

urlpatterns = [
    path('', CategoryListCreateView.as_view(), name='category_list'),
    path('<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('tree/', category_tree_view, name='category_tree'),
]