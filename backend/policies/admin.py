from django.contrib import admin
from .models import InsuranceProduct, Policy, PolicyPayment


@admin.register(InsuranceProduct)
class InsuranceProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'product_type', 'minimum_premium', 'maximum_premium', 'is_active')
    list_filter = ('product_type', 'is_active')
    search_fields = ('product_name', 'description')
    readonly_fields = ('created_at', 'updated_at')


class PolicyPaymentInline(admin.TabularInline):
    model = PolicyPayment
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('policy_number', 'customer', 'product', 'status', 'premium_amount', 'start_date', 'end_date')
    list_filter = ('product', 'status', 'start_date', 'end_date')
    search_fields = ('policy_number', 'customer__customer_id', 'customer__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PolicyPaymentInline]
    fieldsets = (
        ('Policy Information', {
            'fields': ('policy_number', 'customer', 'agent', 'product', 'status')
        }),
        ('Financial Details', {
            'fields': ('premium_amount', 'coverage_limit')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Additional Information', {
            'fields': ('terms_and_conditions', 'renewal_reminder_sent', 'policy_details')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PolicyPayment)
class PolicyPaymentAdmin(admin.ModelAdmin):
    list_display = ('policy', 'amount', 'due_date', 'payment_date', 'status', 'payment_method')
    list_filter = ('status', 'payment_method', 'due_date')
    search_fields = ('policy__policy_number', 'reference_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'due_date'
