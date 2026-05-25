"""
URL configuration for kenwell_erp project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from core.views import (
    LoginView, UserViewSet, UserProfileViewSet, AuditLogViewSet
)
from agents.views import AgentViewSet, AgentCommissionViewSet, AgentPerformanceViewSet
from customers.views import CustomerViewSet, CustomerInteractionViewSet, CustomerNoteViewSet
from policies.views import InsuranceProductViewSet, PolicyViewSet, PolicyPaymentViewSet
from claims.views import ClaimViewSet, ClaimDocumentViewSet, ClaimAssessmentViewSet, ClaimPaymentViewSet
from billing.views import InvoiceViewSet, ReceiptViewSet, FinancialReportViewSet

# Create router and register viewsets
router = DefaultRouter()

# Core
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

# Agents
router.register(r'agents', AgentViewSet)
router.register(r'agent-commissions', AgentCommissionViewSet)
router.register(r'agent-performance', AgentPerformanceViewSet)

# Customers
router.register(r'customers', CustomerViewSet)
router.register(r'customer-interactions', CustomerInteractionViewSet)
router.register(r'customer-notes', CustomerNoteViewSet)

# Policies
router.register(r'products', InsuranceProductViewSet)
router.register(r'policies', PolicyViewSet)
router.register(r'policy-payments', PolicyPaymentViewSet)

# Claims
router.register(r'claims', ClaimViewSet)
router.register(r'claim-documents', ClaimDocumentViewSet)
router.register(r'claim-assessments', ClaimAssessmentViewSet)
router.register(r'claim-payments', ClaimPaymentViewSet)

# Billing
router.register(r'invoices', InvoiceViewSet)
router.register(r'receipts', ReceiptViewSet)
router.register(r'financial-reports', FinancialReportViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
