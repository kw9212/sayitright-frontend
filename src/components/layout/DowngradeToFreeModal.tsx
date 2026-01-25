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

interface DowngradeToFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DowngradeToFreeModal({ isOpen, onClose, onConfirm }: DowngradeToFreeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <span className="text-2xl">⬇️</span>
            일반 회원으로 전환
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            일반 회원으로 전환하시겠습니까?
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
              베타 기간 동안에는 프리미엄 회원과 일반 회원 간 <strong>언제든 자유롭게 전환</strong>
              할 수 있습니다. 부담 없이 다양한 기능을 체험해보세요!
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">일반 회원 제한 사항:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 shrink-0">⚠️</span>
                <span>
                  <strong>이메일 생성 제한</strong> - 일 10회로 제한
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 shrink-0">⚠️</span>
                <span>
                  <strong>템플릿 저장 제한</strong> - 최대 3개까지 저장 가능
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 shrink-0">⚠️</span>
                <span>
                  <strong>기본 AI 기능만</strong> - 고급 기능 사용 불가
                </span>
              </li>
            </ul>
          </div>

          <div
            className="bg-green-950/20 border border-green-700/30 
              rounded-lg p-3"
          >
            <p className="text-xs text-green-300">
              💚 언제든 다시 프리미엄으로 전환하실 수 있습니다!
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            className="text-black hover:bg-zinc-700 hover:text-white"
            onClick={onClose}
          >
            취소
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            일반 회원으로 전환
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
