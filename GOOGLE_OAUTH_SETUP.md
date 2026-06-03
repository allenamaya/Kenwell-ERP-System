# Google OAuth Setup Guide

## Overview

This guide explains how to set up Google OAuth for the Kenwell ERP System, allowing users to sign in with their Google accounts.

## Benefits

- Seamless login experience with Google credentials
- No need to remember another password
- Automatic account creation for new Google users
- Secure OAuth 2.0 authentication
- Works across devices

## Prerequisites

- Google Cloud Console account (https://console.cloud.google.com)
- Access to project settings
- Development and production domain names ready

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" > "New Project"
3. Name your project: `Kenwell ERP` (or similar)
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If asked, configure the OAuth consent screen first:
   - User Type: External
   - App name: Kenwell Insurance ERP
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Back to Credentials, select "OAuth 2.0 Client ID"
5. Application type: Web application
6. Name: Kenwell Web App

### 4. Configure Authorized JavaScript Origins

Add your domain origins:

**Development:**
```
http://localhost:3000
http://127.0.0.1:3000
```

**Production:**
```
https://yourdomain.com
https://app.yourdomain.com
```

### 5. Configure Authorized Redirect URIs

Add your redirect URIs:

**Development:**
```
http://localhost:3000/dashboard
http://127.0.0.1:3000/dashboard
```

**Production:**
```
https://yourdomain.com/dashboard
https://app.yourdomain.com/dashboard
```

### 6. Copy Your Client ID

After creating credentials, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Keep this safe, don't share it

### 7. Set Environment Variables

#### Frontend (.env.local or .env.production.local)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (.env)

The backend doesn't need Google credentials as it only receives pre-verified tokens from the frontend.

## Implementation Details

### Frontend Flow

1. User clicks "Sign in with Google"
2. Google Sign-In button appears
3. User authorizes with their Google account
4. Frontend receives `id_token` (JWT)
5. Frontend sends token to backend at `/api/auth/google-login/`
6. Backend verifies token and creates/retrieves user
7. Backend returns JWT tokens
8. Frontend stores tokens and redirects to dashboard

### Backend Flow

1. Receive Google ID token from frontend
2. Verify token signature with Google's public keys
3. Extract user information (email, name, etc.)
4. Check if user exists in database
5. If not, create new user with role='customer'
6. Set password as unusable (Google OAuth only)
7. Return JWT tokens for API authentication

### User Creation

Google OAuth users are automatically created with:
- **Email**: From Google account
- **First Name**: From Google profile
- **Last Name**: From Google profile
- **Username**: Generated from email (e.g., john.doe@gmail.com → john.doe)
- **Role**: `customer` (can be changed in admin panel)
- **Password**: Unusable (must use Google OAuth to login)
- **Email Verified**: True (Google verifies emails)

## API Endpoint

**POST** `/api/auth/google-login/`

Request body:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Frontend Components

### Google Auth Button Component

Location: `components/google-auth-button.tsx`

Features:
- Loads Google Sign-In JavaScript SDK
- Handles OAuth callback
- Sends token to backend
- Stores JWT tokens
- Redirects to dashboard on success

### Usage

```tsx
import { GoogleAuthButton } from '@/components/google-auth-button';

export function LoginPage() {
  return (
    <div>
      <GoogleAuthButton />
      {/* Traditional login form */}
    </div>
  );
}
```

## Backend Files

### OAuth Module

Location: `backend/core/oauth.py`

Functions:
- `verify_google_token()`: Verifies token with Google
- `get_or_create_user_from_google()`: Creates or retrieves user
- `handle_google_oauth_login()`: Main OAuth handler

### Views

Location: `backend/core/views.py`

Endpoint:
- `GoogleOAuthLoginView.login()`: Handles POST requests to `/api/auth/google-login/`

## Troubleshooting

### "Invalid Client ID"
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Ensure the client ID from Google Cloud Console matches exactly
- Clear browser cache and cookies

### "Redirect URI mismatch"
- Check your domain in `.env.local`
- Add all domains to Google Cloud Console Authorized Redirect URIs
- Include both `http://localhost:3000` and production domains

### "Token verification failed"
- Ensure the backend can access Google's API (check firewall/proxy)
- Verify that `requests` library is installed in backend
- Check Django logs for detailed error messages

### Users not being created
- Check that the core app migrations have run
- Verify User model is using `AUTH_USER_MODEL = 'core.User'`
- Check Django logs for specific error messages

## Security Notes

1. **Never expose Client Secret**: Keep it only in backend (not implemented here as Google OAuth uses ID tokens)
2. **Verify tokens**: Always verify Google tokens on backend before trusting user data
3. **Email verification**: Users from Google are automatically email-verified
4. **Session security**: Use HTTPS in production
5. **Token expiry**: Google ID tokens expire after 1 hour (handled by frontend)

## Production Checklist

- [ ] Added production domain to Google OAuth configuration
- [ ] Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in production environment
- [ ] Tested Google login on staging environment
- [ ] Backend can reach Google APIs
- [ ] HTTPS enabled on all domains
- [ ] CORS configured correctly for production domain
- [ ] Users can login and access dashboard
- [ ] Email notifications working for new users

## Additional Resources

- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [Google Identity Services Library](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Documentation](https://datatracker.ietf.org/doc/html/rfc6749)

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Django logs: `tail -f backend/logs/django.log`
3. Check browser console for frontend errors
4. Verify Google Cloud Console OAuth configuration
5. Contact support with detailed error messages
