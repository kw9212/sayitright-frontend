/**
 * ArchivesPage 단위 테스트
 */

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArchivesPage from './page';
import * as authContext from '@/lib/auth/auth-context';
import { archivesRepository } from '@/lib/repositories/archives.repository';
import { guestArchivesRepository } from '@/lib/repositories/guest-archives.repository';
import * as guestLimits from '@/lib/storage/guest-limits';
import { toast } from 'sonner';

jest.mock('@/lib/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/repositories/archives.repository', () => ({
  archivesRepository: { list: jest.fn(), remove: jest.fn() },
}));
jest.mock('@/lib/repositories/guest-archives.repository', () => ({
  guestArchivesRepository: { list: jest.fn(), remove: jest.fn() },
}));
jest.mock('@/lib/storage/guest-limits', () => ({
  decrementArchiveCount: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn(), promise: jest.fn() },
}));

// 하위 컴포넌트 mock
jest.mock('./components/ArchiveRow', () => ({
  __esModule: true,
  default: ({
    archive,
    isDeleteMode,
    isSelected,
    onToggleSelect,
    onViewDetails,
  }: {
    archive: { id: string; content: string };
    isDeleteMode: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    onViewDetails: () => void;
  }) => (
    <div data-testid={`archive-row-${archive.id}`}>
      <span>{archive.content}</span>
      {isDeleteMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          data-testid={`checkbox-${archive.id}`}
        />
      )}
      <button onClick={onViewDetails} data-testid={`view-${archive.id}`}>
        보기
      </button>
    </div>
  ),
}));
jest.mock('./components/ArchiveFilters', () => ({
  __esModule: true,
  default: ({ onFiltersChange }: { onFiltersChange: (f: Record<string, string>) => void }) => (
    <div data-testid="archive-filters">
      <button
        onClick={() =>
          onFiltersChange({ tone: 'formal', relationship: '', purpose: '', from: '', to: '' })
        }
        data-testid="apply-filter"
      >
        필터 적용
      </button>
    </div>
  ),
}));
jest.mock('./components/DeleteConfirmModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onConfirm} data-testid="confirm-delete">
          확인
        </button>
        <button onClick={onCancel} data-testid="cancel-delete">
          취소
        </button>
      </div>
    ) : null,
}));
jest.mock('./components/ConvertToTemplateModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/layout/MainHeader', () => ({
  MainHeader: ({ title }: { title: string }) => <header>{title}</header>,
}));

const makeArchives = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    content: `아카이브 ${i + 1}`,
    tone: 'formal',
    createdAt: '2024-01-15T10:00:00Z',
  }));

const mockListResponse = (items: ReturnType<typeof makeArchives>, total?: number) => ({
  ok: true,
  data: { items, total: total ?? items.length },
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ArchivesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'authenticated' });
  });

  // ─── 로딩 상태 ────────────────────────────────────────────────────────────

  describe('로딩 상태', () => {
    it('auth.status가 loading이면 "로딩 중..."을 표시한다', () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'loading' });
      renderWithQueryClient(<ArchivesPage />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('데이터 로드 중에는 스피너를 표시한다', async () => {
      (archivesRepository.list as jest.Mock).mockImplementation(() => new Promise(() => {}));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByText('불러오는 중...')).toBeInTheDocument());
    });
  });

  // ─── 초기 렌더링 ──────────────────────────────────────────────────────────

  describe('초기 렌더링', () => {
    it('아카이브 목록을 표시한다', async () => {
      const archives = makeArchives(3);
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(archives));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-1')).toBeInTheDocument();
        expect(screen.getByTestId('archive-row-2')).toBeInTheDocument();
        expect(screen.getByTestId('archive-row-3')).toBeInTheDocument();
      });
    });

    it('총 개수를 표시한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(
        mockListResponse(makeArchives(5), 5),
      );
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByText('총 5개의 아카이브')).toBeInTheDocument());
    });

    it('아카이브가 없으면 빈 상태 메시지를 표시한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([], 0));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByText('아카이브가 없습니다.')).toBeInTheDocument());
    });

    it('authenticated 모드에서는 archivesRepository.list를 호출한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() =>
        expect(archivesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 20 }),
        ),
      );
    });

    it('guest 모드에서는 guestArchivesRepository.list를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestArchivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() =>
        expect(guestArchivesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 20 }),
        ),
      );
    });
  });

  // ─── 에러 처리 ────────────────────────────────────────────────────────────

  describe('에러 처리', () => {
    it('조회 실패 시 에러 토스트를 표시한다', async () => {
      (archivesRepository.list as jest.Mock).mockRejectedValue(new Error('Network error'));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Network error'));
    });

    it('"로그인이 필요" 오류 시 세션 만료 토스트를 표시한다', async () => {
      (archivesRepository.list as jest.Mock).mockRejectedValue(new Error('로그인이 필요합니다.'));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('세션이 만료되었습니다. 다시 로그인해주세요.'),
      );
    });
  });

  // ─── 삭제 모드 ────────────────────────────────────────────────────────────

  describe('삭제 모드', () => {
    it('"삭제" 버튼 클릭 시 삭제 모드로 전환된다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    it('"취소" 버튼 클릭 시 일반 모드로 돌아온다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.queryByTestId('checkbox-1')).not.toBeInTheDocument();
    });

    it('삭제 모드에서 체크박스 클릭 시 선택된다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));

      expect(screen.getByRole('button', { name: '삭제 (1)' })).toBeInTheDocument();
    });

    it('전체 선택 버튼이 동작한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(3)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByRole('button', { name: /전체 선택/ }));

      expect(screen.getByRole('button', { name: '삭제 (3)' })).toBeInTheDocument();
    });

    it('전체 선택 후 다시 클릭하면 전체 해제된다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByRole('button', { name: /전체 선택/ }));
      fireEvent.click(screen.getByRole('button', { name: /전체 해제/ }));

      const deleteBtn = screen.getByRole('button', { name: /^삭제 \(/ });
      expect(deleteBtn).toHaveTextContent('삭제 (0)');
    });

    it('선택 없이 삭제 클릭 시 삭제 버튼이 비활성화된다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));

      const deleteCountBtn = screen.getByRole('button', { name: /^삭제 \(/ });
      expect(deleteCountBtn).toBeDisabled();
    });
  });

  // ─── 삭제 확인 모달 ───────────────────────────────────────────────────────

  describe('삭제 확인 모달', () => {
    it('항목 선택 후 삭제 클릭 시 모달이 열린다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('모달에서 취소 클릭 시 모달이 닫힌다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));
      fireEvent.click(screen.getByTestId('cancel-delete'));

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    it('모달에서 확인 클릭 시 archivesRepository.remove를 호출한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      (archivesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));
      fireEvent.click(screen.getByTestId('confirm-delete'));

      await waitFor(() => expect(archivesRepository.remove).toHaveBeenCalledWith('1'));
    });

    it('삭제 성공 시 toast.success를 호출한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      (archivesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('1개 아카이브가 삭제되었습니다.'),
      );
    });

    it('게스트 모드 삭제 성공 시 decrementArchiveCount를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestArchivesRepository.list as jest.Mock).mockResolvedValue(
        mockListResponse(makeArchives(1)),
      );
      (guestArchivesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });

      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => expect(guestLimits.decrementArchiveCount).toHaveBeenCalled());
    });
  });

  // ─── 필터 ─────────────────────────────────────────────────────────────────

  describe('필터', () => {
    it('필터 변경 시 목록을 새로 조회한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      const callCountBefore = (archivesRepository.list as jest.Mock).mock.calls.length;
      fireEvent.click(screen.getByTestId('apply-filter'));

      await waitFor(() =>
        expect((archivesRepository.list as jest.Mock).mock.calls.length).toBeGreaterThan(
          callCountBefore,
        ),
      );
    });

    it('필터 적용 시 tone 파라미터를 포함해 호출한다', async () => {
      (archivesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeArchives(2)));
      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('apply-filter'));

      await waitFor(() =>
        expect(archivesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ tone: 'formal', page: 1 }),
        ),
      );
    });
  });

  // ─── 모든 목록 로드 완료 ─────────────────────────────────────────────────

  describe('모든 목록 로드 완료', () => {
    it('IntersectionObserver가 교차되면 다음 페이지를 호출한다', async () => {
      let ioCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
      const MockIO = jest.fn((cb: (entries: { isIntersecting: boolean }[]) => void) => {
        ioCallback = cb;
        return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
      });
      Object.defineProperty(global, 'IntersectionObserver', {
        value: MockIO,
        writable: true,
        configurable: true,
      });

      (archivesRepository.list as jest.Mock).mockResolvedValue(
        mockListResponse(makeArchives(3), 10),
      );

      renderWithQueryClient(<ArchivesPage />);
      await waitFor(() => expect(screen.getByTestId('archive-row-1')).toBeInTheDocument());

      await waitFor(() => expect(ioCallback).not.toBeNull());

      await act(async () => {
        ioCallback!([{ isIntersecting: true }]);
        await Promise.resolve();
      });

      await waitFor(() =>
        expect(archivesRepository.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })),
      );

      Object.defineProperty(global, 'IntersectionObserver', {
        value: jest.fn(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() })),
        writable: true,
        configurable: true,
      });
    });
  });
});
