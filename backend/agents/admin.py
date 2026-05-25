from django.contrib import admin
from .models import Agent, AgentCommission, AgentPerformance


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('agent_code', 'user', 'agent_type', 'status', 'commission_rate', 'total_policies', 'created_at')
    list_filter = ('agent_type', 'status', 'created_at')
    search_fields = ('agent_code', 'user__username', 'user__email', 'license_number')
    readonly_fields = ('created_at', 'updated_at', 'total_policies', 'total_commission')
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'agent_code', 'agent_type', 'license_number', 'license_expiry')
        }),
        ('Financial Details', {
            'fields': ('commission_rate', 'bank_account', 'bank_name', 'bank_code', 'total_commission')
        }),
        ('Profile Information', {
            'fields': ('specialization', 'website', 'status', 'total_policies')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AgentCommission)
class AgentCommissionAdmin(admin.ModelAdmin):
    list_display = ('agent', 'period_end', 'amount', 'status', 'payment_date')
    list_filter = ('status', 'period_end')
    search_fields = ('agent__agent_code', 'agent__user__username', 'reference_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'period_end'


@admin.register(AgentPerformance)
class AgentPerformanceAdmin(admin.ModelAdmin):
    list_display = ('agent', 'active_policies', 'lapsed_policies', 'customer_satisfaction_rating', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('agent__agent_code', 'agent__user__username')
    readonly_fields = ('last_updated',)
