'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bhavyafashions.com');
  const [password, setPassword] = useState('bhavya2026admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Basic credential check for admin portal access
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password.');
      }

      // Simulate authentication / session initialization
      await new Promise(r => setTimeout(r, 600));

      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-block">
          <span className="font-serif-luxury text-3xl font-bold tracking-tight text-[#1C1917]">
            BHAVYA <span className="text-[#722F37] italic font-normal">Fashions</span>
          </span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
          Wholesale Administration Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-[#E7E0D5]">
          <div className="mb-6 pb-4 border-b border-[#F3ECE2] flex items-center justify-between">
            <h2 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
              Administrator Sign In
            </h2>
            <div className="w-8 h-8 rounded-full bg-[#722F37]/10 text-[#722F37] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bhavyafashions.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-[#722F37] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C1D24] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#F3ECE2] text-center">
            <p className="text-[11px] text-[#78716C]">
              Demo login credentials are pre-filled for convenience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
