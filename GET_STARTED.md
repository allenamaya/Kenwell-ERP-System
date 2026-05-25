# Kenwell Insurance ERP - Get Started in 5 Minutes

## Quick Setup (Recommended)

### For macOS/Linux:

```bash
cd /vercel/share/v0-project
bash setup-dev.sh
```

### For Windows:

```bash
cd C:\path\to\v0-project
setup-dev.bat
```

This script will:
- ✓ Create Python virtual environment
- ✓ Install all backend dependencies
- ✓ Run database migrations
- ✓ Create test accounts and sample data
- ✓ Install frontend dependencies
- ✓ Configure environment variables

---

## Manual Setup (If Script Doesn't Work)

### Step 1: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd /vercel/share/v0-project/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create test data
python manage.py populate_test_data

# Start server
python manage.py runserver
```

**Backend will run at: http://localhost:8000**

### Step 2: Frontend Setup (Another Terminal)

```bash
# Navigate to project root
cd /vercel/share/v0-project

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

**Frontend will run at: http://localhost:3000**

---

## Login with Test Accounts

Once both servers are running, open **http://localhost:3000** and log in:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `AdminPassword123!` |
| Agent | `john_agent` | `AgentPass123!` |
| Customer | `customer_one` | `CustomerPass123!` |
| Finance | `finance_officer` | `FinancePass123!` |
| Operations | `ops_manager` | `OpsPass123!` |

---

## Project Structure

```
/vercel/share/v0-project/
├── backend/                    # Django REST API
│   ├── core/                   # User & Auth models
│   ├── agents/                 # Agent management
│   ├── customers/              # Customer CRM
│   ├── policies/               # Insurance policies
│   ├── claims/                 # Claims processing
│   ├── billing/                # Invoices & payments
│   ├── manage.py               # Django management
│   └── requirements.txt         # Python dependencies
│
├── app/                        # Next.js React Frontend
│   ├── login/                  # Login page
│   ├── dashboard/              # Main dashboard
│   │   ├── agents/             # Agent management UI
│   │   ├── customers/          # Customer management UI
│   │   ├── policies/           # Policy management UI
│   │   └── claims/             # Claims management UI
│   ├── globals.css             # Global styles with Kenwell colors
│   └── page.tsx                # Home page
│
├── lib/
│   ├── api.ts                  # API client
│   └── auth-context.tsx        # Authentication context
│
├── public/                     # Static assets
│   └── logo.svg                # Kenwell logo
│
├── SETUP_INSTRUCTIONS.md       # Detailed setup guide
├── GET_STARTED.md              # This file
├── setup-dev.sh                # Auto-setup script (macOS/Linux)
└── setup-dev.bat               # Auto-setup script (Windows)
```

---

## What's Included

### Backend API (40+ Endpoints)

**Authentication:**
- User login/registration
- JWT token management
- Password change

**Agent Management:**
- Agent CRUD operations
- Commission tracking
- Performance metrics

**Customer CRM:**
- Customer management
- Interaction tracking
- Internal notes

**Policy Management:**
- Insurance product catalog
- Policy creation/renewal
- Payment tracking

**Claims Processing:**
- Claim submission
- Document upload
- Assessment & approval
- Payment processing

**Billing & Finance:**
- Invoice generation
- Receipt management
- Financial reporting

### Frontend Dashboard

- Responsive design (mobile, tablet, desktop)
- Role-based navigation menu
- KPI statistics cards
- Data tables with filtering/search
- Forms for CRUD operations
- Professional UI with Kenwell brand colors

---

## Common Issues

### "NetworkError when attempting to fetch resource"

The backend isn't running. Make sure you have:
1. Activated the virtual environment: `source venv/bin/activate`
2. Started the backend: `python manage.py runserver`
3. Backend should show "Starting development server at http://127.0.0.1:8000/"

### "Connection refused" on port 8000

Another process might be using port 8000. Stop it or use a different port:
```bash
python manage.py runserver 8001
```

Then update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Module not found errors

Make sure virtual environment is activated:
```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
```

### Database locked (SQLite only)

Remove the database and recreate it:
```bash
rm db.sqlite3
python manage.py migrate
python manage.py populate_test_data
```

---

## Development Workflow

### Keep These Running

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
pnpm dev
```

### Making Changes

- **Backend changes**: Edit files in `backend/` - Django auto-reloads
- **Frontend changes**: Edit files in `app/` - Hot Module Replacement auto-refreshes
- **Database changes**: Create a model, then run `python manage.py makemigrations` and `python manage.py migrate`

---

## API Documentation

Once running, visit **http://localhost:8000/api/** for the browsable API documentation.

Key endpoints:
- `POST /api/auth/login/` - Get JWT token
- `GET /api/agents/` - List agents
- `GET /api/customers/` - List customers
- `GET /api/policies/` - List policies
- `GET /api/claims/` - List claims
- `GET /api/invoices/` - List invoices

---

## Admin Panel

Django admin is available at: **http://localhost:8000/admin/**

Login with:
- Username: `admin`
- Password: `AdminPassword123!`

---

## Next Steps

1. **Customize**: Edit colors in `app/globals.css` (currently Kenwell brand colors)
2. **Add Features**: Create new Django models and REST endpoints
3. **Deploy**: See `DEPLOYMENT_GUIDE.md` for production deployment
4. **Documentation**: See `PROJECT_OVERVIEW.md` for complete technical documentation

---

## Getting Help

- Read `SETUP_INSTRUCTIONS.md` for detailed setup
- Read `PROJECT_OVERVIEW.md` for architecture
- Check Django logs in terminal running `runserver`
- Check browser console (F12) for frontend errors
- Check Network tab (F12 → Network) for API issues

---

**Happy coding! 🚀**
