import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmModal from './DeleteConfirmModal';
import { type TemplateListItem } from '@/lib/repositories/templates.repository';

describe('DeleteConfirmModal (Templates)', () => {
  const mockTemplates: TemplateListItem[] = [
    {
      id: '1',
      title: '첫 번째 템플릿',
      preview: '미리보기1',
      tone: 'formal',
      purpose: 'request',
      relationship: 'professor',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: '두 번째 템플릿',
      preview: '미리보기2',
      tone: 'casual',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockProps = {
    templates: mockTemplates,
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('모달이 열리면 제목을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText('템플릿 삭제 확인')).toBeInTheDocument();
    });

    it('선택된 템플릿 개수를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/템플릿을 삭제하시겠습니까?/)).toBeInTheDocument();
      const countElements = screen.getAllByText(/2개/);
      expect(countElements.length).toBeGreaterThan(0);
    });

    it('isOpen이 false이면 모달이 보이지 않는다', () => {
      render(<DeleteConfirmModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText('템플릿 삭제 확인')).not.toBeInTheDocument();
    });

    it('삭제 버튼에 개수를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByRole('button', { name: /삭제 \(2개\)/ })).toBeInTheDocument();
    });

    it('취소 버튼을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  describe('템플릿 목록 표시', () => {
    it('삭제될 템플릿 목록을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText('삭제될 템플릿:')).toBeInTheDocument();
    });

    it('title이 있으면 title을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText('첫 번째 템플릿')).toBeInTheDocument();
      expect(screen.getByText('두 번째 템플릿')).toBeInTheDocument();
    });

    it('title이 없으면 생성 날짜를 표시한다', () => {
      const templatesWithoutTitle: TemplateListItem[] = [
        {
          id: '1',
          preview: '미리보기',
          tone: 'formal',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} templates={templatesWithoutTitle} />);

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('여러 개의 템플릿을 모두 표시한다', () => {
      const manyTemplates: TemplateListItem[] = [
        {
          id: '1',
          title: '템플릿1',
          preview: '미리보기1',
          tone: 'formal',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          title: '템플릿2',
          preview: '미리보기2',
          tone: 'casual',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
        {
          id: '3',
          title: '템플릿3',
          preview: '미리보기3',
          tone: 'polite',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-03',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} templates={manyTemplates} />);

      expect(screen.getByText('템플릿1')).toBeInTheDocument();
      expect(screen.getByText('템플릿2')).toBeInTheDocument();
      expect(screen.getByText('템플릿3')).toBeInTheDocument();
    });
  });

  describe('경고 메시지', () => {
    it('주의 메시지를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText('주의!')).toBeInTheDocument();
    });

    it('영구 삭제 경고를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/영구적으로 삭제/)).toBeInTheDocument();
    });

    it('복구 불가능 경고를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/복구할 수 없습니다/)).toBeInTheDocument();
    });

    it('신중 확인 요청 메시지를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/신중하게 확인 후 진행해주세요/)).toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('취소 버튼 클릭 시 onCancel을 호출한다', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...mockProps} />);

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onConfirm을 호출한다', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: /삭제 \(2개\)/ });
      await user.click(deleteButton);

      expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('템플릿 개수별 시나리오', () => {
    it('1개의 템플릿 삭제', () => {
      const singleTemplate: TemplateListItem[] = [
        {
          id: '1',
          title: '단일 템플릿',
          preview: '미리보기',
          tone: 'formal',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} templates={singleTemplate} />);

      expect(screen.getByRole('button', { name: /삭제 \(1개\)/ })).toBeInTheDocument();
    });

    it('10개 이상의 템플릿 삭제', () => {
      const manyTemplates: TemplateListItem[] = Array.from({ length: 12 }, (_, i) => ({
        id: `${i + 1}`,
        title: `템플릿 ${i + 1}`,
        preview: `미리보기 ${i + 1}`,
        tone: 'formal',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }));

      render(<DeleteConfirmModal {...mockProps} templates={manyTemplates} />);

      expect(screen.getByRole('button', { name: /삭제 \(12개\)/ })).toBeInTheDocument();
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

      expect(screen.getByRole('heading', { name: /템플릿 삭제 확인/ })).toBeInTheDocument();
    });
  });
});
