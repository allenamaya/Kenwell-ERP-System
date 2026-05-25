from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from .models import Agent, AgentCommission, AgentPerformance
from .serializers import (
    AgentSerializer, AgentDetailSerializer,
    AgentCommissionSerializer, AgentPerformanceSerializer
)


class AgentViewSet(viewsets.ModelViewSet):
    """Agent management viewset"""
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['agent_code', 'user__username', 'user__email', 'license_number']
    filterset_fields = ['status', 'agent_type']
    ordering_fields = ['created_at', 'total_commission']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AgentDetailSerializer
        return AgentSerializer
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get agent performance metrics"""
        agent = self.get_object()
        try:
            performance = agent.performance
            serializer = AgentPerformanceSerializer(performance)
            return Response(serializer.data)
        except AgentPerformance.DoesNotExist:
            return Response(
                {'error': 'Performance data not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def commissions(self, request, pk=None):
        """Get agent commissions"""
        agent = self.get_object()
        commissions = agent.commissions.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            commissions = commissions.filter(status=status_filter)
        
        serializer = AgentCommissionSerializer(commissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get agent summary statistics"""
        agent = self.get_object()
        
        summary = {
            'agent_code': agent.agent_code,
            'total_policies': agent.total_policies,
            'total_commission': float(agent.total_commission),
            'commission_rate': float(agent.commission_rate),
            'status': agent.status,
            'license_expiry': agent.license_expiry,
        }
        
        # Add performance data if available
        try:
            perf = agent.performance
            summary['performance'] = {
                'active_policies': perf.active_policies,
                'lapsed_policies': perf.lapsed_policies,
                'total_clients': perf.total_clients,
                'customer_satisfaction': float(perf.customer_satisfaction_rating),
            }
        except AgentPerformance.DoesNotExist:
            pass
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """Get top performing agents"""
        limit = int(request.query_params.get('limit', 10))
        agents = Agent.objects.filter(status='active').order_by('-total_commission')[:limit]
        serializer = self.get_serializer(agents, many=True)
        return Response(serializer.data)


class AgentCommissionViewSet(viewsets.ModelViewSet):
    """Agent commission management"""
    queryset = AgentCommission.objects.all()
    serializer_class = AgentCommissionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['agent', 'status']
    ordering_fields = ['period_end', 'amount']
    ordering = ['-period_end']
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending commissions"""
        commissions = AgentCommission.objects.filter(status='pending')
        serializer = self.get_serializer(commissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_agent(self, request):
        """Get commissions by agent"""
        agent_id = request.query_params.get('agent_id')
        if not agent_id:
            return Response(
                {'error': 'agent_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        commissions = AgentCommission.objects.filter(agent_id=agent_id)
        serializer = self.get_serializer(commissions, many=True)
        return Response(serializer.data)


class AgentPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    """Agent performance metrics (read-only)"""
    queryset = AgentPerformance.objects.all()
    serializer_class = AgentPerformanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['agent']
