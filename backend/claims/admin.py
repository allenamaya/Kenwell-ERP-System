from django.contrib import admin
from .models import Claim, ClaimDocument, ClaimAssessment, ClaimPayment


class ClaimDocumentInline(admin.TabularInline):
    model = ClaimDocument
    extra = 1
    readonly_fields = ('uploaded_at',)


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('claim_number', 'policy', 'customer', 'status', 'priority', 'claim_amount', 'approved_amount', 'claim_date')
    list_filter = ('status', 'priority', 'claim_date')
    search_fields = ('claim_number', 'policy__policy_number', 'customer__customer_id')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ClaimDocumentInline]
    date_hierarchy = 'claim_date'
    fieldsets = (
        ('Claim Information', {
            'fields': ('claim_number', 'policy', 'customer', 'status', 'priority', 'assigned_to')
        }),
        ('Incident Details', {
            'fields': ('incident_date', 'incident_description', 'location_of_incident')
        }),
        ('Financial Details', {
            'fields': ('claim_amount', 'approved_amount')
        }),
        ('Third Party', {
            'fields': ('third_party_involved', 'third_party_details', 'police_report_filed', 'police_report_number')
        }),
        ('Resolution', {
            'fields': ('estimated_repair_cost', 'resolution_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ClaimDocument)
class ClaimDocumentAdmin(admin.ModelAdmin):
    list_display = ('claim', 'document_type', 'uploaded_by', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = ('claim__claim_number', 'description')
    readonly_fields = ('uploaded_at',)


@admin.register(ClaimAssessment)
class ClaimAssessmentAdmin(admin.ModelAdmin):
    list_display = ('claim', 'assessor', 'assessment_date', 'recommended_amount')
    list_filter = ('assessment_date',)
    search_fields = ('claim__claim_number', 'assessor__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ClaimPayment)
class ClaimPaymentAdmin(admin.ModelAdmin):
    list_display = ('claim', 'amount', 'payment_date', 'status', 'payment_method')
    list_filter = ('status', 'payment_date')
    search_fields = ('claim__claim_number', 'reference_number')
    readonly_fields = ('created_at', 'updated_at')
