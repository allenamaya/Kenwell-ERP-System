from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from agents.models import Agent, AgentPerformance
from customers.models import Customer
from policies.models import InsuranceProduct, Policy
from datetime import date, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with test data for demonstration'

    def handle(self, *args, **options):
        self.stdout.write("Creating test users...")
        
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@kenwell.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('AdminPassword123!')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Created admin user"))
        
        # Create agent user
        agent_user, created = User.objects.get_or_create(
            username='john_agent',
            defaults={
                'email': 'john@kenwell.com',
                'first_name': 'John',
                'last_name': 'Agent',
                'role': 'agent',
                'phone': '+254712345678',
            }
        )
        if created:
            agent_user.set_password('AgentPass123!')
            agent_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Created agent user"))
        
        # Create customer user
        customer_user, created = User.objects.get_or_create(
            username='customer_one',
            defaults={
                'email': 'customer@example.com',
                'first_name': 'Customer',
                'last_name': 'One',
                'role': 'customer',
                'phone': '+254722345678',
            }
        )
        if created:
            customer_user.set_password('CustomerPass123!')
            customer_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Created customer user"))
        
        # Create finance user
        finance_user, created = User.objects.get_or_create(
            username='finance_officer',
            defaults={
                'email': 'finance@kenwell.com',
                'first_name': 'Finance',
                'last_name': 'Officer',
                'role': 'finance',
                'phone': '+254732345678',
            }
        )
        if created:
            finance_user.set_password('FinancePass123!')
            finance_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Created finance user"))
        
        # Create operations user
        ops_user, created = User.objects.get_or_create(
            username='ops_manager',
            defaults={
                'email': 'ops@kenwell.com',
                'first_name': 'Operations',
                'last_name': 'Manager',
                'role': 'operations',
                'phone': '+254742345678',
            }
        )
        if created:
            ops_user.set_password('OpsPass123!')
            ops_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Created operations user"))
        
        self.stdout.write("\nCreating agent profiles...")
        
        # Create agent profile
        agent, created = Agent.objects.get_or_create(
            user=agent_user,
            defaults={
                'agent_type': 'individual',
                'license_number': 'LIC2024001',
                'license_expiry': date.today() + timedelta(days=365),
                'agent_code': 'AGT001',
                'specialization': 'Motor Insurance',
                'commission_rate': 15.00,
                'status': 'active',
                'bank_account': '0123456789',
                'bank_name': 'Kenya Commercial Bank',
                'bank_code': 'KCB',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✓ Created agent"))
            # Create agent performance record
            AgentPerformance.objects.create(agent=agent)
        
        self.stdout.write("\nCreating customer records...")
        
        # Create customer profile
        customer, created = Customer.objects.get_or_create(
            customer_id='CUST001',
            defaults={
                'user': customer_user,
                'customer_type': 'individual',
                'phone': '+254722345678',
                'email': 'customer@example.com',
                'agent': agent,
                'identification_type': 'National ID',
                'identification_number': '12345678',
                'status': 'active',
                'preferred_communication': 'email',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✓ Created customer"))
        
        self.stdout.write("\nCreating insurance products...")
        
        # Create insurance products
        products_data = [
            {
                'product_name': 'Motor Insurance - Comprehensive',
                'product_type': 'motor',
                'description': 'Comprehensive motor vehicle insurance coverage',
                'minimum_premium': 5000,
                'maximum_premium': 50000,
            },
            {
                'product_name': 'Travel Insurance',
                'product_type': 'travel',
                'description': 'Travel insurance for domestic and international trips',
                'minimum_premium': 2000,
                'maximum_premium': 20000,
            },
            {
                'product_name': 'Health Insurance',
                'product_type': 'health',
                'description': 'Comprehensive health insurance coverage',
                'minimum_premium': 10000,
                'maximum_premium': 100000,
            },
            {
                'product_name': 'Fire & General Insurance',
                'product_type': 'fire',
                'description': 'Property and fire insurance coverage',
                'minimum_premium': 15000,
                'maximum_premium': 200000,
            },
        ]
        
        for product_data in products_data:
            product, created = InsuranceProduct.objects.get_or_create(
                product_name=product_data['product_name'],
                defaults=product_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✓ Created {product.product_name}"))
        
        self.stdout.write("\nCreating sample policies...")
        
        # Create sample policy
        motor_product = InsuranceProduct.objects.get(product_type='motor')
        policy, created = Policy.objects.get_or_create(
            policy_number='POL2024001',
            defaults={
                'customer': customer,
                'agent': agent,
                'product': motor_product,
                'status': 'active',
                'premium_amount': 25000,
                'start_date': date.today(),
                'end_date': date.today() + timedelta(days=365),
                'coverage_limit': 500000,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✓ Created policy"))
        
        self.stdout.write("\n" + self.style.SUCCESS("========================================"))
        self.stdout.write(self.style.SUCCESS("Test data population complete!"))
        self.stdout.write(self.style.SUCCESS("========================================"))
        self.stdout.write("\nTest Accounts:")
        self.stdout.write("  Admin:      admin / AdminPassword123!")
        self.stdout.write("  Agent:      john_agent / AgentPass123!")
        self.stdout.write("  Customer:   customer_one / CustomerPass123!")
        self.stdout.write("  Finance:    finance_officer / FinancePass123!")
        self.stdout.write("  Operations: ops_manager / OpsPass123!")
