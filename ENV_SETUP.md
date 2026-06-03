# Environment Variables Setup Guide

## Local Development Setup

### Frontend (.env.local)

Create `.env.local` in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend (.env)

Create `backend/.env`:

```bash
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-for-local-development
ALLOWED_HOSTS=localhost,127.0.0.1,*.railway.app

# Database (Local PostgreSQL)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=kenwell_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT Settings
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7

# Email Settings (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (Optional, for file uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1
```

---

## Production Setup (Vercel + Railway)

### Frontend (Vercel Environment Variables)

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-backend.railway.app/api
NEXT_PUBLIC_ENVIRONMENT = production
```

For preview/staging:
```
NEXT_PUBLIC_API_URL = https://staging-backend.railway.app/api
NEXT_PUBLIC_ENVIRONMENT = staging
```

### Backend (Railway Environment Variables)

In Railway Dashboard → Your Project → Variables:

```
# Django Settings
DEBUG = False
SECRET_KEY = (generate with: python -c "import secrets; print(secrets.token_urlsafe(50))")
ALLOWED_HOSTS = your-backend.railway.app,api.yourdomain.com

# Database (Railway PostgreSQL Auto-configured)
DATABASE_ENGINE = django.db.backends.postgresql
DATABASE_NAME = railway
DATABASE_USER = postgres
DATABASE_PASSWORD = (auto-filled by Railway)
DATABASE_HOST = (auto-filled by Railway)
DATABASE_PORT = 5432

# CORS Settings
CORS_ALLOWED_ORIGINS = https://your-app.vercel.app,https://yourdomain.com

# JWT Settings
JWT_ALGORITHM = HS256
JWT_EXPIRATION_HOURS = 24
JWT_REFRESH_EXPIRATION_DAYS = 7

# Email Settings
EMAIL_BACKEND = django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = your-email@gmail.com
EMAIL_HOST_PASSWORD = your-app-password

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID = your-key
AWS_SECRET_ACCESS_KEY = your-secret
AWS_STORAGE_BUCKET_NAME = your-bucket
AWS_S3_REGION_NAME = us-east-1

# Logging
SENTRY_DSN = (optional, for error tracking)

# Python Runtime
PYTHONUNBUFFERED = true
```

---

## How to Generate SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Or use online generator: https://djecrety.ir/

---

## Step-by-Step: First Time Setup

### 1. Local Development

```bash
# Frontend env
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000/api' > .env.local

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your local database credentials
```

### 2. After Deploying to Vercel

Update `.env.local` to point to your production backend:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### 3. After Setting Up Railway Backend

Update Vercel environment variables with your Railway backend URL.

---

## Verifying Environment Variables

### Frontend (in browser console)
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Backend (in Django shell)
```bash
cd backend
python manage.py shell
```

```python
import os
print(os.getenv('DATABASE_NAME'))
print(os.getenv('SECRET_KEY'))
```

---

## Common Issues

### "NEXT_PUBLIC_API_URL is undefined"
- Make sure the variable starts with `NEXT_PUBLIC_` prefix
- Redeploy after adding variables to Vercel
- Check `.env.local` is in `.gitignore`

### "CORS error from frontend"
- Update `CORS_ALLOWED_ORIGINS` in Django to include your frontend URL
- Restart the backend

### "Database connection refused"
- Verify credentials in `.env`
- Check PostgreSQL is running locally
- Verify Railway PostgreSQL credentials

### "Secret key is insecure"
- Never commit `.env` files
- Always generate new `SECRET_KEY` for production
- Use `secrets` module or online generator

---

## Security Best Practices

✅ **DO:**
- Use strong, random `SECRET_KEY`
- Store sensitive values in environment variables
- Use `.env` files for local development
- Add `.env*` to `.gitignore`
- Rotate `SECRET_KEY` periodically

❌ **DON'T:**
- Commit `.env` files to Git
- Use same `SECRET_KEY` for dev and production
- Share environment variables in chat/email
- Use weak passwords for database
- Expose API keys in frontend code

---

## Getting Help

- Vercel Env Vars: https://vercel.com/docs/projects/environment-variables
- Django Settings: https://docs.djangoproject.com/en/6.0/ref/settings/
- Railway Docs: https://docs.railway.app/guides/variables

