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

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  noteTerms?: string[];
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  noteTerms = [],
}: DeleteConfirmModalProps) {
  const displayTerms =
    noteTerms.length > 3 ? noteTerms.slice(0, 3).join(', ') + '...' : noteTerms.join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">용어 삭제</DialogTitle>
          <DialogDescription className="text-gray-300">
            선택한{' '}
            <span className="font-semibold text-red-400">
              {count}개{noteTerms.length > 0 && `(${displayTerms})`}
            </span>
            의 용어를 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="default" onClick={onClose} className="hover:bg-zinc-600 bg-zinc-700">
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
