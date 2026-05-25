# Kenwell Insurance ERP - Quick Reference Guide

## Default Logins

| Role | Username | Password | Email |
|------|----------|----------|-------|
| **Admin** | admin | AdminPassword123! | admin@kenwell.com |
| **Agent** | john_agent | AgentPass123! | john@kenwell.com |
| **Customer** | customer_one | CustomerPass123! | customer@example.com |
| **Finance** | finance_officer | FinancePass123! | finance@kenwell.com |
| **Operations** | ops_manager | OpsPass123! | operations@kenwell.com |

## Quick Start Commands

```bash
# Backend Setup
cd backend
source venv/bin/activate  # macOS/Linux
python manage.py migrate
python manage.py runserver

# Frontend Setup (new terminal)
pnpm install
pnpm dev

# Access URLs
Frontend: http://localhost:3000
Backend API: http://localhost:8000/api
Django Admin: http://localhost:8000/admin
```

## Key API Endpoints

| Module | Endpoint | Method |
|--------|----------|--------|
| **Auth** | /api/auth/login/ | POST |
| **Agents** | /api/agents/ | GET, POST |
| **Customers** | /api/customers/ | GET, POST |
| **Policies** | /api/policies/ | GET, POST |
| **Claims** | /api/claims/ | GET, POST |
| **Invoices** | /api/invoices/ | GET, POST |

## Dashboard Pages

| Page | URL | Role Access |
|------|-----|-------------|
| Dashboard | /dashboard | All authenticated |
| Agents | /dashboard/agents | Admin, Operations |
| Customers | /dashboard/customers | All |
| Policies | /dashboard/policies | All |
| Claims | /dashboard/claims | All |

## Database Tables (23 Models)

### Core
- User, UserProfile, AuditLog

### Agents
- Agent, AgentCommission, AgentPerformance

### Customers
- Customer, CustomerInteraction, CustomerNote

### Policies
- InsuranceProduct, Policy, PolicyPayment

### Claims
- Claim, ClaimDocument, ClaimAssessment, ClaimPayment

### Billing
- Invoice, InvoiceLineItem, Receipt, FinancialReport

## Color Theme (Kenwell Branding)

| Color | Usage | Value |
|-------|-------|-------|
| Primary Green | Buttons, Links, Accents | #2EE556 |
| Secondary Green | Backgrounds, Cards | #7BD165 |
| Teal Accent | Highlights, Hover States | #8DDDD8 |
| Dark Text | Foreground | #1a1a1a |

## Fonts

- **Body**: Albert Sans
- **Headers**: AFACAD
- **Monospace**: Geist Mono

## Project Structure

```
kenwell-erp/
├── app/                    # Next.js frontend
│   ├── login/             # Login page
│   ├── dashboard/         # Main dashboard
│   │   ├── agents/        # Agent management
│   │   ├── customers/     # Customer CRM
│   │   ├── policies/      # Policy management
│   │   └── claims/        # Claims processing
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home redirect
│   └── globals.css        # Global styles
│
├── backend/               # Django REST API
│   ├── core/             # Core models & auth
│   ├── agents/           # Agent module
│   ├── customers/        # Customer module
│   ├── policies/         # Policy module
│   ├── claims/           # Claims module
│   ├── billing/          # Billing module
│   └── requirements.txt  # Dependencies
│
├── lib/                  # Frontend utilities
│   ├── api.ts           # API client
│   └── auth-context.tsx # Auth context
│
└── Documentation files
    ├── LOGIN_CREDENTIALS.md
    ├── DEPLOYMENT_GUIDE.md
    ├── PROJECT_OVERVIEW.md
    └── QUICK_START.md
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_NAME=kenwell_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
```

## Git Commands

```bash
# Initial setup
git init
git add .
git commit -m "Initial Kenwell ERP implementation"

# Create branches for features
git checkout -b feature/billing-reports
git checkout -b fix/claims-validation

# Push to remote
git push origin feature/billing-reports
```

## Testing Workflows

### Agent Module
1. Login as admin
2. Navigate to /dashboard/agents
3. Create new agent (License #, Commission Rate)
4. View agent performance
5. Track commissions

### Customer Module
1. Login as admin
2. Navigate to /dashboard/customers
3. Create new customer
4. Add interactions/notes
5. Link to agent
6. View policies and claims

### Policy Module
1. Browse products at /dashboard/policies/products
2. Create new policy
3. Assign to customer
4. Track payments
5. View expiring policies

### Claims Module
1. Navigate to /dashboard/claims
2. Submit new claim
3. Add supporting documents
4. Track claim status
5. Process payment when approved

### Billing Module
Coming Soon - Invoice, Receipt, and Financial Report management

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port: `python manage.py runserver 8001` |
| Database connection error | Verify PostgreSQL running: `sudo service postgresql status` |
| CORS error | Add frontend URL to CORS_ALLOWED_ORIGINS |
| Static files missing | Run: `python manage.py collectstatic` |
| Token expired | Use refresh token endpoint to get new token |

## Performance Metrics to Monitor

- API response time (target: <200ms)
- Database query time (target: <100ms)
- Frontend load time (target: <2s)
- Server CPU usage (target: <70%)
- Database connections (target: <50)

## Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes in isolated components
3. Test thoroughly with test data
4. Commit with descriptive messages
5. Create pull request for review
6. Merge to main after approval

## Useful Django Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Clear cache
python manage.py clear_cache

# Collect static files
python manage.py collectstatic
```

## Common API Responses

### Success (200 OK)
```json
{
  "id": 1,
  "name": "John Kipchoge",
  "email": "john@kenwell.com"
}
```

### Error (400 Bad Request)
```json
{
  "error": "Invalid request parameters",
  "details": {
    "field": ["Error message"]
  }
}
```

### Unauthorized (401)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

## Support Resources

- Django Docs: https://docs.djangoproject.com/
- Next.js Docs: https://nextjs.org/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- REST API Best Practices: https://restfulapi.net/
- Tailwind CSS: https://tailwindcss.com/docs

## Feature Checklist

- [x] User authentication & roles
- [x] Agent management
- [x] Customer CRM
- [x] Policy management
- [x] Claims processing
- [x] Billing system
- [x] Admin dashboard
- [x] Audit logging
- [x] API documentation
- [ ] Email notifications (future)
- [ ] SMS alerts (future)
- [ ] Mobile app (future)
- [ ] Advanced analytics (future)
