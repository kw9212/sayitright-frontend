/**
 * TemplatesPage 단위 테스트
 */

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TemplatesPage from './page';
import * as authContext from '@/lib/auth/auth-context';
import { templatesRepository } from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import * as guestLimits from '@/lib/storage/guest-limits';
import { toast } from 'sonner';

jest.mock('@/lib/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/repositories/templates.repository', () => ({
  templatesRepository: { list: jest.fn(), remove: jest.fn() },
}));
jest.mock('@/lib/repositories/guest-templates.repository', () => ({
  guestTemplatesRepository: { list: jest.fn(), remove: jest.fn() },
}));
jest.mock('@/lib/storage/guest-limits', () => ({
  decrementTemplateCount: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn(), promise: jest.fn() },
}));

jest.mock('./components/TemplateCard', () => ({
  __esModule: true,
  default: ({
    template,
    isDeleteMode,
    isSelected,
    onToggleSelect,
    onViewDetails,
  }: {
    template: { id: string; title: string };
    isDeleteMode: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    onViewDetails: () => void;
  }) => (
    <div data-testid={`template-card-${template.id}`}>
      <span>{template.title}</span>
      {isDeleteMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          data-testid={`checkbox-${template.id}`}
        />
      )}
      <button onClick={onViewDetails} data-testid={`view-${template.id}`}>
        보기
      </button>
    </div>
  ),
}));
jest.mock('./components/TemplateFilters', () => ({
  __esModule: true,
  default: ({ onFiltersChange }: { onFiltersChange: (f: Record<string, string>) => void }) => (
    <div data-testid="template-filters">
      <button
        onClick={() =>
          onFiltersChange({ q: '검색', tone: '', relationship: '', purpose: '', from: '', to: '' })
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
jest.mock('./components/TemplateDetailModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/layout/MainHeader', () => ({
  MainHeader: ({ title }: { title: string }) => <header>{title}</header>,
}));

const makeTemplates = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    title: `템플릿 ${i + 1}`,
    content: `내용 ${i + 1}`,
    tone: 'formal',
    createdAt: '2024-01-15T10:00:00Z',
  }));

const mockListResponse = (items: ReturnType<typeof makeTemplates>, total?: number) => ({
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

describe('TemplatesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'authenticated' });
  });

  describe('로딩 상태', () => {
    it('auth.status가 loading이면 "로딩 중..."을 표시한다', () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'loading' });
      renderWithQueryClient(<TemplatesPage />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('데이터 로드 중에는 스피너를 표시한다', async () => {
      (templatesRepository.list as jest.Mock).mockImplementation(() => new Promise(() => {}));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByText('불러오는 중...')).toBeInTheDocument());
    });
  });

  describe('초기 렌더링', () => {
    it('템플릿 목록을 표시한다', async () => {
      const templates = makeTemplates(3);
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(templates));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => {
        expect(screen.getByTestId('template-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('template-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('template-card-3')).toBeInTheDocument();
      });
    });

    it('총 개수를 표시한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(
        mockListResponse(makeTemplates(5), 5),
      );
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByText('총 5개의 템플릿')).toBeInTheDocument());
    });

    it('템플릿이 없으면 빈 상태 메시지를 표시한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([], 0));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() =>
        expect(screen.getByText('저장된 템플릿이 없습니다.')).toBeInTheDocument(),
      );
    });

    it('authenticated 모드에서는 templatesRepository.list를 호출한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() =>
        expect(templatesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 20 }),
        ),
      );
    });

    it('guest 모드에서는 guestTemplatesRepository.list를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestTemplatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() =>
        expect(guestTemplatesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 20 }),
        ),
      );
    });
  });

  describe('에러 처리', () => {
    it('조회 실패 시 에러 토스트를 표시한다', async () => {
      (templatesRepository.list as jest.Mock).mockRejectedValue(new Error('Network error'));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Network error'));
    });

    it('"로그인이 필요" 오류 시 세션 만료 토스트를 표시한다', async () => {
      (templatesRepository.list as jest.Mock).mockRejectedValue(new Error('로그인이 필요합니다.'));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('세션이 만료되었습니다. 다시 로그인해주세요.'),
      );
    });
  });

  describe('삭제 모드', () => {
    it('"삭제" 버튼 클릭 시 삭제 모드로 전환된다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    it('"취소" 버튼 클릭 시 일반 모드로 돌아온다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.queryByTestId('checkbox-1')).not.toBeInTheDocument();
    });

    it('삭제 모드에서 체크박스 클릭 시 선택된다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));

      expect(screen.getByRole('button', { name: '삭제 (1)' })).toBeInTheDocument();
    });

    it('전체 선택 버튼이 동작한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(3)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByRole('button', { name: /전체 선택/ }));

      expect(screen.getByRole('button', { name: '삭제 (3)' })).toBeInTheDocument();
    });

    it('전체 선택 후 다시 클릭하면 전체 해제된다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByRole('button', { name: /전체 선택/ }));
      fireEvent.click(screen.getByRole('button', { name: /전체 해제/ }));

      const deleteBtn = screen.getByRole('button', { name: /^삭제 \(/ });
      expect(deleteBtn).toHaveTextContent('삭제 (0)');
    });

    it('선택 없이 삭제 클릭 시 삭제 버튼이 비활성화된다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));

      const deleteCountBtn = screen.getByRole('button', { name: /^삭제 \(/ });
      expect(deleteCountBtn).toBeDisabled();
    });
  });

  describe('삭제 확인 모달', () => {
    it('항목 선택 후 삭제 클릭 시 모달이 열린다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('모달에서 취소 클릭 시 모달이 닫힌다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));
      fireEvent.click(screen.getByTestId('cancel-delete'));

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    it('모달에서 확인 클릭 시 templatesRepository.remove를 호출한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      (templatesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));
      fireEvent.click(screen.getByTestId('confirm-delete'));

      await waitFor(() => expect(templatesRepository.remove).toHaveBeenCalledWith('1'));
    });

    it('삭제 성공 시 toast.success를 호출한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      (templatesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('1개 템플릿이 삭제되었습니다.'),
      );
    });

    it('게스트 모드 삭제 성공 시 decrementTemplateCount를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestTemplatesRepository.list as jest.Mock).mockResolvedValue(
        mockListResponse(makeTemplates(1)),
      );
      (guestTemplatesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });

      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: '삭제 (1)' }));

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => expect(guestLimits.decrementTemplateCount).toHaveBeenCalled());
    });
  });

  describe('필터', () => {
    it('필터 변경 시 목록을 새로 조회한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      const callCountBefore = (templatesRepository.list as jest.Mock).mock.calls.length;
      fireEvent.click(screen.getByTestId('apply-filter'));

      await waitFor(() =>
        expect((templatesRepository.list as jest.Mock).mock.calls.length).toBeGreaterThan(
          callCountBefore,
        ),
      );
    });

    it('필터 적용 시 q 파라미터를 포함해 호출한다', async () => {
      (templatesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeTemplates(2)));
      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('apply-filter'));

      await waitFor(() =>
        expect(templatesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ q: '검색', page: 1 }),
        ),
      );
    });
  });

  describe('무한 스크롤', () => {
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

      (templatesRepository.list as jest.Mock).mockResolvedValue(
        mockListResponse(makeTemplates(3), 10),
      );

      renderWithQueryClient(<TemplatesPage />);
      await waitFor(() => expect(screen.getByTestId('template-card-1')).toBeInTheDocument());

      await waitFor(() => expect(ioCallback).not.toBeNull());

      await act(async () => {
        ioCallback!([{ isIntersecting: true }]);
        await Promise.resolve();
      });

      await waitFor(() =>
        expect(templatesRepository.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })),
      );

      Object.defineProperty(global, 'IntersectionObserver', {
        value: jest.fn(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() })),
        writable: true,
        configurable: true,
      });
    });
  });
});
