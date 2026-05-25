from rest_framework import viewsets, status
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


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user information"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user details to response
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        return data


class LoginView(TokenObtainPairView):
    """User login endpoint"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


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
        if self.action == 'register':
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
        
        # Generate tokens
        tokens = CustomTokenObtainPairSerializer.get_token(user)
        
        return Response({
            'user': UserDetailSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
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
        if user.role == 'admin':
            return AuditLog.objects.all()
        return AuditLog.objects.filter(user=user)
