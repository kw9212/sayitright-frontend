'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

const RESEND_COOLDOWN = 60;

export default function ForgotPasswordForm({ onSuccess, onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!email) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message ?? '코드 발송에 실패했습니다.');
        return;
      }

      toast.success(`인증 코드를 ${email}로 발송했습니다.`);
      setCooldown(RESEND_COOLDOWN);
      setStep(2);
    } catch {
      toast.error('코드 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = () => {
    if (!emailCode || emailCode.length !== 6) {
      toast.error('6자리 인증 코드를 입력해주세요.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!newPassword) {
      toast.error('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      toast.error('비밀번호는 8자 이상 72자 이하여야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, emailCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message ?? '비밀번호 재설정에 실패했습니다.');
        if (response.status === 404 || response.status === 400) {
          setStep(1);
        }
        return;
      }

      toast.success('비밀번호가 재설정되었습니다. 다시 로그인해주세요.');
      onSuccess();
    } catch {
      toast.error('비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/40 p-4">
      <div className="space-y-3">
        <div className="mb-1">
          <p className="text-xs text-zinc-500">
            단계 {step} / 3 — {step === 1 && '이메일 확인'}
            {step === 2 && '인증 코드 입력'}
            {step === 3 && '새 비밀번호 설정'}
          </p>
        </div>

        {step === 1 && (
          <>
            <div>
              <label className="text-sm text-zinc-200">가입한 이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                placeholder="example@email.com"
                className="w-full rounded-md border border-zinc-800 
                  bg-zinc-950 px-3 py-2 text-zinc-100 mt-1"
                autoFocus
              />
            </div>
            <Button className="w-full" onClick={handleSendCode} disabled={isSendingCode || !email}>
              {isSendingCode ? '발송 중...' : '인증 코드 발송'}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="text-sm text-zinc-200">인증 코드</label>
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                placeholder="6자리 숫자"
                maxLength={6}
                className="w-full rounded-md border border-zinc-800 
                  bg-zinc-950 px-3 py-2 text-zinc-100 tracking-widest 
                  text-center text-lg mt-1"
                autoFocus
              />
              <p className="text-xs text-zinc-500 mt-1">{email}으로 발송된 코드를 입력하세요</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                onClick={() => {
                  setStep(1);
                  setEmailCode('');
                }}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `재발송 (${cooldown}s)` : '이메일 재입력'}
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerifyCode}
                disabled={emailCode.length !== 6}
              >
                다음
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="text-sm text-zinc-200">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상"
                className="w-full rounded-md border border-zinc-800 
                  bg-zinc-950 px-3 py-2 text-zinc-100 mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-zinc-200">비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="비밀번호 재입력"
                className="w-full rounded-md border border-zinc-800 
                  bg-zinc-950 px-3 py-2 text-zinc-100 mt-1"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || !newPassword || !newPasswordConfirm}
            >
              {isSubmitting ? '재설정 중...' : '비밀번호 재설정'}
            </Button>
          </>
        )}

        <button
          type="button"
          onClick={onBack}
          className="w-full text-xs text-zinc-500 hover:text-zinc-300 
            transition-colors text-center pt-1"
        >
          ← 로그인으로 돌아가기
        </button>
      </div>
    </Card>
  );
}
