'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const schema = z
  .object({
    email: z.string().email('이메일 형식이 올바르지 않아요'),
    username: z.string().trim().min(2, '닉네임은 2글자 이상').max(20).optional(),
    password: z.string().min(8, '비밀번호는 8자 이상').max(72, '비밀번호는 72자 이하'),
    passwordConfirm: z.string().min(8).max(72),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['passwordConfirm'],
  });

type FormValues = z.infer<typeof schema>;

type SignupFormProps = {
  onSuccess?: () => void;
};

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      email: values.email,
      password: values.password,
      username: values.username?.trim() || undefined,
    };

    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await r.json();

    if (!r.ok) {
      form.setError('root', { message: json?.error?.message ?? '회원가입 실패' });
      return;
    }

    onSuccess?.();
  };

  const { errors } = form.formState;

  return (
    <Card className="border-zinc-800 bg-zinc-950/40 p-4">
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label className="text-sm text-zinc-200">이메일</label>
          <input
            className="w-full rounded-md border border-zinc-800 
              bg-zinc-950 px-3 py-2 text-zinc-100"
            {...form.register('email')}
          />
          {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-200">닉네임 (선택)</label>
          <input
            className="w-full rounded-md border border-zinc-800 
              bg-zinc-950 px-3 py-2 text-zinc-100"
            {...form.register('username')}
          />
          {errors.username && <p className="text-xs text-rose-400">{errors.username.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-200">비밀번호</label>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-800 
              bg-zinc-950 px-3 py-2 text-zinc-100"
            {...form.register('password')}
          />
          {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-200">비밀번호 확인</label>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-800 
              bg-zinc-950 px-3 py-2 text-zinc-100"
            {...form.register('passwordConfirm')}
          />
          {errors.passwordConfirm && (
            <p className="text-xs text-rose-400">{errors.passwordConfirm.message}</p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          회원가입
        </Button>
      </form>
      {errors.root && <p className="text-sm text-rose-400">{errors.root.message}</p>}
    </Card>
  );
}
