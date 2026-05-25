# Kenwell Insurance ERP - Ready to Use

Your complete Insurance Agency Management System is built and ready!

---

## Quick Start (Choose One)

### Option 1: Automatic Setup (Recommended)

```bash
# macOS/Linux
bash setup-dev.sh

# Windows
setup-dev.bat
```

This runs everything needed automatically.

### Option 2: Manual Setup

**Backend (Terminal 1):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_test_data
python manage.py runserver
```

**Frontend (Terminal 2):**
```bash
pnpm install
pnpm dev
```

---

## Login Credentials

Once everything is running, visit **http://localhost:3000**

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | AdminPassword123! |
| **Agent** | john_agent | AgentPass123! |
| **Customer** | customer_one | CustomerPass123! |
| **Finance** | finance_officer | FinancePass123! |
| **Operations** | ops_manager | OpsPass123! |

---

## What You're Getting

### Backend (Django REST API)
- 40+ API endpoints
- 23 database models
- JWT authentication
- Role-based access control
- Admin panel at http://localhost:8000/admin/
- Full audit logging

### Frontend (React Next.js)
- Responsive dashboard
- Sidebar navigation (auto-hides on mobile)
- KPI stat cards
- Data tables with search/filter
- Forms for all CRUD operations
- Kenwell brand styling

### Modules
✓ Agent Management  
✓ Customer CRM  
✓ Policy Management  
✓ Claims Processing  
✓ Billing & Finance  
✓ User Authentication  

---

## Key Features

- **Role-Based Access**: 5 user types with different permissions
- **Real-time Updates**: Forms, tables, and dashboards
- **Complete API**: All endpoints documented and tested
- **Database**: SQLite (development) / PostgreSQL (production)
- **Mobile Ready**: Responsive design for all devices
- **Professional UI**: Kenwell colors and fonts applied

---

## Documentation Files

| File | Purpose |
|------|---------|
| **GET_STARTED.md** | Start here - 5 minute setup |
| **SETUP_INSTRUCTIONS.md** | Detailed setup with troubleshooting |
| **PROJECT_OVERVIEW.md** | Complete technical documentation |
| **QUICK_REFERENCE.md** | Commands, endpoints, and shortcuts |
| **DEPLOYMENT_GUIDE.md** | Production deployment steps |
| **LOGIN_CREDENTIALS.md** | Test accounts and database setup |
| **IMPLEMENTATION_SUMMARY.md** | What was built and how |

---

## Directory Structure

```
/vercel/share/v0-project/
├── backend/              Django REST API
│   ├── core/            Auth & core models
│   ├── agents/          Agent management
│   ├── customers/       Customer CRM
│   ├── policies/        Insurance policies
│   ├── claims/          Claims processing
│   └── billing/         Invoices & payments
│
├── app/                 React Frontend
│   ├── dashboard/       Main interface
│   │   ├── agents/
│   │   ├── customers/
│   │   ├── policies/
│   │   └── claims/
│   ├── login/           Login page
│   └── globals.css      Kenwell styling
│
└── lib/
    ├── api.ts           API client
    └── auth-context.tsx Authentication
```

---

## Common Next Steps

### Development
- Edit `app/globals.css` to customize colors
- Add new Django models in `backend/[module]/models.py`
- Create new API endpoints in `backend/[module]/views.py`
- Build new frontend pages in `app/dashboard/[module]/`

### Testing
- Use Django admin at http://localhost:8000/admin/
- Use API at http://localhost:8000/api/
- Test with curl, Postman, or any HTTP client

### Deployment
- See `DEPLOYMENT_GUIDE.md` for Vercel, Heroku, or AWS deployment
- Use PostgreSQL for production (configured in settings)
- Set up environment variables for secrets

---

## Support Resources

### If Something Isn't Working

1. **Backend won't start?**
   - Is virtual environment activated? `source venv/bin/activate`
   - Are all dependencies installed? `pip install -r requirements.txt`
   - Check Django logs in terminal

2. **Frontend won't load?**
   - Is backend running at http://localhost:8000?
   - Check browser console (F12) for errors
   - Check Network tab for failed requests

3. **Login fails?**
   - Is Django backend running? `python manage.py runserver`
   - Try test account: `admin` / `AdminPassword123!`
   - Check browser Network tab for API response

4. **Database errors?**
   - Reset database: `rm db.sqlite3 && python manage.py migrate`
   - Repopulate data: `python manage.py populate_test_data`

### Documentation
- **Technical Details**: See `PROJECT_OVERVIEW.md`
- **API Reference**: http://localhost:8000/api/ (browsable API)
- **Setup Help**: See `SETUP_INSTRUCTIONS.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`

---

## System Requirements

- Python 3.10+
- Node.js 16+
- 2GB RAM (minimum)
- SQLite (included) or PostgreSQL (optional)
- Modern web browser

---

## Architecture Summary

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js/React)            │
│  - Dashboard with responsive sidebar        │
│  - Forms for all modules                    │
│  - KPI statistics                           │
│  - Runs on localhost:3000                   │
└────────────────────┬────────────────────────┘
                     │
                   HTTP
                  (REST)
                     │
┌────────────────────▼────────────────────────┐
│      Backend (Django REST API)              │
│  - 40+ endpoints across 6 modules           │
│  - JWT authentication                       │
│  - Role-based permissions                   │
│  - Runs on localhost:8000                   │
└────────────────────┬────────────────────────┘
                     │
                   SQL
                     │
┌────────────────────▼────────────────────────┐
│          Database (SQLite/PostgreSQL)       │
│  - 23 normalized models                     │
│  - Relationships & constraints              │
│  - Audit logging                            │
└─────────────────────────────────────────────┘
```

---

## Performance Notes

- SQLite (development): Good for 1-10 concurrent users
- PostgreSQL (production): Recommended for 10+ concurrent users
- Frontend caching: SWR for API data caching
- Database indexes: Optimized on frequently queried fields

---

## Customization

The system is fully customizable:

1. **Colors**: Edit `app/globals.css` (Kenwell colors already applied)
2. **Fonts**: Currently using Albert Sans (body) + AFACAD (headers)
3. **Database**: Add models, modify relationships, add validation
4. **API**: Add endpoints, custom actions, filtering logic
5. **UI**: Create new components, modify dashboards, add pages

---

## What's Next?

Choose your path:

### Path 1: Deploy to Production
→ Follow `DEPLOYMENT_GUIDE.md`

### Path 2: Add More Features
→ Create new Django models and React pages

### Path 3: Customize for Your Business
→ Modify colors, add custom fields, adjust workflows

### Path 4: Integrate with Other Systems
→ Connect to payment processors, email services, etc.

---

## License & Support

This is your complete, production-ready system.

For detailed help:
- Review documentation files in project root
- Check Django logs when running server
- Check browser console (F12) for frontend errors
- Test with provided test accounts

---

## Files Ready to Use

✓ Complete Backend API  
✓ Complete Frontend Dashboard  
✓ Database Models  
✓ Authentication System  
✓ Admin Panel  
✓ Documentation  
✓ Test Data  
✓ Setup Scripts  

**Everything is ready. Just run the setup script and start coding!** 🚀
