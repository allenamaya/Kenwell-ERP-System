from rest_framework import serializers
from .models import Claim, ClaimDocument, ClaimAssessment, ClaimPayment


class ClaimDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_display = serializers.CharField(source='uploaded_by.__str__', read_only=True)
    
    class Meta:
        model = ClaimDocument
        fields = [
            'id', 'claim', 'document_type', 'file', 'description',
            'uploaded_by', 'uploaded_by_display', 'is_verified', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']


class ClaimAssessmentSerializer(serializers.ModelSerializer):
    assessor_display = serializers.CharField(source='assessor.__str__', read_only=True)
    
    class Meta:
        model = ClaimAssessment
        fields = [
            'id', 'claim', 'assessor', 'assessor_display', 'assessment_date',
            'findings', 'recommended_amount', 'deductible_amount',
            'assessment_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClaimPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimPayment
        fields = [
            'id', 'claim', 'amount', 'payment_date', 'payment_method',
            'bank_account', 'status', 'reference_number', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClaimSerializer(serializers.ModelSerializer):
    policy_display = serializers.CharField(source='policy.policy_number', read_only=True)
    customer_display = serializers.CharField(source='customer.customer_id', read_only=True)
    
    class Meta:
        model = Claim
        fields = [
            'id', 'claim_number', 'policy', 'policy_display', 'customer',
            'customer_display', 'claim_date', 'incident_date',
            'incident_description', 'claim_amount', 'approved_amount',
            'status', 'priority', 'assigned_to', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClaimDetailSerializer(serializers.ModelSerializer):
    documents = ClaimDocumentSerializer(many=True, read_only=True)
    assessment = ClaimAssessmentSerializer(read_only=True)
    payment = ClaimPaymentSerializer(read_only=True)
    
    class Meta:
        model = Claim
        fields = [
            'id', 'claim_number', 'policy', 'customer', 'claim_date',
            'incident_date', 'incident_description', 'claim_amount',
            'approved_amount', 'status', 'priority', 'assigned_to',
            'location_of_incident', 'third_party_involved', 'third_party_details',
            'police_report_filed', 'police_report_number', 'estimated_repair_cost',
            'resolution_notes', 'documents', 'assessment', 'payment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
