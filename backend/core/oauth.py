"""
Google OAuth authentication and user handling
"""
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from .models import User
from .serializers import UserDetailSerializer


def verify_google_token(token: str):
    """Verify Google OAuth token and get user info"""
    try:
        # Check if it looks like a JWT (ID Token has three segments separated by dots)
        is_jwt = len(token.split('.')) == 3
        
        # Use appropriate endpoint and parameter
        if is_jwt:
            url = "https://oauth2.googleapis.com/tokeninfo"
            params = {"id_token": token}
        else:
            url = "https://www.googleapis.com/oauth2/v1/tokeninfo"
            params = {"access_token": token}
            
        # Verify token with Google
        response = requests.get(
            url,
            params=params,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"[v0] Google token verification failed: {response.status_code} - {response.text}")
            return None
        
        return response.json()
    except Exception as e:
        print(f"[v0] Error verifying Google token: {e}")
        return None


def get_or_create_user_from_google(google_user_info: dict):
    """Get or create user from Google OAuth user info"""
    try:
        email = google_user_info.get('email')
        if not email:
            return None
        
        # Try to find existing user by email
        user = User.objects.filter(email=email).first()
        
        if user:
            return user
        
        # Create new user from Google info
        given_name = google_user_info.get('given_name', '').strip()
        family_name = google_user_info.get('family_name', '').strip()
        
        # Generate username from email (use part before @)
        username = email.split('@')[0]
        
        # Ensure username is unique
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create new user
        user = User.objects.create(
            username=username,
            email=email,
            first_name=given_name,
            last_name=family_name,
            role='customer',  # Default role for Google OAuth users
            is_active=True,
            is_email_verified=True,  # Google verifies emails
        )
        
        # Set unusable password so they can only login via Google
        user.set_unusable_password()
        user.save()
        
        return user
    except Exception as e:
        print(f"[v0] Error creating user from Google info: {e}")
        return None


def handle_google_oauth_login(token: str):
    """Handle Google OAuth login flow"""
    try:
        # Verify token with Google
        google_user_info = verify_google_token(token)
        if not google_user_info:
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get or create user
        user = get_or_create_user_from_google(google_user_info)
        if not user:
            return Response(
                {'error': 'Failed to create user'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserDetailSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"[v0] Google OAuth error: {e}")
        return Response(
            {'error': 'OAuth authentication failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
