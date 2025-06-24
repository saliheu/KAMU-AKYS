from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django_filters import rest_framework as filters
from django.db import models
from .models import User, Member, MembershipHistory
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    MemberSerializer, MemberCreateSerializer, MemberListSerializer,
    MembershipHistorySerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """User management viewset"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['role', 'is_active']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'login']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """User login"""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class MemberFilter(filters.FilterSet):
    """Member filter"""
    search = filters.CharFilter(method='search_members')
    
    class Meta:
        model = Member
        fields = ['member_type', 'status', 'search']
    
    def search_members(self, queryset, name, value):
        return queryset.filter(
            models.Q(first_name__icontains=value) |
            models.Q(last_name__icontains=value) |
            models.Q(email__icontains=value) |
            models.Q(member_id__icontains=value) |
            models.Q(tc_no__icontains=value)
        )


class MemberViewSet(viewsets.ModelViewSet):
    """Member management viewset"""
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = MemberFilter
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MemberCreateSerializer
        elif self.action == 'list':
            return MemberListSerializer
        return MemberSerializer
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend member"""
        member = self.get_object()
        old_status = member.status
        member.status = 'SUSPENDED'
        member.save()
        
        # Create history record
        MembershipHistory.objects.create(
            member=member,
            action='SUSPENDED',
            old_status=old_status,
            new_status='SUSPENDED',
            notes=request.data.get('reason', ''),
            created_by=request.user
        )
        
        return Response({'status': 'Üye askıya alındı'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate member"""
        member = self.get_object()
        old_status = member.status
        member.status = 'ACTIVE'
        member.save()
        
        # Create history record
        MembershipHistory.objects.create(
            member=member,
            action='ACTIVATED',
            old_status=old_status,
            new_status='ACTIVE',
            notes=request.data.get('reason', ''),
            created_by=request.user
        )
        
        return Response({'status': 'Üye aktifleştirildi'})
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get member history"""
        member = self.get_object()
        history = member.history.all()
        serializer = MembershipHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def loans(self, request, pk=None):
        """Get member loans"""
        member = self.get_object()
        from apps.loans.serializers import LoanSerializer
        
        active_loans = member.loans.filter(status__in=['BORROWED', 'OVERDUE'])
        history_loans = member.loans.filter(status='RETURNED')
        
        return Response({
            'active': LoanSerializer(active_loans, many=True).data,
            'history': LoanSerializer(history_loans, many=True).data,
            'stats': {
                'total_loans': member.loans.count(),
                'active_loans': active_loans.count(),
                'overdue_loans': active_loans.filter(status='OVERDUE').count(),
                'total_fines': member.fines.aggregate(
                    total=models.Sum('amount')
                )['total'] or 0,
                'unpaid_fines': member.fines.filter(paid=False).aggregate(
                    total=models.Sum('amount')
                )['total'] or 0
            }
        })
    
    @action(detail=True, methods=['get'])
    def card(self, request, pk=None):
        """Generate member card"""
        member = self.get_object()
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import ID_CARD
        from django.http import HttpResponse
        import io
        
        # Create PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=ID_CARD)
        
        # Add content
        p.drawString(20, 180, "KÜTÜPHANE ÜYE KARTI")
        p.drawString(20, 160, f"Ad Soyad: {member.full_name}")
        p.drawString(20, 140, f"Üye No: {member.member_id}")
        p.drawString(20, 120, f"Üye Tipi: {member.get_member_type_display()}")
        p.drawString(20, 100, f"Geçerlilik: {member.expiry_date}")
        
        # Generate barcode/QR code area
        p.drawString(20, 60, f"||||| {member.member_id} |||||")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="member_card_{member.member_id}.pdf"'
        
        return response