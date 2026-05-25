# Kenwell Insurance Agency ERP System

A comprehensive Enterprise Resource Planning (ERP) system built for managing insurance agencies, designed specifically for Kenwell Insurance. This system handles agent management, customer relationships, policy administration, claims processing, and billing operations.

## 🏗️ Architecture Overview

### Technology Stack

**Backend:**
- Django 6.0 - REST API framework
- Django REST Framework - API serialization and viewsets
- PostgreSQL - Relational database
- JWT Authentication - Secure token-based auth
- Python 3.x - Backend language

**Frontend:**
- Next.js 15+ - React framework
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first styling
- shadcn/ui - Component library
- SWR/Fetch - Data fetching

**Infrastructure:**
- Django management commands for data import
- RESTful API architecture
- PostgreSQL for persistent storage
- Vercel for frontend deployment

## 📦 Project Structure

```
kenwell-erp/
├── backend/                    # Django REST API
│   ├── core/                   # User & Auth management
│   │   ├── models.py           # User, UserProfile, AuditLog
│   │   ├── views.py            # Auth endpoints
│   │   └── serializers.py      # API serializers
│   ├── agents/                 # Agent/Broker management
│   │   ├── models.py           # Agent, AgentCommission, AgentPerformance
│   │   ├── views.py            # Agent viewsets
│   │   └── serializers.py      # Serializers
│   ├── customers/              # Customer CRM
│   │   ├── models.py           # Customer, CustomerInteraction, CustomerNote
│   │   ├── views.py            # Customer viewsets
│   │   └── serializers.py      # Serializers
│   ├── policies/               # Insurance products & policies
│   │   ├── models.py           # InsuranceProduct, Policy, PolicyPayment
│   │   ├── views.py            # Policy viewsets
│   │   └── serializers.py      # Serializers
│   ├── claims/                 # Claims processing
│   │   ├── models.py           # Claim, ClaimDocument, ClaimAssessment, ClaimPayment
│   │   ├── views.py            # Claim viewsets
│   │   └── serializers.py      # Serializers
│   ├── billing/                # Invoicing & financial reporting
│   │   ├── models.py           # Invoice, Receipt, FinancialReport
│   │   ├── views.py            # Billing viewsets
│   │   └── serializers.py      # Serializers
│   ├── kenwell_erp/            # Django settings & URLs
│   │   ├── settings.py         # Configuration
│   │   └── urls.py             # API routes
│   ├── manage.py               # Django management
│   └── requirements.txt        # Python dependencies
├── app/                        # Next.js frontend
│   ├── login/                  # Authentication pages
│   ├── dashboard/              # Main dashboard
│   │   ├── agents/             # Agent management UI
│   │   ├── customers/          # Customer management UI
│   │   ├── policies/           # Policy management UI
│   │   ├── claims/             # Claims management UI
│   │   └── billing/            # Billing management UI
│   ├── layout.tsx              # Root layout with auth
│   └── page.tsx                # Home page with redirect
├── lib/                        # Shared utilities
│   ├── api.ts                  # API client & functions
│   ├── auth-context.tsx        # Auth state management
│   └── utils.ts                # Helper functions
├── components/                 # Reusable React components
│   └── ui/                     # shadcn/ui components
├── public/                     # Static assets
└── package.json                # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- pip & npm/pnpm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Update .env with your database credentials and settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup

```bash
# Install dependencies
npm install  # or pnpm install

# Create environment file
cp .env.example .env.local
# Update NEXT_PUBLIC_API_URL to match your Django backend

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🔐 Authentication

### Flow

1. **Login** - User enters credentials at `/login`
2. **Token Generation** - Django validates credentials and returns JWT tokens
3. **Token Storage** - Access token stored in localStorage
4. **Protected Routes** - All dashboard pages require authentication
5. **Auto Redirect** - Unauthenticated users redirected to login

### Endpoints

- `POST /api/auth/login/` - Login with username/password
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/users/register/` - Register new user (admin only)
- `GET /api/users/me/` - Get current user info

## 📊 Core Modules

### 1. User Management (Core)
- User authentication and authorization
- Role-based access control (Admin, Agent, Customer, Finance, Operations)
- User profiles and audit logging
- Password management

**Key Endpoints:**
- `GET /api/users/` - List users
- `POST /api/users/register/` - Register user
- `GET /api/users/me/` - Current user info
- `POST /api/users/change_password/` - Change password

### 2. Agent Management
- Agent/broker profiles with licensing info
- Commission tracking and calculation
- Agent performance metrics
- Top performer identification

**Key Endpoints:**
- `GET /api/agents/` - List agents
- `GET /api/agents/{id}/performance/` - Performance metrics
- `GET /api/agents/{id}/commissions/` - Commission history
- `GET /api/agents/top_performers/` - Top agents

### 3. Customer CRM
- Customer profiles and contact information
- Customer interaction history
- Notes and communication tracking
- Customer segmentation

**Key Endpoints:**
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - Customer details
- `GET /api/customers/{id}/policies/` - Customer policies
- `GET /api/customer-interactions/pending_followups/` - Followups

### 4. Products & Policies
- Insurance product catalog
- Policy creation and management
- Coverage details and terms
- Premium payment tracking

**Key Endpoints:**
- `GET /api/products/` - Available products
- `GET /api/policies/` - List policies
- `POST /api/policies/` - Create policy
- `GET /api/policies/expiring_soon/` - Expiring policies
- `GET /api/policy-payments/overdue/` - Overdue payments

### 5. Claims Processing
- Claim submission and tracking
- Document management
- Claims assessment workflow
- Payment processing

**Key Endpoints:**
- `GET /api/claims/` - List claims
- `POST /api/claims/` - Submit claim
- `POST /api/claims/{id}/add_document/` - Upload documents
- `GET /api/claims/pending/` - Pending claims
- `GET /api/claims/{id}/documents/` - Claim documents

### 6. Billing & Finance
- Invoice generation
- Payment receipt management
- Financial reporting
- Revenue tracking

**Key Endpoints:**
- `GET /api/invoices/` - List invoices
- `GET /api/invoices/outstanding/` - Outstanding invoices
- `GET /api/receipts/` - Payment receipts
- `GET /api/financial-reports/` - Reports

## 🎯 User Roles & Permissions

### Admin
- Full system access
- User management
- All module access
- System configuration

### Agent/Broker
- Own customer management
- Own policy management
- Commission tracking
- Performance metrics

### Customer
- View own policies
- Submit claims
- View invoices
- Interaction history

### Finance
- Invoice management
- Payment processing
- Financial reporting
- Revenue tracking

### Operations
- Agent oversight
- Customer management
- Policy oversight
- Claim processing

## 🔗 API Documentation

### Request/Response Format

All API requests use JSON and require authentication (except login):

```bash
# Example authenticated request
curl -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  https://api.example.com/api/agents/
```

### Pagination

List endpoints support pagination:

```
GET /api/agents/?page=2&page_size=20
```

### Filtering & Search

Most endpoints support filtering:

```
GET /api/policies/?status=active&customer=1&search=john
GET /api/claims/?status=pending&priority=high
```

### Error Handling

Standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 📈 Features

### Dashboard
- Real-time KPI metrics
- Top performing agents
- Quick action buttons
- Role-based views

### Agent Management
- Agent directory with licensing
- Commission calculation
- Performance tracking
- Top performer rankings

### Customer Management
- Full CRM capabilities
- Interaction history
- Policy overview
- Document management

### Policy Management
- Product catalog
- Policy creation workflow
- Expiration alerts
- Payment tracking

### Claims Processing
- Claim submission
- Document uploads
- Assessment workflow
- Payment tracking

### Financial Reporting
- Invoice management
- Receipt tracking
- Financial summaries
- Revenue reporting

## 🛠️ Development

### Adding New Features

1. **Backend:**
   - Create/update models in `models.py`
   - Create serializers in `serializers.py`
   - Create viewsets in `views.py`
   - Register in `urls.py`
   - Run migrations: `python manage.py makemigrations && python manage.py migrate`

2. **Frontend:**
   - Create API functions in `lib/api.ts`
   - Build React components
   - Add pages/routes
   - Update navigation

### Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
npm test
```

### Database Migrations

```bash
# Create migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# See migration history
python manage.py showmigrations
```

## 📱 Frontend Pages

### Public
- `/login` - Authentication
- `/` - Home (redirects to dashboard or login)

### Dashboard (Protected)
- `/dashboard` - Main dashboard
- `/dashboard/agents` - Agent management
- `/dashboard/customers` - Customer management
- `/dashboard/policies` - Policy management
- `/dashboard/claims` - Claims processing
- `/dashboard/billing` - Invoicing & billing
- `/dashboard/reports` - Financial reports

## 🔒 Security Features

- JWT token-based authentication
- Secure password hashing with bcrypt
- CORS configuration for API
- Row-level security (RLS) support
- Input validation and sanitization
- Audit logging of all changes

## 📝 Environment Variables

### Backend (.env)

```
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost/kenwell_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Backend (Vercel/Heroku)
- See `backend/README.md` for detailed deployment guide
- PostgreSQL database setup
- Environment variables configuration
- Static files and media handling

### Frontend (Vercel)
- Connect GitHub repository
- Configure environment variables
- Deploy with `vercel deploy`
- Auto-deployments on push

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/feature-name`
4. Create pull request

## 📄 License

Proprietary - Kenwell Insurance Agency

## 👥 Support

For issues, bug reports, or feature requests, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active Development
