'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { templatesRepository, type TemplateDetail } from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';

type Props = {
  templateId: string | null;
  onClose: () => void;
  onUpdate?: () => void;
};

export default function TemplateDetailModal({ templateId, onClose, onUpdate }: Props) {
  const auth = useAuth();
  const isGuest = auth.status === 'guest';
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTone, setEditedTone] = useState('');
  const [editedRelationship, setEditedRelationship] = useState('');
  const [editedPurpose, setEditedPurpose] = useState('');

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      setIsEditMode(false);
      return;
    }

    const fetchTemplateDetail = async () => {
      setLoading(true);
      try {
        const repository = isGuest ? guestTemplatesRepository : templatesRepository;
        const response = await repository.get(templateId);
        if (response.ok && response.data) {
          const data = response.data;
          setTemplate(data);
          setEditedTitle(data.title || '');
          setEditedContent(data.content);
          setEditedTone(data.tone);
          setEditedRelationship(data.relationship || '');
          setEditedPurpose(data.purpose || '');
        }
      } catch (error) {
        console.error('Template 상세 조회 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '템플릿 조회에 실패했습니다.';
        toast.error(errorMessage);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplateDetail();
  }, [templateId, onClose, isGuest]);

  const handleCopy = () => {
    if (template?.content) {
      void navigator.clipboard.writeText(template.content);
      toast.success('클립보드에 복사되었습니다.');
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (template) {
      setEditedTitle(template.title || '');
      setEditedContent(template.content);
      setEditedTone(template.tone);
      setEditedRelationship(template.relationship || '');
      setEditedPurpose(template.purpose || '');
    }
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!template) {
      return;
    }

    if (!editedContent.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }
    if (!editedTone.trim()) {
      toast.error('톤을 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const repository = isGuest ? guestTemplatesRepository : templatesRepository;
      const response = await repository.update(template.id, {
        title: editedTitle.trim() || undefined,
        content: editedContent.trim(),
        tone: editedTone,
        relationship: editedRelationship.trim() || undefined,
        purpose: editedPurpose.trim() || undefined,
      });

      if (response.ok && response.data) {
        setTemplate(response.data);
        setIsEditMode(false);
        toast.success('템플릿이 수정되었습니다.');
        onUpdate?.();
      }
    } catch (error) {
      console.error('Template 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '템플릿 수정에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = template?.createdAt
    ? new Date(template.createdAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Dialog open={!!templateId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[85vh] bg-zinc-900 text-white 
          border-zinc-700 overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{template?.title || formattedDate}</DialogTitle>
          <DialogDescription className="text-zinc-400">{formattedDate}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-400">로딩 중...</div>
          </div>
        ) : template ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {isEditMode ? (
              <>
                {template.rationale && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-900/20 
                        hover:bg-blue-900/30 border border-blue-700/30 rounded-lg 
                        transition-colors text-sm text-blue-300"
                    >
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>AI 피드백 보기</span>
                    </button>

                    {showTooltip && (
                      <div
                        className="absolute z-50 top-12 left-0 right-0 p-4 bg-zinc-800 border 
                          border-blue-700/50 rounded-lg shadow-xl"
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
                            onClick={() => setShowTooltip(false)}
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
                            {template.rationale}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">제목</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="제목 (선택사항)"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                      text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">톤 *</label>
                  <select
                    value={editedTone}
                    onChange={(e) => setEditedTone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                      text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="formal">격식있는</option>
                    <option value="polite">공손한</option>
                    <option value="casual">캐주얼</option>
                    <option value="friendly">친근한</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">관계</label>
                  <select
                    value={editedRelationship}
                    onChange={(e) => setEditedRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                      text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="professor">교수님</option>
                    <option value="supervisor">상사</option>
                    <option value="colleague">동료</option>
                    <option value="client">고객</option>
                    <option value="friend">친구</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">목적</label>
                  <select
                    value={editedPurpose}
                    onChange={(e) => setEditedPurpose(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                      text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="request">요청</option>
                    <option value="apology">사과</option>
                    <option value="thank">감사</option>
                    <option value="inquiry">문의</option>
                    <option value="report">보고</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">내용 *</label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="이메일 내용을 입력하세요..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                      text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500
                      min-h-[300px] whitespace-pre-wrap leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <>
                {template.rationale && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-900/20 
                        hover:bg-blue-900/30 border border-blue-700/30 rounded-lg 
                        transition-colors text-sm text-blue-300"
                    >
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>AI 피드백 보기</span>
                    </button>

                    {showTooltip && (
                      <div
                        className="absolute z-50 top-12 left-0 right-0 p-4 bg-zinc-800 
                          border border-blue-700/50 rounded-lg shadow-xl"
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
                                12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 
                                3.374 0 0014 18.469V19a2 2 0 11-4 
                                0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                            AI 피드백
                          </h4>
                          <button
                            onClick={() => setShowTooltip(false)}
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
                            {template.rationale}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1 text-xs rounded-full bg-blue-900/30 
                      text-blue-300 border border-blue-700/30"
                  >
                    {template.tone === 'formal'
                      ? '격식있는'
                      : template.tone === 'polite'
                        ? '공손한'
                        : template.tone === 'casual'
                          ? '캐주얼'
                          : template.tone === 'friendly'
                            ? '친근한'
                            : template.tone}
                  </span>
                  {template.relationship && (
                    <span
                      className="px-3 py-1 text-xs rounded-full bg-green-900/30 
                        text-green-300 border border-green-700/30"
                    >
                      {template.relationship === 'professor'
                        ? '교수님'
                        : template.relationship === 'supervisor'
                          ? '상사'
                          : template.relationship === 'colleague'
                            ? '동료'
                            : template.relationship === 'client'
                              ? '고객'
                              : template.relationship === 'friend'
                                ? '친구'
                                : template.relationship}
                    </span>
                  )}
                  {template.purpose && (
                    <span
                      className="px-3 py-1 text-xs rounded-full bg-purple-900/30 
                      text-purple-300 border border-purple-700/30"
                    >
                      {template.purpose === 'request'
                        ? '요청'
                        : template.purpose === 'apology'
                          ? '사과'
                          : template.purpose === 'thank'
                            ? '감사'
                            : template.purpose === 'inquiry'
                              ? '문의'
                              : template.purpose === 'report'
                                ? '보고'
                                : template.purpose}
                    </span>
                  )}
                </div>

                <div
                  className="bg-zinc-800 rounded-lg p-4 border 
                    border-zinc-700 max-h-[400px] overflow-y-auto"
                >
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {template.content}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : null}

        {template && (
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg 
                    transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg 
                    transition-colors disabled:opacity-50"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  복사하기
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
