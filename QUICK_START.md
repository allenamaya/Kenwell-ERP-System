# Kenwell Insurance Agency ERP - Quick Start Guide

## 🚀 Start Development in 5 Minutes

### Step 1: Start the Django Backend

```bash
# Open terminal 1
cd backend

# Create and activate virtual environment (first time only)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Setup database (first time only)
python manage.py migrate

# Create admin user (first time only)
python manage.py createsuperuser
# Enter username, email, password

# Start the server
python manage.py runserver 0.0.0.0:8000
```

**Backend is now running at:** `http://localhost:8000`

### Step 2: Start the Next.js Frontend

```bash
# Open terminal 2
cd project-root

# Install dependencies (first time only)
npm install  # or pnpm install

# Start development server
npm run dev
```

**Frontend is now running at:** `http://localhost:3000`

### Step 3: Login to Dashboard

1. Open browser to `http://localhost:3000`
2. You'll be redirected to login page
3. Use your superuser credentials (created in Step 1)
4. You're now in the dashboard!

## 📝 Default Test User (After First Run)

If you didn't create a superuser, here's how to add test users:

```bash
# In Django shell
python manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

# Create test admin
User.objects.create_user(
    username='admin',
    email='admin@kenwell.com',
    password='admin123',
    first_name='Admin',
    last_name='User',
    role='admin'
)

# Create test agent
User.objects.create_user(
    username='agent',
    email='agent@kenwell.com',
    password='agent123',
    first_name='John',
    last_name='Agent',
    role='agent'
)

exit()
```

## 🔗 Important URLs

| URL | Purpose | Notes |
|-----|---------|-------|
| `http://localhost:3000` | Frontend Home | Redirects to login/dashboard |
| `http://localhost:3000/login` | Login Page | Use superuser credentials |
| `http://localhost:3000/dashboard` | Main Dashboard | Protected route |
| `http://localhost:8000/admin/` | Django Admin | Full database management |
| `http://localhost:8000/api/` | API Root | Browse all endpoints |

## 📚 API Quick Reference

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response includes: access, refresh, user
```

### Agents
```bash
# List agents
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/agents/

# Get top performers
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/agents/top_performers/?limit=5
```

### Customers
```bash
# List customers
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/customers/

# Search customers
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/customers/?search=john"
```

### Policies
```bash
# Get active policies
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/policies/?status=active"

# Get expiring soon
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/policies/expiring_soon/
```

## 🛠️ Common Development Tasks

### Create a New Database
```bash
cd backend
python manage.py migrate
```

### Reset Database (WARNING: Deletes all data)
```bash
cd backend
rm db.sqlite3  # or drop PostgreSQL database
python manage.py migrate
python manage.py createsuperuser
```

### Add Sample Data
```bash
cd backend
python manage.py shell < sample_data.py
```

### View Database in Admin
1. Go to `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Browse and edit all models

### Check API Documentation
1. Visit `http://localhost:8000/api/`
2. Browse all available endpoints
3. Click on endpoints for details

### Frontend Development
- `npm run dev` - Start with hot reload
- `npm run build` - Production build
- `npm run lint` - Check code quality
- `npm test` - Run tests

### Backend Development
- `python manage.py runserver` - Dev server
- `python manage.py migrate` - Apply migrations
- `python manage.py makemigrations` - Create migrations
- `python manage.py test` - Run tests

## 🔍 Troubleshooting

### "Cannot connect to API"
✓ Make sure Django is running: `python manage.py runserver`  
✓ Check `NEXT_PUBLIC_API_URL` in `.env.local`  
✓ Verify CORS is enabled in Django settings  

### "Login not working"
✓ Check user exists: `python manage.py shell` → `User.objects.all()`  
✓ Verify password is correct  
✓ Check browser console for error messages  

### "Database error"
✓ Run migrations: `python manage.py migrate`  
✓ Check PostgreSQL is running  
✓ Verify DATABASE_URL in `.env`  

### "Port already in use"
```bash
# Change port
python manage.py runserver 8001
# Update NEXT_PUBLIC_API_URL to :8001
```

## 📋 File Locations

| Purpose | Location |
|---------|----------|
| Backend settings | `backend/kenwell_erp/settings.py` |
| API routes | `backend/kenwell_erp/urls.py` |
| Frontend env | `.env.local` |
| Backend env | `backend/.env` |
| Database | PostgreSQL (configured in .env) |
| Static files | `public/` |

## 🎓 Next Steps

1. **Explore the Dashboard** - Check out the admin interface
2. **Create Test Data** - Add agents, customers, policies
3. **Try API Endpoints** - Use the admin or curl commands
4. **Build UI Pages** - Extend the dashboard with more pages
5. **Add Business Logic** - Create commission calculations, report generation

## 📞 Need Help?

- Check `PROJECT_OVERVIEW.md` for architecture details
- Read `backend/README.md` for API documentation
- Review `IMPLEMENTATION_SUMMARY.md` for what's implemented
- Check inline code comments for implementation details

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Django running at `http://localhost:8000`
- [ ] Admin panel accessible at `http://localhost:8000/admin/`
- [ ] Next.js running at `http://localhost:3000`
- [ ] Can login with superuser credentials
- [ ] Dashboard shows welcome message
- [ ] Navigation menu appears in sidebar
- [ ] API endpoints respond (curl test)
- [ ] No console errors in browser dev tools

---

**Happy coding!** 🚀

For detailed documentation, see PROJECT_OVERVIEW.md
