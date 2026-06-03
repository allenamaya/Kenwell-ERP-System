# Vercel Environment Variables Setup

## Quick Setup

After deploying to Vercel, you need to add environment variables in the Vercel dashboard:

### Steps:

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Select your "Kenwell-ERP-System" project

2. **Add Environment Variables**
   - Click "Settings" (top navigation)
   - Click "Environment Variables" (left sidebar)

3. **Add `NEXT_PUBLIC_API_URL`**
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your backend API URL
     - **Development:** `http://localhost:8000/api` (only for local)
     - **Staging:** `https://your-staging-backend.railway.app/api`
     - **Production:** `https://your-production-backend.railway.app/api`
   - **Environments:** Select all (Production, Preview, Development)
   - Click "Save"

4. **Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID`** (if using Google OAuth)
   - **Name:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value:** Your Google OAuth Client ID from Google Cloud Console
   - **Environments:** Select all
   - Click "Save"

5. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"
   - Wait for deployment to complete

## Vercel Environment Variable Syntax

### For Secret References (create in Vercel first)
```json
"@secret_name"
```
The secret must exist in Vercel before referencing it.

### For Direct Values
```json
"https://api.example.com"
```
The value is set directly without quotes.

## Current vercel.json Configuration

```json
{
  "env": {
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  }
}
```

`NEXT_PUBLIC_API_URL` is now set via Vercel dashboard instead of vercel.json to avoid secret reference errors.

## Troubleshooting

### "Environment Variable references Secret which does not exist"
- The secret must be created in Vercel dashboard first
- Go to Settings → Environment Variables
- Create the secret with the exact name referenced
- Only use `@secretName` syntax if the secret exists

### "Build failed with environment variables"
- Check that all `NEXT_PUBLIC_*` variables are set
- Variables without `NEXT_PUBLIC_` prefix are backend-only
- Verify variable values don't have typos
- Redeploy after adding variables

## Best Practices

1. Use different backend URLs for different environments
2. Never hardcode secrets in code or vercel.json
3. Use Vercel's dashboard to manage secrets securely
4. Test environment variables locally before deploying
5. Document all required environment variables
