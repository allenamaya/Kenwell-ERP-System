# Railway PostgreSQL and Backend URL Setup

## Part 1: Add PostgreSQL Database to Railway

### Step 1: Go to Your Railway Project
1. Open https://railway.app/dashboard
2. Click on your project (Kenwell-ERP-System)
3. You should see your service in the project

### Step 2: Add PostgreSQL Plugin
1. Click the **"+ New"** button in the top right
2. Select **"Database"** from the menu
3. Click **"PostgreSQL"**
4. Railway will automatically create a PostgreSQL database

**That's it!** Railway automatically adds all PostgreSQL connection variables.

### Step 3: Verify PostgreSQL Variables
Once PostgreSQL is added, Railway automatically creates these environment variables:
- `DATABASE_URL` - Full connection string (already includes username, password, host, port, database)
- `PGHOST` - Database host
- `PGPORT` - Database port (usually 5432)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

These are automatically available to your Django backend.

---

## Part 2: Configure Django Backend Environment Variables

### Step 1: Go to Variables Section
1. In Railway dashboard, click on your **Kenwell-ERP-System project**
2. You should see two services:
   - Your GitHub repo (backend service)
   - PostgreSQL database

3. Click on your **GitHub service** (the one from your repo)
4. Go to the **"Variables"** tab (or "Environment" tab)

### Step 2: Add Required Environment Variables

You need to add these variables in Railway:

**Click "Add Variable"** and add each one:

| Variable Name | Value | Notes |
|---|---|---|
| `ENVIRONMENT` | `production` | |
| `DEBUG` | `False` | Always False for production |
| `SECRET_KEY` | Generate random string | Use: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `ALLOWED_HOSTS` | Your domain | e.g., `api-xxxx.railway.app` |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL | e.g., `https://your-frontend.vercel.app` |

**PostgreSQL is automatic:**
- Railway automatically provides `DATABASE_URL`
- Your Django settings should use `DATABASE_URL` environment variable
- No need to manually add database variables

### Step 3: Verify Environment Variables Are Set
1. Look at the Variables tab
2. You should see all your added variables
3. Click "Deploy" if prompted

---

## Part 3: Get Your Backend URL

### Step 1: Wait for Deployment
1. Go back to your project dashboard
2. Click on your **GitHub service** (not PostgreSQL)
3. Look at the **Deployments** tab or main view
4. Wait until the deployment shows **"Success"** (green checkmark)

### Step 2: Find the Backend URL
The URL will be displayed in one of these places:

**Location 1: Service Header**
- At the top of the service page
- Look for a button that shows the URL
- Looks like: `https://api-xxxxx.railway.app`

**Location 2: Networking Tab**
- Click the **"Networking"** tab
- You'll see a public URL
- Copy this URL

**Location 3: Deployments Tab**
- Click **"Deployments"**
- Click the most recent successful deployment
- You should see the URL there

### Step 3: Copy the Full API URL
The backend URL should look like:
```
https://api-xxxxx.railway.app
```

But for your **Vercel environment variable**, you need the full API endpoint:
```
https://api-xxxxx.railway.app/api
```

Note the `/api` at the end - this is important!

---

## Part 4: Add Backend URL to Vercel

### Step 1: Go to Vercel
1. Open https://vercel.com/dashboard
2. Click on your **Kenwell-ERP-System** project (frontend)
3. Click **"Settings"**
4. Click **"Environment Variables"**

### Step 2: Add the Backend URL
1. Click **"Add New"**
2. Fill in:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api-xxxxx.railway.app/api` (replace xxxxx with your actual URL)
   - **Environments:** Select all (Production, Preview, Development)
3. Click **"Save"**

### Step 3: Redeploy Frontend
1. Go to the **"Deployments"** tab
2. Find your latest deployment
3. Click the **three dots** menu
4. Click **"Redeploy"**
5. Wait for it to finish

---

## Testing the Connection

### Step 1: Open Your Frontend
1. Go to your Vercel deployment URL: `https://your-frontend.vercel.app`
2. You should see the login page

### Step 2: Try to Login
1. Use credentials: `admin` / `AdminPassword123!`
2. If successful, the frontend is connected to the backend!

### Step 3: Check Dashboard
1. You should see the dashboard with real data
2. Try adding an agent or customer
3. Everything should work!

### If It Doesn't Work
Check the browser console for errors:
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for errors mentioning the API URL
4. Common issues:
   - Wrong API URL (missing `/api`)
   - Backend not running (check Railway deployments)
   - CORS error (check CORS_ALLOWED_ORIGINS in Railway)

---

## Quick Reference

### Railway PostgreSQL Variables (Auto-Provided)
```
DATABASE_URL=postgresql://user:pass@host:5432/database
```

### Railway Django Variables (You Add)
```
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=api-xxxxx.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Vercel Frontend Variables
```
NEXT_PUBLIC_API_URL=https://api-xxxxx.railway.app/api
```

---

## Troubleshooting

### PostgreSQL Not Appearing
- Refresh the page
- Try clicking "+ New" → "Database" → "PostgreSQL" again
- Check if it's in the "Plugins" section

### Backend URL Not Showing
- Wait for deployment to complete (green checkmark)
- Refresh the page
- Check the "Networking" tab

### Login Fails After Adding URL
- Double-check the URL format (should end with `/api`)
- Check CORS_ALLOWED_ORIGINS matches your Vercel URL exactly
- Check if backend is still running (green checkmark in Railway)

### Database Connection Error
- Make sure DATABASE_URL environment variable exists
- Check your Django settings uses DATABASE_URL
- Check the database migration ran (see logs)

---

## Need Help?

Check the logs in Railway:
1. Click on your service
2. Go to **"Logs"** tab
3. Look for error messages
4. Red text = errors, scroll up to see full error

Most common issues are visible in the logs!
