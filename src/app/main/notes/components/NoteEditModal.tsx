'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/lib/repositories/notes.repository';

interface NoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { term: string; description?: string; example?: string }) => Promise<void>;
  note?: Note | null;
}

export function NoteEditModal({ isOpen, onClose, onSave, note }: NoteEditModalProps) {
  const [term, setTerm] = useState('');
  const [description, setDescription] = useState('');
  const [example, setExample] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTerm(note.term);
      setDescription(note.description || '');
      setExample(note.example || '');
    } else {
      setTerm('');
      setDescription('');
      setExample('');
    }
  }, [note, isOpen]);

  const handleSubmit = async () => {
    if (!term.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        term: term.trim(),
        description: description.trim() || undefined,
        example: example.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('용어 저장 실패:', error);
      alert(error instanceof Error ? error.message : '용어 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 
          text-white border-zinc-800"
      >
        <DialogHeader>
          <DialogTitle className="text-white">{note ? '용어 수정' : '용어 추가'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="term" className="text-sm font-medium text-gray-200">
              용어 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="예: Cohort Analysis"
              maxLength={255}
              className="w-full bg-zinc-800 border-zinc-700 text-white 
                placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-400">{term.length}/255자</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-200">
              설명
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="용어에 대한 설명을 입력하세요"
              rows={4}
              className="w-full resize-none bg-zinc-800 border-zinc-700 
                text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example" className="text-sm font-medium text-gray-200">
              예시
            </Label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="용어 사용 예시를 입력하세요"
              rows={3}
              className="w-full resize-none bg-zinc-800 border-zinc-700 
                text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="default"
            onClick={onClose}
            disabled={isSubmitting}
            className="hover:bg-zinc-600 bg-zinc-700"
          >
            취소
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!term.trim() || isSubmitting}
            className="hover:bg-zinc-600 bg-zinc-700"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
