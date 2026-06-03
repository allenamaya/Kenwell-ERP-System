<img width="196" height="89" alt="logo(1)" src="https://github.com/user-attachments/assets/e19bf8c6-035a-44dd-9059-094cd1af85dd" />
# Kenwell Insurance Agency ERP System

**Project Manager & Author:** Allen Ahlee Amaya

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Strategy](#deployment-strategy)
3. [Environment Setup](#environment-setup)
4. [CI/CD Pipelines](#cicd-pipelines)
5. [Unit Testing](#unit-testing)
6. [Local Development](#local-development)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

### Recommended Architecture

**Yes, backend and frontend should be deployed separately.** This is the industry best practice for scalability and flexibility.

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │  Frontend App    │              │  Backend API     │    │
│  │  (Vercel/Netlify)│◄────────────►│  (Railway/Render)│    │
│  │  Next.js + React │              │  Django REST     │    │
│  │  http://app.com  │              │  http://api.com  │    │
│  └──────────────────┘              └──────────────────┘    │
│           ▲                                    ▲              │
│           │                                    │              │
│           └────────────┬───────────────────────┘              │
│                        │                                      │
│                   PostgreSQL DB                               │
│                  (Vercel Postgres)                            │
│                        │                                      │
│                   Redis Cache                                 │
│                 (Upstash Redis)                               │
│                        │                                      │
│                  S3/Blob Storage                              │
│               (Vercel Blob)                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| **Frontend** | Next.js 15 + React 19 | Server-side rendering, API routes, optimal performance |
| **Backend** | Django 6.0 REST | Robust ORM, excellent async support, built-in admin |
| **Database** | PostgreSQL | ACID compliance, relational integrity, scalability |
| **Cache** | Redis | Session management, performance optimization |
| **File Storage** | Vercel Blob/S3 | CDN integration, global distribution |
| **Auth** | JWT (SimplJWT) | Stateless, scalable, modern standard |
| **Hosting (Frontend)** | Vercel | Zero-config deployment, built for Next.js |
| **Hosting (Backend)** | Railway or Render | Docker support, PostgreSQL integration, easy scaling |
| **CI/CD** | GitHub Actions | Free, integrated with GitHub, reliable |
| **Monitoring** | Sentry + DataDog | Error tracking, performance monitoring |

---

## Deployment Strategy

### Multi-Environment Architecture

```
Development (Local)
    ↓
Staging/UAT (Separate Instances)
    ↓
Production (Live)
```

### Environment Specifications

#### **Development Environment**
- **Location:** Local machine
- **Database:** SQLite (for quick setup) or PostgreSQL container
- **API URL:** `http://localhost:8000`
- **Frontend URL:** `http://localhost:3000`
- **Auto-reload:** Enabled
- **Debugging:** Full stack trace

#### **Staging/UAT Environment**
- **Frontend:** Vercel (preview branch)
- **Backend:** Railway/Render (staging tier)
- **Database:** PostgreSQL (staging instance)
- **URL:** `https://staging.kenwell-erp.com`
- **Auth:** Same as production (test accounts only)
- **Data:** Anonymized production data

#### **Production Environment**
- **Frontend:** Vercel (main branch)
- **Backend:** Railway/Render (production tier)
- **Database:** PostgreSQL (managed)
- **Redis:** Upstash Redis (managed)
- **Storage:** Vercel Blob or S3
- **URL:** `https://app.kenwell-erp.com` (Frontend)
- **API:** `https://api.kenwell-erp.com` (Backend)
- **SSL/TLS:** Automatic (Let's Encrypt)
- **Monitoring:** Sentry + DataDog

---

## Environment Setup

### Prerequisites

- Node.js 18+ & pnpm
- Python 3.10+
- Git
- Docker & Docker Compose (optional)
- Vercel CLI
- PostgreSQL client tools

### Environment Variables

#### Backend (.env file)

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,api.kenwell-erp.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kenwell_db
# OR for development
DATABASE_URL=sqlite:///db.sqlite3

# Cache
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.kenwell-erp.com

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT
SIMPLE_JWT_SECRET_KEY=your-jwt-secret-key

# AWS/S3 (if using S3 instead of Vercel Blob)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=kenwell-erp-bucket
AWS_S3_REGION_NAME=us-east-1

# Sentry
SENTRY_DSN=https://your-sentry-dsn

# Environment
ENVIRONMENT=production
```

#### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Vercel
VERCEL_URL=https://app.kenwell-erp.com

# Analytics
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
```

### Setup Instructions

#### 1. Local Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/kenwell-erp.git
cd kenwell-erp

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py populate_test_data
python manage.py runserver

# Frontend setup (new terminal)
cd ../
pnpm install
pnpm dev
```

#### 2. Docker Setup (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kenwell_db
      POSTGRES_USER: kenwell_user
      POSTGRES_PASSWORD: secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py populate_test_data &&
             python manage.py runserver 0.0.0.0:8000"
    environment:
      - DATABASE_URL=postgresql://kenwell_user:secure_password_here@db:5432/kenwell_db
      - REDIS_URL=redis://redis:6379/0
      - DEBUG=True
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build: ./
    command: pnpm dev
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./:/app
      - /app/node_modules

volumes:
  postgres_data:
```

---

## CI/CD Pipelines

### GitHub Actions Setup

#### 1. Backend Testing Pipeline

Create `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests & Quality

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_kenwell
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
          cache: 'pip'

      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-django

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_kenwell
        run: |
          cd backend
          python manage.py migrate

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_kenwell
        run: |
          cd backend
          pytest --cov=. --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml

      - name: Run linting
        run: |
          cd backend
          pip install flake8 black isort
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          black . --check
          isort . --check-only
```

#### 2. Frontend Testing Pipeline

Create `.github/workflows/frontend-tests.yml`:

```yaml
name: Frontend Tests & Quality

on:
  push:
    branches: [main, develop]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'package.json'
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test --coverage

      - name: Run linting
        run: pnpm lint

      - name: Run type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### 3. Deploy Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          curl -L https://railway.app/install.sh | bash
          railway deploy --service backend --detach
      
      - name: Run migrations
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway run python manage.py migrate

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Unit Testing

### Backend Testing Setup

#### Install Testing Dependencies

```bash
pip install pytest pytest-django pytest-cov pytest-asyncio factory-boy faker
```

#### Create test configuration

Create `backend/pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = kenwell_erp.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = --strict-markers --tb=short
testpaths = .
```

#### Example Backend Tests

Create `backend/core/tests.py`:

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.mark.django_db
class TestUserAPI:
    def test_user_registration(self, api_client):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = api_client.post('/api/users/register/', data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_user_login(self, api_client, test_user):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = api_client.post('/api/auth/login/', data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_user_detail(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)
        response = api_client.get('/api/users/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'testuser'
```

### Frontend Testing Setup

#### Install Testing Dependencies

```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### Create Jest configuration

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

#### Example Frontend Tests

Create `__tests__/pages/login.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock the auth context
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({}),
    isLoading: false,
  }),
}))

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByText(/sign in to kenwell/i)).toBeInTheDocument()
  })

  it('submits login form', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
```

#### Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

---

## Local Development

### Quick Start

```bash
# Option 1: Automatic setup (Unix/Linux/macOS)
bash setup-dev.sh

# Option 2: Manual setup
cd backend && python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_test_data
python manage.py runserver

# In another terminal
pnpm install
pnpm dev
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**
   ```bash
   pnpm dev          # Frontend
   python manage.py runserver  # Backend
   pnpm test         # Frontend tests
   pytest            # Backend tests
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request on GitHub**
   - CI/CD will automatically run tests
   - Get code review
   - Merge to `develop` branch

5. **Testing in Staging**
   - Push to `develop` branch triggers staging deployment
   - Test thoroughly with test accounts
   - When ready, merge to `main` for production

---

## Production Deployment

### Step 1: Prepare Backend Deployment

#### A. Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Create services
railway service add postgres
railway service add redis

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set SECRET_KEY=your-key-here
railway variables set DEBUG=False

# Deploy
railway deploy
```

#### B. Render Deployment

1. Connect GitHub repository
2. Create new Web Service
3. Configure build command: `pip install -r requirements.txt && python manage.py migrate`
4. Configure start command: `gunicorn kenwell_erp.wsgi`
5. Add environment variables
6. Deploy

### Step 2: Prepare Frontend Deployment

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or connect GitHub repo in Vercel dashboard
```

Configure `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "envs": {
    "preview": {
      "NEXT_PUBLIC_API_URL": "@staging_api_url"
    },
    "production": {
      "NEXT_PUBLIC_API_URL": "@prod_api_url"
    }
  }
}
```

### Step 3: Setup Custom Domains

**Frontend (Vercel):**
1. Go to Vercel Project Settings
2. Add domain: `app.kenwell-erp.com`
3. Update DNS records

**Backend (Railway/Render):**
1. Add custom domain to service
2. Update DNS records
3. Configure SSL/TLS

### Step 4: Database Migration

```bash
# On production server
python manage.py migrate
python manage.py collectstatic --noinput
```

### Step 5: Setup Monitoring

**Install Sentry:**

Backend:
```bash
pip install sentry-sdk
```

Frontend:
```bash
pnpm add @sentry/nextjs
```

Configure Sentry in both applications with production DSN.

---

## Monitoring & Maintenance

### Health Checks

**Backend API health endpoint:**
```bash
curl https://api.kenwell-erp.com/api/health/
```

**Frontend status:**
```bash
curl https://app.kenwell-erp.com/api/health
```

### Logging

**View logs:**

Railway:
```bash
railway logs
```

Vercel:
```bash
vercel logs <project>
```

### Database Backups

**PostgreSQL automated backups:**
- Railway: Daily automatic backups
- Render: Daily automatic backups
- Manual backup: `pg_dump -h host -U user -d dbname > backup.sql`

### Performance Monitoring

Monitor via:
- **Sentry** - Error tracking
- **DataDog** - Performance metrics
- **New Relic** - APM monitoring
- **Vercel Analytics** - Frontend performance

### Scaling Strategies

| Load Level | Frontend | Backend | Database |
|-----------|----------|---------|----------|
| **Low** | 1 instance | 1 instance | Shared |
| **Medium** | 2 instances | 2 instances | Dedicated 2GB |
| **High** | 4+ instances | 4+ instances | Dedicated 4GB+ |
| **Enterprise** | Global CDN | Kubernetes | RDS + Read replicas |

---

## Troubleshooting

### Common Issues

**Network Error on Login:**
```
Solution: Ensure backend is running on http://localhost:8000
Check CORS settings in Django settings.py
```

**Database Connection Failed:**
```
Solution: Check DATABASE_URL environment variable
Verify PostgreSQL is running
Check database credentials
```

**Port Already in Use:**
```bash
# Find and kill process
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>
```

### Getting Help

1. Check logs: `vercel logs`, `railway logs`
2. Review Sentry for errors
3. Check GitHub Issues
4. Contact support: support@kenwell-erp.com

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong SECRET_KEY in Django
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure cookie settings
- [ ] Enable CSRF protection
- [ ] Use environment variables for secrets
- [ ] Regular dependency updates
- [ ] Database backups enabled
- [ ] Monitoring and alerting active
- [ ] Rate limiting configured
- [ ] Input validation implemented

---

## Support & Contact

**Project Manager:** Allen Ahlee Amaya

For questions or issues:
- GitHub Issues: https://github.com/yourusername/kenwell-erp/issues
- Email: support@kenwell-erp.com
- Documentation: https://docs.kenwell-erp.com

---

**Last Updated:** May 2026
**Version:** 1.0.0
