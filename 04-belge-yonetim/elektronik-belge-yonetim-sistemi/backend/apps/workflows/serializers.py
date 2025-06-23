from rest_framework import serializers
from .models import WorkflowTemplate, WorkflowStep, Workflow, WorkflowAction
from apps.authentication.serializers import UserSerializer
from apps.documents.serializers import DocumentSerializer


class WorkflowStepSerializer(serializers.ModelSerializer):
    assigned_department_name = serializers.CharField(source='assigned_department.name', read_only=True)
    
    class Meta:
        model = WorkflowStep
        fields = [
            'id', 'name', 'step_type', 'order', 'assigned_role',
            'assigned_department', 'assigned_department_name',
            'deadline_days', 'is_optional'
        ]


class WorkflowTemplateSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = WorkflowTemplate
        fields = [
            'id', 'name', 'description', 'is_active', 'steps',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class WorkflowActionSerializer(serializers.ModelSerializer):
    performed_by_detail = UserSerializer(source='performed_by', read_only=True)
    forwarded_to_detail = UserSerializer(source='forwarded_to', read_only=True)
    step_name = serializers.CharField(source='step.name', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = WorkflowAction
        fields = [
            'id', 'step', 'step_name', 'action_type', 'action_type_display',
            'performed_by', 'performed_by_detail', 'performed_at',
            'comments', 'forwarded_to', 'forwarded_to_detail'
        ]
        read_only_fields = ['performed_by', 'performed_at']


class WorkflowSerializer(serializers.ModelSerializer):
    template_detail = WorkflowTemplateSerializer(source='template', read_only=True)
    document_detail = DocumentSerializer(source='document', read_only=True)
    current_step_detail = WorkflowStepSerializer(source='current_step', read_only=True)
    started_by_name = serializers.CharField(source='started_by.get_full_name', read_only=True)
    actions = WorkflowActionSerializer(many=True, read_only=True)
    can_perform_action = serializers.SerializerMethodField()
    
    class Meta:
        model = Workflow
        fields = [
            'id', 'template', 'template_detail', 'document', 'document_detail',
            'status', 'current_step', 'current_step_detail', 'started_by',
            'started_by_name', 'started_at', 'completed_at', 'actions',
            'can_perform_action'
        ]
        read_only_fields = ['started_by', 'started_at', 'completed_at']
    
    def get_can_perform_action(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Check if workflow is active
        if obj.status != 'active' or not obj.current_step:
            return False
        
        # Check if user has the right role or department
        user = request.user
        step = obj.current_step
        
        # Admin can always perform actions
        if user.role == 'admin':
            return True
        
        # Check role match
        if step.assigned_role and user.role == step.assigned_role:
            return True
        
        # Check department match
        if step.assigned_department and user.department == step.assigned_department:
            return True
        
        return False


class WorkflowCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = ['template', 'document']
    
    def validate(self, attrs):
        # Check if there's already an active workflow for this document
        if Workflow.objects.filter(
            document=attrs['document'],
            status='active'
        ).exists():
            raise serializers.ValidationError(
                "Bu belge için zaten aktif bir iş akışı bulunmaktadır."
            )
        return attrs
    
    def create(self, validated_data):
        # Set the first step as current step
        template = validated_data['template']
        first_step = template.steps.first()
        
        workflow = Workflow.objects.create(
            **validated_data,
            current_step=first_step,
            started_by=self.context['request'].user
        )
        return workflow


class WorkflowActionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowAction
        fields = ['action_type', 'comments', 'forwarded_to']
    
    def validate_action_type(self, value):
        workflow_id = self.context['view'].kwargs.get('workflow_id')
        workflow = Workflow.objects.get(pk=workflow_id)
        
        if not workflow.current_step:
            raise serializers.ValidationError("İş akışında aktif bir adım bulunmamaktadır.")
        
        # Validate action type based on step type
        step_type = workflow.current_step.step_type
        valid_actions = {
            'approval': ['approved', 'rejected', 'commented'],
            'review': ['reviewed', 'commented', 'forwarded'],
            'signature': ['signed', 'rejected', 'commented'],
            'notification': ['commented']
        }
        
        if value not in valid_actions.get(step_type, []):
            raise serializers.ValidationError(
                f"'{value}' bu adım türü için geçerli bir işlem değildir."
            )
        
        return value