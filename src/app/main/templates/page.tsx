'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { MainHeader } from '@/components/layout/MainHeader';
import { templatesRepository } from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import { decrementTemplateCount } from '@/lib/storage/guest-limits';
import TemplateCard from './components/TemplateCard';
import TemplateFilters from './components/TemplateFilters';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import TemplateDetailModal from './components/TemplateDetailModal';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TemplatesPage() {
  const auth = useAuth();
  const isGuest = auth.status === 'guest';
  const queryClient = useQueryClient();

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

  // TanStack Query로 무한 스크롤 구현
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ['templates', filters, isGuest],
      queryFn: async ({ pageParam = 1 }) => {
        const apiFilters = {
          ...filters,
          q: filters.q?.trim() || '',
        };
        const repository = isGuest ? guestTemplatesRepository : templatesRepository;
        return repository.list({
          page: pageParam,
          limit: 20,
          ...apiFilters,
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        const currentTotal = allPages.reduce((sum, page) => sum + page.data.items.length, 0);
        return currentTotal < lastPage.data.total ? allPages.length + 1 : undefined;
      },
      initialPageParam: 1,
      enabled: auth.status === 'authenticated' || auth.status === 'guest',
      staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    });

  // IntersectionObserver로 자동 페이지 로드
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 에러 처리
  useEffect(() => {
    if (isError) {
      const errorMessage = error instanceof Error ? error.message : '템플릿 조회에 실패했습니다.';

      if (errorMessage.includes('로그인이 필요')) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          window.location.href = '/intro';
        }, 3000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [isError, error]);

  // 데이터 변환
  const templates = data?.pages.flatMap((page) => page.data.items) ?? [];
  const total = data?.pages[0]?.data.total ?? 0;

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const repository = isGuest ? guestTemplatesRepository : templatesRepository;
      await Promise.all(ids.map((id) => repository.remove(id)));
    },
    onSuccess: (_, deletedIds) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['templates'] });

      // 게스트 모드: 사용량 카운트 감소
      if (isGuest) {
        deletedIds.forEach(() => decrementTemplateCount());
      }

      setSelectedIds(new Set());
      setShowDeleteModal(false);
      setIsDeleteMode(false);
      toast.success(`${deletedIds.length}개 템플릿이 삭제되었습니다.`);
    },
    onError: (error) => {
      console.error('삭제 실패:', error);
      toast.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    },
  });

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
    deleteMutation.mutate(Array.from(selectedIds));
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
          {templates.length === 0 && !isLoading ? (
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

          {(isLoading || isFetchingNextPage) && (
            <div className="text-center py-8 text-zinc-400">
              <div className="inline-block w-8 h-8 border-4 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-2">불러오는 중...</p>
            </div>
          )}

          <div ref={observerTarget} className="h-20" />

          {!hasNextPage && templates.length > 0 && (
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
          queryClient.invalidateQueries({ queryKey: ['templates'] });
        }}
      />
    </main>
  );
}
