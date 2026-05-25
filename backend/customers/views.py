from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Customer, CustomerInteraction, CustomerNote
from .serializers import (
    CustomerSerializer, CustomerDetailSerializer,
    CustomerInteractionSerializer, CustomerNoteSerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """Customer management viewset"""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['customer_id', 'email', 'phone', 'identification_number']
    filterset_fields = ['customer_type', 'status', 'agent']
    ordering_fields = ['created_at', 'customer_id']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CustomerDetailSerializer
        return CustomerSerializer
    
    @action(detail=True, methods=['get'])
    def policies(self, request, pk=None):
        """Get customer policies"""
        customer = self.get_object()
        policies = customer.policies.all()
        
        from policies.serializers import PolicySerializer
        serializer = PolicySerializer(policies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def interactions(self, request, pk=None):
        """Get customer interactions"""
        customer = self.get_object()
        interactions = customer.interactions.all()
        
        serializer = CustomerInteractionSerializer(interactions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def claims(self, request, pk=None):
        """Get customer claims"""
        customer = self.get_object()
        claims = customer.claims.all()
        
        from claims.serializers import ClaimSerializer
        serializer = ClaimSerializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get customer summary"""
        customer = self.get_object()
        
        return Response({
            'customer_id': customer.customer_id,
            'email': customer.email,
            'phone': customer.phone,
            'customer_type': customer.customer_type,
            'status': customer.status,
            'total_policies': customer.policies.count(),
            'active_policies': customer.policies.filter(status='active').count(),
            'total_claims': customer.claims.count(),
            'total_interactions': customer.interactions.count(),
        })


class CustomerInteractionViewSet(viewsets.ModelViewSet):
    """Customer interaction management"""
    queryset = CustomerInteraction.objects.all()
    serializer_class = CustomerInteractionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['customer', 'agent', 'interaction_type']
    ordering_fields = ['created_at', 'scheduled_followup']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def pending_followups(self, request):
        """Get pending follow-ups"""
        from django.utils import timezone
        interactions = CustomerInteraction.objects.filter(
            scheduled_followup__lte=timezone.now()
        ).order_by('scheduled_followup')
        
        serializer = self.get_serializer(interactions, many=True)
        return Response(serializer.data)


class CustomerNoteViewSet(viewsets.ModelViewSet):
    """Customer note management"""
    queryset = CustomerNote.objects.all()
    serializer_class = CustomerNoteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['customer', 'is_internal']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
