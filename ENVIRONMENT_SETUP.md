# Environment Configuration Guide

## Overview

This guide explains how to configure the Kenwell ERP System for different environments: development, staging, and production.

## Environment Hierarchy

```
Development (Local)
    ↓
Staging (Pre-production testing)
    ↓
Production (Live system)
```

## Environment Files

### Frontend Environment Files

Location: Project root

#### Development (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_DEV_GOOGLE_CLIENT_ID

# App Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Staging (.env.staging)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_STAGING_GOOGLE_CLIENT_ID

# App Configuration
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
```

#### Production (.env.production.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_PROD_GOOGLE_CLIENT_ID

# App Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

### Backend Environment Files

Location: `backend/` directory

#### Development (.env)
```bash
# Django Configuration
DEBUG=True
SECRET_KEY=your-secret-key-development-only-change-this
ALLOWED_HOSTS=localhost,127.0.0.1,localhost:8000,127.0.0.1:8000

# Database (SQLite for development)
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Configuration (optional for dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=localhost
EMAIL_PORT=1025

# Security
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

#### Staging (.env)
```bash
# Django Configuration
DEBUG=False
SECRET_KEY=your-secret-key-staging-change-this-in-production
ALLOWED_HOSTS=staging.yourdomain.com,api-staging.yourdomain.com

# Database (PostgreSQL for staging)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=kenwell_staging
DATABASE_USER=postgres_user
DATABASE_PASSWORD=secure_password_here
DATABASE_HOST=db-staging.yourdomain.com
DATABASE_PORT=5432

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://staging.yourdomain.com,https://api-staging.yourdomain.com

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@staging.yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

#### Production (.env)
```bash
# Django Configuration
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-change-immediately
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com,app.yourdomain.com

# Database (PostgreSQL for production)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=kenwell_production
DATABASE_USER=postgres_user
DATABASE_PASSWORD=very_secure_password_here
DATABASE_HOST=db.yourdomain.com
DATABASE_PORT=5432

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True

# AWS/Storage (optional)
USE_S3=True
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=kenwell-uploads
AWS_S3_REGION_NAME=us-east-1
```

## Environment Variables Reference

### Frontend Variables

| Variable | Development | Staging | Production | Required |
|----------|-------------|---------|------------|----------|
| `NEXT_PUBLIC_API_URL` | http://localhost:8000 | https://api-staging.yourdomain.com | https://api.yourdomain.com | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | dev_client_id | staging_client_id | prod_client_id | Yes |
| `NEXT_PUBLIC_APP_ENV` | development | staging | production | No |
| `NEXT_PUBLIC_APP_URL` | http://localhost:3000 | https://staging.yourdomain.com | https://app.yourdomain.com | No |

### Backend Variables

| Variable | Development | Staging | Production | Required |
|----------|-------------|---------|------------|----------|
| `DEBUG` | True | False | False | Yes |
| `SECRET_KEY` | dev_only | staging_key | prod_key (secret) | Yes |
| `ALLOWED_HOSTS` | localhost | staging.yourdomain.com | yourdomain.com | Yes |
| `DATABASE_ENGINE` | sqlite3 | postgresql | postgresql | Yes |
| `CORS_ALLOWED_ORIGINS` | localhost:3000 | staging domain | production domain | Yes |
| `SECURE_SSL_REDIRECT` | False | True | True | Yes |
| `SESSION_COOKIE_SECURE` | False | True | True | Yes |

## Setting Up Environments

### Development Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/allenamaya/Kenwell-ERP-System.git
   cd Kenwell-ERP-System
   ```

2. **Create frontend environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with development values
   ```

3. **Create backend environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with development values
   ```

4. **Install dependencies**
   ```bash
   # Frontend
   pnpm install
   
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Run migrations**
   ```bash
   cd backend
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start servers**
   ```bash
   pnpm dev:all
   ```

### Staging Setup

1. **Create staging branch**
   ```bash
   git checkout -b staging
   ```

2. **Update environment files**
   ```bash
   # Frontend
   cat > .env.staging << EOF
   NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=staging_client_id
   NEXT_PUBLIC_APP_ENV=staging
   NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
   EOF
   
   # Backend
   cd backend
   cat > .env << EOF
   DEBUG=False
   SECRET_KEY=your-staging-secret-key
   # ... other staging variables
   EOF
   ```

3. **Deploy to staging server**
   ```bash
   # Frontend on Vercel
   vercel --prod --env staging
   
   # Backend on Railway/Heroku
   git push heroku-staging staging:main
   ```

4. **Run database migrations**
   ```bash
   # On staging server
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

### Production Setup

1. **Create production branch**
   ```bash
   git checkout -b production
   ```

2. **Update environment files**
   ```bash
   # Frontend
   cat > .env.production.local << EOF
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=prod_client_id
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
   EOF
   
   # Backend
   cd backend
   cat > .env << EOF
   DEBUG=False
   SECRET_KEY=your-very-secure-production-secret-key
   # ... other production variables
   EOF
   ```

3. **Deploy to production**
   ```bash
   # Frontend on Vercel
   vercel --prod
   
   # Backend on Railway/Heroku
   git push heroku-production production:main
   ```

4. **Run database migrations**
   ```bash
   # On production server
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

## Environment-Specific Features

### Development
- Debug mode enabled
- Hot reload for code changes
- SQLite database
- Console email output
- CORS allows localhost
- No SSL requirement

### Staging
- Debug mode disabled
- PostgreSQL database
- Email via SendGrid
- SSL required
- Identical to production setup
- Used for final testing before production

### Production
- Debug mode disabled
- PostgreSQL database
- Email via SendGrid
- SSL/HTTPS required
- HSTS security headers
- Optional S3/AWS storage
- Performance optimizations

## Deployment Workflow

```
Local Development
       ↓
   git commit
       ↓
   git push origin feature-branch
       ↓
   Create Pull Request
       ↓
   Code Review (staging deployment)
       ↓
   Approve PR
       ↓
   Merge to main
       ↓
   Deploy to Production
```

## Database Setup by Environment

### Development (SQLite)
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Staging (PostgreSQL)
```bash
# Create database
createdb kenwell_staging

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### Production (PostgreSQL)
```bash
# Database created by hosting provider

# Run migrations
python manage.py migrate

# Create superuser (optional, can be done via admin)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create backup
pg_dump kenwell_production > backup.sql
```

## Environment-Specific Debugging

### Development
- Check browser console for errors
- View Django logs: `tail -f logs/django.log`
- Use `console.log()` for debugging
- Database: `sqlite3 db.sqlite3`

### Staging
- Check application logs on hosting platform
- View error tracking (if configured)
- Check API responses with curl or Postman
- Database backups available

### Production
- Monitor with error tracking service (Sentry)
- Review application logs
- Check performance metrics
- Regular backups configured

## Security Checklist

### Development
- [ ] Using localhost only
- [ ] SECRET_KEY is development value
- [ ] Debug mode enabled (OK for dev)

### Staging
- [ ] SECRET_KEY is unique staging value
- [ ] Debug mode disabled
- [ ] SSL/HTTPS enabled
- [ ] CORS restricted to staging domain
- [ ] Database password is secure

### Production
- [ ] SECRET_KEY is unique, long, random
- [ ] Debug mode disabled
- [ ] HTTPS/SSL enabled and enforced
- [ ] HSTS headers configured
- [ ] Database backups enabled
- [ ] Email service configured
- [ ] Static files served from CDN
- [ ] Regular security updates applied

## Monitoring and Maintenance

### Daily
- Check application logs
- Monitor error rates
- Verify key features working

### Weekly
- Database integrity check
- Review user activity
- Check security logs

### Monthly
- Database optimization
- Performance review
- Security audit
- Backup verification

## Rollback Procedures

### Frontend Rollback
```bash
# On Vercel
vercel rollback

# Or redeploy previous version
git revert HEAD
git push origin main
```

### Backend Rollback
```bash
# On Heroku
heroku releases
heroku rollback

# Or redeploy previous version
git revert HEAD
git push heroku main
```

## Support and Troubleshooting

For environment-specific issues:

1. **Check environment variables**: Verify all required variables are set
2. **Check logs**: Review application logs for detailed error messages
3. **Test connectivity**: Ensure frontend can reach backend API
4. **Verify database**: Connect to database and check tables exist
5. **Check SSL certificates**: Ensure HTTPS certificates are valid

## Next Steps

1. Set up development environment locally
2. Configure staging environment
3. Test deployment pipeline
4. Configure monitoring and logging
5. Set up automated backups
6. Document any customizations
