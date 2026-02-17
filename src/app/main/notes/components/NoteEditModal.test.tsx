/**
 * NoteEditModal 컴포넌트 테스트
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditModal } from './NoteEditModal';
import * as authContext from '@/lib/auth/auth-context';
import * as guestLimits from '@/lib/storage/guest-limits';

// Mock dependencies
jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/storage/guest-limits', () => ({
  canCreateNote: jest.fn(),
}));

jest.mock('@/components/layout/GuestLimitModal', () => ({
  GuestLimitModal: ({ isOpen, limitType }: { isOpen: boolean; limitType: string }) =>
    isOpen ? <div data-testid="guest-limit-modal">한도 초과: {limitType}</div> : null,
}));

describe('NoteEditModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({
      status: 'authenticated',
      user: { id: 1, email: 'test@example.com' },
    });
    (guestLimits.canCreateNote as jest.Mock).mockReturnValue(true);
    mockOnSave.mockResolvedValue(undefined);
  });

  describe('렌더링', () => {
    it('모달이 열렸을 때 표시된다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByText('용어 추가')).toBeInTheDocument();
    });

    it('모달이 닫혔을 때 표시되지 않는다', () => {
      render(<NoteEditModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.queryByText('용어 추가')).not.toBeInTheDocument();
    });

    it('새 노트 추가 시 "용어 추가" 타이틀을 표시한다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByText('용어 추가')).toBeInTheDocument();
    });

    it('노트 수정 시 "용어 수정" 타이틀을 표시한다', () => {
      const note = {
        id: '1',
        term: 'Test Term',
        description: 'Test Description',
        example: 'Test Example',
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />);

      expect(screen.getByText('용어 수정')).toBeInTheDocument();
    });

    it('모든 폼 필드를 표시한다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByPlaceholderText('예: Cohort Analysis')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('예시')).toBeInTheDocument();
    });

    it('필수 필드에 별표를 표시한다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      // 용어 필드의 * 표시 확인 (HTML 구조 확인)
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('취소 및 저장 버튼을 표시한다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    });
  });

  describe('폼 입력', () => {
    it('용어를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const termInput = screen.getByPlaceholderText('예: Cohort Analysis');
      await user.type(termInput, 'Cohort Analysis');

      expect(termInput).toHaveValue('Cohort Analysis');
    });

    it('설명을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const descriptionInput = screen.getByLabelText('설명');
      await user.type(descriptionInput, 'Test description');

      expect(descriptionInput).toHaveValue('Test description');
    });

    it('예시를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const exampleInput = screen.getByLabelText('예시');
      await user.type(exampleInput, 'Test example');

      expect(exampleInput).toHaveValue('Test example');
    });

    it('용어 글자 수를 표시한다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByText('0/255자')).toBeInTheDocument();

      const termInput = screen.getByPlaceholderText('예: Cohort Analysis');
      await user.type(termInput, 'Test');

      expect(screen.getByText('4/255자')).toBeInTheDocument();
    });

    it('용어는 최대 255자까지 입력할 수 있다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const termInput = screen.getByPlaceholderText('예: Cohort Analysis');
      expect(termInput).toHaveAttribute('maxLength', '255');
    });
  });

  describe('기존 노트 수정', () => {
    it('기존 노트 데이터로 폼이 채워진다', () => {
      const note = {
        id: '1',
        term: 'Existing Term',
        description: 'Existing Description',
        example: 'Existing Example',
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />);

      expect(screen.getByPlaceholderText('예: Cohort Analysis')).toHaveValue('Existing Term');
      expect(screen.getByLabelText('설명')).toHaveValue('Existing Description');
      expect(screen.getByLabelText('예시')).toHaveValue('Existing Example');
    });

    it('description이 null인 경우 빈 문자열로 표시된다', () => {
      const note = {
        id: '1',
        term: 'Test Term',
        description: null,
        example: 'Test Example',
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />);

      expect(screen.getByLabelText('설명')).toHaveValue('');
    });

    it('example이 null인 경우 빈 문자열로 표시된다', () => {
      const note = {
        id: '1',
        term: 'Test Term',
        description: 'Test Description',
        example: null,
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />);

      expect(screen.getByLabelText('예시')).toHaveValue('');
    });

    it('note가 null에서 값으로 변경되면 폼이 채워진다', () => {
      const { rerender } = render(
        <NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={null} />,
      );

      expect(screen.getByPlaceholderText('예: Cohort Analysis')).toHaveValue('');

      const note = {
        id: '1',
        term: 'New Term',
        description: 'New Description',
        example: 'New Example',
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      rerender(
        <NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />,
      );

      expect(screen.getByPlaceholderText('예: Cohort Analysis')).toHaveValue('New Term');
    });
  });

  describe('폼 제출', () => {
    it('용어를 입력하고 저장 버튼을 클릭하면 onSave가 호출된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Test Term',
          description: undefined,
          example: undefined,
        });
      });
    });

    it('모든 필드를 입력하면 onSave에 전달된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.type(screen.getByLabelText('설명'), 'Test Description');
      await user.type(screen.getByLabelText('예시'), 'Test Example');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Test Term',
          description: 'Test Description',
          example: 'Test Example',
        });
      });
    });

    it('앞뒤 공백은 제거된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), '  Test Term  ');
      await user.type(screen.getByLabelText('설명'), '  Description  ');
      await user.type(screen.getByLabelText('예시'), '  Example  ');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Test Term',
          description: 'Description',
          example: 'Example',
        });
      });
    });

    it('빈 설명과 예시는 undefined로 전달된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.type(screen.getByLabelText('설명'), '   '); // 공백만
      await user.type(screen.getByLabelText('예시'), '   '); // 공백만
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Test Term',
          description: undefined,
          example: undefined,
        });
      });
    });

    it('저장 성공 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('저장 중에는 "저장 중..." 텍스트를 표시한다', async () => {
      const user = userEvent.setup();
      let resolveOnSave: () => void;
      const onSavePromise = new Promise<void>((resolve) => {
        resolveOnSave = resolve;
      });
      mockOnSave.mockReturnValue(onSavePromise);

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(screen.getByRole('button', { name: '저장 중...' })).toBeInTheDocument();

      resolveOnSave!();
    });

    it('저장 실패 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      const error = new Error('저장 실패');
      mockOnSave.mockRejectedValue(error);

      global.alert = jest.fn();
      global.console.error = jest.fn();

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('저장 실패');
      });
    });

    it('저장 실패 시 모달이 닫히지 않는다', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('저장 실패'));
      global.alert = jest.fn();

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('버튼 상태', () => {
    it('용어가 비어있으면 저장 버튼이 비활성화된다', () => {
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const saveButton = screen.getByRole('button', { name: '저장' });
      expect(saveButton).toBeDisabled();
    });

    it('용어가 공백만 있으면 저장 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), '   ');

      const saveButton = screen.getByRole('button', { name: '저장' });
      expect(saveButton).toBeDisabled();
    });

    it('용어가 입력되면 저장 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test');

      const saveButton = screen.getByRole('button', { name: '저장' });
      expect(saveButton).toBeEnabled();
    });

    it('저장 중에는 저장 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      let resolveOnSave: () => void;
      const onSavePromise = new Promise<void>((resolve) => {
        resolveOnSave = resolve;
      });
      mockOnSave.mockReturnValue(onSavePromise);

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      const saveButton = screen.getByRole('button', { name: '저장 중...' });
      expect(saveButton).toBeDisabled();

      resolveOnSave!();
    });

    it('저장 중에는 취소 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      let resolveOnSave: () => void;
      const onSavePromise = new Promise<void>((resolve) => {
        resolveOnSave = resolve;
      });
      mockOnSave.mockReturnValue(onSavePromise);

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      const cancelButton = screen.getByRole('button', { name: '취소' });
      expect(cancelButton).toBeDisabled();

      resolveOnSave!();
    });
  });

  describe('취소 버튼', () => {
    it('취소 버튼을 클릭하면 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('입력한 내용이 있어도 취소할 수 있다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.type(screen.getByLabelText('설명'), 'Test Description');
      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Guest 모드 제한', () => {
    beforeEach(() => {
      (authContext.useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
        user: null,
      });
    });

    it('게스트 모드에서 새 노트 생성 시 한도를 체크한다', async () => {
      const user = userEvent.setup();
      (guestLimits.canCreateNote as jest.Mock).mockReturnValue(false);

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(guestLimits.canCreateNote).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('게스트 모드에서 한도 초과 시 GuestLimitModal을 표시한다', async () => {
      const user = userEvent.setup();
      (guestLimits.canCreateNote as jest.Mock).mockReturnValue(false);

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(screen.getByTestId('guest-limit-modal')).toBeInTheDocument();
        expect(screen.getByText('한도 초과: note')).toBeInTheDocument();
      });
    });

    it('게스트 모드에서 한도 내에서는 정상 저장된다', async () => {
      const user = userEvent.setup();
      (guestLimits.canCreateNote as jest.Mock).mockReturnValue(true);

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Test Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('게스트 모드에서 기존 노트 수정은 한도 체크를 하지 않는다', async () => {
      const user = userEvent.setup();
      (guestLimits.canCreateNote as jest.Mock).mockReturnValue(false); // 한도 초과

      const note = {
        id: '1',
        term: 'Existing Term',
        description: 'Existing Description',
        example: null,
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />);

      await user.clear(screen.getByPlaceholderText('예: Cohort Analysis'));
      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Updated Term');
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Updated Term',
          description: 'Existing Description',
          example: undefined,
        });
      });

      // 한도 체크를 하지 않았으므로 호출되지 않음
      expect(guestLimits.canCreateNote).not.toHaveBeenCalled();
    });
  });

  describe('통합 시나리오', () => {
    it('새 노트 생성 전체 플로우가 정상 동작한다', async () => {
      const user = userEvent.setup();
      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      // 초기 상태: 저장 버튼 비활성화
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();

      // 폼 입력
      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Cohort Analysis');
      await user.type(screen.getByLabelText('설명'), '동일 속성을 가진 그룹 분석');
      await user.type(screen.getByLabelText('예시'), '2024년 1월 가입 사용자 그룹');

      // 저장 버튼 활성화 확인
      expect(screen.getByRole('button', { name: '저장' })).toBeEnabled();

      // 저장
      await user.click(screen.getByRole('button', { name: '저장' }));

      // 저장 완료 및 모달 닫힘
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Cohort Analysis',
          description: '동일 속성을 가진 그룹 분석',
          example: '2024년 1월 가입 사용자 그룹',
        });
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('기존 노트 수정 전체 플로우가 정상 동작한다', async () => {
      const user = userEvent.setup();
      const note = {
        id: '1',
        term: 'Old Term',
        description: 'Old Description',
        example: 'Old Example',
        isStarred: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<NoteEditModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} note={note} />);

      // 기존 데이터 확인
      expect(screen.getByText('용어 수정')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('예: Cohort Analysis')).toHaveValue('Old Term');

      // 데이터 수정
      await user.clear(screen.getByPlaceholderText('예: Cohort Analysis'));
      await user.type(screen.getByPlaceholderText('예: Cohort Analysis'), 'Updated Term');

      // 저장
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          term: 'Updated Term',
          description: 'Old Description',
          example: 'Old Example',
        });
      });
    });
  });
});
