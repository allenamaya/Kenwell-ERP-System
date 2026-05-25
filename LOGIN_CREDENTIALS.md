# Kenwell Insurance Agency ERP - Login Credentials

## Important Setup Instructions

Before you can log in, you need to:

1. **Set up the PostgreSQL database** with the credentials in the backend `.env` file
2. **Run Django migrations** to create the database tables
3. **Create superuser accounts** for testing

## Database Setup

### Create the database:
```bash
createdb kenwell_db -U postgres
```

### Run migrations:
```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

### Create superuser (Admin):
```bash
python manage.py createsuperuser
```
When prompted:
- Username: `admin`
- Email: `admin@kenwell.com`
- Password: `AdminPassword123!`

## Test User Accounts

After creating the superuser, use the Django admin to create these test accounts:

### Admin Account
- **URL**: `http://localhost:8000/admin`
- **Username**: `admin`
- **Password**: `AdminPassword123!`
- **Role**: Administrator
- **Email**: `admin@kenwell.com`

### Agent Account (Insurance Agent)
- **Username**: `john_agent`
- **Password**: `AgentPass123!`
- **Email**: `john@kenwell.com`
- **Role**: Agent
- **First Name**: John
- **Last Name**: Kipchoge

### Customer Account
- **Username**: `customer_one`
- **Password**: `CustomerPass123!`
- **Email**: `customer@example.com`
- **Role**: Customer
- **First Name**: Jane
- **Last Name**: Doe

### Finance Account
- **Username**: `finance_officer`
- **Password**: `FinancePass123!`
- **Email**: `finance@kenwell.com`
- **Role**: Finance
- **First Name**: Robert
- **Last Name**: Omondi

### Operations Account
- **Username**: `ops_manager`
- **Password**: `OpsPass123!`
- **Email**: `operations@kenwell.com`
- **Role**: Operations
- **First Name**: Sarah
- **Last Name**: Kariuki

## Creating Test Users via API

You can also create users by hitting the registration endpoint:

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }'
```

## Logging In

### Via Web Application:
1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Login"
4. You'll be redirected to the dashboard

### Response:
The login endpoint returns JWT tokens:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@kenwell.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

## API Authentication

Once logged in, include the access token in your API requests:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/users/
```

## Quick Start with Django Admin

1. Create superuser:
```bash
python manage.py createsuperuser
```

2. Run the development server:
```bash
python manage.py runserver
```

3. Visit: `http://localhost:8000/admin`

4. Create additional users through the admin panel

## Environment Variables

### Backend (.env file)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_NAME=kenwell_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env.local file)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Troubleshooting

### "Database connection refused"
- Ensure PostgreSQL is running
- Check database credentials in settings.py

### "CORS error when logging in"
- Verify CORS_ALLOWED_ORIGINS in settings.py includes your frontend URL
- Default includes localhost:3000

### "Invalid credentials"
- Ensure the user was created with the correct role
- Check that the password is correct
- Use the Django admin to verify the user exists

## Default Role Permissions

| Role | Access |
|------|--------|
| **admin** | Full system access, all modules |
| **agent** | Agent management, commission tracking, customer management |
| **customer** | View own policies, submit claims, view interactions |
| **finance** | Invoices, receipts, financial reports, billing |
| **operations** | Claims management, policy administration, operations tasks |

## Next Steps

1. Start the development servers (Django + Next.js)
2. Create test users via admin or API
3. Log in with test credentials
4. Explore the dashboard
5. Test each module

## Support

For issues with login or credentials:
- Check Django logs: `backend/error.log`
- Check Next.js logs in terminal
- Verify all environment variables are set correctly
- Ensure database migrations have run successfully
