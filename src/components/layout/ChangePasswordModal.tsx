'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESEND_COOLDOWN = 60;

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const auth = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [emailCode, setEmailCode] = useState('');

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resetState = useCallback(() => {
    setStep(1);
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setEmailCode('');
    setIsSendingCode(false);
    setIsSubmitting(false);
    setCooldown(0);
    setCodeSent(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleStep1Next = () => {
    if (!currentPassword) {
      toast.error('현재 비밀번호를 입력해주세요.');
      return;
    }
    setStep(2);
  };

  const handleSendCode = async () => {
    if (!newPassword) {
      toast.error('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      toast.error('비밀번호는 8자 이상 72자 이하여야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: auth.user?.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? data?.message ?? '코드 발송에 실패했습니다.');
        return;
      }

      toast.success(`인증 코드를 ${auth.user?.email}로 발송했습니다.`);
      setCodeSent(true);
      setCooldown(RESEND_COOLDOWN);
      setStep(3);
    } catch {
      toast.error('코드 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!emailCode || emailCode.length !== 6) {
      toast.error('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = auth.accessToken;
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ currentPassword, newPassword, emailCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? data?.message ?? '비밀번호 변경에 실패했습니다.');
        return;
      }

      toast.success('비밀번호가 변경되었습니다.');
      handleClose();
    } catch {
      toast.error('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabel = ['현재 비밀번호 확인', '새 비밀번호 입력', '이메일 인증'][step - 1];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">비밀번호 변경</DialogTitle>
          <DialogDescription className="text-zinc-400">
            <span className="text-zinc-500 text-xs">단계 {step} / 3 — </span>
            {stepLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-zinc-200">
                현재 비밀번호
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStep1Next()}
                placeholder="현재 비밀번호 입력"
                className="bg-zinc-800 border-zinc-700 text-white"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-zinc-200">
                  새 비밀번호
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8자 이상"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPasswordConfirm" className="text-sm font-medium text-zinc-200">
                  새 비밀번호 확인
                </Label>
                <Input
                  id="newPasswordConfirm"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <p className="text-xs text-zinc-500">
                인증 코드가 <strong className="text-zinc-400">{auth.user?.email}</strong>으로
                발송됩니다.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailCode" className="text-sm font-medium text-zinc-200">
                  인증 코드
                </Label>
                <Input
                  id="emailCode"
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="6자리 숫자 입력"
                  className="bg-zinc-800 border-zinc-700 text-white tracking-widest text-center text-lg"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  코드가 오지 않았나요?{' '}
                  <button
                    onClick={() => {
                      setStep(2);
                      setCodeSent(false);
                    }}
                    disabled={cooldown > 0}
                    className="text-blue-400 hover:text-blue-300 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {cooldown > 0 ? `재발송 (${cooldown}s)` : '재발송'}
                  </button>
                </p>
                {codeSent && <span className="text-xs text-emerald-400">코드 발송됨</span>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="default"
            onClick={step === 1 ? handleClose : () => setStep((s) => (s - 1) as 1 | 2 | 3)}
            disabled={isSubmitting || isSendingCode}
            className="hover:bg-zinc-600 bg-zinc-700"
          >
            {step === 1 ? '취소' : '이전'}
          </Button>

          {step === 1 && (
            <Button
              variant="default"
              onClick={handleStep1Next}
              className="hover:bg-blue-600 bg-blue-700"
            >
              다음
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="default"
              onClick={handleSendCode}
              disabled={isSendingCode}
              className="hover:bg-blue-600 bg-blue-700"
            >
              {isSendingCode ? '발송 중...' : '인증 코드 발송'}
            </Button>
          )}

          {step === 3 && (
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting || emailCode.length !== 6}
              className="hover:bg-blue-600 bg-blue-700"
            >
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
