from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from .models import InsuranceProduct, Policy, PolicyPayment
from .serializers import (
    InsuranceProductSerializer, PolicySerializer, PolicyDetailSerializer,
    PolicyPaymentSerializer
)


class InsuranceProductViewSet(viewsets.ModelViewSet):
    """Insurance product catalog"""
    queryset = InsuranceProduct.objects.all()
    serializer_class = InsuranceProductSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['product_type', 'category', 'is_active']
    search_fields = ['product_name', 'description']
    
    def get_queryset(self):
        user = self.request.user
        queryset = InsuranceProduct.objects.all()
        # Non-admins/non-ops can only see active products
        if not (user.is_superuser or user.is_staff or user.role in ['admin', 'operations']):
            queryset = queryset.filter(is_active=True)
            
        # Filter by category if provided in query params
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset.annotate(policy_count=Count('policies')).order_by('-policy_count')


class PolicyViewSet(viewsets.ModelViewSet):
    """Policy management"""
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['policy_number', 'customer__customer_id', 'customer__email']
    filterset_fields = ['status', 'product', 'agent', 'customer']
    ordering_fields = ['created_at', 'start_date', 'end_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PolicyDetailSerializer
        return PolicySerializer
    
    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """Get policy payments"""
        policy = self.get_object()
        payments = policy.payments.all()
        
        serializer = PolicyPaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def claims(self, request, pk=None):
        """Get policy claims"""
        policy = self.get_object()
        claims = policy.claims.all()
        
        from claims.serializers import ClaimSerializer
        serializer = ClaimSerializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get policies expiring in next 30 days"""
        from datetime import timedelta
        today = timezone.now().date()
        thirty_days = today + timedelta(days=30)
        
        policies = Policy.objects.filter(
            end_date__gte=today,
            end_date__lte=thirty_days,
            status='active'
        ).order_by('end_date')
        
        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_policies(self, request):
        """Get all active policies"""
        policies = Policy.objects.filter(status='active')
        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """Get policies by customer"""
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response(
                {'error': 'customer_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        policies = Policy.objects.filter(customer_id=customer_id)
        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)


class PolicyPaymentViewSet(viewsets.ModelViewSet):
    """Policy payment management"""
    queryset = PolicyPayment.objects.all()
    serializer_class = PolicyPaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['policy', 'status', 'payment_method']
    ordering_fields = ['due_date', 'payment_date']
    ordering = ['-due_date']
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue payments"""
        today = timezone.now().date()
        payments = PolicyPayment.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'partially_paid']
        ).order_by('due_date')
        
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_policy(self, request):
        """Get payments by policy"""
        policy_id = request.query_params.get('policy_id')
        if not policy_id:
            return Response(
                {'error': 'policy_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payments = PolicyPayment.objects.filter(policy_id=policy_id)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
