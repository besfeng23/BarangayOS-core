
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { app } from '@/lib/firebase/client';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const persistence = keepLoggedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const idToken = await userCredential.user.getIdToken();

      // Create the session cookie
      const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
          throw new Error('Failed to create session on the server.');
      }
      
      // Force a full page reload to ensure server and client are in sync
      window.location.href = '/apps';

    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 relative p-4">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/landing" className="text-sm text-slate-400 hover:text-white transition-colors">&larr; Back to Landing Page</Link>
      </div>

      <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-slate-700 text-white">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-400" />
          <CardTitle className="text-3xl font-bold mt-4">BarangayOS</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access your terminal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                required
                className="h-12 text-lg bg-slate-900 border-slate-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="h-12 text-lg bg-slate-900 border-slate-600 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="keep-logged-in" checked={keepLoggedIn} onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)} />
              <label
                htmlFor="keep-logged-in"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep me logged in
              </label>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="fixed bottom-8 left-0 right-0 flex flex-col items-center justify-center">
        <p className="text-[10px] text-slate-500 tracking-widest mb-2 uppercase">POWERED BY</p>
        <Image 
            src="/speedypldt.png" 
            alt="PLDT Enterprise" 
            width={200}
            height={48}
            className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
        />
      </footer>
    </div>
  );
}
