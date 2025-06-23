from django.urls import path
from .views import (
    WorkflowTemplateListView, WorkflowListCreateView,
    WorkflowDetailView, WorkflowActionCreateView
)

urlpatterns = [
    path('templates/', WorkflowTemplateListView.as_view(), name='workflow_templates'),
    path('', WorkflowListCreateView.as_view(), name='workflow_list'),
    path('<int:pk>/', WorkflowDetailView.as_view(), name='workflow_detail'),
    path('<int:workflow_id>/actions/', WorkflowActionCreateView.as_view(), name='workflow_action'),
]