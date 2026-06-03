# Railway Backend Deployment Guide

## Overview
This guide walks you through deploying the Kenwell ERP Django backend to Railway.

**Time Required:** ~15-20 minutes

## Prerequisites
- Railway account (https://railway.app)
- GitHub account with the repository connected
- Vercel project set up (frontend)

## Step 1: Connect GitHub to Railway

1. Go to https://railway.app and log in
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Click "Configure GitHub App"
5. Select your GitHub organization/account
6. Select "Kenwell-ERP-System" repository
7. Click "Install & Continue"
8. Accept permissions

## Step 2: Create the Backend Service

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Find and select "allenamaya/Kenwell-ERP-System"
4. Click "Deploy"

## Step 3: Configure the Backend Service

1. Railway will auto-detect this is a Python project
2. Click on the "backend" service (or create one)
3. In the "Service" tab, set:
   - **Root Directory:** `backend`
   - This tells Railway to deploy from the backend folder

## Step 4: Add PostgreSQL Database

1. In your Railway project, click "Add Service"
2. Select "Database"
3. Choose "PostgreSQL"
4. Click "Create"

Railway will automatically create and expose:
- `DATABASE_URL` environment variable with the connection string
- All necessary credentials

## Step 5: Configure Environment Variables

Railway automatically sets `DATABASE_URL`. Now add these:

1. In Railway dashboard, go to your backend service
2. Click "Variables" tab
3. Add these environment variables:

```
DEBUG=False
SECRET_KEY=<generate-new-random-secret>
ALLOWED_HOSTS=*.railway.app,yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com
ENVIRONMENT=production

# Email (SendGrid recommended)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<your-sendgrid-api-key>
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Generate SECRET_KEY

Generate a strong secret key:

```bash
# Run in terminal
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Or use an online generator: https://djecrety.ir/

### Important Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `DEBUG` | `False` | Must be False in production |
| `SECRET_KEY` | Random string | Django secret, keep private |
| `ALLOWED_HOSTS` | Domain list | Which domains can access API |
| `CORS_ALLOWED_ORIGINS` | Frontend URL | Where frontend requests come from |
| `DATABASE_URL` | Auto-set by Railway | PostgreSQL connection (auto-created) |

## Step 6: Verify Deployment

1. In Railway, go to your backend service
2. Click "Deployments" tab
3. Wait for status to show "Success" (green)
4. Click on the deployment to view logs
5. Look for "Running on" or similar message

## Step 7: Get Your Backend URL

1. In Railway dashboard, click on your backend service
2. In the "Settings" tab, scroll down to "Domains"
3. Click "Generate Domain"
4. Your backend URL will be something like:
   ```
   https://kenwell-backend-production-xxxx.railway.app
   ```

**Save this URL!** You'll need it for Vercel configuration.

## Step 8: Test the Backend

```bash
# Test if backend is running
curl https://your-railway-url/api/auth/login/

# Should return a JSON response (may error if no data, but that's OK)
```

## Step 9: Update Vercel Environment Variables

Now that you have your backend URL:

1. Go to Vercel Dashboard → Your Project
2. Go to "Settings" → "Environment Variables"
3. Add/Update:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-railway-url/api`
   - **Environments:** All (Production, Preview, Development)

4. Redeploy your frontend:
   - Click "Deployments"
   - Find the latest deployment
   - Click "..." → "Redeploy"

## Step 10: Test the Integration

1. Go to your Vercel frontend URL
2. Try to login with admin credentials
3. Dashboard should load with data

If it doesn't work, check:
- CORS_ALLOWED_ORIGINS includes your Vercel domain
- NEXT_PUBLIC_API_URL is set correctly
- Backend is running (check Railway logs)

## Troubleshooting

### "502 Bad Gateway"
- Check Railway logs: Click service → Logs tab
- Backend may be starting, wait 1-2 minutes
- Check if Python version is compatible

### "CORS error" in browser console
- Add your Vercel domain to CORS_ALLOWED_ORIGINS in Railway
- Redeploy backend after changing

### "Connection refused" on login
- Verify NEXT_PUBLIC_API_URL is set in Vercel
- Make sure backend URL is correct (no trailing slash)
- Wait for Railway deployment to complete

### "Database connection error"
- DATABASE_URL should be auto-set by Railway
- Check if PostgreSQL service is running
- Verify status in Railway dashboard

### Database migrations failed
- Check Railway logs for specific error
- May need to manually run: `python manage.py migrate`
- Can run via Railway's CLI or bash terminal

## Important: Database Migrations

Railway automatically runs migrations via the `release` command in Procfile:
```
release: python manage.py migrate
```

This runs **before** the web process starts, so your database schema is created automatically.

## After Deployment

### Monitor the Backend
- Railway dashboard shows CPU, memory, request counts
- Check logs regularly for errors
- Monitor PostgreSQL database size

### Keep It Updated
1. Make changes to code locally
2. Push to GitHub
3. Railway auto-deploys on new commits
4. No manual steps needed!

### Scale if Needed
- If you get high traffic, Railway auto-scales
- Pay-per-use pricing on Railway
- Can set memory/CPU limits

## Next Steps

1. Test the complete login flow
2. Create a few test users through admin panel
3. Verify agents and customers appear on dashboard
4. Test Google OAuth with your backend
5. Monitor Railway logs for first week

## Useful Links

- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/6.0/howto/deployment/
- Environment Variables: See ENVIRONMENT_SETUP.md in main repo

## Support

If you encounter issues:
1. Check Railway status at https://railway.app/status
2. View logs in Railway dashboard
3. Check Django error documentation
4. Refer to troubleshooting section above

---

**All set!** Your backend is now deployed and ready for production.
