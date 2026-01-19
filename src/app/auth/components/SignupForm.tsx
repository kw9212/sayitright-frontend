'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const emailSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요'),
});

const verificationSchema = z.object({
  code: z.string().length(6, '인증 코드는 6자리 숫자입니다'),
});

const signupSchema = z
  .object({
    username: z.string().trim().min(2, '닉네임은 2글자 이상').max(20).optional(),
    password: z.string().min(8, '비밀번호는 8자 이상').max(72, '비밀번호는 72자 이하'),
    passwordConfirm: z.string().min(8).max(72),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: '비밀번호가 일치하지 않아요',
    path: ['passwordConfirm'],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

type SignupFormProps = {
  onSuccess?: () => void;
};

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [step, setStep] = useState<'email' | 'verification' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const handleSendCode = async (values: EmailFormValues) => {
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? '인증 코드 발송에 실패했습니다.');
        return;
      }

      setEmail(values.email);
      setStep('verification');
      toast.success('인증 코드가 이메일로 발송되었습니다.');

      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  const handleVerifyCode = async (values: VerificationFormValues) => {
    try {
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code: values.code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? '인증 코드가 올바르지 않습니다.');
        return;
      }

      setIsVerified(true);
      setStep('signup');
      toast.success('이메일 인증이 완료되었습니다!');
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? '인증 코드 재발송에 실패했습니다.');
        return;
      }

      toast.success('인증 코드가 재발송되었습니다.');

      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    if (!isVerified) {
      toast.error('이메일 인증을 먼저 완료해주세요.');
      return;
    }

    try {
      const payload = {
        email,
        password: values.password,
        username: values.username?.trim() || undefined,
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? '회원가입 실패');
        return;
      }

      toast.success('회원가입이 완료되었습니다!');
      onSuccess?.();
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/40 p-4">
      {step === 'email' && (
        <form className="space-y-3" onSubmit={emailForm.handleSubmit(handleSendCode)}>
          <div className="space-y-1">
            <label className="text-sm text-zinc-200">이메일</label>
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 
              text-zinc-100"
              {...emailForm.register('email')}
              autoFocus
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-rose-400">{emailForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button className="w-full" type="submit" disabled={emailForm.formState.isSubmitting}>
            인증 코드 발송
          </Button>
        </form>
      )}

      {step === 'verification' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-zinc-100">{email}</span>로 인증 코드를
              발송했습니다.
            </p>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-xs text-blue-400 hover:underline"
            >
              이메일 변경
            </button>
          </div>

          <form className="space-y-3" onSubmit={verificationForm.handleSubmit(handleVerifyCode)}>
            <div className="space-y-1">
              <label className="text-sm text-zinc-200">인증 코드 (6자리)</label>
              <input
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 
                text-zinc-100 text-center text-2xl tracking-widest"
                {...verificationForm.register('code')}
                maxLength={6}
                placeholder="000000"
                autoFocus
              />
              {verificationForm.formState.errors.code && (
                <p className="text-xs text-rose-400">
                  {verificationForm.formState.errors.code.message}
                </p>
              )}
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={verificationForm.formState.isSubmitting}
            >
              인증하기
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={cooldown > 0}
              className="text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50 
              disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `재발송 (${cooldown}초 후)` : '인증 코드 재발송'}
            </button>
          </div>
        </div>
      )}

      {step === 'signup' && (
        <form className="space-y-3" onSubmit={signupForm.handleSubmit(handleSignup)}>
          <div className="space-y-1 rounded-md bg-green-950/20 p-2 border border-green-800/30">
            <p className="text-xs text-green-400">✓ 이메일 인증 완료: {email}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-zinc-200">닉네임 (선택)</label>
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 
              text-zinc-100"
              {...signupForm.register('username')}
            />
            {signupForm.formState.errors.username && (
              <p className="text-xs text-rose-400">
                {signupForm.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-zinc-200">비밀번호</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 
              text-zinc-100"
              {...signupForm.register('password')}
              autoFocus
            />
            {signupForm.formState.errors.password && (
              <p className="text-xs text-rose-400">
                {signupForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-zinc-200">비밀번호 확인</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 
              text-zinc-100"
              {...signupForm.register('passwordConfirm')}
            />
            {signupForm.formState.errors.passwordConfirm && (
              <p className="text-xs text-rose-400">
                {signupForm.formState.errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={signupForm.formState.isSubmitting}>
            회원가입
          </Button>
        </form>
      )}
    </Card>
  );
}
