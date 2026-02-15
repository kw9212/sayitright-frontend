import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmModal from './DeleteConfirmModal';
import { type ArchiveListItem } from '@/lib/repositories/archives.repository';

describe('DeleteConfirmModal (Archives)', () => {
  const mockArchives: ArchiveListItem[] = [
    {
      id: '1',
      preview: '첫 번째 아카이브',
      tone: 'formal',
      purpose: 'request',
      relationship: 'professor',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      preview: '두 번째 아카이브',
      tone: 'casual',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockProps = {
    archives: mockArchives,
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

      expect(screen.getByText('아카이브 삭제 확인')).toBeInTheDocument();
    });

    it('선택된 아카이브 개수를 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText(/아카이브를 삭제하시겠습니까?/)).toBeInTheDocument();
      // "2개"가 여러 곳에 나타나므로 getAllByText 사용
      const countElements = screen.getAllByText(/2개/);
      expect(countElements.length).toBeGreaterThan(0);
    });

    it('isOpen이 false이면 모달이 보이지 않는다', () => {
      render(<DeleteConfirmModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText('아카이브 삭제 확인')).not.toBeInTheDocument();
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

  describe('아카이브 목록 표시', () => {
    it('삭제될 아카이브 목록을 표시한다', () => {
      render(<DeleteConfirmModal {...mockProps} />);

      expect(screen.getByText('삭제될 아카이브:')).toBeInTheDocument();
    });

    it('title이 있으면 title을 표시한다', () => {
      const archivesWithTitle: ArchiveListItem[] = [
        {
          id: '1',
          title: '제목이 있는 아카이브',
          preview: '미리보기',
          tone: 'formal',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} archives={archivesWithTitle} />);

      expect(screen.getByText('제목이 있는 아카이브')).toBeInTheDocument();
    });

    it('title이 없으면 생성 날짜를 표시한다', () => {
      const archivesWithoutTitle: ArchiveListItem[] = [
        {
          id: '1',
          preview: '미리보기',
          tone: 'formal',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} archives={archivesWithoutTitle} />);

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('여러 개의 아카이브를 모두 표시한다', () => {
      const manyArchives: ArchiveListItem[] = [
        {
          id: '1',
          title: '첫 번째',
          preview: '미리보기1',
          tone: 'formal',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          title: '두 번째',
          preview: '미리보기2',
          tone: 'casual',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
        {
          id: '3',
          title: '세 번째',
          preview: '미리보기3',
          tone: 'polite',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-03',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} archives={manyArchives} />);

      expect(screen.getByText('첫 번째')).toBeInTheDocument();
      expect(screen.getByText('두 번째')).toBeInTheDocument();
      expect(screen.getByText('세 번째')).toBeInTheDocument();
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

  describe('아카이브 개수별 시나리오', () => {
    it('1개의 아카이브 삭제', () => {
      const singleArchive: ArchiveListItem[] = [
        {
          id: '1',
          title: '단일 아카이브',
          preview: '미리보기',
          tone: 'formal',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      render(<DeleteConfirmModal {...mockProps} archives={singleArchive} />);

      // "1개"가 여러 곳에 나타나므로 버튼 텍스트로 확인
      expect(screen.getByRole('button', { name: /삭제 \(1개\)/ })).toBeInTheDocument();
    });

    it('10개 이상의 아카이브 삭제', () => {
      const manyArchives: ArchiveListItem[] = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        title: `아카이브 ${i + 1}`,
        preview: `미리보기 ${i + 1}`,
        tone: 'formal',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }));

      render(<DeleteConfirmModal {...mockProps} archives={manyArchives} />);

      // "15개"가 여러 곳에 나타나므로 버튼 텍스트로 확인
      expect(screen.getByRole('button', { name: /삭제 \(15개\)/ })).toBeInTheDocument();
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

      expect(screen.getByRole('heading', { name: /아카이브 삭제 확인/ })).toBeInTheDocument();
    });
  });
});
