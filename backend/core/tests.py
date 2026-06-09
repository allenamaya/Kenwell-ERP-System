from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from .models import UserProfile, OTPVerification

User = get_user_model()

class OTPVerificationTests(APITestCase):
    def setUp(self):
        # Create a user to use in testing
        self.user_data = {
            'username': 'testuser@kenwell.com',
            'email': 'testuser@kenwell.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
            'phone': '1234567890',
            'role': 'customer'
        }

    def test_registration_creates_otp_and_sends_email(self):
        """Test that registering a user creates an OTP and sends an email"""
        # Register user
        response = self.client.post('/api/users/register/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Verification OTP sent.')
        self.assertEqual(response.data['email'], 'testuser@kenwell.com')

        # Check user creation
        user = User.objects.get(email='testuser@kenwell.com')
        self.assertFalse(user.profile.is_verified)

        # Check OTP creation
        otps = OTPVerification.objects.filter(user=user)
        self.assertEqual(otps.count(), 1)
        otp = otps.first()
        self.assertEqual(len(otp.otp_code), 6)
        self.assertFalse(otp.is_verified)

        # Check email sending
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(otp.otp_code, mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].to, ['testuser@kenwell.com'])

    def test_login_blocked_for_unverified_user(self):
        """Test that login is blocked until email is verified"""
        # Register user
        self.client.post('/api/users/register/', self.user_data, format='json')

        # Try to log in
        login_data = {
            'username': 'testuser@kenwell.com',
            'password': 'testpassword123'
        }
        response = self.client.post('/api/auth/login/', login_data, format='json')
        
        # Verify response is forbidden/unauthorized
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Email is not verified', str(response.data))

    def test_verify_otp_success_and_logs_in(self):
        """Test verifying OTP correctly activates account and issues tokens"""
        # Register user
        self.client.post('/api/users/register/', self.user_data, format='json')
        user = User.objects.get(email='testuser@kenwell.com')
        otp = OTPVerification.objects.filter(user=user).first()

        # Submit correct OTP
        verify_data = {
            'email': 'testuser@kenwell.com',
            'otp_code': otp.otp_code
        }
        response = self.client.post('/api/users/verify-otp/', verify_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verify database flags are updated
        user.profile.refresh_from_db()
        self.assertTrue(user.profile.is_verified)
        self.assertIsNotNone(user.profile.verification_date)
        
        otp.refresh_from_db()
        self.assertTrue(otp.is_verified)

        # Try logging in now that user is verified
        login_data = {
            'username': 'testuser@kenwell.com',
            'password': 'testpassword123'
        }
        login_response = self.client.post('/api/auth/login/', login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)

    def test_verify_otp_failure_invalid_code(self):
        """Test that submitting an incorrect OTP fails and keeps account unverified"""
        self.client.post('/api/users/register/', self.user_data, format='json')
        
        # Submit incorrect OTP
        verify_data = {
            'email': 'testuser@kenwell.com',
            'otp_code': '999999' # Incorrect
        }
        response = self.client.post('/api/users/verify-otp/', verify_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid or expired OTP code', str(response.data))

        # Profile remains unverified
        user = User.objects.get(email='testuser@kenwell.com')
        self.assertFalse(user.profile.is_verified)

    def test_resend_otp_invalidates_previous_and_sends_new(self):
        """Test resending OTP generates a new code and expires the previous one"""
        self.client.post('/api/users/register/', self.user_data, format='json')
        user = User.objects.get(email='testuser@kenwell.com')
        first_otp = OTPVerification.objects.filter(user=user).first()
        
        # Resend code
        resend_response = self.client.post('/api/users/resend-otp/', {'email': 'testuser@kenwell.com'}, format='json')
        self.assertEqual(resend_response.status_code, status.HTTP_200_OK)
        
        # Check that previous code expired
        first_otp.refresh_from_db()
        self.assertTrue(first_otp.is_expired())
        
        # Check that a new active code was created
        new_otp = OTPVerification.objects.filter(user=user).order_by('-created_at').first()
        self.assertNotEqual(first_otp.otp_code, new_otp.otp_code)
        
        # Check email outbox contains second email
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn(new_otp.otp_code, mail.outbox[1].body)
