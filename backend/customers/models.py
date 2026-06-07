from django.db import models
from django.core.validators import EmailValidator
from core.models import User
from agents.models import Agent

class Customer(models.Model):
    """Customer model"""
    CUSTOMER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('business', 'Business'),
        ('corporate', 'Corporate'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('blocked', 'Blocked'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile', null=True, blank=True)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES)
    customer_id = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(validators=[EmailValidator()])
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='customers')
    identification_type = models.CharField(max_length=50)  # ID, Passport, etc.
    identification_number = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)
    business_registration = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    kra_pin = models.CharField(max_length=50, blank=True)
    kra_pin_document = models.FileField(upload_to='kra_pins/', null=True, blank=True)
    preferred_communication = models.CharField(
        max_length=20, 
        choices=[('email', 'Email'), ('sms', 'SMS'), ('phone', 'Phone')],
        default='email'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer_id']),
            models.Index(fields=['agent', 'status']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.customer_id} - {self.email}"


class CustomerInteraction(models.Model):
    """Track customer interactions and communications"""
    INTERACTION_TYPE_CHOICES = [
        ('call', 'Phone Call'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('meeting', 'Meeting'),
        ('follow_up', 'Follow-up'),
        ('inquiry', 'Inquiry'),
        ('complaint', 'Complaint'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='interactions')
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_interactions')
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPE_CHOICES)
    subject = models.CharField(max_length=255)
    notes = models.TextField()
    outcome = models.TextField(blank=True)
    scheduled_followup = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'interaction_type']),
            models.Index(fields=['agent', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.interaction_type} - {self.customer.customer_id} ({self.created_at.date()})"


class CustomerNote(models.Model):
    """Internal notes about customers"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='notes')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='customer_notes')
    content = models.TextField()
    is_internal = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'created_at']),
        ]
    
    def __str__(self):
        return f"Note for {self.customer.customer_id}"


# Signal to auto-create Customer profile when a customer user is created
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

@receiver(post_save, sender=User)
def create_customer_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'customer':
        # Generate a unique customer_id
        cust_id = f"CUST-{uuid.uuid4().hex[:6].upper()}"
        while Customer.objects.filter(customer_id=cust_id).exists():
            cust_id = f"CUST-{uuid.uuid4().hex[:6].upper()}"
            
        Customer.objects.create(
            user=instance,
            customer_type='individual',
            customer_id=cust_id,
            phone=instance.phone or 'N/A',
            email=instance.email,
            identification_type='National ID',
            identification_number='Pending',
        )
