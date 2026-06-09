'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Config } from '@/lib/config';

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { refresh } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume/mute from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedVolume = localStorage.getItem('app_volume');
        if (savedVolume !== null) setVolume(parseFloat(savedVolume));
        const savedMute = localStorage.getItem('app_muted') === 'true';
        setIsMuted(savedMute);
      } catch (e) {
        console.warn('Storage read blocked in OTPForm:', e);
      }
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);

  // Focus the first input cell on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_volume', String(newVal));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_muted', String(nextMute));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const playSynthesizedChime = (): boolean => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return false;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const delay = ctx.createDelay();
        const delayGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        delay.delayTime.setValueAtTime(0.15, now);
        delayGain.gain.setValueAtTime(0.04, now);
        
        gainNode.gain.setValueAtTime(0, now + idx * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.5);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(ctx.destination);
        
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.5);
      });
      return true;
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
      return false;
    }
  };

  const playChime = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio('/chime.wav');
      const currentVolume = isMuted ? 0 : volume;
      audio.volume = currentVolume;
      audioRef.current = audio;

      audio.play()
        .then(() => {
          console.log('[v0] Chime played from static audio file /chime.wav');
          resolve(true);
        })
        .catch((err) => {
          console.warn('Failed to play /chime.wav, trying /chime.mp3', err);
          const audioMp3 = new Audio('/chime.mp3');
          audioMp3.volume = currentVolume;
          audioRef.current = audioMp3;
          
          audioMp3.play()
            .then(() => {
              console.log('[v0] Chime played from static audio file /chime.mp3');
              resolve(true);
            })
            .catch((err2) => {
              console.log('[v0] Fallback to synthesized premium chime', err2);
              const synthSuccess = playSynthesizedChime();
              resolve(synthSuccess);
            });
        });
    });
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    setError('');

    // Advance focus
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];

      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
      setError('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      setError('');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (otpCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${Config.api.baseUrl}/api/users/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          otp_code: otpCode,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Verification failed. Please verify the code and try again.');
        return;
      }

      setSuccess('Email verified successfully! Logging you in...');
      
      // Play celebration chime
      await playChime();

      // Store tokens globally
      apiClient.setToken(responseData.access);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('refresh_token', responseData.refresh);
        } catch (e) {
          console.warn('localStorage write blocked:', e);
        }
      }

      // Sync auth state
      await refresh();

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('[verify-otp] Verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    if (!email.trim()) {
      setError('Please provide your email address to resend the code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${Config.api.baseUrl}/api/users/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Failed to resend code. Please try again.');
        return;
      }

      setSuccess('A new verification code has been sent to your email.');
      setOtp(new Array(6).fill(''));
      setCooldown(60);
      setCanResend(false);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error('[verify-otp] Resend error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative bg-gradient-to-br from-background to-background/80">
      {/* Top Header Utilities */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {/* Sound Controller */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-border backdrop-blur-md shadow-lg transition-all hover:bg-white/10 dark:bg-black/20">
          <button
            onClick={toggleMute}
            className="text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <span className="text-sm">🔇</span>
            ) : volume < 0.4 ? (
              <span className="text-sm">🔉</span>
            ) : (
              <span className="text-sm">🔊</span>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              if (isMuted) setIsMuted(false);
              handleVolumeChange(parseFloat(e.target.value));
            }}
            className="w-16 h-1 rounded-lg appearance-none cursor-pointer bg-zinc-300 dark:bg-zinc-700 accent-primary focus:outline-none"
            style={{
              background: `linear-gradient(to right, #2EE556 0%, #2EE556 ${(isMuted ? 0 : volume) * 100}%, #718096 ${(isMuted ? 0 : volume) * 100}%, #718096 100%)`
            }}
          />
        </div>
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border border-border shadow-2xl backdrop-blur-sm bg-card/90">
        {/* Logo and Titles */}
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
            Verify Email
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
            )}

            {/* Email Input (Editable in case of errors) */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Verification Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-background border border-border"
              />
            </div>

            {/* 6-Digit input boxes */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                Security Code
              </label>
              <div className="flex justify-between gap-2 my-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || otp.join('').length < 6 || !email}
              className="w-full bg-primary text-foreground font-semibold hover:bg-primary/90"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          {/* Resend Cooldown Section */}
          <div className="text-center text-sm pt-2">
            <span className="text-muted-foreground">Didn&apos;t receive a code? </span>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer p-0 focus:outline-none"
              >
                Resend Code
              </button>
            ) : (
              <span className="text-muted-foreground font-medium">
                Resend in {cooldown}s
              </span>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            <Link href="/login" className="hover:text-primary transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-sm font-medium">Loading Verification Portal...</p>
        </div>
      </div>
    }>
      <OTPForm />
    </Suspense>
  );
}
