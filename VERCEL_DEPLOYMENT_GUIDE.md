# Kenwell ERP - Vercel Deployment Guide

This guide covers deploying your monorepo (Next.js Frontend + Django Backend) with optimal configuration.

## Architecture Overview

```
Your App Structure:
├── Frontend (Next.js) → Vercel
├── Backend (Django) → External Platform (Recommended)
└── Database → PostgreSQL Cloud Service
```

## Deployment Options

### Option 1: Frontend on Vercel + Backend on External Platform (RECOMMENDED)

**Why this is best:**
- Vercel is optimized for Next.js
- Django runs properly with full Python runtime
- Better scalability and performance
- Easier debugging and monitoring

**Backend Hosting Options:**
1. **Railway** (Recommended - Easy PostgreSQL integration)
2. **Render** (Free tier available)
3. **Heroku** (Paid, reliable)
4. **AWS Elastic Beanstalk** (Most control)
5. **DigitalOcean** (Good price/performance)

---

## Step 1: Prepare Frontend for Vercel

### 1.1 Update Environment Variables in `.env.local`

```bash
# .env.local (for local development)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# .env.production (for production)
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### 1.2 Update vercel.json

Your `vercel.json` already has good configuration, but ensure:

```json
{
  "buildCommand": "pnpm install && pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "envPrefix": "NEXT_PUBLIC_",
  "regions": ["sfo1"],
  "public": true,
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

### 1.3 Exclude Backend from Vercel Build

Create `.vercelignore`:

```
backend/
.env.example
*.md
docker-compose.yml
Dockerfile
.git/
node_modules/
.next/
venv/
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select `allenamaya/Kenwell-ERP-System`
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`

### 2.2 Add Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-backend-api.com/api
```

For development/preview:
```
NEXT_PUBLIC_API_URL = https://dev-backend-api.com/api
```

### 2.3 Deploy

Click "Deploy" - Vercel will automatically build and deploy your Next.js app!

---

## Step 3: Deploy Backend (Using Railway - Recommended)

### 3.1 Prepare Django for Production

#### Update `backend/kenwell_erp/settings.py`:

```python
# settings.py

import os
from pathlib import Path

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# CORS Settings - Allow your Vercel frontend
CORS_ALLOWED_ORIGINS = [
    'https://your-app-name.vercel.app',
    'https://yourdomain.com',
    'http://localhost:3000',  # for local development
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'kenwell_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Security
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media Files (if you use file uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

#### Update `backend/requirements.txt`:

```
Django==6.0
djangorestframework==3.14.0
django-cors-headers==4.3.1
python-decouple==3.8
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
python-dateutil==2.8.2
pytz==2024.1
```

#### Create `backend/Procfile` for deployment:

```
web: gunicorn kenwell_erp.wsgi:application --log-file -
release: python manage.py migrate
```

#### Create `backend/runtime.txt`:

```
python-3.11.7
```

#### Update `.gitignore` to exclude sensitive files:

```
*.pyc
__pycache__/
*.egg-info/
.env
.env.local
venv/
.vscode/
.DS_Store
db.sqlite3
staticfiles/
media/
```

### 3.2 Create Railway Account and Deploy

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `allenamaya/Kenwell-ERP-System`
6. Click "Add Service" → PostgreSQL
7. Click "Add Service" → Python

### 3.3 Configure Railway Environment Variables

In Railway Dashboard, go to your Python service → Variables:

```
SECRET_KEY = (generate with: python -c "import secrets; print(secrets.token_urlsafe(50))")
DEBUG = False
ALLOWED_HOSTS = your-railway-domain.railway.app,localhost
CORS_ALLOWED_ORIGINS = https://your-app.vercel.app
DATABASE_URL = (auto-filled by Railway PostgreSQL)
DB_NAME = railway
DB_USER = postgres
DB_PASSWORD = (auto-filled)
DB_HOST = (auto-filled)
DB_PORT = 5432
PYTHONUNBUFFERED = true
```

### 3.4 Deploy

Railway automatically deploys when you push to main branch!

---

## Step 4: Connect Frontend to Backend

### Update `.env.production` in Frontend:

```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

### Update `lib/api.ts` (or wherever you make API calls):

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## Step 5: Run Locally with Both Servers

Now you can test concurrent development:

```bash
# Install dependencies
pnpm install

# Setup backend virtual environment (one time)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Run both servers concurrently
pnpm dev:all
```

This will run:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000/api

---

## Step 6: Production Checklist

Before going live:

- [ ] Django `DEBUG = False`
- [ ] Generate new `SECRET_KEY`
- [ ] Set up HTTPS (both platforms support this)
- [ ] Configure CORS for your frontend domain
- [ ] Set up database backups
- [ ] Configure environment variables in both platforms
- [ ] Test login flow end-to-end
- [ ] Test API calls from frontend
- [ ] Set up error logging (Sentry)
- [ ] Monitor performance

---

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS
```

**Solution:** Ensure `CORS_ALLOWED_ORIGINS` in Django settings includes your Vercel domain.

### 401 Unauthorized
**Solution:** Check that JWT token is being sent in Authorization header.

### Database Connection Failed
**Solution:** Verify database credentials in environment variables match your provider's connection string.

### Static Files 404
**Solution:** Run `python manage.py collectstatic` before deployment.

---

## Quick Reference Commands

```bash
# Local development with both servers
pnpm dev:all

# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend

# Build frontend
pnpm build

# Backend migrations
cd backend && python manage.py migrate

# Backend shell
cd backend && python manage.py shell

# Create superuser
cd backend && python manage.py createsuperuser
```

---

## Support

- Vercel Docs: https://vercel.com/docs
- Django Docs: https://docs.djangoproject.com/
- Railway Docs: https://railway.app/docs
- DRF Docs: https://www.django-rest-framework.org/

