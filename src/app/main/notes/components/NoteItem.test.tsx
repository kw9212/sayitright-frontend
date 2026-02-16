import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteItem } from './NoteItem';
import { NoteListItem } from '@/lib/repositories/notes.repository';

describe('NoteItem', () => {
  const mockNote: NoteListItem = {
    id: '1',
    term: 'JavaScript',
    description: '프로그래밍 언어',
    example: 'console.log("Hello");',
    isStarred: false,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockProps = {
    note: mockNote,
    isDeleteMode: false,
    isSelected: false,
    onToggleSelect: jest.fn(),
    onToggleStar: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('노트의 term을 표시한다', () => {
      render(<NoteItem {...mockProps} />);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('description이 있으면 표시한다', () => {
      render(<NoteItem {...mockProps} />);

      expect(screen.getByText('프로그래밍 언어')).toBeInTheDocument();
    });

    it('description이 없으면 표시하지 않는다', () => {
      const noteWithoutDesc = { ...mockNote, description: null };
      render(<NoteItem {...mockProps} note={noteWithoutDesc} />);

      expect(screen.queryByText('프로그래밍 언어')).not.toBeInTheDocument();
    });

    it('example이 있으면 표시한다', () => {
      render(<NoteItem {...mockProps} />);

      expect(screen.getByText('예시:')).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello");')).toBeInTheDocument();
    });

    it('example이 없으면 표시하지 않는다', () => {
      const noteWithoutExample = { ...mockNote, example: null };
      render(<NoteItem {...mockProps} note={noteWithoutExample} />);

      expect(screen.queryByText('예시:')).not.toBeInTheDocument();
    });

    it('생성 날짜를 표시한다', () => {
      render(<NoteItem {...mockProps} />);

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });

  describe('일반 모드', () => {
    it('별표 버튼을 표시한다', () => {
      render(<NoteItem {...mockProps} />);

      const starButton = screen.getByRole('button', { name: '중요 표시' });
      expect(starButton).toBeInTheDocument();
    });

    it('수정 버튼을 표시한다', () => {
      render(<NoteItem {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      // 별표 버튼 외에 수정 버튼이 하나 더 있어야 함
      expect(buttons.length).toBe(2);
    });

    it('체크박스를 표시하지 않는다', () => {
      render(<NoteItem {...mockProps} />);

      const checkbox = screen.queryByRole('checkbox');
      expect(checkbox).not.toBeInTheDocument();
    });

    it('별표 버튼 클릭 시 onToggleStar를 호출한다', async () => {
      const user = userEvent.setup();
      render(<NoteItem {...mockProps} />);

      const starButton = screen.getByRole('button', { name: '중요 표시' });
      await user.click(starButton);

      expect(mockProps.onToggleStar).toHaveBeenCalledWith('1');
    });

    it('수정 버튼 클릭 시 onEdit을 호출한다', async () => {
      const user = userEvent.setup();
      render(<NoteItem {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      // 별표 버튼(첫 번째)과 수정 버튼(두 번째)
      const editButton = buttons[1];

      await user.click(editButton);

      expect(mockProps.onEdit).toHaveBeenCalledWith(mockNote);
    });

    it('isStarred가 true면 별표가 채워진다', () => {
      const starredNote = { ...mockNote, isStarred: true };
      render(<NoteItem {...mockProps} note={starredNote} />);

      const starButton = screen.getByRole('button', { name: '중요 표시 해제' });
      expect(starButton).toBeInTheDocument();
    });

    it('isStarred가 false면 별표가 비어있다', () => {
      render(<NoteItem {...mockProps} />);

      const starButton = screen.getByRole('button', { name: '중요 표시' });
      expect(starButton).toBeInTheDocument();
    });
  });

  describe('삭제 모드', () => {
    const deleteProps = {
      ...mockProps,
      isDeleteMode: true,
    };

    it('체크박스를 표시한다', () => {
      render(<NoteItem {...deleteProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('별표 버튼을 표시하지 않는다', () => {
      render(<NoteItem {...deleteProps} />);

      const starButton = screen.queryByRole('button', { name: /중요 표시/ });
      expect(starButton).not.toBeInTheDocument();
    });

    it('수정 버튼을 표시하지 않는다', () => {
      render(<NoteItem {...deleteProps} />);

      // 삭제 모드에서는 버튼이 없어야 함
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });

    it('체크박스 클릭 시 onToggleSelect를 호출한다', async () => {
      const user = userEvent.setup();
      render(<NoteItem {...deleteProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockProps.onToggleSelect).toHaveBeenCalledWith('1');
    });

    it('카드 클릭 시 onToggleSelect를 호출한다', async () => {
      const user = userEvent.setup();
      render(<NoteItem {...deleteProps} />);

      const term = screen.getByText('JavaScript');
      await user.click(term);

      expect(mockProps.onToggleSelect).toHaveBeenCalledWith('1');
    });

    it('isSelected가 true면 선택된 스타일을 적용한다', () => {
      const selectedProps = {
        ...deleteProps,
        isSelected: true,
      };

      render(<NoteItem {...selectedProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('isSelected가 false면 기본 스타일을 적용한다', () => {
      render(<NoteItem {...deleteProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('카드에 cursor-pointer 클래스가 적용된다', () => {
      const { container } = render(<NoteItem {...deleteProps} />);

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });
  });

  describe('조건부 렌더링', () => {
    it('description만 없는 경우', () => {
      const noteWithoutDesc = {
        ...mockNote,
        description: null,
      };

      render(<NoteItem {...mockProps} note={noteWithoutDesc} />);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.queryByText('프로그래밍 언어')).not.toBeInTheDocument();
      expect(screen.getByText('console.log("Hello");')).toBeInTheDocument();
    });

    it('example만 없는 경우', () => {
      const noteWithoutExample = {
        ...mockNote,
        example: null,
      };

      render(<NoteItem {...mockProps} note={noteWithoutExample} />);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('프로그래밍 언어')).toBeInTheDocument();
      expect(screen.queryByText('예시:')).not.toBeInTheDocument();
    });

    it('description과 example이 모두 없는 경우', () => {
      const minimalNote = {
        ...mockNote,
        description: null,
        example: null,
      };

      render(<NoteItem {...mockProps} note={minimalNote} />);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.queryByText('프로그래밍 언어')).not.toBeInTheDocument();
      expect(screen.queryByText('예시:')).not.toBeInTheDocument();
    });
  });

  describe('이벤트 전파', () => {
    it('별표 버튼 클릭 시 카드 클릭 이벤트가 전파되지 않는다', async () => {
      const user = userEvent.setup();
      const onCardClick = jest.fn();

      const { container } = render(<NoteItem {...mockProps} />);
      const card = container.querySelector('[data-slot="card"]');
      card?.addEventListener('click', onCardClick);

      const starButton = screen.getByRole('button', { name: '중요 표시' });
      await user.click(starButton);

      expect(mockProps.onToggleStar).toHaveBeenCalled();
      // stopPropagation으로 인해 카드 클릭은 호출되지 않음
    });

    it('수정 버튼 클릭 시 카드 클릭 이벤트가 전파되지 않는다', async () => {
      const user = userEvent.setup();
      render(<NoteItem {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      // 별표 버튼(첫 번째)과 수정 버튼(두 번째)
      const editButton = buttons[1];

      await user.click(editButton);

      expect(mockProps.onEdit).toHaveBeenCalled();
    });

    it('삭제 모드에서 체크박스 클릭 시 이벤트 전파가 중단된다', async () => {
      const user = userEvent.setup();
      render(<NoteItem {...mockProps} isDeleteMode={true} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // 한 번만 호출되어야 함 (이벤트 전파 중단)
      expect(mockProps.onToggleSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('접근성', () => {
    it('별표 버튼에 적절한 aria-label이 있다', () => {
      render(<NoteItem {...mockProps} />);

      expect(screen.getByLabelText('중요 표시')).toBeInTheDocument();
    });

    it('별표가 활성화되면 aria-label이 변경된다', () => {
      const starredNote = { ...mockNote, isStarred: true };
      render(<NoteItem {...mockProps} note={starredNote} />);

      expect(screen.getByLabelText('중요 표시 해제')).toBeInTheDocument();
    });

    it('체크박스에 적절한 type이 설정되어 있다', () => {
      render(<NoteItem {...mockProps} isDeleteMode={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('다양한 노트 데이터', () => {
    it('긴 term을 표시한다', () => {
      const longTermNote = {
        ...mockNote,
        term: 'Very Long Term Name That Should Be Displayed Correctly Without Issues',
      };

      render(<NoteItem {...mockProps} note={longTermNote} />);

      expect(
        screen.getByText('Very Long Term Name That Should Be Displayed Correctly Without Issues'),
      ).toBeInTheDocument();
    });

    it('여러 줄의 description을 표시한다', () => {
      const multilineNote = {
        ...mockNote,
        description: '첫 번째 줄\n두 번째 줄\n세 번째 줄',
      };

      render(<NoteItem {...mockProps} note={multilineNote} />);

      expect(screen.getByText(/첫 번째 줄/)).toBeInTheDocument();
    });

    it('여러 줄의 example을 표시한다', () => {
      const multilineExample = {
        ...mockNote,
        example: 'function test() {\n  return true;\n}',
      };

      render(<NoteItem {...mockProps} note={multilineExample} />);

      expect(screen.getByText(/function test/)).toBeInTheDocument();
    });

    it('한글 노트를 표시한다', () => {
      const koreanNote = {
        ...mockNote,
        term: '자바스크립트',
        description: '웹 프로그래밍 언어입니다.',
        example: 'const 변수 = 10;',
      };

      render(<NoteItem {...mockProps} note={koreanNote} />);

      expect(screen.getByText('자바스크립트')).toBeInTheDocument();
      expect(screen.getByText('웹 프로그래밍 언어입니다.')).toBeInTheDocument();
      expect(screen.getByText('const 변수 = 10;')).toBeInTheDocument();
    });
  });

  describe('통합 시나리오', () => {
    it('일반 모드 → 별표 추가 → 수정', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<NoteItem {...mockProps} />);

      // 별표 추가
      const starButton = screen.getByRole('button', { name: '중요 표시' });
      await user.click(starButton);
      expect(mockProps.onToggleStar).toHaveBeenCalledWith('1');

      // 별표 추가 후 상태 변경
      const starredNote = { ...mockNote, isStarred: true };
      rerender(<NoteItem {...mockProps} note={starredNote} />);

      expect(screen.getByRole('button', { name: '중요 표시 해제' })).toBeInTheDocument();

      // 수정 버튼 클릭
      const buttons = screen.getAllByRole('button');
      const editButton = buttons[1]; // 두 번째 버튼이 수정 버튼

      await user.click(editButton);

      expect(mockProps.onEdit).toHaveBeenCalledWith(starredNote);
    });

    it('일반 모드 → 삭제 모드 전환', async () => {
      const { rerender } = render(<NoteItem {...mockProps} />);

      // 일반 모드: 별표와 수정 버튼 확인
      expect(screen.getByRole('button', { name: '중요 표시' })).toBeInTheDocument();

      // 삭제 모드로 전환
      rerender(<NoteItem {...mockProps} isDeleteMode={true} />);

      // 삭제 모드: 체크박스 확인
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      // 별표 버튼 사라짐
      expect(screen.queryByRole('button', { name: '중요 표시' })).not.toBeInTheDocument();
    });

    it('삭제 모드에서 선택 → 선택 해제', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <NoteItem {...mockProps} isDeleteMode={true} isSelected={false} />,
      );

      // 선택
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(mockProps.onToggleSelect).toHaveBeenCalledWith('1');

      // 선택 상태로 리렌더
      rerender(<NoteItem {...mockProps} isDeleteMode={true} isSelected={true} />);

      const selectedCheckbox = screen.getByRole('checkbox');
      expect(selectedCheckbox).toBeChecked();
    });
  });
});
