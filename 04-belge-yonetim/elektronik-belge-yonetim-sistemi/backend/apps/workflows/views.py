from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from .models import WorkflowTemplate, Workflow, WorkflowAction
from .serializers import (
    WorkflowTemplateSerializer, WorkflowSerializer,
    WorkflowCreateSerializer, WorkflowActionCreateSerializer
)


class WorkflowTemplateListView(generics.ListCreateAPIView):
    queryset = WorkflowTemplate.objects.filter(is_active=True).prefetch_related('steps')
    serializer_class = WorkflowTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            # Only admins can create templates
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WorkflowListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WorkflowCreateSerializer
        return WorkflowSerializer
    
    def get_queryset(self):
        queryset = Workflow.objects.select_related(
            'template', 'document', 'current_step', 'started_by'
        ).prefetch_related('actions')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by document
        document_id = self.request.query_params.get('document')
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        
        # Filter based on user permissions
        if self.request.user.role != 'admin':
            # Users can see workflows they started or can act on
            queryset = queryset.filter(
                models.Q(started_by=self.request.user) |
                models.Q(
                    status='active',
                    current_step__assigned_role=self.request.user.role
                ) |
                models.Q(
                    status='active',
                    current_step__assigned_department=self.request.user.department
                )
            ).distinct()
        
        return queryset


class WorkflowDetailView(generics.RetrieveAPIView):
    queryset = Workflow.objects.select_related(
        'template', 'document', 'current_step', 'started_by'
    ).prefetch_related('actions__performed_by', 'actions__step')
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkflowActionCreateView(generics.CreateAPIView):
    serializer_class = WorkflowActionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        workflow_id = self.kwargs['workflow_id']
        workflow = get_object_or_404(Workflow, pk=workflow_id)
        
        # Check if user can perform action
        if workflow.status != 'active':
            return Response(
                {'error': 'Bu iş akışı aktif değil.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not workflow.current_step:
            return Response(
                {'error': 'İş akışında aktif bir adım bulunmamaktadır.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate user permissions
        user = request.user
        step = workflow.current_step
        
        can_perform = (
            user.role == 'admin' or
            (step.assigned_role and user.role == step.assigned_role) or
            (step.assigned_department and user.department == step.assigned_department)
        )
        
        if not can_perform:
            return Response(
                {'error': 'Bu işlemi gerçekleştirme yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create action
        action = WorkflowAction.objects.create(
            workflow=workflow,
            step=workflow.current_step,
            performed_by=user,
            **serializer.validated_data
        )
        
        # Update workflow based on action
        if action.action_type in ['approved', 'reviewed', 'signed']:
            # Move to next step
            next_step = workflow.template.steps.filter(
                order__gt=workflow.current_step.order
            ).first()
            
            if next_step:
                workflow.current_step = next_step
                workflow.save()
            else:
                # Workflow completed
                workflow.status = 'completed'
                workflow.completed_at = timezone.now()
                workflow.save()
                
                # Update document status
                workflow.document.status = 'active'
                workflow.document.save()
        
        elif action.action_type == 'rejected':
            # End workflow
            workflow.status = 'cancelled'
            workflow.completed_at = timezone.now()
            workflow.save()
        
        return Response(
            WorkflowSerializer(workflow, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )