from django.urls import path
from .views import (
    DocumentListCreateView, DocumentDetailView, document_download,
    DocumentVersionListView, DocumentAccessListCreateView, DocumentLogListView
)

urlpatterns = [
    path('', DocumentListCreateView.as_view(), name='document_list'),
    path('<int:pk>/', DocumentDetailView.as_view(), name='document_detail'),
    path('<int:pk>/download/', document_download, name='document_download'),
    path('<int:document_id>/versions/', DocumentVersionListView.as_view(), name='document_versions'),
    path('<int:document_id>/access/', DocumentAccessListCreateView.as_view(), name='document_access'),
    path('<int:document_id>/logs/', DocumentLogListView.as_view(), name='document_logs'),
]