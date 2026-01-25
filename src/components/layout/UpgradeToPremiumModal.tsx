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

interface UpgradeToPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UpgradeToPremiumModal({ isOpen, onClose, onConfirm }: UpgradeToPremiumModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <span className="text-2xl">✨</span>
            프리미엄 회원으로 전환
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            프리미엄 회원이 되어 더 많은 기능을 사용해보세요!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className="bg-blue-950/20 border border-blue-700/30 
              rounded-lg p-4"
          >
            <p className="text-sm text-blue-300 mb-2">
              <strong>🎉 베타 버전 안내</strong>
            </p>
            <p className="text-xs text-blue-200">
              베타 기간 동안에는 <strong>실제 과금이 발생하지 않으며</strong>, 프리미엄과 일반 회원
              간 <strong>언제든 자유롭게 전환</strong>할 수 있습니다. 부담 없이 다양한 기능을
              체험해보세요!
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">프리미엄 회원 혜택:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>무제한 이메일 생성</strong> - 횟수 제한 없이 사용
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>고급 AI 기능</strong> - 더 정교한 이메일 작성
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>무제한 템플릿 저장</strong> - 원하는 만큼 템플릿 보관
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                <span>
                  <strong>우선 지원</strong> - 더 빠른 고객 서비스
                </span>
              </li>
            </ul>
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
            onClick={onConfirm}
            className="bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-700 hover:to-purple-700"
          >
            프리미엄으로 전환하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
