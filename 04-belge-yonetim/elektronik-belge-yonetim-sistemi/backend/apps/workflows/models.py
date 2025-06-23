from django.db import models
from django.conf import settings
from apps.documents.models import Document


class WorkflowTemplate(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class WorkflowStep(models.Model):
    STEP_TYPES = [
        ('approval', 'Onay'),
        ('review', 'İnceleme'),
        ('signature', 'İmza'),
        ('notification', 'Bildirim'),
    ]
    
    template = models.ForeignKey(WorkflowTemplate, on_delete=models.CASCADE, related_name='steps')
    name = models.CharField(max_length=100)
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    order = models.IntegerField()
    assigned_role = models.CharField(max_length=20, blank=True)  # Role that can perform this step
    assigned_department = models.ForeignKey('authentication.Department', on_delete=models.SET_NULL, null=True, blank=True)
    deadline_days = models.IntegerField(default=3)  # Days to complete the step
    is_optional = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['order']
        unique_together = ['template', 'order']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"


class Workflow(models.Model):
    STATUS_CHOICES = [
        ('active', 'Aktif'),
        ('completed', 'Tamamlandı'),
        ('cancelled', 'İptal Edildi'),
        ('expired', 'Süresi Doldu'),
    ]
    
    template = models.ForeignKey(WorkflowTemplate, on_delete=models.PROTECT)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='workflows')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    current_step = models.ForeignKey(WorkflowStep, on_delete=models.SET_NULL, null=True, related_name='current_workflows')
    started_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='started_workflows')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.document.title}"


class WorkflowAction(models.Model):
    ACTION_TYPES = [
        ('approved', 'Onaylandı'),
        ('rejected', 'Reddedildi'),
        ('reviewed', 'İncelendi'),
        ('signed', 'İmzalandı'),
        ('commented', 'Yorum Eklendi'),
        ('forwarded', 'Yönlendirildi'),
    ]
    
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='actions')
    step = models.ForeignKey(WorkflowStep, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(blank=True)
    forwarded_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='forwarded_actions')
    
    class Meta:
        ordering = ['-performed_at']
    
    def __str__(self):
        return f"{self.workflow} - {self.action_type}"