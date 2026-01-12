'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import { useAuth } from '@/lib/auth/auth-context';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === 'authenticated') router.replace('/main');
  }, [auth.status, router]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <Card className="w-full border-zinc-800 bg-zinc-950/60 text-zinc-50 shadow-[0_0_60px_rgba(217,70,239,0.10)]">
          <CardHeader>
            <CardTitle className="text-xl">
              <span className="text-zinc-100">SayItRight</span>
            </CardTitle>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={tab === 'login' ? 'default' : 'outline'}
                className={tab !== 'login' ? 'text-zinc-600 hover:text-zinc-50' : ''}
                onClick={() => setTab('login')}
              >
                로그인
              </Button>

              <Button
                type="button"
                variant={tab === 'signup' ? 'default' : 'outline'}
                className={tab !== 'signup' ? 'text-zinc-600 hover:text-zinc-50' : ''}
                onClick={() => setTab('signup')}
              >
                회원가입
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {tab === 'login' ? <LoginForm /> : <SignupForm onSuccess={() => setTab('login')} />}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
