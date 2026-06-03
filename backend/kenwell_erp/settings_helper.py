"""
Django settings helper for environment-based configuration
Helps manage different settings for development, staging, and production
"""

import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

def get_env(key: str, default: str = '') -> str:
    """Get environment variable with optional default"""
    return os.getenv(key, default)

def get_env_bool(key: str, default: bool = False) -> bool:
    """Get boolean environment variable"""
    value = os.getenv(key, str(default)).lower()
    return value in ('true', '1', 'yes', 'on')

def get_env_list(key: str, default: str = '') -> list:
    """Get comma-separated environment variable as list"""
    value = os.getenv(key, default)
    return [item.strip() for item in value.split(',') if item.strip()]

# Detect environment
ENVIRONMENT = get_env('ENVIRONMENT', 'development').lower()
IS_DEVELOPMENT = ENVIRONMENT == 'development'
IS_STAGING = ENVIRONMENT == 'staging'
IS_PRODUCTION = ENVIRONMENT == 'production'

# Django Core Settings
DEBUG = get_env_bool('DEBUG', IS_DEVELOPMENT)
SECRET_KEY = get_env('SECRET_KEY', 'django-insecure-dev-key-change-in-production')
ALLOWED_HOSTS = get_env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')

# Database Configuration
def get_database_config():
    """Get database configuration based on environment"""
    
    engine = get_env('DATABASE_ENGINE', 'django.db.backends.sqlite3')
    
    if 'postgresql' in engine:
        # PostgreSQL Configuration
        return {
            'default': {
                'ENGINE': engine,
                'NAME': get_env('DATABASE_NAME', 'kenwell_db'),
                'USER': get_env('DATABASE_USER', 'postgres'),
                'PASSWORD': get_env('DATABASE_PASSWORD', 'password'),
                'HOST': get_env('DATABASE_HOST', 'localhost'),
                'PORT': get_env('DATABASE_PORT', '5432'),
                'ATOMIC_REQUESTS': True,
                'CONN_MAX_AGE': 600 if IS_PRODUCTION else 0,
            }
        }
    else:
        # SQLite Configuration
        return {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / get_env('DATABASE_NAME', 'db.sqlite3'),
            }
        }

DATABASES = get_database_config()

# CORS Configuration
CORS_ALLOWED_ORIGINS = get_env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000'
)

# Email Configuration
def get_email_config():
    """Get email configuration based on environment"""
    
    backend = get_env(
        'EMAIL_BACKEND',
        'django.core.mail.backends.console.EmailBackend'
    )
    
    config = {
        'EMAIL_BACKEND': backend,
        'DEFAULT_FROM_EMAIL': get_env('DEFAULT_FROM_EMAIL', 'noreply@example.com'),
    }
    
    # SMTP Configuration for production
    if 'smtp' in backend.lower():
        config.update({
            'EMAIL_HOST': get_env('EMAIL_HOST', 'smtp.gmail.com'),
            'EMAIL_PORT': int(get_env('EMAIL_PORT', '587')),
            'EMAIL_HOST_USER': get_env('EMAIL_HOST_USER', ''),
            'EMAIL_HOST_PASSWORD': get_env('EMAIL_HOST_PASSWORD', ''),
            'EMAIL_USE_TLS': get_env_bool('EMAIL_USE_TLS', True),
        })
    
    return config

EMAIL_CONFIG = get_email_config()

# Security Settings
SECURE_SSL_REDIRECT = get_env_bool('SECURE_SSL_REDIRECT', IS_PRODUCTION)
SESSION_COOKIE_SECURE = get_env_bool('SESSION_COOKIE_SECURE', IS_PRODUCTION)
CSRF_COOKIE_SECURE = get_env_bool('CSRF_COOKIE_SECURE', IS_PRODUCTION)

# HSTS Settings (production only)
SECURE_HSTS_SECONDS = int(get_env('SECURE_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = get_env_bool('SECURE_HSTS_INCLUDE_SUBDOMAINS', False)

# Storage Configuration
def get_storage_config():
    """Get storage configuration (local or S3)"""
    
    if get_env_bool('USE_S3', False):
        return {
            'DEFAULT_FILE_STORAGE': 'storages.backends.s3boto3.S3Boto3Storage',
            'AWS_ACCESS_KEY_ID': get_env('AWS_ACCESS_KEY_ID', ''),
            'AWS_SECRET_ACCESS_KEY': get_env('AWS_SECRET_ACCESS_KEY', ''),
            'AWS_STORAGE_BUCKET_NAME': get_env('AWS_STORAGE_BUCKET_NAME', ''),
            'AWS_S3_REGION_NAME': get_env('AWS_S3_REGION_NAME', 'us-east-1'),
            'AWS_S3_CUSTOM_DOMAIN': f"{get_env('AWS_STORAGE_BUCKET_NAME', '')}.s3.amazonaws.com",
            'AWS_LOCATION': 'media',
        }
    else:
        # Local file storage
        return {}

STORAGE_CONFIG = get_storage_config()

# Logging Configuration
def get_logging_config():
    """Get logging configuration based on environment"""
    
    if IS_PRODUCTION:
        return {
            'version': 1,
            'disable_existing_loggers': False,
            'handlers': {
                'file': {
                    'level': 'INFO',
                    'class': 'logging.handlers.RotatingFileHandler',
                    'filename': '/var/log/django/kenwell.log',
                    'maxBytes': 1024 * 1024 * 15,  # 15MB
                    'backupCount': 10,
                },
                'console': {
                    'class': 'logging.StreamHandler',
                },
            },
            'root': {
                'handlers': ['file', 'console'],
                'level': 'INFO',
            },
        }
    else:
        # Development logging
        return {
            'version': 1,
            'disable_existing_loggers': False,
            'handlers': {
                'console': {
                    'class': 'logging.StreamHandler',
                },
            },
            'root': {
                'handlers': ['console'],
                'level': 'DEBUG',
            },
        }

LOGGING = get_logging_config()

# Cache Configuration
def get_cache_config():
    """Get cache configuration based on environment"""
    
    if IS_PRODUCTION:
        return {
            'default': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': get_env('REDIS_URL', 'redis://127.0.0.1:6379/1'),
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                },
                'KEY_PREFIX': 'kenwell',
                'TIMEOUT': 300,
            }
        }
    else:
        # Development uses in-memory cache
        return {
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'kenwell-cache',
            }
        }

CACHES = get_cache_config()

# Print configuration info (development only)
if IS_DEVELOPMENT:
    print("""
    [v0] Django Environment Configuration:
    - Environment: {}
    - Debug: {}
    - Database: {}
    - Allowed Hosts: {}
    - CORS Origins: {}
    """.format(
        ENVIRONMENT,
        DEBUG,
        get_env('DATABASE_ENGINE', 'sqlite3'),
        ALLOWED_HOSTS,
        CORS_ALLOWED_ORIGINS,
    ))
