'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GoogleAuthButton } from '@/components/google-auth-button';
import { Config } from '@/lib/config';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated, hasSeenSplash } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  // Check if splash screen has been seen in this session and handle auth redirect
  useEffect(() => {
    let sessionSeen = false;
    if (typeof window !== 'undefined') {
      try {
        sessionSeen = sessionStorage.getItem('hasSeenSplash') === 'true';
      } catch (e) {
        console.warn('sessionStorage read blocked in SignupPage:', e);
      }
    }

    if (isAuthenticated) {
      router.push('/dashboard');
    } else if (!hasSeenSplash && !sessionSeen) {
      router.push('/?redirect=/signup');
    } else {
      setMounted(true);
    }
  }, [router, isAuthenticated, hasSeenSplash]);

  if (!mounted || isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('[v0] Signup: Creating new customer account');

      // Create user account via API
      const registerResponse = await fetch(`${Config.api.baseUrl}/api/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password_confirm: formData.password,
          phone: formData.phone,
          role: 'customer',
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.error('[v0] Signup: Registration error:', errorData);
        
        // Handle specific error messages
        if (errorData.email) {
          setError(Array.isArray(errorData.email) ? errorData.email[0] : 'Email already exists');
        } else if (errorData.username) {
          setError(Array.isArray(errorData.username) ? errorData.username[0] : 'Email already in use');
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Failed to create account. Please try again.');
        }
        return;
      }

      const userData = await registerResponse.json();
      console.log('[v0] Signup: Account created successfully');

      // Authenticate the user and update context
      try {
        await login(formData.email, formData.password);
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);
      } catch (loginErr) {
        console.error('[v0] Signup: Auto-login failed:', loginErr);
        setSuccess('Account created! Please log in with your credentials.');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error) {
      console.error('[v0] Signup: Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border text-center">
          <img
            src="/logo-light-mode.svg"
            alt="Kenwell Logo"
            className="h-16 mx-auto mb-3 dark:hidden"
          />
          <img
            src="/logo-dark-mode.svg"
            alt="Kenwell Logo"
            className="h-16 mx-auto mb-3 hidden dark:block"
          />
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join Kenwell for insurance management
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Google OAuth */}
          <GoogleAuthButton />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-background border border-border"
              />
              <Input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-background border border-border"
              />
            </div>

            {/* Email */}
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="bg-background border border-border"
            />

            {/* Phone */}
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              className="bg-background border border-border"
            />

            {/* Password */}
            <Input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="bg-background border border-border"
            />

            {/* Confirm Password */}
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              className="bg-background border border-border"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
