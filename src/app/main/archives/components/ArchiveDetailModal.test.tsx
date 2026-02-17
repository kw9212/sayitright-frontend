/**
 * ArchiveDetailModal 컴포넌트 테스트
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveDetailModal from './ArchiveDetailModal';
import * as authContext from '@/lib/auth/auth-context';
import { archivesRepository } from '@/lib/repositories/archives.repository';
import { guestArchivesRepository } from '@/lib/repositories/guest-archives.repository';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/repositories/archives.repository', () => ({
  archivesRepository: {
    get: jest.fn(),
  },
}));

jest.mock('@/lib/repositories/guest-archives.repository', () => ({
  guestArchivesRepository: {
    get: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ArchiveDetailModal', () => {
  const mockOnClose = jest.fn();
  const mockArchiveDetail = {
    id: '1',
    title: '회의 요청 이메일',
    content:
      '안녕하세요. 다음 주 회의 일정을 조율하고자 연락드립니다.\n\n가능하신 시간대를 알려주시면 감사하겠습니다.',
    tone: 'formal',
    relationship: 'supervisor',
    purpose: 'request',
    rationale: 'AI 피드백',
    createdAt: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({
      status: 'authenticated',
      user: { id: 1, email: 'test@example.com' },
    });

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  describe('렌더링', () => {
    it('archiveId가 null이면 모달이 표시되지 않는다', () => {
      render(<ArchiveDetailModal archiveId={null} onClose={mockOnClose} />);

      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    });

    it('archiveId가 있으면 모달이 열린다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('회의 요청 이메일')).toBeInTheDocument();
      });
    });

    it('로딩 중에는 "로딩 중..." 텍스트를 표시한다', () => {
      (archivesRepository.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('title이 있으면 title을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('회의 요청 이메일')).toBeInTheDocument();
      });
    });

    it('title이 없으면 날짜를 title로 표시한다', async () => {
      const archiveWithoutTitle = {
        ...mockArchiveDetail,
        title: '',
      };

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: archiveWithoutTitle,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        const dateElements = screen.getAllByText(/2024/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('생성 날짜를 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
      });
    });

    it('content를 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/다음 주 회의 일정을 조율하고자/)).toBeInTheDocument();
      });
    });

    it('여러 줄의 content를 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/가능하신 시간대를 알려주시면/)).toBeInTheDocument();
      });
    });

    it('tone 라벨을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('격식있는')).toBeInTheDocument();
      });
    });

    it('relationship 라벨을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('상사')).toBeInTheDocument();
      });
    });

    it('purpose 라벨을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('요청')).toBeInTheDocument();
      });
    });

    it('relationship이 없으면 표시하지 않는다', async () => {
      const archiveWithoutRelationship = {
        ...mockArchiveDetail,
        relationship: undefined,
      };

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: archiveWithoutRelationship,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('격식있는')).toBeInTheDocument();
      });

      expect(screen.queryByText('상사')).not.toBeInTheDocument();
    });

    it('purpose가 없으면 표시하지 않는다', async () => {
      const archiveWithoutPurpose = {
        ...mockArchiveDetail,
        purpose: undefined,
      };

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: archiveWithoutPurpose,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('격식있는')).toBeInTheDocument();
      });

      expect(screen.queryByText('요청')).not.toBeInTheDocument();
    });

    it('복사하기 및 닫기 버튼을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '복사하기' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });
    });
  });

  describe('데이터 로딩', () => {
    it('authenticated 모드에서는 archivesRepository를 호출한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(archivesRepository.get).toHaveBeenCalledWith('1');
      });
    });

    it('guest 모드에서는 guestArchivesRepository를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
        user: null,
      });

      (guestArchivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(guestArchivesRepository.get).toHaveBeenCalledWith('1');
      });
    });

    it('archiveId가 변경되면 새로운 데이터를 로드한다', async () => {
      const { rerender } = render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      await waitFor(() => {
        expect(archivesRepository.get).toHaveBeenCalledWith('1');
      });

      const newArchive = {
        ...mockArchiveDetail,
        id: '2',
        title: '새로운 아카이브',
      };

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: newArchive,
      });

      rerender(<ArchiveDetailModal archiveId="2" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(archivesRepository.get).toHaveBeenCalledWith('2');
      });
    });

    it('archiveId가 null로 변경되면 archive를 초기화한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      const { rerender } = render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('회의 요청 이메일')).toBeInTheDocument();
      });

      rerender(<ArchiveDetailModal archiveId={null} onClose={mockOnClose} />);

      expect(screen.queryByText('회의 요청 이메일')).not.toBeInTheDocument();
    });
  });

  describe('에러 처리', () => {
    it('데이터 로딩 실패 시 에러 토스트를 표시한다', async () => {
      const error = new Error('Network error');
      (archivesRepository.get as jest.Mock).mockRejectedValue(error);

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });

    it('데이터 로딩 실패 시 onClose를 호출한다', async () => {
      const error = new Error('Network error');
      (archivesRepository.get as jest.Mock).mockRejectedValue(error);

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('Error가 아닌 예외는 기본 메시지를 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockRejectedValue('Unknown error');

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('아카이브 조회에 실패했습니다.');
      });
    });
  });

  describe('복사 기능', () => {
    it('복사하기 버튼 클릭 시 content를 클립보드에 복사한다', async () => {
      const user = userEvent.setup();
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '복사하기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '복사하기' }));

      expect(writeTextMock).toHaveBeenCalledWith(mockArchiveDetail.content);
    });

    it('복사 성공 시 성공 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '복사하기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '복사하기' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('클립보드에 복사되었습니다.');
      });
    });

    it('content가 없으면 복사하지 않는다', async () => {
      const user = userEvent.setup();
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      const archiveWithoutContent = {
        ...mockArchiveDetail,
        content: '',
      };

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: archiveWithoutContent,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '복사하기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '복사하기' }));

      expect(writeTextMock).not.toHaveBeenCalled();
    });
  });

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('통합 시나리오', () => {
    it('전체 플로우가 정상 동작한다', async () => {
      const user = userEvent.setup();
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      // 로딩
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();

      // 데이터 로드 완료
      await waitFor(() => {
        expect(screen.getByText('회의 요청 이메일')).toBeInTheDocument();
      });

      // 내용 확인
      expect(screen.getByText(/다음 주 회의 일정을 조율하고자/)).toBeInTheDocument();
      expect(screen.getByText('격식있는')).toBeInTheDocument();
      expect(screen.getByText('상사')).toBeInTheDocument();
      expect(screen.getByText('요청')).toBeInTheDocument();

      // 복사
      await user.click(screen.getByRole('button', { name: '복사하기' }));
      expect(writeTextMock).toHaveBeenCalledWith(mockArchiveDetail.content);
      expect(toast.success).toHaveBeenCalledWith('클립보드에 복사되었습니다.');

      // 닫기
      await user.click(screen.getByRole('button', { name: '닫기' }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('guest 모드에서도 정상 동작한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
        user: null,
      });

      (guestArchivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchiveDetail,
      });

      render(<ArchiveDetailModal archiveId="1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(guestArchivesRepository.get).toHaveBeenCalledWith('1');
        expect(screen.getByText('회의 요청 이메일')).toBeInTheDocument();
      });
    });
  });
});
