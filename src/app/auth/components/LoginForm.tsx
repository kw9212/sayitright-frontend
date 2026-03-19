'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

type FormValues = z.infer<typeof schema>;

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const auth = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await auth.loginLocal(values);
      sendGAEvent('event', 'login', { method: 'email' });
    } catch (e) {
      form.setError('root', {
        message: e instanceof Error ? e.message : '로그인 실패',
      });
    }
  };

  const handleGuestMode = () => {
    sendGAEvent('event', 'guest_mode_start', {});
    auth.loginAsGuest();
    router.push('/main');
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/40 p-4">
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm text-zinc-200">이메일</label>
          <input
            className="w-full rounded-md border border-zinc-800 
              bg-zinc-950 px-3 py-2 text-zinc-100"
            {...form.register('email')}
          />
        </div>

        <div>
          <label className="text-sm text-zinc-200">비밀번호</label>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-800 
              bg-zinc-950 px-3 py-2 text-zinc-100"
            {...form.register('password')}
          />
        </div>

        {form.formState.errors.root && (
          <p className="text-sm text-rose-400">{form.formState.errors.root.message}</p>
        )}

        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          로그인
        </Button>

        {onForgotPassword && (
          <div className="text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        )}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950/40 px-2 text-zinc-500">또는</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-zinc-800 hover:bg-zinc-700 
            border-zinc-500 hover:border-zinc-400
            text-zinc-100 hover:text-white"
          onClick={handleGuestMode}
        >
          <span className="mr-2">🎭</span>
          게스트 모드로 사용해보기
        </Button>

        <p className="text-xs text-center text-zinc-500 mt-2">
          💡 로그인 없이 모든 기능을 체험해볼 수 있습니다
        </p>
      </form>
    </Card>
  );
}
