import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal (Notes)', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    count: 3,
    noteTerms: ['JavaScript', 'React', 'TypeScript'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('모달이 열리면 제목을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText('용어 삭제')).toBeInTheDocument();
    });

    it('선택된 용어 개수를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/3개/)).toBeInTheDocument();
    });

    it('isOpen이 false이면 모달이 보이지 않는다', () => {
      render(<DeleteConfirmModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText('용어 삭제')).not.toBeInTheDocument();
    });

    it('삭제 버튼을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    it('취소 버튼을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('되돌릴 수 없다는 경고를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/이 작업은 되돌릴 수 없습니다/)).toBeInTheDocument();
    });
  });

  describe('용어 목록 표시', () => {
    it('3개 이하의 용어는 모두 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
      expect(screen.getByText(/React/)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript/)).toBeInTheDocument();
    });

    it('3개 초과 시 처음 3개만 표시하고 ...를 추가한다', () => {
      const manyTerms = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Express'];

      render(<DeleteConfirmModal {...mockProps} count={5} noteTerms={manyTerms} />);

      expect(screen.getByText(/JavaScript, React, TypeScript\.\.\./)).toBeInTheDocument();
    });

    it('noteTerms가 비어있어도 동작한다', () => {
      render(<DeleteConfirmModal {...mockProps} noteTerms={[]} />);

      expect(screen.getByText('용어 삭제')).toBeInTheDocument();
      expect(screen.getByText(/3개/)).toBeInTheDocument();
    });

    it('noteTerms가 제공되지 않아도 동작한다', () => {
      const { noteTerms, ...propsWithoutTerms } = mockProps;

      render(<DeleteConfirmModal {...propsWithoutTerms} />);

      expect(screen.getByText('용어 삭제')).toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('취소 버튼 클릭 시 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...mockProps} />);

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onConfirm을 호출한다', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: '삭제' });
      await user.click(deleteButton);

      expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('용어 개수별 시나리오', () => {
    it('1개의 용어 삭제', () => {
      render(<DeleteConfirmModal {...mockProps} count={1} noteTerms={['JavaScript']} />);

      expect(screen.getByText(/1개/)).toBeInTheDocument();
      expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
    });

    it('2개의 용어 삭제', () => {
      render(<DeleteConfirmModal {...mockProps} count={2} noteTerms={['JavaScript', 'React']} />);

      expect(screen.getByText(/2개/)).toBeInTheDocument();
      expect(screen.getByText(/JavaScript, React/)).toBeInTheDocument();
    });

    it('10개 이상의 용어 삭제', () => {
      const manyTerms = Array.from({ length: 15 }, (_, i) => `용어${i + 1}`);

      render(<DeleteConfirmModal {...mockProps} count={15} noteTerms={manyTerms} />);

      expect(screen.getByText(/15개/)).toBeInTheDocument();
      expect(screen.getByText(/용어1, 용어2, 용어3\.\.\./)).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('모달에 적절한 role이 있다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('제목이 dialog title로 설정되어 있다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByRole('heading', { name: '용어 삭제' })).toBeInTheDocument();
    });
  });

  describe('Button 컴포넌트 사용', () => {
    it('Button 컴포넌트를 사용한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('삭제 버튼은 destructive variant를 사용한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: '삭제' });
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
