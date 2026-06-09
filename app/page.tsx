'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, setHasSeenSplash } = useAuth();
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [played, setPlayed] = useState(false);

  // Load sound preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('app_muted') === 'true';
      const savedVolume = localStorage.getItem('app_volume');
      if (savedMuted) setIsMuted(true);
      if (savedVolume !== null) setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Sync volume changes to the playing audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('app_muted', String(nextMuted));
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    localStorage.setItem('app_volume', String(newVal));
  };

  // FM synthesized premium chime with delay and reverb simulation
  const playSynthesizedChime = (): boolean => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return false;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        console.warn('[v0] AudioContext is suspended. Autoplay blocked.');
        return false;
      }
      const now = ctx.currentTime;
      
      const currentVolume = isMuted ? 0 : volume;
      
      // Warm, supportive base drone (C3)
      const baseOsc = ctx.createOscillator();
      const baseGain = ctx.createGain();
      baseOsc.type = 'triangle';
      baseOsc.frequency.setValueAtTime(130.81, now); // C3
      baseGain.gain.setValueAtTime(0, now);
      baseGain.gain.linearRampToValueAtTime(0.12 * currentVolume, now + 0.15);
      baseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      
      baseOsc.connect(baseGain);
      baseGain.connect(filter);
      filter.connect(ctx.destination);
      baseOsc.start(now);
      baseOsc.stop(now + 2.5);

      // Staggered arpeggiated bright chime chord (C5 - E5 - G5 - C6)
      const frequencies = [523.25, 659.25, 783.99, 1046.50];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        // Volume envelope: fast attack, long decay
        gainNode.gain.setValueAtTime(0, now + idx * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.08 * currentVolume, now + idx * 0.12 + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.0);
        
        // Delay/echo simulation
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.28;
        const delayGain = ctx.createGain();
        delayGain.gain.value = 0.25;
        
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
      // Attempt to load and play static audio file if provided
      const audio = new Audio('/chime.wav');
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;

      audio.play()
        .then(() => {
          console.log('[v0] Chime played from static audio file /chime.wav');
          resolve(true);
        })
        .catch((err) => {
          console.warn('Failed to play /chime.wav, trying /chime.mp3', err);
          const audioMp3 = new Audio('/chime.mp3');
          audioMp3.volume = isMuted ? 0 : volume;
          audioRef.current = audioMp3;
          
          audioMp3.play()
            .then(() => {
              console.log('[v0] Chime played from static audio file /chime.mp3');
              resolve(true);
            })
            .catch((err2) => {
              // Fallback to beautiful Web Audio API chime on failure or if file doesn't exist
              console.log('[v0] Fallback to synthesized premium chime', err2);
              const synthSuccess = playSynthesizedChime();
              resolve(synthSuccess);
            });
        });
    });
  };

  useEffect(() => {
    // Autoplay attempt
    let autoPlayAttempted = false;
    
    const tryPlay = () => {
      if (!played && !autoPlayAttempted) {
        autoPlayAttempted = true;
        playChime().then((success) => {
          if (success) {
            setPlayed(true);
          } else {
            autoPlayAttempted = false;
          }
        });
      }
    };

    const autoPlayTimer = setTimeout(() => {
      tryPlay();
    }, 400);

    const handleFirstInteraction = () => {
      if (!played) {
        playChime().then((success) => {
          if (success) {
            setPlayed(true);
          }
        });
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      clearTimeout(autoPlayTimer);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [played, isMuted, volume]);

  useEffect(() => {
    if (!isLoading) {
      // Begin exit animation at 3.0 seconds
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 3000);

      // Perform routing redirect at 3.7 seconds
      const redirectTimer = setTimeout(() => {
        setHasSeenSplash(true);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('hasSeenSplash', 'true');
          } catch (e) {
            console.warn('sessionStorage write blocked:', e);
          }
          const params = new URLSearchParams(window.location.search);
          const redirectPath = params.get('redirect') || (isAuthenticated ? '/dashboard' : '/signup');
          router.push(redirectPath);
        } else {
          router.push(isAuthenticated ? '/dashboard' : '/signup');
        }
      }, 3700);
      
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [isLoading, isAuthenticated, router, setHasSeenSplash]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-black transition-opacity duration-700 relative overflow-hidden select-none ${isExiting ? 'page-exit' : ''}`}>
      {/* CSS Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInLogo {
          0% {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.08);
          }
        }
        @keyframes fadeInText {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pageFadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .animate-logo {
          animation: fadeInLogo 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-text {
          animation: fadeInText 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
          opacity: 0;
        }
        .animate-glow {
          animation: glowPulse 4s ease-in-out infinite;
        }
        .page-exit {
          animation: pageFadeOut 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Decorative Radial Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(46,229,86,0.08)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,_rgba(141,221,216,0.06)_0%,_transparent_70%)] blur-3xl animate-glow pointer-events-none" />

      {/* Splash Logo Wrapper */}
      <div className="text-center z-10 flex flex-col items-center">
        <div className="animate-logo mb-6 relative p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 shadow-2xl backdrop-blur-sm">
          <img
            src="/logo-dark-mode.svg"
            alt="Kenwell Logo"
            className="h-28 w-auto select-none pointer-events-none"
            draggable="false"
          />
        </div>
        
        {/* Soft Glowing Subtitle */}
        <p className="animate-text font-heading text-xs tracking-[0.35em] text-emerald-400 font-semibold uppercase">
          Kenwell ERP System
        </p>
      </div>

      {/* Sound Controller */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg transition-all hover:bg-white/10">
        <button
          onClick={toggleMute}
          className="text-white hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer"
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
          className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-zinc-700 accent-emerald-500 focus:outline-none"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, #3f3f46 ${(isMuted ? 0 : volume) * 100}%, #3f3f46 100%)`
          }}
        />
      </div>

      {/* Bottom Status / Footer */}
      <div className="absolute bottom-12 text-center z-10">
        <p className="text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
          Enterprising Trust
        </p>
      </div>
    </div>
  );
}
