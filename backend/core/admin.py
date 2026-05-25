from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active_user', 'created_at')
    list_filter = ('role', 'is_active_user', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Kenwell Specific', {
            'fields': ('role', 'phone', 'profile_picture', 'is_active_user', 'created_at', 'updated_at')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'country', 'is_verified', 'created_at')
    list_filter = ('country', 'is_verified', 'created_at')
    search_fields = ('user__username', 'user__email', 'company_name')
    readonly_fields = ('created_at', 'updated_at', 'verification_date')
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('bio', 'company_name', 'identification_number', 'address', 'city', 'state', 'postal_code', 'country')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'model_name', 'object_id', 'timestamp')
    list_filter = ('action', 'model_name', 'timestamp')
    search_fields = ('user__username', 'model_name')
    readonly_fields = ('user', 'action', 'model_name', 'object_id', 'changes', 'ip_address', 'timestamp')
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
