# Kenwell Insurance ERP - Production Deployment Guide

**Project Manager:** Allen Ahlee Amaya

---

## Pre-Deployment Checklist

- [ ] All tests passing locally (`pnpm test:all` & `pytest`)
- [ ] Code reviewed and merged to `main` branch
- [ ] Environment variables configured in all platforms
- [ ] Database backups scheduled
- [ ] Monitoring and alerting configured
- [ ] SSL/TLS certificates valid
- [ ] CORS settings updated for production domains
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Incident response plan in place

---

## Deployment Architecture Decision

### Recommended: Separate Frontend & Backend Deployment

```
┌─────────────────────────────────────────┐
│       Frontend (Vercel)                 │
│  - Next.js with automatic deployments   │
│  - Global CDN                           │
│  - Zero-config                          │
│  URL: app.kenwell-erp.com               │
└─────────────────┬───────────────────────┘
                  │
           (HTTPS REST API)
                  │
┌─────────────────▼───────────────────────┐
│  Backend (Railway/Render)               │
│  - Django REST API                      │
│  - Docker containerized                 │
│  - Auto-scaling                         │
│  URL: api.kenwell-erp.com               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Database & Cache                       │
│  - PostgreSQL (Managed)                 │
│  - Redis (Upstash)                      │
│  - Storage (Vercel Blob/S3)             │
└─────────────────────────────────────────┘
```

### Benefits of Separate Deployment

✅ **Scalability** - Each service scales independently  
✅ **Flexibility** - Use different platforms optimized for each  
✅ **Reliability** - One service down doesn't take both down  
✅ **Performance** - Frontend CDN, backend optimized for API  
✅ **Cost Efficiency** - Pay only for what you use  

---

## Step-by-Step Deployment

### Phase 1: Infrastructure Setup (One-time)

#### 1.1 Create Vercel Account and Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link existing project
vercel link

# Create production environment
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://api.kenwell-erp.com
```

#### 1.2 Create Railway/Render Account

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
```

**OR Render:**
- Visit https://render.com
- Create new Web Service
- Connect GitHub repository

#### 1.3 Setup PostgreSQL Database

**Via Railway:**
```bash
railway service add postgres
railway variables set DATABASE_URL=postgresql://...
```

**Via Render:**
- Create PostgreSQL database
- Copy connection string to environment variables

**Via AWS RDS (Advanced):**
```bash
# Create RDS instance via AWS Console
# Get connection string
# Add to DATABASE_URL
```

#### 1.4 Setup Redis Cache

**Via Upstash:**
```bash
# Visit https://upstash.com
# Create Redis database
# Copy REDIS_URL to environment variables
```

#### 1.5 Setup File Storage

**Via Vercel Blob:**
```bash
# Automatically available with Vercel
# Set BLOB_STORE_KEY in environment
```

**Via AWS S3:**
```bash
# Create S3 bucket
# Set AWS credentials in environment:
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_STORAGE_BUCKET_NAME
```

---

### Phase 2: Backend Deployment

#### 2.1 Prepare Backend for Production

Create `backend/Dockerfile.prod`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y postgresql-client

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "kenwell_erp.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

#### 2.2 Deploy to Railway

```bash
# From project root
railway login
railway link

# Deploy
railway up

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser
```

#### 2.3 Configure Environment Variables

In Railway/Render dashboard, set:

```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=api.kenwell-erp.com
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://...
CORS_ALLOWED_ORIGINS=https://app.kenwell-erp.com
EMAIL_HOST_PASSWORD=your-app-password
SENTRY_DSN=https://your-sentry-dsn
ENVIRONMENT=production
```

#### 2.4 Setup Custom Domain

1. In Railway dashboard → Settings → Custom Domain
2. Add `api.kenwell-erp.com`
3. Update DNS CNAME record:
   ```
   api.kenwell-erp.com CNAME railway.app
   ```
4. Wait for DNS propagation (up to 24 hours)

#### 2.5 Test Backend

```bash
curl https://api.kenwell-erp.com/api/health/

# Should return 200 OK
```

---

### Phase 3: Frontend Deployment

#### 3.1 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://api.kenwell-erp.com
NEXT_PUBLIC_ENVIRONMENT=production
```

#### 3.2 Deploy to Vercel

```bash
# Option 1: Via CLI
vercel --prod

# Option 2: Via GitHub (Recommended)
# - Push to main branch
# - Vercel auto-deploys
```

#### 3.3 Configure Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add `app.kenwell-erp.com`
3. Update DNS records:
   ```
   app.kenwell-erp.com CNAME cname.vercel-dns.com
   ```

#### 3.4 Test Frontend

```bash
# Open in browser
https://app.kenwell-erp.com

# Check browser console for errors
# Check Network tab for API calls
```

---

### Phase 4: Database Setup

#### 4.1 Run Migrations

```bash
# Via SSH into backend
railway run python manage.py migrate

# Or via Render shell
```

#### 4.2 Create Admin User

```bash
railway run python manage.py createsuperuser

# Enter username, email, password
```

#### 4.3 Populate Initial Data

```bash
railway run python manage.py populate_test_data
```

#### 4.4 Backup Database

```bash
# Create backup
pg_dump postgresql://user:pass@host/db > backup.sql

# Or use managed backup (Railway/Render handles this)
```

---

### Phase 5: Monitoring & Logging

#### 5.1 Setup Sentry

```bash
# In Django settings.py
import sentry_sdk

sentry_sdk.init(
    dsn="https://your-dsn@sentry.io/123456",
    environment="production",
    traces_sample_rate=0.1
)
```

#### 5.2 Configure Logging

```bash
# View logs
railway logs
# OR
vercel logs
```

#### 5.3 Setup Alerts

Railway/Render → Alerts → Create Alert for:
- High memory usage
- High CPU usage
- Deployment failures
- 5xx errors

---

### Phase 6: Testing Production

#### 6.1 Health Checks

```bash
# Backend health
curl https://api.kenwell-erp.com/api/health/

# Frontend health
curl https://app.kenwell-erp.com

# Admin panel
curl https://api.kenwell-erp.com/admin/
```

#### 6.2 User Testing

1. Open https://app.kenwell-erp.com
2. Test login with credentials
3. Test all major features
4. Check network requests in DevTools

#### 6.3 Performance Testing

```bash
# Frontend Lighthouse
# Open DevTools → Lighthouse

# API response time
time curl https://api.kenwell-erp.com/api/agents/
```

#### 6.4 Security Testing

- [ ] HTTPS enforced
- [ ] CORS headers correct
- [ ] No sensitive data in logs
- [ ] SQL injection tests pass
- [ ] XSS protection enabled

---

## Multi-Environment Setup

### Development
```
Frontend: http://localhost:3000
Backend: http://localhost:8000
Database: SQLite local
```

### Staging
```
Frontend: https://staging.kenwell-erp.com (Vercel preview)
Backend: https://staging-api.kenwell-erp.com (Railway staging tier)
Database: PostgreSQL (staging)
```

### Production
```
Frontend: https://app.kenwell-erp.com
Backend: https://api.kenwell-erp.com
Database: PostgreSQL (production)
Cache: Redis (Upstash)
```

---

## Continuous Deployment via GitHub Actions

### Automatic Deployment Workflow

1. **Develop** → Create feature branch
2. **Test** → GitHub Actions runs tests
3. **Review** → Create Pull Request
4. **Merge** → Approve and merge to develop
5. **Staging** → Auto-deploy to staging
6. **Production** → Merge develop → main
7. **Verify** → Auto-deploy to production

### Manual Override

```bash
# Deploy immediately to production
git push origin main

# Vercel and Railway will auto-deploy
```

---

## Rollback Procedure

### Frontend Rollback (Vercel)

```bash
vercel rollback
# Select previous deployment
```

### Backend Rollback (Railway)

```bash
railway run git revert <commit-hash>
railway up
railway run python manage.py migrate --no-input
```

### Database Rollback

```bash
# Restore from backup
psql postgresql://user:pass@host/db < backup.sql
```

---

## Post-Deployment Verification

### 1. Check Health Endpoints

```bash
curl -I https://api.kenwell-erp.com/api/health/
curl -I https://app.kenwell-erp.com/api/health
```

### 2. Verify Environment Variables

```bash
# Backend
railway vars list

# Frontend
vercel env ls
```

### 3. Check Logs

```bash
railway logs
vercel logs
```

### 4. Test Key Features

- [ ] User login works
- [ ] Agent CRUD operations work
- [ ] Data persistence works
- [ ] File uploads work
- [ ] Email notifications work

### 5. Monitor Performance

- Check Vercel Analytics dashboard
- Check Railway CPU/Memory usage
- Check database query performance
- Monitor error tracking (Sentry)

---

## Troubleshooting Common Issues

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check backend logs
railway logs

# Restart backend
railway up

# Check database connection
railway run python manage.py dbshell
```

### Issue: CORS Errors

**Solution:**
```bash
# Update CORS_ALLOWED_ORIGINS in backend
railway vars set CORS_ALLOWED_ORIGINS=https://app.kenwell-erp.com

# Restart backend
railway up
```

### Issue: Database Connection Failed

**Solution:**
```bash
# Check DATABASE_URL
railway vars list | grep DATABASE_URL

# Test connection
railway run python manage.py dbshell

# Verify IP whitelist on database
```

### Issue: Static Files Not Loading

**Solution:**
```bash
# Collect static files
railway run python manage.py collectstatic --noinput

# Check STATIC_URL and STATIC_ROOT
```

---

## Security Hardening Checklist

- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] SQL injection prevention in place
- [ ] XSS protection enabled
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] Secrets not in code/logs
- [ ] Database credentials rotated
- [ ] Regular security updates scheduled

---

## Scaling & Performance

### When to Scale

| Metric | Threshold | Action |
|--------|-----------|--------|
| Request latency | >1s | Add backend instances |
| CPU usage | >80% | Upgrade tier or add instances |
| Database CPU | >85% | Add read replicas |
| Storage | >80% | Upgrade storage tier |

### Scaling Strategy

1. **Vertical**: Upgrade single instance
2. **Horizontal**: Add more instances
3. **Caching**: Optimize with Redis
4. **CDN**: Use edge caching

---

## Support & Escalation

### Incident Response

1. **Identify**: Check monitoring dashboards
2. **Alert**: Notify team via Slack
3. **Investigate**: Review logs and metrics
4. **Fix**: Deploy hotfix if needed
5. **Verify**: Test fix thoroughly
6. **Document**: Log incident details

### Contact Information

- **Project Manager**: Allen Ahlee Amaya
- **Support Email**: support@kenwell-erp.com
- **Emergency Hotline**: [your-number]
- **Slack Channel**: #kenwell-incidents

---

## References

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Django Deployment](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Author:** Allen Ahlee Amaya
