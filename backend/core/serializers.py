from rest_framework import serializers
from .models import User, UserProfile, AuditLog


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'company_name', 'identification_number',
            'address', 'city', 'state', 'postal_code', 'country',
            'is_verified', 'verification_date'
        ]
        read_only_fields = ['id', 'verification_date']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone', 'is_active_user', 'profile', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_superuser or instance.is_staff:
            data['role'] = 'admin'
        return data


class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone', 'profile_picture', 'is_active_user', 'profile',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_superuser or instance.is_staff:
            data['role'] = 'admin'
        return data


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'role', 'phone'
        ]
    
    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.__str__', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_display', 'action', 'model_name',
            'object_id', 'changes', 'ip_address', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
