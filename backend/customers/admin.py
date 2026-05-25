from django.contrib import admin
from .models import Customer, CustomerInteraction, CustomerNote


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'email', 'customer_type', 'agent', 'status', 'created_at')
    list_filter = ('customer_type', 'status', 'created_at')
    search_fields = ('customer_id', 'email', 'phone', 'identification_number')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('customer_id', 'customer_type', 'status', 'user', 'agent')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'preferred_communication')
        }),
        ('Identification', {
            'fields': ('identification_type', 'identification_number', 'date_of_birth')
        }),
        ('Business Details', {
            'fields': ('business_registration',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class CustomerNoteInline(admin.TabularInline):
    model = CustomerNote
    extra = 1
    readonly_fields = ('created_by', 'created_at', 'updated_at')


@admin.register(CustomerInteraction)
class CustomerInteractionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'interaction_type', 'agent', 'subject', 'created_at')
    list_filter = ('interaction_type', 'created_at')
    search_fields = ('customer__customer_id', 'subject', 'agent__agent_code')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'


@admin.register(CustomerNote)
class CustomerNoteAdmin(admin.ModelAdmin):
    list_display = ('customer', 'created_by', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('customer__customer_id', 'content')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
