'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function GoogleAuthButton() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);

  const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientID) return;

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: handleGoogleCallback,
        });
        setGoogleReady(true);
      }
    };
    document.head.appendChild(script);
  }, [clientID]);

  // Render the Google Button automatically when ready
  useEffect(() => {
    if (googleReady && window.google?.accounts?.id && clientID) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        { theme: 'outline', size: 'large', width: '380px' }
      );
    }
  }, [googleReady, clientID]);

  const handleGoogleCallback = async (response: any) => {
    try {
      setIsLoading(true);
      setError('');
      console.log('[v0] Google auth token received');

      // Send token to backend
      const result = await apiClient.post<any>('/api/auth/google-login/', {
        token: response.credential,
      });

      console.log('[v0] Google auth successful:', result);

      // Store tokens
      if (result.access) {
        apiClient.setToken(result.access);
        localStorage.setItem('refresh_token', result.refresh);
        
        // Refresh AuthContext to update current user state
        await refresh();
        
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[v0] Google auth error:', err);
      setError(
          err instanceof Error ? err.message : 'Google authentication failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientID) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-sm text-center dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
        Google Sign-In is not configured. Please set the <code className="bg-amber-100/50 dark:bg-amber-950/40 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> environment variable.
      </div>
    );
  }

  if (!googleReady) {
    return (
      <Button disabled className="w-full bg-gray-200 text-gray-500">
        Loading Google Sign-In...
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div
        id="google-signin-button"
        className="flex justify-center"
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">or</span>
        </div>
      </div>
    </div>
  );
}

// Declare google window interface
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}
