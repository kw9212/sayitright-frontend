'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { MainHeader } from '@/components/layout/MainHeader';
import { archivesRepository } from '@/lib/repositories/archives.repository';
import { guestArchivesRepository } from '@/lib/repositories/guest-archives.repository';
import { decrementArchiveCount } from '@/lib/storage/guest-limits';
import ArchiveRow from './components/ArchiveRow';
import ArchiveFilters from './components/ArchiveFilters';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ConvertToTemplateModal from './components/ConvertToTemplateModal';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ArchivesPage() {
  const auth = useAuth();
  const isGuest = auth.status === 'guest';
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    tone: '',
    relationship: '',
    purpose: '',
    from: '',
    to: '',
  });

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // TanStack Query로 무한 스크롤 구현
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ['archives', filters, isGuest],
      queryFn: async ({ pageParam = 1 }) => {
        const repository = isGuest ? guestArchivesRepository : archivesRepository;
        return repository.list({
          page: pageParam,
          limit: 20,
          ...filters,
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

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const repository = isGuest ? guestArchivesRepository : archivesRepository;
      await Promise.all(ids.map((id) => repository.remove(id)));
    },
    onSuccess: (_, deletedIds) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['archives'] });

      // 게스트 모드: 사용량 카운트 감소
      if (isGuest) {
        deletedIds.forEach(() => decrementArchiveCount());
      }

      setSelectedIds(new Set());
      setShowDeleteModal(false);
      setIsDeleteMode(false);
      toast.success(`${deletedIds.length}개 아카이브가 삭제되었습니다.`);
    },
    onError: (error) => {
      console.error('삭제 실패:', error);
      toast.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    },
  });

  // 에러 처리
  useEffect(() => {
    if (isError) {
      const errorMessage = error instanceof Error ? error.message : '아카이브 조회에 실패했습니다.';

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
  const archives = data?.pages.flatMap((page) => page.data.items) ?? [];
  const total = data?.pages[0]?.data.total ?? 0;

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
    if (selectedIds.size === archives.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(archives.map((a) => a.id)));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) {
      toast.error('삭제할 아카이브를 선택해주세요.');
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

  const selectedArchives = archives.filter((a) => selectedIds.has(a.id));

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <MainHeader title="아카이브" showBackButton />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 bg-blue-950/20 border border-blue-700/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0 mt-0.5"
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
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-blue-300">
                <strong>아카이브 보관 정책:</strong> 이메일 생성 시 자동으로 저장되며, 생성일로부터{' '}
                <strong>최대 7일</strong>까지 보관됩니다. 중요한 이메일은 템플릿으로 전환하여 영구
                보관하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-zinc-400">총 {total}개의 아카이브</p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {isDeleteMode && (
                <>
                  <button
                    onClick={toggleSelectAll}
                    className="px-3 sm:px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      {selectedIds.size === archives.length ? '전체 해제' : '전체 선택 (현재 목록)'}
                    </span>
                    <span className="sm:hidden">
                      {selectedIds.size === archives.length ? '전체 해제' : '전체 선택'}
                    </span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={selectedIds.size === 0}
                    className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 
                      disabled:cursor-not-allowed rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    삭제 ({selectedIds.size})
                  </button>
                </>
              )}

              <button
                onClick={toggleDeleteMode}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                  isDeleteMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeleteMode ? '취소' : '삭제'}
              </button>
            </div>
          </div>

          <ArchiveFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <div>
          {archives.length === 0 && !isLoading ? (
            <div className="text-center py-20 text-zinc-400">
              <p className="text-xl mb-2">아카이브가 없습니다.</p>
              <p className="text-sm">이메일을 생성하면 자동으로 7일간 저장됩니다.</p>
            </div>
          ) : (
            <div className="space-y-1 bg-zinc-900 rounded-lg border border-zinc-800 p-1 sm:p-2">
              {archives.map((archive) => (
                <ArchiveRow
                  key={archive.id}
                  archive={archive}
                  isDeleteMode={isDeleteMode}
                  isSelected={selectedIds.has(archive.id)}
                  onToggleSelect={() => toggleSelect(archive.id)}
                  onViewDetails={() => setSelectedArchiveId(archive.id)}
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
          {!hasNextPage && archives.length > 0 && (
            <div className="text-center py-8 text-zinc-500">모든 아카이브를 불러왔습니다.</div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        archives={selectedArchives}
        isOpen={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConvertToTemplateModal
        archiveId={selectedArchiveId}
        onClose={() => setSelectedArchiveId(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['archives'] });
        }}
      />
    </main>
  );
}
