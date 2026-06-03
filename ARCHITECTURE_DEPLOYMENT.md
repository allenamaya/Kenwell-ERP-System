# Kenwell ERP - Architecture & Deployment Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR APPLICATION                         │
│                                                                  │
│  ┌────────────────────┐              ┌──────────────────────┐  │
│  │   NEXT.JS FRONTEND │              │   DJANGO REST API    │  │
│  │                    │              │                      │  │
│  │  - Authentication  │◄────────────►│  - User Auth         │  │
│  │  - Dashboard       │   HTTPS API  │  - Agent Management  │  │
│  │  - Agent Mgmt      │  Port: 443   │  - Customer CRM      │  │
│  │  - Customer CRM    │              │  - Policy Mgmt       │  │
│  │  - Policies        │   JWT Token  │  - Claims Process    │  │
│  │  - Claims          │              │  - Billing           │  │
│  │                    │              │                      │  │
│  └────────────────────┘              └──────────────────────┘  │
│          │                                      │                │
│          │ Port 3000 (Dev)                      │ Port 8000 (Dev)│
│          │ https://vercel.app (Prod)           │ https://railway│
│          │                                      │                │
│          └──────────────┬───────────────────────┘                │
│                         │                                        │
│                         ▼                                        │
│                  ┌──────────────┐                               │
│                  │  PostgreSQL  │                               │
│                  │   Database   │                               │
│                  │              │                               │
│                  │ - Users      │                               │
│                  │ - Agents     │                               │
│                  │ - Customers  │                               │
│                  │ - Policies   │                               │
│                  │ - Claims     │                               │
│                  │ - Billing    │                               │
│                  │              │                               │
│                  └──────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Communication Flow

### 1. User Logs In

```
Browser
  │
  ├─► Frontend (Next.js)
  │   - Shows login form
  │   - User enters credentials
  │   │
  │   ├─► API Call: POST /api/auth/login/
  │       {username, password}
  │       │
  │       ▼
  │   Backend (Django)
  │   - Verifies credentials
  │   - Generates JWT token
  │   │
  │   ├─► Response: {access_token, refresh_token}
  │       │
  │       ▼
  │   Frontend stores token in localStorage
  │   - Redirects to /dashboard
  │
  ▼
Dashboard loads with auth
```

### 2. Fetching Data

```
Frontend (Next.js)
  │
  ├─► API Call: GET /api/agents/
  │   Headers: Authorization: Bearer {token}
  │   │
  │   ▼
  Backend (Django)
  - Validates JWT token
  - Checks user permissions
  - Queries database
  │
  ├─► Response: {agents: [...], count: 50}
  │
  ▼
Frontend displays agents in table
```

---

## 🚀 Deployment Environments

### Development (Your Local Machine)

```
┌──────────────────────────────────┐
│      YOUR COMPUTER               │
├──────────────────────────────────┤
│  Frontend                        │
│  Port 3000                       │
│  http://localhost:3000           │
│                 ↕ API Calls      │
│  Backend                         │
│  Port 8000                       │
│  http://localhost:8000/api       │
│                 ↕ Database       │
│  PostgreSQL (Local)              │
│  Port 5432                       │
└──────────────────────────────────┘

Command: pnpm dev:all
```

### Staging/Preview (GitHub PR)

```
┌──────────────────────────────────┐
│      VERCEL (Preview URL)        │
├──────────────────────────────────┤
│  Frontend Preview                │
│  https://pr-123--your-app.vercel │
│       .app                       │
│                 ↕ API Calls      │
│  Backend (Production)            │
│  https://your-backend.railway.app│
│  /api                            │
│                 ↕ Database       │
│  PostgreSQL (Production)         │
└──────────────────────────────────┘

Automatic deployment on PR
```

### Production (Main Branch)

```
┌─────────────────────────────────────┐
│         YOUR USERS                  │
│      (Their Browsers)               │
└────────┬──────────────┬─────────────┘
         │              │
         ▼              ▼
    ┌──────────┐   ┌──────────────┐
    │  VERCEL  │   │   RAILWAY    │
    │ (Global  │   │ (Backend API)│
    │   CDN)   │   │              │
    │          │   │ - Processing │
    │Frontend: │   │ - Database   │
    │- Assets  │◄─►│ - Auth       │
    │- Pages   │   │ - Storage    │
    │- Images  │   │              │
    └──────────┘   └──────────────┘
         │              │
         │              ▼
         │         PostgreSQL
         │         (AWS RDS/Railway)
         │
         └─► Global CDN Caching
             (Fast worldwide access)
```

---

## 🔐 Data Flow with Security

```
1. USER INPUT
   │
   ▼
2. FRONTEND VALIDATION
   - Check email format
   - Check password strength
   - Validate form fields
   │
   ▼
3. ENCRYPTED TRANSMISSION
   - HTTPS/TLS encryption
   - API key in header
   - JWT token validation
   │
   ▼
4. BACKEND VALIDATION
   - Verify JWT token
   - Check user permissions
   - Validate input again
   │
   ▼
5. DATABASE SECURITY
   - Parameterized queries
   - Role-based access
   - Audit logging
   │
   ▼
6. RESPONSE
   - Filtered data only
   - No sensitive info
   - Encrypted response
   │
   ▼
7. FRONTEND DISPLAY
   - Safely render data
   - No XSS vulnerabilities
   - Secure storage
```

---

## 📊 Deployment Timeline

### Day 1: Local Setup (30 min)
```
09:00 - Git clone & install dependencies     [✓ 5 min]
09:05 - Setup backend venv & requirements    [✓ 10 min]
09:15 - Create .env files                    [✓ 5 min]
09:20 - Test locally with pnpm dev:all       [✓ 10 min]
09:30 - Verify login works                   [✓ DONE]
```

### Day 2: Frontend Deployment (20 min)
```
14:00 - Create Vercel account                [✓ 5 min]
14:05 - Connect GitHub repo                  [✓ 5 min]
14:10 - Add env variables                    [✓ 5 min]
14:15 - Deploy and verify                    [✓ 5 min]
14:20 - Frontend LIVE at vercel.app          [✓ DONE]
```

### Day 3: Backend Deployment (25 min)
```
15:00 - Create Railway account               [✓ 5 min]
15:05 - Import GitHub repo                   [✓ 5 min]
15:10 - Add PostgreSQL service               [✓ 5 min]
15:15 - Configure environment variables      [✓ 5 min]
15:20 - Run migrations automatically         [✓ 5 min]
15:25 - Backend LIVE at railway.app          [✓ DONE]
```

### Day 4: Integration Testing (15 min)
```
10:00 - Update Vercel env with Railway URL   [✓ 3 min]
10:03 - Update Railway CORS settings         [✓ 3 min]
10:06 - Test login end-to-end                [✓ 5 min]
10:11 - Test all major features              [✓ 4 min]
10:15 - Production deployment COMPLETE       [✓ DONE]
```

---

## 🔄 Git Workflow

```
Your Local Machine (Dev)
│
├─► Feature Branch
│   - Make code changes
│   - Test with pnpm dev:all
│   - Commit changes
│   │
│   └─► git push origin feature-branch
│       │
│       ▼
│   GitHub PR
│   │
│   ├─► Vercel Preview Deploy
│   │   - Frontend deployed to temp URL
│   │   - Test before merging
│   │
│   ├─► Code Review
│   │
│   └─► Merge to Main
│       │
│       ▼
│   Production Deployments (Automatic)
│   ├─► Vercel Frontend Deploy
│   │   - Build Next.js
│   │   - Deploy to CDN
│   │   - LIVE in ~30 seconds
│   │
│   └─► Railway Backend Deploy
│       - Build Docker image
│       - Run migrations
│       - Deploy API
│       - LIVE in ~2 minutes
```

---

## 🎛️ Environment Variable Propagation

```
.env.local (Local Dev)
│
└─► Next.js reads NEXT_PUBLIC_*
    │
    └─► Frontend knows backend URL
        │
        └─► API calls to localhost:8000

.env.production (Local, not committed)
│
└─► Next.js (Production) reads NEXT_PUBLIC_*
    │
    └─► Frontend knows production backend URL

Vercel Dashboard (Frontend Env Vars)
│
├─► NEXT_PUBLIC_API_URL = https://backend.railway.app/api
│   │
│   └─► Frontend deployed on Vercel
│       │
│       └─► Calls production backend API

Railway Dashboard (Backend Env Vars)
│
├─► SECRET_KEY = abc123...
├─► DATABASE_URL = postgresql://...
├─► CORS_ALLOWED_ORIGINS = https://app.vercel.app
│   │
│   └─► Backend deployed on Railway
│       │
│       └─► Accepts requests from frontend
```

---

## 📦 What Gets Deployed Where

### Vercel Deployment
```
Frontend Code (⬆ Uploaded to Vercel)
├── app/
├── components/
├── lib/
├── public/
├── styles/
├── next.config.js
├── package.json
└── .env (only NEXT_PUBLIC_* used)

Backend Code (⬇ NOT uploaded)
├── backend/ ← Ignored by .vercelignore
└── *.md ← Ignored by .vercelignore
```

### Railway Deployment
```
Backend Code (⬆ Uploaded to Railway)
├── backend/
│   ├── manage.py
│   ├── kenwell_erp/
│   ├── agents/
│   ├── customers/
│   ├── policies/
│   ├── claims/
│   ├── billing/
│   ├── core/
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
└── database setup (PostgreSQL)

Frontend Code (⬇ NOT uploaded)
├── app/ ← Not needed on backend
├── components/ ← Not needed
└── node_modules/ ← Not needed
```

---

## 🛡️ Security Architecture

```
┌────────────────────────────────────────┐
│        USER'S BROWSER                  │
│  (Running JavaScript Frontend)         │
└────────────────────┬───────────────────┘
                     │
                     │ 1. HTTPS/TLS
                     │ (Encrypted)
                     │
                     ▼
┌────────────────────────────────────────┐
│  VERCEL CDN                            │
│  - Serves HTML/CSS/JS                  │
│  - DDoS Protection                     │
│  - Global edge locations               │
│  - HSTS Headers                        │
└────────────────────┬───────────────────┘
                     │
                     │ 2. HTTPS/TLS
                     │ JWT in Authorization
                     │
                     ▼
┌────────────────────────────────────────┐
│  RAILWAY FIREWALL                      │
│  - Only HTTPS allowed                  │
│  - Rate limiting                       │
│  - DDoS protection                     │
└────────────────────┬───────────────────┘
                     │
                     │ 3. Backend Validation
                     │ - JWT verification
                     │ - Permission check
                     │ - Input sanitization
                     │
                     ▼
┌────────────────────────────────────────┐
│  DJANGO BACKEND                        │
│  - CSRF protection                     │
│  - SQL injection prevention            │
│  - Password hashing (bcrypt)           │
│  - Role-based access control           │
└────────────────────┬───────────────────┘
                     │
                     │ 4. Encrypted Connection
                     │ (SSL/TLS to DB)
                     │
                     ▼
┌────────────────────────────────────────┐
│  POSTGRESQL DATABASE                   │
│  - User roles & permissions            │
│  - Encrypted passwords                 │
│  - Backup encryption                   │
│  - Audit logging                       │
└────────────────────────────────────────┘
```

---

## 🎯 Performance Optimization

```
Request Flow with Optimization:

1. Browser requests page
   └─► Vercel CDN (Global Edge)
       - Cached content served from nearest location
       - GZIP compression
       - Image optimization
       └─► 200ms (Fast!)

2. Dynamic data request (API call)
   └─► Vercel → Railway
       - Persistent connection pooling
       - Query optimization (DB indexes)
       - Response caching where possible
       └─► 300-500ms (Normal)

3. Heavy computation
   └─► Railway Backend
       - Async processing
       - Background jobs
       - Database query optimization
       └─► 1-5s (Acceptable)
```

---

## 📈 Scaling Your Application

### Current Setup (Small Traffic)
```
Frontend:  1 Vercel instance (auto-scales)
Backend:   1 Railway instance
Database:  Managed PostgreSQL
Users:     Hundreds
Load:      Light
```

### Future Setup (Growing Traffic)
```
Frontend:  Multiple Vercel regions (auto)
Backend:   Multiple Railway instances (load balanced)
Database:  PostgreSQL with read replicas
Redis:     Caching layer (optional)
CDN:       Enhanced caching (optional)
Users:     Thousands
Load:      Medium-Heavy
```

### Enterprise Setup (Large Scale)
```
Frontend:  Vercel + custom CDN
Backend:   Kubernetes + auto-scaling
Database:  PostgreSQL + replication + sharding
Cache:     Redis cluster
Storage:   S3 for files
Search:    Elasticsearch (optional)
Users:     Millions
Load:      Very Heavy
```

---

## ✅ Checklist Before Production

```
Frontend Setup:
 □ Environment variables configured
 □ API URL pointing to production
 □ HTTPS enabled
 □ Static assets optimized
 □ Cache headers set
 □ Error tracking (Sentry) optional

Backend Setup:
 □ DEBUG = False
 □ SECRET_KEY generated
 □ ALLOWED_HOSTS configured
 □ CORS settings correct
 □ Database credentials set
 □ Migrations run
 □ Static files collected

Connection:
 □ Frontend can call backend API
 □ JWT tokens working
 □ Login flow tested
 □ API permissions correct
 □ CORS errors resolved

Monitoring:
 □ Error logging set up
 □ Performance monitoring
 □ Database backups configured
 □ Alert notifications set up
```

---

**Your system is production-ready! 🚀**

