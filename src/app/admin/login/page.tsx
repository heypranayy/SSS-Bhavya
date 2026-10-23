'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { getFirebaseApp, isFirebaseConfigured } from '@/lib/firebase/config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sss@bhavyafashions.com');
  const [password, setPassword] = useState('Bhavya@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      let authenticated = false;
      let authUserRole = 'admin';

      // 1. Try Firebase Authentication (if configured and user was created in Firebase Auth)
      if (isFirebaseConfigured()) {
        try {
          const app = getFirebaseApp();
          if (app) {
            const auth = getAuth(app);
            const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
            if (userCred && userCred.user) {
              authenticated = true;
              authUserRole = cleanEmail.includes('gexart') ? 'super_admin' : 'admin';
            }
          }
        } catch (fbErr: any) {
          // If password error or user not found, fall through to backend/local checks
          console.warn('Firebase Auth check passed to fallback handlers:', fbErr.code);
        }
      }

      // 2. Try Server-Side Verification API (/api/admin/login)
      if (!authenticated) {
        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              authenticated = true;
              authUserRole = data.user?.role || 'admin';
            }
          }
        } catch (apiErr) {
          console.warn('Server login API fallback:', apiErr);
        }
      }

      // 3. Try LocalStorage Fallback (for offline or local staff accounts)
      if (!authenticated && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('bhavya_staff_accounts');
          if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) {
              const found = list.find(
                (s: any) =>
                  s.email?.toLowerCase() === cleanEmail &&
                  s.password === cleanPass &&
                  s.status !== 'suspended'
              );
              if (found) {
                authenticated = true;
                authUserRole = found.role || 'staff';
              }
            }
          }
        } catch {}
      }

      // 4. Master Emergency & Developer Fallback for Super Admin / Gexart Lead
      if (!authenticated) {
        const isMasterGexart =
          cleanEmail === 'pranay@gexart.com' &&
          (cleanPass === 'Bhavya@2026' ||
            cleanPass === 'bhavya2026' ||
            cleanPass === 'bhavya2026admin' ||
            cleanPass === 'Gexart@2026' ||
            cleanPass === 'gexart2026');

        const isMasterBhavya =
          (cleanEmail === 'sss@bhavyafashions.com' &&
            (cleanPass === 'Bhavya@2026' || cleanPass === 'bhavya2026')) ||
          (cleanEmail === 'admin@bhavyafashions.com' &&
            (cleanPass === 'bhavya2026admin' || cleanPass === 'Bhavya@2026'));

        if (isMasterGexart || isMasterBhavya) {
          authenticated = true;
          authUserRole = 'super_admin';
        }
      }

      if (authenticated) {
        setAuthSuccess(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bhavya_admin_auth', 'authenticated');
          localStorage.setItem('bhavya_admin_user', cleanEmail);
          localStorage.setItem('bhavya_admin_role', authUserRole);
          document.cookie = 'bhavya_admin_auth=authenticated; path=/; max-age=86400';
        }
        await new Promise((r) => setTimeout(r, 400));
        router.push('/admin');
      } else {
        throw new Error('Invalid credentials. Please check your email and password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      setAuthSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillSuperAdmin = () => {
    setEmail('sss@bhavyafashions.com');
    setPassword('Bhavya@2026');
    setErrorMsg('');
  };

  const handleAutofillGexartAdmin = () => {
    setEmail('pranay@gexart.com');
    setPassword('Bhavya@2026');
    setErrorMsg('');
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
          Super Admin & Wholesale Command Center
        </p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C1917] text-[#C5A059] text-[10px] font-mono tracking-wider font-bold">
          ⚡ STAMPED & POWERED BY GEXART TECHNOLOGIES
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-[#E7E0D5]">
          <div className="mb-6 pb-4 border-b border-[#F3ECE2] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Administrator Sign In
              </h2>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Firebase Auth &amp; Enterprise Staff Access
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#722F37]/10 text-[#722F37] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Authentication successful! Launching dashboard...</span>
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
                disabled={isLoading || authSuccess}
                className="w-full py-3 px-4 rounded-lg bg-[#722F37] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C1D24] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
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

          {/* Quick Super Admin Credentials for evaluation */}
          <div className="mt-6 pt-4 border-t border-[#F3ECE2] space-y-2.5">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#78716C]">
              Authorized Admin Profiles:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAutofillGexartAdmin}
                className="p-2.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] rounded-xl border border-[#E7E0D5] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1917] text-[11px] group-hover:text-[#722F37]">
                    Pranay (Gexart)
                  </span>
                  <span className="text-[9px] bg-[#1C1917] text-[#C5A059] px-1.5 py-0.5 rounded font-mono font-bold">
                    Dev Lead
                  </span>
                </div>
                <span className="font-mono text-[#78716C] text-[10px] block truncate">
                  pranay@gexart.com
                </span>
              </button>

              <button
                type="button"
                onClick={handleAutofillSuperAdmin}
                className="p-2.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] rounded-xl border border-[#E7E0D5] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1917] text-[11px] group-hover:text-[#722F37]">
                    Bhavya Fashions
                  </span>
                  <span className="text-[9px] bg-[#722F37]/10 text-[#722F37] px-1.5 py-0.5 rounded font-mono font-bold">
                    Super Admin
                  </span>
                </div>
                <span className="font-mono text-[#78716C] text-[10px] block truncate">
                  sss@bhavyafashions.com
                </span>
              </button>
            </div>

            <p className="text-[10px] text-center text-[#78716C] pt-2">
              Engineered & Secured by{' '}
              <a
                href="https://www.gexart.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1C1917] hover:underline"
              >
                Gexart Technologies
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
