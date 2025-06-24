from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MemberViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('', MemberViewSet, basename='member')

urlpatterns = [
    path('', include(router.urls)),
]