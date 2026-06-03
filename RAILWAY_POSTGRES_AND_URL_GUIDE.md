# Railway PostgreSQL & Backend URL Guide

## Quick Answer

**You don't manually add PostgreSQL variables.** Railway automatically creates them for you!

### Two Key Points:

1. **PostgreSQL Variables are AUTO-CREATED by Railway**
   - When you add a PostgreSQL database service, Railway automatically creates `DATABASE_URL`
   - This single variable contains everything (host, port, user, password, database name)
   - You DON'T need to add individual variables for each database detail

2. **Backend URL is Generated AFTER Deployment**
   - You get it from Railway → Your Service → Settings → Domains
   - NOT from the Variables tab
   - Only available once deployment succeeds

---

## Step-by-Step: PostgreSQL Setup

### Step 1: Add PostgreSQL Database to Railway

1. Go to https://railway.app and log in
2. Go to your project dashboard
3. Click **"New Service"** or **"Add Service"**
4. Click **"Database"**
5. Select **"PostgreSQL"**
6. Click **"Create"**

**That's it!** Railway automatically:
- Creates a PostgreSQL database
- Generates credentials
- Creates `DATABASE_URL` environment variable
- Sets it on your backend service

### Step 2: Verify PostgreSQL Variables Were Created

1. In Railway, click on your **backend service**
2. Go to **"Variables"** tab
3. You should see:
   - `DATABASE_URL=postgresql://user:password@host:port/dbname`
   - (This is auto-generated, don't edit it!)

The `DATABASE_URL` is **all your backend needs**. It includes:
- Host (server location)
- Port (5432 for PostgreSQL)
- Username (database user)
- Password (database password)
- Database name (database to use)

**All in one variable!**

### Step 3: Add Other Required Variables

Now manually add these variables in Railway:

In your backend service → **Variables** tab, click **"Add Variable"**:

**Variable 1: DEBUG**
- Name: `DEBUG`
- Value: `False`

**Variable 2: SECRET_KEY** (Generate a new one!)
```bash
# In your terminal, run:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy the output and paste it as the value
```
- Name: `SECRET_KEY`
- Value: `[paste the generated key]`

**Variable 3: ALLOWED_HOSTS**
- Name: `ALLOWED_HOSTS`
- Value: `*.railway.app`
- (This allows any Railway domain to access the API)

**Variable 4: CORS_ALLOWED_ORIGINS**
- Name: `CORS_ALLOWED_ORIGINS`
- Value: (you'll fill this later once you know your Vercel frontend URL)
- Example: `https://kenwell-frontend.vercel.app`

### Step 4: What About ${{REF}} Syntax?

The `${{REF}}` syntax is used to **reference variables from other services** in Railway.

You would use it like this if needed:
```
${{PostgreSQL.DATABASE_URL}}
```

**But you don't need it!** Because:
- Railway automatically connects PostgreSQL to your backend service
- `DATABASE_URL` is automatically available in your backend
- No need to manually reference it

**Only use ${{REF}} if you need to reference a variable from a different service**, which you don't in this setup.

---

## Step-by-Step: Get Your Backend URL

### Step 1: Wait for Deployment to Complete

1. In Railway dashboard, go to your **backend service**
2. Click **"Deployments"** tab
3. Wait for status to turn **green** (Success)
4. Check the logs to verify it started successfully

**The backend URL is only available AFTER successful deployment!**

### Step 2: Generate Your Backend Domain

1. In your backend service, click **"Settings"** tab
2. Scroll down to **"Domains"** section
3. You should see an option like **"Generate Domain"** or a domain already created
4. Click **"Generate Domain"** if needed
5. Railway will generate a URL like:

```
https://kenwell-backend-production-xxx123.railway.app
```

**This is your Backend URL!**

### Step 3: Copy and Save Your Backend URL

The format is always:
```
https://[project-name]-[service-name]-[environment-xxxx].railway.app
```

Example:
```
https://kenwell-backend-production-a1b2c3d4.railway.app
```

**Copy this and save it somewhere safe!**

---

## Step-by-Step: Connect Backend URL to Vercel Frontend

Now that you have your backend URL:

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Click your **Kenwell** project
3. Click **"Settings"** button (top right)

### Step 2: Add Environment Variable

1. Go to **"Environment Variables"** section
2. Click **"Add New"** button
3. Fill in:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-railway-backend-url/api`
   - **Environments:** Select **"All"** (Production, Preview, Development)

Example value:
```
https://kenwell-backend-production-a1b2c3d4.railway.app/api
```

**Important:** Include `/api` at the end!

### Step 3: Redeploy Frontend

1. In Vercel, go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Wait for deployment to complete (green status)

---

## Testing the Connection

### Test 1: Backend is Running

In your terminal:
```bash
curl https://your-railway-backend-url/api/auth/login/
```

Should return JSON (may have error, but that's OK - it means backend responds)

### Test 2: Frontend Can Reach Backend

1. Go to your Vercel frontend URL
2. Open browser Developer Tools (F12)
3. Go to **"Console"** tab
4. Try to login with: `admin` / `AdminPassword123!`
5. Check Network tab to see if API calls go to your Railway URL
6. If you see successful responses, it's working!

### Test 3: Dashboard Shows Data

1. After logging in, dashboard should show:
   - Number of agents
   - Number of customers
   - Active policies
   - Pending claims
   - etc.

If you see data, **everything is connected!**

---

## Common Issues & Solutions

### Issue: "DATABASE_URL not found"

**Solution:**
- Make sure you added PostgreSQL service first
- Railway automatically creates it, might take a minute
- Refresh the page
- Try redeploying

### Issue: Backend deployment fails

**Solution:**
- Check Railway logs (Deployments tab)
- Look for error messages
- Common issues:
  - Missing SECRET_KEY variable
  - Old Node.js version (should be 20+)
  - Python version incompatibility

### Issue: Frontend shows "Cannot connect to backend"

**Solution:**
- Verify NEXT_PUBLIC_API_URL is set correctly in Vercel
- Make sure `/api` is included at the end
- Check CORS_ALLOWED_ORIGINS in Railway includes your Vercel URL
- Verify backend URL is working (test with curl)

### Issue: "CORS error" in browser console

**Solution:**
- Go to Railway backend service
- Add your Vercel domain to CORS_ALLOWED_ORIGINS
- Example: `https://kenwell.vercel.app`
- Redeploy backend
- Wait 1-2 minutes for changes to take effect

---

## Summary

**PostgreSQL:**
- Railway creates it automatically when you add the service
- You get `DATABASE_URL` environment variable
- No manual configuration needed!

**Backend URL:**
- Generated after deployment succeeds
- Found in: Backend Service → Settings → Domains
- Format: `https://[name]-[service]-[hash].railway.app`
- Use `[url]/api` in Vercel as `NEXT_PUBLIC_API_URL`

**${{REF}} Syntax:**
- Only use to reference variables from OTHER services
- You don't need it for this setup
- Railway auto-connects services

---

## Checklist

- [ ] PostgreSQL service added to Railway project
- [ ] Backend service deployed successfully (green status)
- [ ] Backend URL generated and copied
- [ ] `DEBUG=False` set in Railway variables
- [ ] `SECRET_KEY` set in Railway variables
- [ ] `ALLOWED_HOSTS=*.railway.app` set in Railway variables
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel (with `/api` suffix)
- [ ] Frontend redeployed on Vercel
- [ ] Tested backend with `curl` command
- [ ] Tested login on frontend
- [ ] Dashboard shows data

**All done? You're ready to go live!**
