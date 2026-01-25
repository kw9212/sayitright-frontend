'use client';

import { useState } from 'react';
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

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string | null;
}

export function ProfileEditModal({ isOpen, onClose, currentUsername }: ProfileEditModalProps) {
  const auth = useAuth();
  const [username, setUsername] = useState(currentUsername || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (password && password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password && (password.length < 8 || password.length > 72)) {
      toast.error('비밀번호는 8자 이상 72자 이하여야 합니다.');
      return;
    }

    if (!username.trim() && !password) {
      toast.error('변경할 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: { username?: string; password?: string } = {};

      const trimmedUsername = username.trim();
      if (trimmedUsername !== (currentUsername || '')) {
        payload.username = trimmedUsername || undefined;
      }

      if (password) {
        payload.password = password;
      }

      const token = auth.accessToken;

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error?.message ?? '프로필 변경에 실패했습니다.');
        return;
      }

      toast.success('프로필이 변경되었습니다.');

      await auth.refreshUser();

      setPassword('');
      setPasswordConfirm('');
      onClose();
    } catch (error) {
      console.error('프로필 변경 실패:', error);
      toast.error('프로필 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUsername(currentUsername || '');
    setPassword('');
    setPasswordConfirm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">프로필 변경</DialogTitle>
          <DialogDescription className="text-gray-300">
            닉네임과 비밀번호를 변경할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-200">
              닉네임
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-gray-400">
              {username.length}/20자 (비워두면 닉네임이 삭제됩니다)
            </p>
          </div>

          <div className="border-t border-zinc-700 pt-4">
            <p className="text-sm text-gray-400 mb-3">
              비밀번호를 변경하려면 아래에 새 비밀번호를 입력하세요
            </p>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                새 비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2 mt-3">
              <Label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-200">
                비밀번호 확인
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={isSubmitting}
            className="hover:bg-zinc-600 bg-zinc-700"
          >
            취소
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="hover:bg-blue-600 bg-blue-700"
          >
            {isSubmitting ? '변경 중...' : '변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
