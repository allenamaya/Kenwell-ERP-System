from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from .models import Invoice, InvoiceLineItem, Receipt, FinancialReport
from .serializers import (
    InvoiceSerializer, InvoiceDetailSerializer, InvoiceLineItemSerializer,
    ReceiptSerializer, FinancialReportSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    """Invoice management"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['invoice_number', 'customer__customer_id', 'customer__email']
    filterset_fields = ['status', 'customer', 'invoice_date', 'due_date']
    ordering_fields = ['invoice_date', 'due_date', 'amount']
    ordering = ['-invoice_date']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InvoiceDetailSerializer
        return InvoiceSerializer
    
    @action(detail=True, methods=['get'])
    def line_items(self, request, pk=None):
        """Get invoice line items"""
        invoice = self.get_object()
        items = invoice.line_items.all()
        
        serializer = InvoiceLineItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_line_item(self, request, pk=None):
        """Add line item to invoice"""
        invoice = self.get_object()
        
        serializer = InvoiceLineItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(invoice=invoice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def outstanding(self, request):
        """Get outstanding invoices"""
        invoices = Invoice.objects.filter(status__in=['sent', 'overdue'])
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue invoices"""
        from django.utils import timezone
        today = timezone.now().date()
        invoices = Invoice.objects.filter(
            due_date__lt=today,
            status__in=['sent', 'overdue']
        ).order_by('due_date')
        
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """Get invoices by customer"""
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response(
                {'error': 'customer_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoices = Invoice.objects.filter(customer_id=customer_id)
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)


class ReceiptViewSet(viewsets.ModelViewSet):
    """Receipt management"""
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['receipt_number', 'invoice__invoice_number', 'reference_number']
    filterset_fields = ['status', 'invoice', 'receipt_date']
    ordering_fields = ['receipt_date']
    ordering = ['-receipt_date']


class FinancialReportViewSet(viewsets.ReadOnlyModelViewSet):
    """Financial reports (read-only)"""
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['report_type']
    ordering_fields = ['period_end']
    ordering = ['-period_end']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest report of each type"""
        from django.db.models import Max
        
        reports = []
        report_types = ['daily', 'weekly', 'monthly', 'quarterly', 'annual']
        
        for rtype in report_types:
            latest = FinancialReport.objects.filter(
                report_type=rtype
            ).order_by('-period_end').first()
            
            if latest:
                serializer = self.get_serializer(latest)
                reports.append(serializer.data)
        
        return Response(reports)
    
    @action(detail=False, methods=['get'])
    def by_period(self, request):
        """Get reports by period"""
        period_start = request.query_params.get('period_start')
        period_end = request.query_params.get('period_end')
        
        if not period_start or not period_end:
            return Response(
                {'error': 'period_start and period_end parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reports = FinancialReport.objects.filter(
            period_start__gte=period_start,
            period_end__lte=period_end
        )
        
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
