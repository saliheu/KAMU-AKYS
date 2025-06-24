from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('loans/', views.loan_report, name='loan-report'),
    path('inventory/', views.inventory_report, name='inventory-report'),
    path('members/', views.member_report, name='member-report'),
    path('overdue/', views.overdue_report, name='overdue-report'),
    path('popular-books/', views.popular_books_report, name='popular-books-report'),
    path('export/<str:report_type>/', views.export_report, name='export-report'),
]