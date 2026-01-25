'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { MainHeader } from '@/components/layout/MainHeader';
import {
  templatesRepository,
  type TemplateListItem,
} from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import { decrementTemplateCount } from '@/lib/storage/guest-limits';
import TemplateCard from './components/TemplateCard';
import TemplateFilters from './components/TemplateFilters';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import TemplateDetailModal from './components/TemplateDetailModal';

export default function TemplatesPage() {
  const auth = useAuth();
  const isGuest = auth.status === 'guest';

  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    q: '',
    tone: '',
    relationship: '',
    purpose: '',
    from: '',
    to: '',
  });

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  const requestIdRef = useRef(0);

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const initialLoadDoneRef = useRef(false);

  const fetchTemplates = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      if (!reset && !hasMoreRef.current) {
        return;
      }

      if (pageNum > 100) {
        setHasMore(false);
        return;
      }

      const requestId = ++requestIdRef.current;

      setLoading(true);
      try {
        const apiFilters = {
          ...filters,
          q: filters.q?.trim() || '',
        };

        const repository = isGuest ? guestTemplatesRepository : templatesRepository;
        const response = await repository.list({
          page: pageNum,
          limit: 20,
          ...apiFilters,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response.ok) {
          const newTemplates = response.data.items;
          const serverTotal = response.data.total;

          if (newTemplates.length === 0) {
            setHasMore(false);
            setTotal(serverTotal);

            if (reset) {
              setTemplates([]);
            }

            return;
          }

          let nextTotalLoaded = 0;
          setTemplates((prev) => {
            const updatedTemplates = reset ? newTemplates : [...prev, ...newTemplates];
            nextTotalLoaded = updatedTemplates.length;
            return updatedTemplates;
          });

          const hasMoreValue = nextTotalLoaded < serverTotal;
          setHasMore(hasMoreValue);

          setTotal(serverTotal);
        }
      } catch (error) {
        console.error('Templates 조회 실패:', error);

        setHasMore(false);

        const errorMessage = error instanceof Error ? error.message : '템플릿 조회에 실패했습니다.';

        if (errorMessage.includes('로그인이 필요')) {
          toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
          setTimeout(() => {
            window.location.href = '/intro';
          }, 3000);
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [filters, loading],
  );

  useEffect(() => {
    if (
      (auth.status === 'authenticated' || auth.status === 'guest') &&
      !initialLoadDoneRef.current
    ) {
      initialLoadDoneRef.current = true;
      setPage(1);
      setHasMore(true);
      void fetchTemplates(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status]);

  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      return;
    }

    setPage(1);
    setHasMore(true);
    void fetchTemplates(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        (auth.status === 'authenticated' || auth.status === 'guest') &&
        templates.length === 0 &&
        !loading &&
        initialLoadDoneRef.current === false
      ) {
        initialLoadDoneRef.current = true;
        setPage(1);
        setHasMore(true);
        void fetchTemplates(1, true);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, templates.length, loading]);

  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      return;
    }

    if (!hasMoreRef.current) {
      return;
    }

    if (templates.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting;

        if (isIntersecting && hasMoreRef.current && !loading && templates.length > 0) {
          const nextPage = page + 1;
          setPage(nextPage);
          void fetchTemplates(nextPage, false);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [page, loading, fetchTemplates, hasMore, templates.length]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(templates.map((t) => t.id)));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) {
      toast.error('삭제할 템플릿을 선택해주세요.');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const count = selectedIds.size;
    const repository = isGuest ? guestTemplatesRepository : templatesRepository;

    toast.promise(Promise.all(Array.from(selectedIds).map((id) => repository.remove(id))), {
      loading: `${count}개 템플릿 삭제 중...`,
      success: () => {
        setTemplates((prev) => prev.filter((t) => !selectedIds.has(t.id)));
        setTotal((prev) => prev - count);
        setSelectedIds(new Set());
        setShowDeleteModal(false);
        setIsDeleteMode(false);

        // 게스트 모드: 사용량 카운트 감소
        if (isGuest) {
          Array.from(selectedIds).forEach(() => decrementTemplateCount());
        }

        return `${count}개 템플릿이 삭제되었습니다.`;
      },
      error: (error) => {
        console.error('삭제 실패:', error);
        return error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.';
      },
    });
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  if (auth.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>로딩 중...</div>
      </div>
    );
  }

  const selectedTemplates = templates.filter((t) => selectedIds.has(t.id));

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <MainHeader title="템플릿" showBackButton />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-zinc-400">총 {total}개의 템플릿</p>
            </div>

            <div className="flex gap-3">
              {isDeleteMode && (
                <>
                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 
                    rounded-lg transition-colors text-sm"
                  >
                    {selectedIds.size === templates.length ? '전체 해제' : '전체 선택 (현재 목록)'}
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={selectedIds.size === 0}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 
                      disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    삭제 ({selectedIds.size})
                  </button>
                </>
              )}

              <button
                onClick={toggleDeleteMode}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDeleteMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeleteMode ? '취소' : '삭제'}
              </button>
            </div>
          </div>

          <TemplateFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <div>
          {templates.length === 0 && !loading ? (
            <div className="text-center py-20 text-zinc-400">
              <p className="text-xl mb-2">저장된 템플릿이 없습니다.</p>
              <p className="text-sm">
                이메일 생성 후 &apos;템플릿으로 저장&apos; 버튼을 눌러 저장하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isDeleteMode={isDeleteMode}
                  isSelected={selectedIds.has(template.id)}
                  onToggleSelect={() => toggleSelect(template.id)}
                  onViewDetails={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-zinc-400">
              <div className="inline-block w-8 h-8 border-4 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-2">불러오는 중...</p>
            </div>
          )}

          <div ref={observerTarget} className="h-20" />

          {!hasMore && templates.length > 0 && (
            <div className="text-center py-8 text-zinc-500">모든 템플릿을 불러왔습니다.</div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        templates={selectedTemplates}
        isOpen={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <TemplateDetailModal
        templateId={selectedTemplateId}
        onClose={() => setSelectedTemplateId(null)}
        onUpdate={() => {
          setPage(1);
          setHasMore(true);
          void fetchTemplates(1, true);
        }}
      />
    </main>
  );
}
