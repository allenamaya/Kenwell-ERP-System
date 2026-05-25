from rest_framework import serializers
from .models import Agent, AgentCommission, AgentPerformance
from core.serializers import UserSerializer


class AgentPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentPerformance
        fields = [
            'id', 'agent', 'total_clients', 'active_policies', 'lapsed_policies',
            'total_premium', 'claims_handled', 'customer_satisfaction_rating', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class AgentCommissionSerializer(serializers.ModelSerializer):
    agent_display = serializers.CharField(source='agent.agent_code', read_only=True)
    
    class Meta:
        model = AgentCommission
        fields = [
            'id', 'agent', 'agent_display', 'period_start', 'period_end',
            'amount', 'status', 'payment_date', 'reference_number', 'notes'
        ]
        read_only_fields = ['id']


class AgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    performance = AgentPerformanceSerializer(read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'user', 'agent_type', 'license_number', 'license_expiry',
            'agent_code', 'specialization', 'commission_rate', 'status',
            'bank_account', 'bank_name', 'bank_code', 'total_policies',
            'total_commission', 'website', 'performance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_policies', 'total_commission', 'created_at', 'updated_at']


class AgentDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    performance = AgentPerformanceSerializer(read_only=True)
    commissions = AgentCommissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'user', 'agent_type', 'license_number', 'license_expiry',
            'agent_code', 'specialization', 'commission_rate', 'status',
            'bank_account', 'bank_name', 'bank_code', 'total_policies',
            'total_commission', 'website', 'performance', 'commissions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_policies', 'total_commission', 'created_at', 'updated_at']
