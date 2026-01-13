'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const auth = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await auth.loginLocal(values);
    } catch (e) {
      form.setError('root', {
        message: e instanceof Error ? e.message : '로그인 실패',
      });
    }
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
      </form>
    </Card>
  );
}
