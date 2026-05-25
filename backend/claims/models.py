from django.db import models
from django.core.validators import MinValueValidator
from policies.models import Policy
from customers.models import Customer
from core.models import User

class Claim(models.Model):
    """Insurance claims"""
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
        ('pending_documents', 'Pending Documents'),
    ]
    
    CLAIM_PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    claim_number = models.CharField(max_length=100, unique=True)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='claims')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='claims')
    claim_date = models.DateField()
    incident_date = models.DateField()
    incident_description = models.TextField()
    claim_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    priority = models.CharField(max_length=20, choices=CLAIM_PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_claims')
    location_of_incident = models.CharField(max_length=255, blank=True)
    third_party_involved = models.BooleanField(default=False)
    third_party_details = models.TextField(blank=True)
    police_report_filed = models.BooleanField(default=False)
    police_report_number = models.CharField(max_length=100, blank=True)
    estimated_repair_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-claim_date']
        indexes = [
            models.Index(fields=['claim_number']),
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['status', 'priority']),
        ]
    
    def __str__(self):
        return self.claim_number


class ClaimDocument(models.Model):
    """Supporting documents for claims"""
    DOCUMENT_TYPE_CHOICES = [
        ('incident_report', 'Incident Report'),
        ('police_report', 'Police Report'),
        ('medical_report', 'Medical Report'),
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('quote', 'Quote'),
        ('photo', 'Photo/Evidence'),
        ('other', 'Other'),
    ]
    
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='claim_documents/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['claim', 'document_type']),
        ]
    
    def __str__(self):
        return f"{self.document_type} - {self.claim.claim_number}"


class ClaimAssessment(models.Model):
    """Assessment details for claims"""
    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='assessment')
    assessor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='claim_assessments')
    assessment_date = models.DateField()
    findings = models.TextField()
    recommended_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    deductible_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    assessment_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Claim Assessments"
    
    def __str__(self):
        return f"Assessment - {self.claim.claim_number}"


class ClaimPayment(models.Model):
    """Track claim payments"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processed', 'Processed'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    
    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    bank_account = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    reference_number = models.CharField(max_length=100, blank=True, unique=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Claim Payments"
    
    def __str__(self):
        return f"Payment - {self.claim.claim_number}"
