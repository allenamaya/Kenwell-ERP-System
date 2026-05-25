# Kenwell Insurance ERP - Complete Setup Instructions

## Prerequisites

Make sure you have installed:
- Python 3.10 or higher
- Node.js 16+ and npm/pnpm
- PostgreSQL 12+ (or SQLite for development)

## Step 1: Backend Setup

### 1.1 Create and Activate Virtual Environment

```bash
cd /vercel/share/v0-project/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 1.2 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 1.3 Configure Database (SQLite for Development)

Edit `backend/kenwell_erp/settings.py` and ensure SQLite is configured:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

Or for PostgreSQL (if you have it set up):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'kenwell_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 1.4 Run Database Migrations

```bash
python manage.py migrate
```

### 1.5 Create Superuser (Optional - for Admin Panel)

```bash
python manage.py createsuperuser
# Follow the prompts to create an admin account
```

### 1.6 Populate Test Data

```bash
python manage.py populate_test_data
```

This creates test accounts and sample data:
- Admin: `admin` / `AdminPassword123!`
- Agent: `john_agent` / `AgentPass123!`
- Customer: `customer_one` / `CustomerPass123!`
- Finance: `finance_officer` / `FinancePass123!`
- Operations: `ops_manager` / `OpsPass123!`

### 1.7 Start Django Development Server

```bash
python manage.py runserver
```

The API will be available at: **http://localhost:8000**
Admin panel: **http://localhost:8000/admin/**

---

## Step 2: Frontend Setup

### 2.1 Install Frontend Dependencies

```bash
# From the project root directory
cd /vercel/share/v0-project

# Install dependencies
pnpm install
# or npm install
```

### 2.2 Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.3 Start Frontend Development Server

```bash
pnpm dev
# or npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## Step 3: Verify Everything is Working

### Test the Login Flow

1. Open **http://localhost:3000** in your browser
2. You should be redirected to the login page
3. Try logging in with one of the test accounts:
   - Username: `admin`
   - Password: `AdminPassword123!`

### Test the API

You can test the API endpoints using curl or Postman:

```bash
# Get login token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"AdminPassword123!"}'

# Response will include access token
```

---

## Common Issues & Solutions

### Issue: "NetworkError when attempting to fetch resource"

**Solution:** The backend server is not running.

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

### Issue: "CORS Error" or "No 'Access-Control-Allow-Origin' header"

**Solution:** CORS is misconfigured. Check `backend/kenwell_erp/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

If this doesn't work, make sure you have `corsheaders` installed:
```bash
pip install django-cors-headers
```

### Issue: Database migrations fail

**Solution:** Reset the database and re-migrate:

```bash
# For SQLite (development)
rm db.sqlite3
python manage.py migrate

# For PostgreSQL
python manage.py flush  # Warning: This deletes all data
python manage.py migrate
```

### Issue: "ModuleNotFoundError" when running Django

**Solution:** Ensure virtual environment is activated:

```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
```

---

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/login/          - Login and get JWT token
POST   /api/auth/refresh/        - Refresh JWT token
GET    /api/users/me/            - Get current user
POST   /api/users/register/      - Register new user
POST   /api/users/change_password/ - Change password
```

### Key Resource Endpoints

```
GET    /api/agents/              - List agents
POST   /api/agents/              - Create agent
GET    /api/customers/           - List customers
POST   /api/customers/           - Create customer
GET    /api/policies/            - List policies
POST   /api/policies/            - Create policy
GET    /api/claims/              - List claims
POST   /api/claims/              - Create claim
GET    /api/invoices/            - List invoices
POST   /api/invoices/            - Create invoice
```

Full API documentation is available in the Django REST Framework browsable API at:
**http://localhost:8000/api/**

---

## Development Workflow

### Terminal 1: Backend API

```bash
cd /vercel/share/v0-project/backend
source venv/bin/activate
python manage.py runserver
```

### Terminal 2: Frontend

```bash
cd /vercel/share/v0-project
pnpm dev
```

### Terminal 3 (Optional): Django Shell

```bash
cd /vercel/share/v0-project/backend
source venv/bin/activate
python manage.py shell
```

---

## Deployment

See **DEPLOYMENT_GUIDE.md** for production deployment instructions.

---

## Support

For issues or questions:
1. Check the documentation files in the project root
2. Review the Django logs: `python manage.py runserver`
3. Check browser console for frontend errors (F12)
4. Review API response in Network tab (F12 → Network)
