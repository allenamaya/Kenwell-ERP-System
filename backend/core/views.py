from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User, UserProfile, AuditLog
from .serializers import (
    UserSerializer, UserDetailSerializer, UserRegisterSerializer,
    UserProfileSerializer, AuditLogSerializer
)
from .oauth import handle_google_oauth_login


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user information"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = 'admin' if (user.is_superuser or user.is_staff) else user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        if user.role == 'customer' and hasattr(user, 'customer_profile') and user.customer_profile:
            token['customer_id'] = user.customer_profile.id
            token['customer_code'] = user.customer_profile.customer_id
            
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user = self.user
        
        # Block login if user is not verified
        if not (user.is_superuser or user.is_staff):
            try:
                profile = user.profile
                if not profile.is_verified:
                    raise serializers.ValidationError({'error': 'Email is not verified'})
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError({'error': 'User profile not found'})
        
        # Add user details to response
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': 'admin' if (user.is_superuser or user.is_staff) else user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        if user.role == 'customer' and hasattr(user, 'customer_profile') and user.customer_profile:
            data['user']['customer_id'] = user.customer_profile.id
            data['user']['customer_code'] = user.customer_profile.customer_id
            
        return data


class LoginView(TokenObtainPairView):
    """User login endpoint"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class GoogleOAuthLoginView(viewsets.ViewSet):
    """Google OAuth login endpoint"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Handle Google OAuth login
        Expected POST data: { "token": "<google_access_token>" }
        """
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Google token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return handle_google_oauth_login(token)


class UserViewSet(viewsets.ModelViewSet):
    """User management viewset"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        elif self.action == 'register':
            return UserRegisterSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['register', 'verify_otp', 'resend_otp']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new user"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate OTP
        from .models import OTPVerification
        from .emails import send_otp_email
        otp = OTPVerification.generate_otp(user)
        
        # Send OTP email
        try:
            send_otp_email(user, otp.otp_code)
        except Exception as e:
            print(f"[Register] Error sending email: {e}")
            
        return Response({
            'message': 'Verification OTP sent.',
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get', 'patch', 'delete'])
    def me(self, request):
        """Get, update, or deactivate current user"""
        user = request.user
        if request.method == 'GET':
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = UserDetailSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        elif request.method == 'DELETE':
            user.is_active = False
            user.is_active_user = False
            user.save()
            if hasattr(user, 'customer_profile') and user.customer_profile:
                profile = user.customer_profile
                profile.status = 'inactive'
                profile.save()
            return Response({'message': 'Account successfully deactivated.'})
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')
        
        if not authenticate(username=user.username, password=old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != new_password_confirm:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({'success': 'Password changed successfully'})
    
    @action(detail=False, methods=['get'])
    def by_role(self, request):
        """Get users by role"""
        role = request.query_params.get('role')
        if not role:
            return Response(
                {'error': 'role parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(role=role)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='verify-otp', permission_classes=[AllowAny])
    def verify_otp(self, request):
        """Verify OTP for email registration"""
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response(
                {'error': 'Email and OTP code are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Check if already verified
        if hasattr(user, 'profile') and user.profile.is_verified:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account is already verified.',
                'user': UserDetailSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
            
        # Find active verification
        from django.utils import timezone
        from .models import OTPVerification
        otp_verification = OTPVerification.objects.filter(
            user=user,
            otp_code=otp_code,
            is_verified=False,
            expires_at__gt=timezone.now()
        ).first()
        
        if not otp_verification:
            return Response(
                {'error': 'Invalid or expired OTP code.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Mark OTP as verified
        otp_verification.is_verified = True
        otp_verification.save()
        
        # Mark user profile as verified
        profile = user.profile
        profile.is_verified = True
        profile.verification_date = timezone.now()
        profile.save()
        
        # Log in user and generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Email verified successfully.',
            'user': UserDetailSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='resend-otp', permission_classes=[AllowAny])
    def resend_otp(self, request):
        """Resend email verification OTP"""
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        if hasattr(user, 'profile') and user.profile.is_verified:
            return Response(
                {'error': 'Email is already verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Generate and send new OTP
        from .models import OTPVerification
        from .emails import send_otp_email
        otp = OTPVerification.generate_otp(user)
        
        try:
            send_otp_email(user, otp.otp_code)
        except Exception as e:
            print(f"[Resend OTP] Error sending email: {e}")
            
        return Response({
            'message': 'Verification OTP resent successfully.',
            'email': user.email
        }, status=status.HTTP_200_OK)


class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's profile"""
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit log viewing (read-only)"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'action', 'model_name']
    search_fields = ['user__username', 'model_name']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        # Admins can see all audit logs, others can only see their own
        user = self.request.user
        if user.role == 'admin' or user.is_superuser or user.is_staff:
            return AuditLog.objects.all()
        return AuditLog.objects.filter(user=user)
