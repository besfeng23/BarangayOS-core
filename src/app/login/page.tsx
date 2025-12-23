'use client';

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { app } from '@/lib/firebase/client';
import Image from 'next/image';
import Link from 'next/link';
import {
  LolaBanner,
  LolaCard,
  LolaHeader,
  LolaInput,
  LolaPage,
  LolaPrimaryButton,
} from '@/components/lola';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth(app);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const persistence = keepLoggedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);

      window.location.href = '/apps';
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <LolaPage className="flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <LolaHeader title="Sign in to BarangayOS" subtitle="Large, clear controls to keep Lola unblocked." backHref="/landing" />

        <LolaCard className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-tight">Secure Sign In</p>
              <p className="text-base text-slate-600">Use your official email and password.</p>
            </div>
          </div>

          {error && (
            <LolaBanner variant="error" title="Login failed" message={error} />
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-semibold text-slate-800">Email</label>
              <LolaInput
                id="email"
                type="email"
                placeholder="juan@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-slate-600">We’ll keep you signed in on this device.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-semibold text-slate-800">Password</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <LolaInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-sm text-slate-600">Passwords are hidden by default to prevent mistakes.</p>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-sm">
              <input
                id="keep-logged-in"
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="h-5 w-5 accent-blue-700"
              />
              Keep me logged in on this device
            </label>

            <LolaPrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In…
                </span>
              ) : (
                'Sign In'
              )}
            </LolaPrimaryButton>
          </form>
        </LolaCard>

        <footer className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">Powered by</p>
          <Link href="/landing" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Image
              src="/speedypldt.png"
              alt="PLDT Enterprise"
              width={200}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>
        </footer>
      </div>
    </LolaPage>
  );
}
