'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // loading placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border hover:border-primary/50 shadow-sm flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-[18px] w-[18px] text-amber-400 animate-[spin_8s_linear_infinite]" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-slate-700 transition-colors" />
      )}
    </button>
  );
}
