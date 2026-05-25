from django.contrib import admin
from .models import Invoice, InvoiceLineItem, Receipt, FinancialReport


class InvoiceLineItemInline(admin.TabularInline):
    model = InvoiceLineItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'amount', 'paid_amount', 'status', 'invoice_date', 'due_date')
    list_filter = ('status', 'invoice_date', 'due_date')
    search_fields = ('invoice_number', 'customer__customer_id', 'customer__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [InvoiceLineItemInline]
    date_hierarchy = 'invoice_date'
    fieldsets = (
        ('Invoice Information', {
            'fields': ('invoice_number', 'customer', 'policy', 'status')
        }),
        ('Financial Details', {
            'fields': ('amount', 'paid_amount')
        }),
        ('Dates', {
            'fields': ('invoice_date', 'due_date', 'sent_date')
        }),
        ('Additional Information', {
            'fields': ('description', 'notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'invoice', 'amount', 'receipt_date', 'status')
    list_filter = ('status', 'receipt_date')
    search_fields = ('receipt_number', 'invoice__invoice_number', 'reference_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'receipt_date'


@admin.register(FinancialReport)
class FinancialReportAdmin(admin.ModelAdmin):
    list_display = ('get_report_type_display', 'period_start', 'period_end', 'total_premium', 'total_claims', 'net_profit')
    list_filter = ('report_type', 'period_end')
    readonly_fields = ('created_at',)
    date_hierarchy = 'period_end'
    fieldsets = (
        ('Report Information', {
            'fields': ('report_type', 'period_start', 'period_end', 'generated_by')
        }),
        ('Financial Metrics', {
            'fields': ('total_premium', 'total_claims', 'total_commissions', 'total_revenue', 'net_profit', 'outstanding_invoices')
        }),
        ('Data', {
            'fields': ('data',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
