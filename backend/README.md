# Kenwell Insurance Agency ERP - Django Backend

A comprehensive Django REST API backend for the Kenwell Insurance Agency management system.

## Project Structure

```
backend/
├── core/                 # User management, authentication, audit logs
├── agents/              # Agent/Broker management and commissions
├── customers/           # Customer CRM and interactions
├── policies/            # Insurance products and policy management
├── claims/              # Claims processing and document management
├── billing/             # Invoicing, receipts, and financial reporting
├── kenwell_erp/         # Django project settings and URLs
├── venv/                # Python virtual environment
└── manage.py            # Django management script
```

## Installation

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the database credentials:

```bash
cp .env.example .env
```

### 4. Database Setup

Create PostgreSQL database:

```bash
createdb kenwell_db
```

Run migrations:

```bash
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

## Running the Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login with username/password
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/users/register/` - Register new user
- `GET /api/users/me/` - Get current user
- `POST /api/users/change_password/` - Change password

### Users
- `GET /api/users/` - List users
- `GET /api/users/{id}/` - Get user details
- `POST /api/users/` - Create user
- `GET /api/users/by_role/?role=agent` - Get users by role

### Agents
- `GET /api/agents/` - List agents
- `GET /api/agents/{id}/` - Get agent details
- `GET /api/agents/{id}/performance/` - Get agent performance
- `GET /api/agents/{id}/commissions/` - Get agent commissions
- `GET /api/agents/top_performers/` - Get top performing agents

### Customers
- `GET /api/customers/` - List customers
- `GET /api/customers/{id}/` - Get customer details
- `GET /api/customers/{id}/policies/` - Get customer policies
- `GET /api/customers/{id}/claims/` - Get customer claims
- `GET /api/customers/{id}/interactions/` - Get customer interactions

### Policies
- `GET /api/products/` - List insurance products
- `GET /api/policies/` - List policies
- `GET /api/policies/{id}/` - Get policy details
- `GET /api/policies/expiring_soon/` - Get policies expiring soon
- `GET /api/policy-payments/overdue/` - Get overdue payments

### Claims
- `GET /api/claims/` - List claims
- `GET /api/claims/{id}/` - Get claim details
- `POST /api/claims/{id}/add_document/` - Add document to claim
- `GET /api/claims/pending/` - Get pending claims
- `GET /api/claim-documents/` - List claim documents

### Billing
- `GET /api/invoices/` - List invoices
- `GET /api/invoices/{id}/` - Get invoice details
- `GET /api/invoices/outstanding/` - Get outstanding invoices
- `GET /api/invoices/overdue/` - Get overdue invoices
- `GET /api/receipts/` - List receipts
- `GET /api/financial-reports/` - List financial reports

## Authentication

All endpoints (except registration and login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Filtering and Searching

Most list endpoints support filtering and searching:

```
GET /api/agents/?status=active&search=John
GET /api/policies/?status=active&customer=1
GET /api/claims/?status=pending&priority=high
```

## Pagination

Responses are paginated with 20 items per page:

```
GET /api/customers/?page=2
```

## Admin Panel

Access the Django admin at `http://localhost:8000/admin/` with superuser credentials.

## Database Models

### User Management
- **User**: Extended Django user with roles (admin, agent, customer, finance, operations)
- **UserProfile**: Additional user information (company, address, verification status)
- **AuditLog**: Track all system changes

### Agents
- **Agent**: Agent/Broker profiles with commissions and licensing
- **AgentCommission**: Commission payment tracking
- **AgentPerformance**: Performance metrics and KPIs

### Customers
- **Customer**: Customer profiles with contact info
- **CustomerInteraction**: Track all customer interactions
- **CustomerNote**: Internal notes about customers

### Policies
- **InsuranceProduct**: Available insurance products catalog
- **Policy**: Customer insurance policies
- **PolicyPayment**: Premium payment tracking

### Claims
- **Claim**: Insurance claim submissions
- **ClaimDocument**: Supporting documents for claims
- **ClaimAssessment**: Claim assessment details
- **ClaimPayment**: Claim payment tracking

### Billing
- **Invoice**: Customer invoices
- **InvoiceLineItem**: Invoice line items
- **Receipt**: Payment receipts
- **FinancialReport**: Financial reports and summaries

## Development Tips

### Create Sample Data

```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from agents.models import Agent

User = get_user_model()

# Create agent user
user = User.objects.create_user(
    username='agent001',
    email='agent@example.com',
    password='securepass123',
    first_name='John',
    last_name='Agent',
    role='agent'
)

# Create agent profile
Agent.objects.create(
    user=user,
    agent_type='individual',
    license_number='LIC123456',
    license_expiry='2025-12-31',
    agent_code='AG001',
    commission_rate=15.50
)
```

## Contributing

1. Create a new branch for features
2. Follow PEP 8 style guidelines
3. Add docstrings to models and views
4. Test endpoints before committing

## License

Proprietary - Kenwell Insurance Agency
