/**
 * Centralized configuration management for different environments
 * Helps manage environment-specific settings consistently
 */

export const Config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },

  // App Configuration
  app: {
    env: (process.env.NEXT_PUBLIC_APP_ENV || 'development') as 'development' | 'staging' | 'production',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'Kenwell Insurance ERP',
  },

  // Feature Flags
  features: {
    googleOAuth: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    analytics: process.env.NEXT_PUBLIC_APP_ENV === 'production',
    debugMode: process.env.NEXT_PUBLIC_APP_ENV === 'development',
  },

  // API Endpoints
  endpoints: {
    login: '/api/auth/login/',
    googleLogin: '/api/auth/google-login/',
    refresh: '/api/auth/refresh/',
    me: '/api/users/me/',
    agents: '/api/agents/',
    customers: '/api/customers/',
    policies: '/api/policies/',
    claims: '/api/claims/',
    invoices: '/api/invoices/',
  },
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const isDevelopment = Config.app.env === 'development';
  const isStaging = Config.app.env === 'staging';
  const isProduction = Config.app.env === 'production';

  return {
    isDevelopment,
    isStaging,
    isProduction,
    isLocal: isDevelopment && Config.api.baseUrl.includes('localhost'),
  };
}

/**
 * Helper function to get full API URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = Config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}

/**
 * Helper function to log environment info (development only)
 */
export function logEnvironmentConfig() {
  if (Config.features.debugMode) {
    console.log('[v0] Environment Configuration:', {
      environment: Config.app.env,
      apiBaseUrl: Config.api.baseUrl,
      googleOAuthEnabled: Config.google.enabled,
      appUrl: Config.app.url,
    });
  }
}

// Call on module load
logEnvironmentConfig();
