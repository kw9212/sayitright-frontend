'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'template' | 'archive' | 'note' | 'email';
}

export function GuestLimitModal({ isOpen, onClose, limitType }: GuestLimitModalProps) {
  const router = useRouter();

  const limitMessages = {
    template: {
      title: '템플릿 저장 한도 도달',
      description: '게스트는 템플릿을 1개까지 저장할 수 있습니다.',
    },
    archive: {
      title: '아카이브 저장 한도 도달',
      description: '게스트는 아카이브를 10개까지 저장할 수 있습니다.',
    },
    note: {
      title: '노트 저장 한도 도달',
      description: '게스트는 노트를 5개까지 저장할 수 있습니다.',
    },
    email: {
      title: '오늘의 이메일 생성 한도 도달',
      description: '게스트는 하루에 3회까지 이메일을 생성할 수 있습니다.',
    },
  };

  const message = limitMessages[limitType];

  const handleSignup = () => {
    onClose();
    router.push('/auth/signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-950/20 border border-blue-700/30 rounded-lg p-4">
            <p className="text-sm text-blue-300 mb-2">
              <strong>🎉 회원가입하고 무제한으로 사용하세요!</strong>
            </p>
            <p className="text-xs text-blue-200">
              간단한 회원가입(이메일 인증)만 하시면 모든 기능을
              <strong> 제한 없이</strong> 사용하실 수 있습니다.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">회원 혜택:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>무제한 이메일 생성</strong> - 횟수 제한 없음
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>템플릿 3개 저장</strong> - 게스트의 3배
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>7일간 아카이브 보관</strong> - 최대 200개
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>무제한 노트 저장</strong> - 용어 관리 자유롭게
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-950/20 border border-purple-700/30 rounded-lg p-3">
            <p className="text-xs text-purple-300">
              <strong>💎 베타 기간</strong> - 현재 모든 프리미엄 기능도 무료로 사용 가능합니다!
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            className="text-black hover:bg-zinc-700 hover:text-white"
            onClick={onClose}
          >
            나중에
          </Button>
          <Button
            onClick={handleSignup}
            className="bg-linear-to-r from-blue-600 to-purple-600 
              hover:from-blue-700 hover:to-purple-700"
          >
            회원가입하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
