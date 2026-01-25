'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { archivesRepository } from '@/lib/repositories/archives.repository';
import { guestArchivesRepository } from '@/lib/repositories/guest-archives.repository';
import { templatesRepository } from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import { canCreateTemplate, incrementTemplateCount } from '@/lib/storage/guest-limits';
import { GuestLimitModal } from '@/components/layout/GuestLimitModal';
import { toast } from 'sonner';

type Props = {
  archiveId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ConvertToTemplateModal({ archiveId, onClose, onSuccess }: Props) {
  const auth = useAuth();
  const isGuest = auth.status === 'guest';

  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [archive, setArchive] = useState<{
    id: string;
    title?: string;
    content: string;
    preview: string;
    tone: string;
    purpose?: string;
    relationship?: string;
    rationale?: string;
    createdAt: string | Date;
  } | null>(null);

  useEffect(() => {
    if (!archiveId) {
      setArchive(null);
      setShowRationale(false);
      return;
    }

    const fetchArchive = async () => {
      setLoading(true);
      try {
        const repository = isGuest ? guestArchivesRepository : archivesRepository;
        const response = await repository.get(archiveId);
        if (response.ok && response.data) {
          setArchive(response.data);
        }
      } catch (error) {
        console.error('Archive 조회 실패:', error);
        const errorMessage =
          error instanceof Error ? error.message : '아카이브 조회에 실패했습니다.';
        toast.error(errorMessage);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    void fetchArchive();
  }, [archiveId, onClose, isGuest]);

  const handleConvert = async () => {
    if (!archive) return;

    // 게스트 모드: 템플릿 저장 한도 체크
    if (isGuest && !canCreateTemplate()) {
      setShowGuestLimitModal(true);
      return;
    }

    setConverting(true);
    try {
      const repository = isGuest ? guestTemplatesRepository : templatesRepository;
      const response = await repository.create({
        sourceArchiveId: archive.id,
        title: archive.title,
        content: archive.content,
        tone: archive.tone,
        purpose: archive.purpose,
        relationship: archive.relationship,
        rationale: archive.rationale,
      });

      if (response.ok) {
        // 게스트 모드: 템플릿 카운트 증가
        if (isGuest) {
          incrementTemplateCount();
        }

        toast.success('템플릿으로 저장되었습니다!');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('템플릿 전환 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '템플릿 전환에 실패했습니다.';

      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setConverting(false);
    }
  };

  const handleCopyAttempt = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.info('아카이브는 복사할 수 없습니다. 템플릿으로 전환하세요.');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info('아카이브는 복사할 수 없습니다. 템플릿으로 전환하세요.');
  };

  const formattedDate = archive?.createdAt
    ? new Date(archive.createdAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Dialog open={!!archiveId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] bg-zinc-900 text-white 
          border-zinc-700 overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            템플릿으로 전환
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            이 아카이브 기록을 템플릿으로 저장하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400">로딩 중...</div>
          </div>
        ) : archive ? (
          <div className="overflow-y-auto pr-2 space-y-4">
            {archive.rationale && (
              <div className="relative">
                <button
                  onClick={() => setShowRationale(!showRationale)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-900/20 hover:bg-blue-900/30 
                    border border-blue-700/30 rounded-lg transition-colors 
                    text-sm text-blue-300 w-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>AI 피드백 {showRationale ? '숨기기' : '보기'}</span>
                </button>

                {showRationale && (
                  <div
                    className="mt-2 p-4 bg-zinc-800 border border-blue-700/50 
                      rounded-lg shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 
                              12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 
                              0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 
                              0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        AI 피드백
                      </h4>
                      <button
                        onClick={() => setShowRationale(false)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {archive.rationale}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-zinc-500">{formattedDate}</div>

            {archive.title && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">{archive.title}</h3>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span
                className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-300 
                  border border-blue-700/30"
                title={archive.tone}
              >
                {archive.tone === 'formal'
                  ? '격식있는'
                  : archive.tone === 'polite'
                    ? '공손한'
                    : archive.tone === 'casual'
                      ? '캐주얼'
                      : archive.tone === 'friendly'
                        ? '친근한'
                        : archive.tone}
              </span>
              {archive.relationship && (
                <span
                  className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-300 
                    border border-green-700/30"
                  title={archive.relationship}
                >
                  {archive.relationship === 'professor'
                    ? '교수님'
                    : archive.relationship === 'supervisor'
                      ? '상사'
                      : archive.relationship === 'colleague'
                        ? '동료'
                        : archive.relationship === 'client'
                          ? '고객'
                          : archive.relationship === 'friend'
                            ? '친구'
                            : archive.relationship}
                </span>
              )}
              {archive.purpose && (
                <span
                  className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 
                    border border-purple-700/30"
                  title={archive.purpose}
                >
                  {archive.purpose === 'request'
                    ? '요청'
                    : archive.purpose === 'apology'
                      ? '사과'
                      : archive.purpose === 'thank'
                        ? '감사'
                        : archive.purpose === 'inquiry'
                          ? '문의'
                          : archive.purpose === 'report'
                            ? '보고'
                            : archive.purpose}
                </span>
              )}
            </div>

            <div
              className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 select-none"
              onCopy={handleCopyAttempt}
              onContextMenu={handleContextMenu}
              onDragStart={(e) => e.preventDefault()}
            >
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">내용:</h4>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {archive.content}
                </p>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs text-zinc-400">
                💡 <strong>안내:</strong> 템플릿으로 저장하면 언제든지 재사용할 수 있습니다. 티어에
                따라 저장 가능한 개수가 제한될 수 있으며, 무료 한도 초과 시 크레딧이 차감됩니다.
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={converting}>
            취소
          </Button>
          <Button
            onClick={handleConvert}
            disabled={converting || loading || !archive}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {converting ? '저장 중...' : '템플릿으로 저장'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <GuestLimitModal
        isOpen={showGuestLimitModal}
        onClose={() => setShowGuestLimitModal(false)}
        limitType="template"
      />
    </Dialog>
  );
}
