from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoanViewSet, ReservationViewSet, FineViewSet, MemberLoanSummaryView

router = DefaultRouter()
router.register('reservations', ReservationViewSet, basename='reservation')
router.register('fines', FineViewSet, basename='fine')
router.register('summary', MemberLoanSummaryView, basename='member-loan-summary')
router.register('', LoanViewSet, basename='loan')

urlpatterns = [
    path('', include(router.urls)),
]