from django.db import models
from django.core.validators import MinValueValidator
from customers.models import Customer
from agents.models import Agent

class InsuranceProduct(models.Model):
    """Insurance products catalog"""
    PRODUCT_TYPE_CHOICES = [
        ('motor', 'Motor Insurance'),
        ('travel', 'Travel Insurance'),
        ('health', 'Health Insurance'),
        ('fire', 'Fire & General'),
        ('liability', 'Public Liability'),
        ('marine', 'Marine Insurance'),
        ('accident', 'Personal Accident'),
    ]
    
    CATEGORY_CHOICES = [
        ('auto', 'Auto/Motor'),
        ('home', 'Home/Property'),
        ('health', 'Health'),
        ('life', 'Life'),
        ('travel', 'Travel'),
        ('business', 'Business'),
        ('disability', 'Disability'),
    ]
    
    product_name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=50, choices=PRODUCT_TYPE_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='auto')
    description = models.TextField()
    minimum_premium = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    maximum_premium = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['product_name']
        indexes = [
            models.Index(fields=['product_type', 'is_active']),
            models.Index(fields=['category', 'is_active']),
        ]
    
    def __str__(self):
        return self.product_name


class Policy(models.Model):
    """Insurance policies"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
        ('lapsed', 'Lapsed'),
        ('renewed', 'Renewed'),
    ]
    
    policy_number = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='policies')
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='policies')
    product = models.ForeignKey(InsuranceProduct, on_delete=models.PROTECT, related_name='policies')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    premium_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    start_date = models.DateField()
    end_date = models.DateField()
    coverage_limit = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    terms_and_conditions = models.TextField(blank=True)
    policy_details = models.JSONField(default=dict, blank=True)
    renewal_reminder_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['policy_number']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['agent', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return self.policy_number


class PolicyPayment(models.Model):
    """Policy payment tracking"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('partially_paid', 'Partially Paid'),
        ('overdue', 'Overdue'),
        ('failed', 'Failed'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('bank_transfer', 'Bank Transfer'),
        ('mpesa', 'Mpesa'),
        ('credit_card', 'Credit Card'),
        ('insurance_company', 'Insurance Company'),
    ]
    
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateField()
    due_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    reference_number = models.CharField(max_length=100, blank=True, unique=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-due_date']
        indexes = [
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['due_date', 'status']),
        ]
    
    def __str__(self):
        return f"Payment - {self.policy.policy_number} ({self.amount})"
