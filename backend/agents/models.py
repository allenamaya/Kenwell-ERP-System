from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator
from core.models import User

class Agent(models.Model):
    """Agent/Broker model"""
    AGENT_TYPE_CHOICES = [
        ('individual', 'Individual Agent'),
        ('broker_firm', 'Broker Firm'),
        ('agency', 'Agency'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    agent_type = models.CharField(max_length=20, choices=AGENT_TYPE_CHOICES)
    license_number = models.CharField(max_length=100, unique=True)
    license_expiry = models.DateField()
    agent_code = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=255, blank=True)
    commission_rate = models.DecimalField(
        max_digits=5, decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    bank_account = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=255, blank=True)
    bank_code = models.CharField(max_length=10, blank=True)
    total_policies = models.IntegerField(default=0)
    total_commission = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    website = models.URLField(blank=True, validators=[URLValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent_code']),
            models.Index(fields=['status', 'agent_type']),
        ]
    
    def __str__(self):
        return f"{self.agent_code} - {self.user.get_full_name()}"


class AgentCommission(models.Model):
    """Track commission payments to agents"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
    ]
    
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='commissions')
    period_start = models.DateField()
    period_end = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_date = models.DateField(null=True, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end']
        indexes = [
            models.Index(fields=['agent', 'status']),
            models.Index(fields=['period_start', 'period_end']),
        ]
    
    def __str__(self):
        return f"Commission {self.id} - {self.agent.user.get_full_name()} ({self.period_end})"


class AgentPerformance(models.Model):
    """Track agent performance metrics"""
    agent = models.OneToOneField(Agent, on_delete=models.CASCADE, related_name='performance')
    total_clients = models.IntegerField(default=0)
    active_policies = models.IntegerField(default=0)
    lapsed_policies = models.IntegerField(default=0)
    total_premium = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    claims_handled = models.IntegerField(default=0)
    customer_satisfaction_rating = models.DecimalField(
        max_digits=3, decimal_places=1, 
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        default=0
    )
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Agent Performance"
    
    def __str__(self):
        return f"Performance - {self.agent.user.get_full_name()}"
