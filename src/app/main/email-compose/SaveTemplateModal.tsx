'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  isLoading?: boolean;
};

export default function SaveTemplateModal({ isOpen, onClose, onConfirm, isLoading }: Props) {
  const [title, setTitle] = useState('');

  const handleConfirm = () => {
    onConfirm(title.trim());
    setTitle('');
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-800 text-white border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-zinc-200">템플릿으로 저장</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="template-title" className="text-sm font-medium text-zinc-300">
              템플릿 제목 (선택사항)
            </label>
            <input
              id="template-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 회의 요청 이메일"
              maxLength={255}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white 
                placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-500">제목을 입력하지 않으면 자동으로 생성됩니다.</p>
          </div>

          <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-md">
            <p className="text-sm text-blue-300">
              💡 이 이메일을 템플릿으로 저장하여 나중에 재사용할 수 있습니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
