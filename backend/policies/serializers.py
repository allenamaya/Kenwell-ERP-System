from rest_framework import serializers
from .models import InsuranceProduct, Policy, PolicyPayment


class InsuranceProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceProduct
        fields = [
            'id', 'product_name', 'product_type', 'description',
            'minimum_premium', 'maximum_premium', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PolicyPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyPayment
        fields = [
            'id', 'policy', 'amount', 'payment_date', 'due_date',
            'payment_method', 'status', 'reference_number', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PolicySerializer(serializers.ModelSerializer):
    product_display = serializers.CharField(source='product.product_name', read_only=True)
    customer_display = serializers.CharField(source='customer.customer_id', read_only=True)
    
    class Meta:
        model = Policy
        fields = [
            'id', 'policy_number', 'customer', 'customer_display', 'agent',
            'product', 'product_display', 'status', 'premium_amount',
            'start_date', 'end_date', 'coverage_limit', 'policy_details',
            'renewal_reminder_sent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PolicyDetailSerializer(serializers.ModelSerializer):
    product = InsuranceProductSerializer(read_only=True)
    payments = PolicyPaymentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Policy
        fields = [
            'id', 'policy_number', 'customer', 'agent', 'product',
            'status', 'premium_amount', 'start_date', 'end_date',
            'coverage_limit', 'terms_and_conditions', 'policy_details',
            'renewal_reminder_sent', 'payments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
