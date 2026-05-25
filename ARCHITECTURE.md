# Kenwell Insurance ERP - System Architecture

**Project Manager:** Allen Ahlee Amaya

---

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                 INTERNET                                      │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              CDN / Load Balancer                              │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
                           │ HTTPS
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌─────────────────────┐          ┌─────────────────────┐
│   FRONTEND TIER     │          │   API TIER          │
│   (Vercel)          │          │   (Railway/Render)  │
├─────────────────────┤          ├─────────────────────┤
│ • Next.js 15        │          │ • Django 6.0        │
│ • React 19          │          │ • DRF               │
│ • Tailwind CSS      │          │ • JWT Auth          │
│ • shadcn/ui         │          │ • Gunicorn Server   │
├─────────────────────┤          ├─────────────────────┤
│ app.kenwell-        │ REST API │ api.kenwell-        │
│ erp.com             │◄────────►│ erp.com             │
└─────────────────────┘          └────────┬────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                                │                                │
          ▼                                ▼                                ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌────────────────────┐
│   CACHE TIER         │     │   DATA TIER          │     │   STORAGE TIER     │
│   (Upstash Redis)    │     │   (PostgreSQL)       │     │   (Vercel Blob)    │
├──────────────────────┤     ├──────────────────────┤     ├────────────────────┤
│ • Session mgmt       │     │ • Relational DB      │     │ • File uploads     │
│ • Rate limiting      │     │ • ACID compliance    │     │ • Images           │
│ • Query caching      │     │ • Read replicas      │     │ • Documents        │
│ • Real-time data     │     │ • Automated backup   │     │ • Global CDN       │
├──────────────────────┤     ├──────────────────────┤     ├────────────────────┤
│ REDIS PROTOCOL       │     │ PostgreSQL 15        │     │ S3-compatible API  │
│ redis://...          │     │ postgresql://...     │     │ blob://...         │
└──────────────────────┘     └──────────────────────┘     └────────────────────┘

        ▲                              ▲                         ▲
        │                              │                         │
        └──────────────────────────────┼─────────────────────────┘
                                       │
                              ┌────────▼────────┐
                              │  MONITORING &   │
                              │   LOGGING       │
                              ├─────────────────┤
                              │ • Sentry        │
                              │ • DataDog       │
                              │ • GitHub Actions│
                              │ • Vercel Logs   │
                              │ • Railway Logs  │
                              └─────────────────┘
```

---

## Multi-Tier Architecture

### Presentation Layer (Frontend)
**Technology:** Next.js 15 + React 19 on Vercel

```
User Browser
    │
    ▼
Vercel Edge Network (CDN)
    │
    ▼
Next.js Application
├── App Router
├── Server Components
├── API Routes
└── Client Components
```

**Key Features:**
- Server-side rendering
- Static site generation
- API routes
- Middleware
- Edge functions

### Business Logic Layer (Backend API)
**Technology:** Django + DRF on Railway/Render

```
API Request
    │
    ▼
Gunicorn WSGI Server (4 workers)
    │
    ▼
Django Application
├── URL Router
├── ViewSets & Serializers
├── Authentication (JWT)
├── Authorization (Permissions)
├── Validation (Serializers)
└── Business Logic
    │
    ▼
Database & Cache Layer
```

**Key Features:**
- RESTful API design
- JWT authentication
- Role-based access control
- Request validation
- Error handling

### Data Layer
**Technology:** PostgreSQL + Redis

```
Application Queries
    │
    ├─ Write Request ──► PostgreSQL
    │                      │
    │                      ├── Primary DB
    │                      ├── Read Replicas
    │                      └── Automated Backups
    │
    └─ Read Request ───► Redis Cache
                           │
                           ├── Hit ──► Return cached data
                           │
                           └── Miss ──► PostgreSQL
```

**Database Schema Highlights:**
- Users (Authentication)
- Agents (Sales force)
- Customers (Policy holders)
- Policies (Products)
- Claims (Claims processing)
- Billing (Invoices & payments)
- Audit logs (Compliance)

---

## Network Architecture

### Development Environment

```
Developer Machine
├── Frontend (http://localhost:3000)
│   ├── Node.js dev server
│   ├── Hot reload enabled
│   └── Source maps available
│
├── Backend (http://localhost:8000)
│   ├── Django dev server
│   ├── Debug toolbar
│   └── Detailed logging
│
├── Database (localhost:5432)
│   └── SQLite or PostgreSQL
│
└── Cache (localhost:6379)
    └── Redis or mock

All services local and isolated
```

### Staging Environment

```
GitHub (develop branch)
    │
    ▼
GitHub Actions
├── Run tests
├── Code quality checks
└── Deploy on success
    │
    ├─ Vercel Preview ──┐
    │  (preview URL)    │
    │                   ├─ Staging Environment
    ├─ Railway Staging ─┤
    │  (staging-api)    │
    │                   │
    └─ PostgreSQL Staging
       (staging DB)
```

### Production Environment

```
GitHub (main branch)
    │
    ▼
GitHub Actions
├── Run full test suite
├── Code quality checks
├── Security scans
└── Deploy on success
    │
    ├─ Vercel Production ──┐
    │  (app.kenwell-...)   │
    │                      ├─ Production Environment
    ├─ Railway Prod ───────┤
    │  (api.kenwell-...)   │
    │                      │
    └─ PostgreSQL Prod
       (prod DB)
       
With:
- SSL/TLS encryption
- DDoS protection
- Rate limiting
- Monitoring & alerts
- Automated backups
```

---

## Data Flow Diagrams

### Authentication Flow

```
User Input (Email/Password)
    │
    ▼
Login Component
    │
    ▼
API Call to /api/auth/login/
    │
    ▼
Django Backend
├── Validate credentials
├── Hash password check
└── Generate JWT tokens
    │
    ▼
Return Access & Refresh Tokens
    │
    ▼
Store in secure HttpOnly cookie
    │
    ▼
Redirect to Dashboard
```

### Policy Creation Flow

```
Agent clicks "New Policy"
    │
    ▼
Policy Form Component
    │
    ▼
Form Validation (Zod)
    │
    ▼
POST /api/policies/
    │
    ▼
Django Backend
├── Validate request
├── Check permissions
├── Save to database
└── Generate confirmation
    │
    ▼
Return created policy
    │
    ▼
Redirect to policy detail
    │
    ▼
Display success message
```

### Claim Processing Flow

```
Customer submits claim
    │
    ▼
Claim Form Component
├── Upload documents
├── Enter claim details
└── Validate information
    │
    ▼
POST /api/claims/
    │
    ▼
Django Backend
├── Validate data
├── Store documents in Blob
├── Create claim record
├── Set status: SUBMITTED
└── Send notification email
    │
    ▼
Admin reviews claim
    │
    ▼
PATCH /api/claims/{id}/
├── Update assessment
├── Add documents
└── Change status
    │
    ▼
Process payment
    │
    ▼
Send confirmation to customer
```

---

## Deployment Pipeline

### CI/CD Workflow

```
Developer commits code
    │
    ▼
Push to GitHub
    │
    ▼
GitHub Actions Triggered
    │
    ├─ Unit Tests ─────────────┐
    │  • Backend: pytest        │
    │  • Frontend: Jest         │
    │                           ├─ All pass?
    ├─ Code Quality ────────────┤
    │  • Linting (ESLint, flake8)│
    │  • Type checking           │
    │  • Coverage reports        │
    │                           │
    └─ Build Check ──────────────┘
                │
                ▼
            YES: All passed
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
    Feature Branch  Main Branch
        │               │
        ▼               ▼
    Deploy to      Deploy to
    Staging        Production
```

### Deployment Stages

```
1. DEVELOPMENT
   ├── Local testing
   ├── Manual testing
   └── Feature branch PR

2. STAGING
   ├── Auto-deploy on develop push
   ├── Full UAT testing
   ├── Load testing
   └── Security scanning

3. PRODUCTION
   ├── Auto-deploy on main push
   ├── Health checks
   ├── Smoke tests
   └── Monitoring enabled
```

---

## Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────────┐
│      REQUEST COMES TO BACKEND                │
└──────────────────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ CORS Middleware      │
        │ Check allowed origins│
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ JWT Middleware       │
        │ Extract & validate   │
        │ access token         │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ Permission Check     │
        │ Verify user role     │
        │ Check resource perms │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ Rate Limiting        │
        │ Prevent abuse        │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ Process Request      │
        │ Execute business     │
        │ logic safely         │
        └──────────────────────┘
```

### Data Protection

```
Sensitive Data at Rest:
├── Passwords: bcrypt hashing
├── Tokens: Encrypted in database
├── API keys: Environment variables
└── User data: Database encryption

Sensitive Data in Transit:
├── HTTPS/TLS encryption
├── Secure cookies (HttpOnly)
├── No sensitive data in logs
└── Request validation

Access Control:
├── Role-based access control (RBAC)
├── Resource-level permissions
├── Audit logging all changes
└── Session timeout & refresh
```

---

## Scalability Architecture

### Horizontal Scaling

```
Low Traffic
└── 1 Frontend instance
└── 1 Backend instance
└── 1 Database instance

Medium Traffic
├── 2-3 Frontend instances (CDN distributes)
├── 2-3 Backend instances (Load balancer)
└── 1 Database + Read replicas

High Traffic
├── 4+ Frontend instances (Global CDN)
├── 4+ Backend instances (Auto-scaling)
├── Database with read replicas
└── Kubernetes orchestration (optional)
```

### Caching Strategy

```
Client Cache (Browser)
    │ Static assets
    ├── JS/CSS (30 days)
    ├── Images (90 days)
    └── API responses (1 hour)
            │
            ▼
CDN Cache (Vercel Edge)
    │
    ├── HTML (30 mins)
    ├── API responses (cache rules)
    └── Stale-while-revalidate
            │
            ▼
Redis Cache (Upstash)
    │
    ├── Session data (24 hours)
    ├── Query results (varies)
    ├── Rate limit tokens (1 hour)
    └── User preferences
            │
            ▼
Database (PostgreSQL)
    │
    └── Source of truth
```

---

## Monitoring Architecture

### Application Monitoring

```
Frontend (Vercel)
├── Web Vitals
├── Error tracking (Sentry)
├── Analytics
└── Performance metrics

Backend (Railway)
├── API response times
├── Error rate tracking
├── Database query performance
└── Resource utilization
```

### Infrastructure Monitoring

```
Metrics:
├── CPU usage
├── Memory usage
├── Disk usage
├── Network I/O
└── Request rate

Logs:
├── Application logs
├── Server logs
├── Database logs
└── Network logs

Alerts:
├── High error rate (>1%)
├── High latency (>2s)
├── High resource usage (>85%)
├── Deployment failures
└── Security incidents
```

---

## Disaster Recovery

### Backup Strategy

```
Database Backups:
├── Daily automatic backups
├── 7-day retention
├── Point-in-time recovery
└── Multi-region replication

Application Backups:
├── Code in GitHub
├── Docker images in registry
├── Configuration in .env files
└── Database migrations tracked

Disaster Recovery Plan:
├── RPO: 1 hour
├── RTO: 4 hours
├── Test monthly
└── Documentation updated
```

### Rollback Procedure

```
Detect Issue
    │
    ▼
Alert triggered
    │
    ▼
Investigate (5 mins)
    │
    ├─ Issue confirmed
    │
    └─ Rollback decision
            │
            ▼
Execute Rollback
├── Frontend: Vercel rollback
├── Backend: Git revert + redeploy
└── Database: Restore from backup
            │
            ▼
Health Check
├── API health
├── Database connectivity
└── Service status
            │
            ▼
Notify stakeholders
└── Document incident
```

---

## Performance Optimization

### Frontend Optimization

```
Code Splitting:
├── Next.js automatic code splitting
├── Dynamic imports for large components
└── Route-based lazy loading

Image Optimization:
├── Next.js Image component
├── WebP format
├── Responsive images
└── CDN delivery

Bundling:
├── Tree shaking
├── Minification
├── Compression (gzip/brotli)
└── Source map optimization
```

### Backend Optimization

```
Database:
├── Index optimization
├── Query caching (Redis)
├── Connection pooling
└── Read replicas for queries

API:
├── Response caching
├── Pagination for list endpoints
├── Field selection
└── Rate limiting

Server:
├── Async processing
├── Task queues
├── Connection timeout limits
└── Worker scaling
```

---

## Technology Decision Matrix

| Aspect | Choice | Reason |
|--------|--------|--------|
| **Frontend Framework** | Next.js | Server components, built-in routing, SEO |
| **Backend Framework** | Django | Mature, batteries-included, ORM |
| **Database** | PostgreSQL | Relational integrity, ACID compliance |
| **Cache** | Redis | Session mgmt, rate limiting, real-time data |
| **Frontend Hosting** | Vercel | Optimized for Next.js, automatic deployments |
| **Backend Hosting** | Railway/Render | Docker support, managed services |
| **CI/CD** | GitHub Actions | Free, integrated with GitHub |
| **Monitoring** | Sentry + DataDog | Comprehensive error tracking & analytics |
| **File Storage** | Vercel Blob | Integration with Vercel, simple API |
| **Auth** | JWT | Stateless, scalable, modern standard |

---

## Conclusion

This architecture provides:
- ✅ **Scalability**: Horizontal scaling at each layer
- ✅ **Reliability**: Redundancy, backups, disaster recovery
- ✅ **Security**: Multiple layers of protection
- ✅ **Performance**: Caching, CDN, optimization
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Cost-effectiveness**: Pay-as-you-go pricing
- ✅ **Monitoring**: Comprehensive observability

The system is designed to handle growth from startup to enterprise scale while maintaining code quality and developer productivity.

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Author:** Allen Ahlee Amaya
