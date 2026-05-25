from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Claim, ClaimDocument, ClaimAssessment, ClaimPayment
from .serializers import (
    ClaimSerializer, ClaimDetailSerializer, ClaimDocumentSerializer,
    ClaimAssessmentSerializer, ClaimPaymentSerializer
)


class ClaimViewSet(viewsets.ModelViewSet):
    """Claim management"""
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['claim_number', 'policy__policy_number', 'customer__customer_id']
    filterset_fields = ['status', 'priority', 'policy', 'customer']
    ordering_fields = ['claim_date', 'created_at', 'approved_amount']
    ordering = ['-claim_date']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClaimDetailSerializer
        return ClaimSerializer
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get claim documents"""
        claim = self.get_object()
        documents = claim.documents.all()
        
        serializer = ClaimDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_document(self, request, pk=None):
        """Add document to claim"""
        claim = self.get_object()
        
        serializer = ClaimDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(claim=claim, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending claims"""
        claims = Claim.objects.filter(status__in=['submitted', 'under_review', 'pending_documents'])
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def approved(self, request):
        """Get approved claims"""
        claims = Claim.objects.filter(status='approved')
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)


class ClaimDocumentViewSet(viewsets.ModelViewSet):
    """Claim document management"""
    queryset = ClaimDocument.objects.all()
    serializer_class = ClaimDocumentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['claim', 'document_type', 'is_verified']
    ordering_fields = ['uploaded_at']
    ordering = ['-uploaded_at']


class ClaimAssessmentViewSet(viewsets.ModelViewSet):
    """Claim assessment management"""
    queryset = ClaimAssessment.objects.all()
    serializer_class = ClaimAssessmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['claim', 'assessor']
    ordering_fields = ['assessment_date']
    ordering = ['-assessment_date']


class ClaimPaymentViewSet(viewsets.ModelViewSet):
    """Claim payment management"""
    queryset = ClaimPayment.objects.all()
    serializer_class = ClaimPaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['claim', 'status']
    ordering_fields = ['payment_date']
    ordering = ['-payment_date']
    
    @action(detail=False, methods=['get'])
    def pending_payment(self, request):
        """Get claims pending payment"""
        payments = ClaimPayment.objects.filter(status__in=['pending', 'approved'])
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
