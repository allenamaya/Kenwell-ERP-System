from rest_framework import serializers
from .models import Invoice, InvoiceLineItem, Receipt, FinancialReport


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'invoice', 'description', 'quantity', 'unit_price', 'amount']
        read_only_fields = ['id']


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'invoice', 'amount', 'receipt_date',
            'payment_method', 'reference_number', 'status', 'received_by',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceSerializer(serializers.ModelSerializer):
    customer_display = serializers.CharField(source='customer.customer_id', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_display', 'policy',
            'invoice_date', 'due_date', 'amount', 'paid_amount', 'status',
            'description', 'notes', 'sent_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceDetailSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    receipts = ReceiptSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'policy', 'invoice_date',
            'due_date', 'amount', 'paid_amount', 'status', 'description',
            'notes', 'sent_date', 'created_by', 'line_items', 'receipts',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FinancialReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialReport
        fields = [
            'id', 'report_type', 'period_start', 'period_end', 'total_premium',
            'total_claims', 'total_commissions', 'total_revenue', 'net_profit',
            'outstanding_invoices', 'data', 'generated_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
