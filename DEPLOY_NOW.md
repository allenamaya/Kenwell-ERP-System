# Ready to Deploy! Backend + Frontend

Your Kenwell ERP System is ready for production deployment. Here's the complete path forward.

## Current Status

✅ **Frontend:** Ready on Vercel (waiting for backend URL)  
✅ **Backend:** Ready for Railway deployment  
✅ **Database:** Will be created on Railway (PostgreSQL)  
✅ **Documentation:** Complete with troubleshooting

## Deployment Order (Important!)

**You MUST deploy backend FIRST**, then frontend. Here's why:

1. Backend deploys and gets a URL (e.g., `https://api.railway.app`)
2. You add that URL to Vercel environment variables
3. Frontend redeploys with the backend URL
4. Everything works together

## Timeline

**Backend Deployment:** ~20 minutes  
**Frontend Update:** ~5 minutes  
**Testing:** ~5 minutes  

**Total: ~30 minutes from start to live production**

---

## Step-by-Step Deployment

### Part 1: Deploy Backend to Railway (20 minutes)

**Read:** `RAILWAY_QUICK_START.txt` for a quick checklist  
**Detailed:** `RAILWAY_DEPLOYMENT.md` for full guide with troubleshooting

Quick summary:
1. Go to https://railway.app
2. Create new project from GitHub
3. Select your repository
4. Add PostgreSQL database
5. Set environment variables
6. Wait for deployment to complete
7. **Copy your backend URL** (looks like: `https://kenwell-backend-xxxx.railway.app`)

### Part 2: Connect Backend to Frontend (5 minutes)

1. Go to Vercel dashboard → Kenwell-ERP-System
2. Settings → Environment Variables
3. Add `NEXT_PUBLIC_API_URL` = `https://your-railway-url/api`
4. Redeploy frontend

### Part 3: Test Everything (5 minutes)

1. Visit your Vercel URL
2. Login with: `admin` / `AdminPassword123!`
3. Dashboard should show data
4. Try adding an agent or customer
5. Test Google OAuth (if configured)

---

## What's Included

### Backend (Django)
- REST API with authentication
- Admin management (agents, customers, policies)
- Google OAuth support
- PostgreSQL database
- JWT tokens for security

### Frontend (Next.js)
- Modern dashboard UI
- Modal-based management interfaces
- Google OAuth button
- Role-based access control
- Admin, Agent, and Customer portals

### Deployment
- Auto-deploy from GitHub (push = automatic deployment)
- Environment-based configuration
- Production-ready security settings
- Error tracking and monitoring

---

## Important Environment Variables

### Railway (Backend)
```
DEBUG=False
SECRET_KEY=<generate-new>
ALLOWED_HOSTS=*.railway.app,yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
ENVIRONMENT=production
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-railway-url/api
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-id (if using Google OAuth)
```

---

## Test Credentials

**Admin User:**
- Username: `admin`
- Password: `AdminPassword123!`
- Role: Admin (full access)

**Test Agent:**
- Username: `agent@example.com`
- Password: `AgentPass123!`
- Role: Agent (limited access)

---

## After Deployment

### Monitor Everything
- Railway dashboard for backend health
- Vercel dashboard for frontend health
- Check logs regularly
- Set up error alerts

### Auto-Updates
- Push to GitHub
- Railway auto-deploys backend
- Vercel auto-deploys frontend
- No manual steps needed!

### Scaling
- Railway auto-scales with traffic
- Vercel auto-scales with traffic
- Pay-per-use pricing
- No downtime during scaling

---

## Troubleshooting

### Backend Won't Deploy
1. Check Railway logs (click service → Logs)
2. Common: Database not ready, wait 2-3 minutes
3. Verify Procfile exists in backend folder
4. Check requirements.txt has all dependencies

### Frontend Can't Connect to Backend
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Make sure no trailing slash
3. Check CORS is configured on backend
4. Backend URL must include `/api` at end

### Login Fails
1. Check backend is running (Railway logs)
2. Verify database is initialized
3. Confirm CORS_ALLOWED_ORIGINS includes your Vercel domain
4. Check frontend console for error details

### Google OAuth Not Working
1. Read `GOOGLE_OAUTH_SETUP.md`
2. Configure Google Cloud Console
3. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to Vercel
4. Test on staging first before production

---

## Next Steps

1. **Right now:** Read `RAILWAY_QUICK_START.txt` (5 min read)
2. **In 5 minutes:** Start Railway deployment (follow 10 steps)
3. **In 20 minutes:** Backend is live, copy the URL
4. **In 25 minutes:** Add URL to Vercel, redeploy
5. **In 30 minutes:** Everything is live and production-ready!

---

## Documentation Files

In this repository:

- **RAILWAY_QUICK_START.txt** - Fast deployment checklist
- **RAILWAY_DEPLOYMENT.md** - Detailed deployment guide
- **GOOGLE_OAUTH_SETUP.md** - OAuth configuration
- **ENVIRONMENT_SETUP.md** - Environment variables
- **VERCEL_DEPLOYMENT_GUIDE.md** - Frontend deployment
- **IMPLEMENTATION_COMPLETE.md** - Feature summary

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/6.0/howto/deployment/
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## You're Ready! 🚀

Everything is configured, tested, and ready to go.

**Next action:** Open `RAILWAY_QUICK_START.txt` and follow the 10-step checklist.

**Expected time to production:** 30 minutes

**Go deploy!**
