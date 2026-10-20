'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial saved theme or system preference
    const saved = localStorage.getItem('bhavya_theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('bhavya_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 border cursor-pointer ${
        theme === 'dark'
          ? 'bg-[#271F22] text-[#D4AF37] border-[#382B2F] hover:bg-[#34272B]'
          : 'bg-white/10 text-[#FAF7F2] border-white/20 hover:bg-white/20 hover:text-[#C5A059]'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Warm Light Mode' : 'Switch to Luxury Dark Mode'}
      aria-label="Toggle theme mode"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform rotate-0 hover:rotate-90 duration-300" />
      ) : (
        <Moon className="w-4 h-4 transition-transform rotate-0 hover:-rotate-12 duration-300" />
      )}
    </button>
  );
}
