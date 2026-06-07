from rest_framework import serializers
from .models import Customer, CustomerInteraction, CustomerNote
from core.serializers import UserSerializer
from agents.serializers import AgentSerializer


class CustomerNoteSerializer(serializers.ModelSerializer):
    created_by_display = serializers.CharField(source='created_by.__str__', read_only=True)
    
    class Meta:
        model = CustomerNote
        fields = [
            'id', 'customer', 'created_by', 'created_by_display',
            'content', 'is_internal', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerInteractionSerializer(serializers.ModelSerializer):
    agent_display = serializers.CharField(source='agent.agent_code', read_only=True)
    
    class Meta:
        model = CustomerInteraction
        fields = [
            'id', 'customer', 'agent', 'agent_display', 'interaction_type',
            'subject', 'notes', 'outcome', 'scheduled_followup', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'customer_type', 'customer_id', 'phone', 'email',
            'agent', 'identification_type', 'identification_number',
            'date_of_birth', 'business_registration', 'status',
            'kra_pin', 'kra_pin_document',
            'preferred_communication', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    agent = AgentSerializer(read_only=True)
    interactions = CustomerInteractionSerializer(many=True, read_only=True)
    notes = CustomerNoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'customer_type', 'customer_id', 'phone', 'email',
            'agent', 'identification_type', 'identification_number',
            'date_of_birth', 'business_registration', 'status',
            'kra_pin', 'kra_pin_document',
            'preferred_communication', 'interactions', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
