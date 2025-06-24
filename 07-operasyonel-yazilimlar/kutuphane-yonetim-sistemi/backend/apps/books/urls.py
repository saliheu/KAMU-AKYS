from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PublisherViewSet, AuthorViewSet, BookViewSet, BookCopyViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('publishers', PublisherViewSet, basename='publisher')
router.register('authors', AuthorViewSet, basename='author')
router.register('copies', BookCopyViewSet, basename='bookcopy')
router.register('', BookViewSet, basename='book')

urlpatterns = [
    path('', include(router.urls)),
]