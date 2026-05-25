# Kenwell Insurance Agency ERP - Deployment & Testing Guide

## Project Completion Status

All 7 phases have been successfully completed:
- Phase 1: Infrastructure & Design System ✅
- Phase 2: Django Backend Models & Admin ✅
- Phase 3: Authentication System (JWT) ✅
- Phase 4: Agent Management Module ✅
- Phase 5: Customer CRM Module ✅
- Phase 6: Products & Policies Module ✅
- Phase 7: Claims Processing Module ✅

## System Architecture

```
Kenwell Insurance ERP
├── Frontend (Next.js 15 + React 19)
│   ├── Authentication UI
│   ├── Dashboard
│   ├── Agent Management
│   ├── Customer CRM
│   ├── Policy Management
│   └── Claims Processing
│
├── Backend (Django 6.0 REST API)
│   ├── Core Module (Users, Auth, Audit)
│   ├── Agents Module (Agent, Commission, Performance)
│   ├── Customers Module (Customer, Interaction, Notes)
│   ├── Policies Module (Products, Policies, Payments)
│   ├── Claims Module (Claims, Documents, Assessment)
│   └── Billing Module (Invoices, Receipts, Reports)
│
└── Database (PostgreSQL)
    ├── 23 Models
    ├── Full relationships
    └── Audit logging
```

## Getting Started - Local Development

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- npm or pnpm

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create database
createdb kenwell_db -U postgres

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Username: admin
# Email: admin@kenwell.com
# Password: AdminPassword123!

# Run development server
python manage.py runserver
```

### Step 2: Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
pnpm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

# Run development server
pnpm dev
```

### Step 3: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## Testing the Application

### Login with Test Accounts

Use the LOGIN_CREDENTIALS.md file to log in with different roles:
- Admin: admin / AdminPassword123!
- Agent: john_agent / AgentPass123!
- Customer: customer_one / CustomerPass123!
- Finance: finance_officer / FinancePass123!
- Operations: ops_manager / OpsPass123!

### API Testing with cURL

```bash
# Login and get token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!"
  }'

# Copy the access token from response

# Get agents list
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/agents/

# Get customers list
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/customers/

# Get policies list
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/policies/
```

### Test Scenarios

#### 1. User Registration & Login
- Create new user via /api/users/register/
- Login and receive JWT tokens
- Verify tokens work for protected endpoints

#### 2. Agent Management
- Create agent with commission rate
- View agent performance metrics
- Track agent commissions
- List all agents with filtering

#### 3. Customer CRM
- Create customer with contact info
- Add customer interactions
- Create customer notes
- View customer policies and claims

#### 4. Policy Management
- Browse insurance products
- Create new policy for customer
- Track policy payments
- Filter expiring policies

#### 5. Claims Processing
- Submit new claim for policy
- Upload claim documents
- Track claim status
- Approve and process claims

#### 6. Billing & Finance
- Generate invoices
- Track invoice payments
- Create receipts
- Generate financial reports

## API Endpoints Overview

### Authentication
- POST /api/auth/login/ - Login user
- POST /api/auth/refresh/ - Refresh token
- POST /api/users/register/ - Register new user

### Users & Profile
- GET/POST /api/users/ - User management
- GET /api/users/me/ - Current user
- GET /api/profiles/ - User profiles
- GET /api/audit-logs/ - Audit logs

### Agents
- GET/POST /api/agents/ - Agent CRUD
- GET /api/agents/{id}/performance/ - Agent performance
- GET /api/agents/{id}/commissions/ - Agent commissions
- GET /api/agents/top_performers/ - Top agents
- GET/POST /api/agent-commissions/ - Commission management

### Customers
- GET/POST /api/customers/ - Customer CRUD
- GET /api/customers/{id}/policies/ - Customer policies
- GET /api/customers/{id}/claims/ - Customer claims
- GET/POST /api/customer-interactions/ - Customer interactions
- GET/POST /api/customer-notes/ - Customer notes

### Policies
- GET /api/products/ - Insurance products
- GET/POST /api/policies/ - Policy CRUD
- GET /api/policies/expiring_soon/ - Expiring policies
- GET /api/policies/active_policies/ - Active policies
- GET/POST /api/policy-payments/ - Payment tracking

### Claims
- GET/POST /api/claims/ - Claim CRUD
- GET /api/claims/{id}/documents/ - Claim documents
- GET /api/claims/pending/ - Pending claims
- GET /api/claims/approved/ - Approved claims
- GET/POST /api/claim-documents/ - Document management
- GET/POST /api/claim-assessments/ - Assessments
- GET/POST /api/claim-payments/ - Claim payments

### Billing
- GET/POST /api/invoices/ - Invoice management
- GET /api/invoices/outstanding/ - Outstanding invoices
- GET /api/invoices/overdue/ - Overdue invoices
- GET /api/receipts/ - Receipts
- GET /api/financial-reports/ - Financial reports

## Production Deployment

### Environment Variables

#### Django Settings (.env)
```
DEBUG=False
SECRET_KEY=generate-with-django-secret-key-generator
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_NAME=kenwell_db
DATABASE_USER=postgres_user
DATABASE_PASSWORD=secure_password_here
DATABASE_HOST=your_db_host
DATABASE_PORT=5432

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

#### Frontend Settings (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Database Backup & Restore

```bash
# Backup
pg_dump kenwell_db > backup.sql

# Restore
psql kenwell_db < backup.sql
```

### Scaling Considerations

1. **Database**: Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
2. **Static Files**: Use CDN (CloudFront, Azure CDN, etc.)
3. **API Server**: Containerize with Docker, deploy to cloud (AWS ECS, Azure Container Apps)
4. **Frontend**: Deploy to Vercel, Netlify, or similar
5. **Caching**: Implement Redis for session/cache layer
6. **Monitoring**: Set up error tracking (Sentry), monitoring (DataDog)

### Docker Deployment

```dockerfile
# Dockerfile for Django backend
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV DEBUG=False

EXPOSE 8000

CMD ["gunicorn", "kenwell_erp.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```bash
# Build and run
docker build -t kenwell-erp .
docker run -p 8000:8000 kenwell-erp
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure venv is activated
   - Run `pip install -r requirements.txt` again

2. **PostgreSQL connection refused**
   - Check PostgreSQL is running: `sudo service postgresql status`
   - Verify credentials in settings.py
   - Create database: `createdb kenwell_db`

3. **CORS errors in frontend**
   - Add frontend URL to CORS_ALLOWED_ORIGINS in settings.py
   - Restart Django server

4. **JWT token invalid/expired**
   - Token lifetime is 1 hour (configurable in settings.py)
   - Use refresh token to get new access token

5. **Static files not loading in production**
   - Run `python manage.py collectstatic`
   - Configure CDN or serve from S3

## Performance Optimization Tips

1. Use Django Debug Toolbar in development
2. Enable query optimization with select_related/prefetch_related
3. Implement caching with Redis
4. Minimize API calls from frontend
5. Compress responses with gzip
6. Use database indexes strategically
7. Implement pagination for large datasets

## Security Best Practices

1. Always use HTTPS in production
2. Keep dependencies updated
3. Use strong SECRET_KEY
4. Implement rate limiting on API
5. Enable CORS only for trusted domains
6. Use secure passwords for database
7. Implement request logging and monitoring
8. Regular security audits
9. Implement field-level encryption for sensitive data
10. Use environment variables for secrets

## Maintenance & Support

- Regular database backups (automated)
- Monitor API logs and errors
- Update dependencies monthly
- Security patches applied immediately
- Performance monitoring and optimization
- User support and documentation

## Next Phase Development

Additional modules that can be built:
- Customer self-service portal
- Mobile app (React Native)
- Advanced analytics dashboard
- Email notification system
- SMS notifications
- Automated claim processing
- Integration with insurance partners
- Compliance reporting

## Contact & Support

For technical support or questions about deployment:
- Review Django documentation: https://docs.djangoproject.com/
- Review Next.js documentation: https://nextjs.org/docs
- Check PostgreSQL documentation: https://www.postgresql.org/docs/
