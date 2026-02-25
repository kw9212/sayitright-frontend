/**
 * NotesPage 단위 테스트
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotesPage from './page';
import * as authContext from '@/lib/auth/auth-context';
import { notesRepository } from '@/lib/repositories/notes.repository';
import { guestNotesRepository } from '@/lib/repositories/guest-notes.repository';
import * as guestLimits from '@/lib/storage/guest-limits';
import { tokenStore } from '@/lib/auth/token';
import { toast } from 'sonner';

jest.mock('@/lib/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/repositories/notes.repository', () => ({
  notesRepository: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleStar: jest.fn(),
  },
}));
jest.mock('@/lib/repositories/guest-notes.repository', () => ({
  guestNotesRepository: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleStar: jest.fn(),
  },
}));
jest.mock('@/lib/storage/guest-limits', () => ({
  incrementNoteCount: jest.fn(),
  decrementNoteCount: jest.fn(),
}));
jest.mock('@/lib/auth/token', () => ({
  tokenStore: { getAccessToken: jest.fn(), setAccessToken: jest.fn() },
}));
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('./components/NoteItem', () => ({
  NoteItem: ({
    note,
    isDeleteMode,
    isSelected,
    onToggleSelect,
    onToggleStar,
    onEdit,
  }: {
    note: { id: string; term: string; isStarred: boolean };
    isDeleteMode: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onToggleStar: (id: string) => void;
    onEdit: (note: { id: string; term: string }) => void;
  }) => (
    <div data-testid={`note-item-${note.id}`}>
      <span>{note.term}</span>
      {isDeleteMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(note.id)}
          data-testid={`checkbox-${note.id}`}
        />
      )}
      <button onClick={() => onToggleStar(note.id)} data-testid={`star-${note.id}`}>
        {note.isStarred ? '★' : '☆'}
      </button>
      <button onClick={() => onEdit(note)} data-testid={`edit-${note.id}`}>
        수정
      </button>
    </div>
  ),
}));
jest.mock('./components/NoteEditModal', () => ({
  NoteEditModal: ({
    isOpen,
    onClose,
    onSave,
    note,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { term: string }) => Promise<void>;
    note: { term: string } | null;
  }) =>
    isOpen ? (
      <div data-testid="note-edit-modal">
        <button onClick={onClose} data-testid="close-modal">
          닫기
        </button>
        <button
          onClick={() => onSave({ term: note ? `수정된 ${note.term}` : '새 용어' })}
          data-testid="save-note"
        >
          저장
        </button>
      </div>
    ) : null,
}));
jest.mock('./components/DeleteConfirmModal', () => ({
  DeleteConfirmModal: ({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div data-testid="delete-confirm-modal">
        <button onClick={onClose} data-testid="cancel-delete">
          취소
        </button>
        <button onClick={onConfirm} data-testid="confirm-delete">
          확인
        </button>
      </div>
    ) : null,
}));
jest.mock('@/components/layout/MainHeader', () => ({
  MainHeader: ({ title }: { title: string }) => <header>{title}</header>,
}));

const makeNotes = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    term: `용어 ${i + 1}`,
    description: `설명 ${i + 1}`,
    isStarred: false,
    createdAt: '2024-01-15T10:00:00Z',
  }));

const mockListResponse = (notes: ReturnType<typeof makeNotes>, total?: number) => ({
  notes,
  pagination: {
    page: 1,
    limit: 10,
    total: total ?? notes.length,
    totalPages: Math.ceil((total ?? notes.length) / 10),
  },
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

describe('NotesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'authenticated' });
    (tokenStore.getAccessToken as jest.Mock).mockReturnValue('token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { accessToken: 'new-token' } }),
    });
  });

  describe('로딩 상태', () => {
    it('auth.status가 loading이 아니면 null을 반환하지 않는다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByText('용어 노트')).toBeInTheDocument());
    });

    it('데이터 로드 중에는 "로딩 중..."을 표시한다', async () => {
      (notesRepository.list as jest.Mock).mockImplementation(() => new Promise(() => {}));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByText('로딩 중...')).toBeInTheDocument());
    });
  });

  describe('초기 렌더링', () => {
    it('용어 목록을 표시한다', async () => {
      const notes = makeNotes(3);
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(notes));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => {
        expect(screen.getByTestId('note-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('note-item-2')).toBeInTheDocument();
        expect(screen.getByTestId('note-item-3')).toBeInTheDocument();
      });
    });

    it('총 개수를 표시한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(5), 5));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByText('총 5개의 용어')).toBeInTheDocument());
    });

    it('용어가 없으면 빈 상태 메시지를 표시한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([], 0));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByText('저장된 용어가 없습니다.')).toBeInTheDocument());
    });

    it('authenticated 모드에서는 notesRepository.list를 호출한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() =>
        expect(notesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 10 }),
        ),
      );
    });

    it('guest 모드에서는 guestNotesRepository.list를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestNotesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() =>
        expect(guestNotesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 10 }),
        ),
      );
    });
  });

  describe('에러 처리', () => {
    it('조회 실패 시 에러 토스트를 표시한다', async () => {
      (notesRepository.list as jest.Mock).mockRejectedValue(new Error('Network error'));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Network error'));
    });
  });

  describe('검색', () => {
    it('검색 버튼 클릭 시 검색어로 목록을 조회한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      const searchInput = screen.getByPlaceholderText('용어, 설명, 예시 검색...');
      fireEvent.change(searchInput, { target: { value: '검색어' } });
      fireEvent.click(screen.getByRole('button', { name: '검색' }));

      await waitFor(() =>
        expect(notesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ q: '검색어', page: 1 }),
        ),
      );
    });

    it('Enter 키 입력 시 검색을 실행한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      const searchInput = screen.getByPlaceholderText('용어, 설명, 예시 검색...');
      fireEvent.change(searchInput, { target: { value: '검색' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() =>
        expect(notesRepository.list).toHaveBeenCalledWith(
          expect.objectContaining({ q: '검색', page: 1 }),
        ),
      );
    });
  });

  describe('삭제 모드', () => {
    it('"선택 삭제" 버튼 클릭 시 삭제 모드로 전환된다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });

    it('"취소" 버튼 클릭 시 일반 모드로 돌아온다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));
      fireEvent.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.queryByTestId('checkbox-1')).not.toBeInTheDocument();
    });

    it('체크박스 클릭 시 선택된다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));

      expect(screen.getByRole('button', { name: /삭제 \(1\)/ })).toBeInTheDocument();
    });

    it('선택 없이 삭제 클릭 시 삭제 버튼이 비활성화된다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));

      const deleteBtn = screen.getByRole('button', { name: /삭제 \(0\)/ });
      expect(deleteBtn).toBeDisabled();
    });
  });

  describe('삭제 확인 모달', () => {
    it('항목 선택 후 삭제 클릭 시 모달이 열린다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: /삭제 \(1\)/ }));

      expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
    });

    it('모달에서 확인 클릭 시 삭제를 실행한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(2)));
      (notesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: /삭제 \(1\)/ }));
      fireEvent.click(screen.getByTestId('confirm-delete'));

      await waitFor(() => expect(notesRepository.remove).toHaveBeenCalledWith('1'));
    });

    it('게스트 모드 삭제 성공 시 decrementNoteCount를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestNotesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(1)));
      (guestNotesRepository.remove as jest.Mock).mockResolvedValue({ ok: true });
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '선택 삭제' }));
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByRole('button', { name: /삭제 \(1\)/ }));

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      await waitFor(() => expect(guestLimits.decrementNoteCount).toHaveBeenCalled());
    });
  });

  describe('용어 추가/수정', () => {
    it('"추가" 버튼 클릭 시 편집 모달이 열린다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByRole('button', { name: /추가/ })).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /추가/ }));

      expect(screen.getByTestId('note-edit-modal')).toBeInTheDocument();
    });

    it('용어 저장 시 notesRepository.create를 호출한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      (notesRepository.create as jest.Mock).mockResolvedValue({ id: '1', term: '새 용어' });
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByRole('button', { name: /추가/ })).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /추가/ }));
      fireEvent.click(screen.getByTestId('save-note'));

      await waitFor(() => expect(notesRepository.create).toHaveBeenCalledWith({ term: '새 용어' }));
    });

    it('게스트 모드 용어 추가 시 incrementNoteCount를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestNotesRepository.list as jest.Mock).mockResolvedValue(mockListResponse([]));
      (guestNotesRepository.create as jest.Mock).mockResolvedValue({ id: '1', term: '새 용어' });
      renderWithQueryClient(<NotesPage />);
      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /추가/ }).length).toBeGreaterThan(0),
      );

      fireEvent.click(screen.getAllByRole('button', { name: /추가/ })[0]);
      fireEvent.click(screen.getByTestId('save-note'));

      await waitFor(() => expect(guestLimits.incrementNoteCount).toHaveBeenCalled());
    });

    it('수정 버튼 클릭 시 편집 모달이 열린다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(1)));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('edit-1'));

      expect(screen.getByTestId('note-edit-modal')).toBeInTheDocument();
    });

    it('용어 수정 시 notesRepository.update를 호출한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(1)));
      (notesRepository.update as jest.Mock).mockResolvedValue({ id: '1', term: '수정된 용어 1' });
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('edit-1'));
      fireEvent.click(screen.getByTestId('save-note'));

      await waitFor(() =>
        expect(notesRepository.update).toHaveBeenCalledWith('1', { term: '수정된 용어 1' }),
      );
    });
  });

  describe('중요 표시', () => {
    it('별 버튼 클릭 시 toggleStar를 호출한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(1)));
      (notesRepository.toggleStar as jest.Mock).mockResolvedValue({ id: '1', isStarred: true });
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByTestId('note-item-1')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('star-1'));

      await waitFor(() => expect(notesRepository.toggleStar).toHaveBeenCalledWith('1'));
    });
  });

  describe('페이지네이션', () => {
    it('다음 페이지 버튼 클릭 시 페이지가 증가한다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(10), 20));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByText('1 / 2')).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: '다음' }));

      await waitFor(() =>
        expect(notesRepository.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })),
      );
    });

    it('이전 페이지 버튼이 첫 페이지에서 비활성화된다', async () => {
      (notesRepository.list as jest.Mock).mockResolvedValue(mockListResponse(makeNotes(10), 20));
      renderWithQueryClient(<NotesPage />);
      await waitFor(() => expect(screen.getByText('1 / 2')).toBeInTheDocument());

      const prevBtn = screen.getByRole('button', { name: '이전' });
      expect(prevBtn).toBeDisabled();
    });
  });
});
