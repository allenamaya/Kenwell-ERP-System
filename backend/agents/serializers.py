from rest_framework import serializers
from .models import Agent, AgentCommission, AgentPerformance
from core.serializers import UserSerializer
from core.models import User, UserProfile


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


class AgentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']


class AgentSerializer(serializers.ModelSerializer):
    user = AgentUserSerializer()
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

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        username = user_data.get('username')
        email = user_data.get('email')
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role='agent',
            is_active_user=True
        )
        user.set_password('KenwellAgent2026!')
        user.save()
        
        UserProfile.objects.get_or_create(user=user)
        
        agent = Agent.objects.create(user=user, **validated_data)
        AgentPerformance.objects.get_or_create(agent=agent)
        
        return agent

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            user.save()
            
        status_val = validated_data.get('status', instance.status)
        if status_val:
            user = instance.user
            if status_val == 'active':
                user.is_active = True
                user.is_active_user = True
            else:  # inactive or suspended
                user.is_active = False
                user.is_active_user = False
            user.save()
            
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data
        return data


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

