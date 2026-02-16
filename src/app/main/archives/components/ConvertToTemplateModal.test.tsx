import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConvertToTemplateModal from './ConvertToTemplateModal';
import { useAuth } from '@/lib/auth/auth-context';
import { archivesRepository } from '@/lib/repositories/archives.repository';
import { guestArchivesRepository } from '@/lib/repositories/guest-archives.repository';
import { templatesRepository } from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import * as guestLimits from '@/lib/storage/guest-limits';
import { toast } from 'sonner';

// Mocking
jest.mock('@/lib/auth/auth-context');
jest.mock('@/lib/repositories/archives.repository');
jest.mock('@/lib/repositories/guest-archives.repository');
jest.mock('@/lib/repositories/templates.repository');
jest.mock('@/lib/repositories/guest-templates.repository');
jest.mock('@/lib/storage/guest-limits');
jest.mock('sonner');
jest.mock('@/components/layout/GuestLimitModal', () => ({
  GuestLimitModal: ({ isOpen, limitType }: { isOpen: boolean; limitType: string }) =>
    isOpen ? <div data-testid="guest-limit-modal">{limitType}</div> : null,
}));

describe('ConvertToTemplateModal', () => {
  const mockArchive = {
    id: '1',
    title: '테스트 아카이브',
    content: '테스트 내용입니다.',
    preview: '테스트 내용...',
    tone: 'formal',
    purpose: 'request',
    relationship: 'professor',
    rationale: 'AI 피드백 내용',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockProps = {
    archiveId: '1',
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      status: 'authenticated',
      user: { id: '1', email: 'test@example.com' },
    });
    (guestLimits.canCreateTemplate as jest.Mock).mockReturnValue(true);
    (toast.success as jest.Mock).mockImplementation(() => {});
    (toast.error as jest.Mock).mockImplementation(() => {});
    (toast.info as jest.Mock).mockImplementation(() => {});
  });

  describe('렌더링', () => {
    it('archiveId가 null이면 모달이 열리지 않는다', () => {
      render(<ConvertToTemplateModal {...mockProps} archiveId={null} />);

      expect(screen.queryByText('템플릿으로 전환')).not.toBeInTheDocument();
    });

    it('archiveId가 있으면 모달이 열린다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('템플릿으로 전환')).toBeInTheDocument();
      });
    });

    it('로딩 중에는 로딩 메시지를 표시한다', () => {
      (archivesRepository.get as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // 완료되지 않는 Promise
      );

      render(<ConvertToTemplateModal {...mockProps} />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('아카이브 조회 후 제목을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 아카이브')).toBeInTheDocument();
      });
    });

    it('아카이브 내용을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
      });
    });

    it('생성 날짜를 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/2024/)).toBeInTheDocument();
      });
    });

    it('취소와 저장 버튼을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });
    });
  });

  describe('아카이브 조회', () => {
    it('일반 모드에서는 archivesRepository를 사용한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(archivesRepository.get).toHaveBeenCalledWith('1');
      });
    });

    it('게스트 모드에서는 guestArchivesRepository를 사용한다', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
      });
      (guestArchivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(guestArchivesRepository.get).toHaveBeenCalledWith('1');
      });
    });

    it('아카이브 조회 실패 시 에러 토스트를 표시하고 모달을 닫는다', async () => {
      (archivesRepository.get as jest.Mock).mockRejectedValue(new Error('조회 실패'));

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('조회 실패');
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });
  });

  describe('템플릿 변환', () => {
    it('템플릿으로 저장 버튼 클릭 시 변환을 시도한다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (templatesRepository.create as jest.Mock).mockResolvedValue({
        ok: true,
        data: { id: 'new-template' },
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(templatesRepository.create).toHaveBeenCalledWith({
          sourceArchiveId: '1',
          title: '테스트 아카이브',
          content: '테스트 내용입니다.',
          tone: 'formal',
          purpose: 'request',
          relationship: 'professor',
          rationale: 'AI 피드백 내용',
        });
      });
    });

    it('변환 성공 시 성공 토스트와 onSuccess를 호출한다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (templatesRepository.create as jest.Mock).mockResolvedValue({
        ok: true,
        data: { id: 'new-template' },
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('템플릿으로 저장되었습니다!');
        expect(mockProps.onSuccess).toHaveBeenCalled();
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });

    it('변환 실패 시 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (templatesRepository.create as jest.Mock).mockRejectedValue(new Error('변환 실패'));

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('변환 실패', expect.any(Object));
      });
    });

    it('게스트 모드에서 변환 성공 시 템플릿 카운트를 증가시킨다', async () => {
      const user = userEvent.setup();
      (useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
      });
      (guestArchivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (guestTemplatesRepository.create as jest.Mock).mockResolvedValue({
        ok: true,
        data: { id: 'new-template' },
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(guestLimits.incrementTemplateCount).toHaveBeenCalled();
      });
    });
  });

  describe('게스트 제한', () => {
    it('게스트 모드에서 제한 초과 시 GuestLimitModal을 표시한다', async () => {
      const user = userEvent.setup();
      (useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
      });
      (guestArchivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (guestLimits.canCreateTemplate as jest.Mock).mockReturnValue(false);

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('guest-limit-modal')).toBeInTheDocument();
      });
    });

    it('게스트 모드에서 제한 초과 시 변환을 시도하지 않는다', async () => {
      const user = userEvent.setup();
      (useAuth as jest.Mock).mockReturnValue({
        status: 'guest',
      });
      (guestArchivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (guestLimits.canCreateTemplate as jest.Mock).mockReturnValue(false);

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(guestTemplatesRepository.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('AI 피드백 (rationale)', () => {
    it('rationale이 있으면 AI 피드백 보기 버튼을 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument();
      });
    });

    it('AI 피드백 보기 버튼 클릭 시 피드백을 표시한다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument();
      });

      const showButton = screen.getByText('AI 피드백 보기');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('AI 피드백 내용')).toBeInTheDocument();
        expect(screen.getByText('AI 피드백 숨기기')).toBeInTheDocument();
      });
    });

    it('AI 피드백 숨기기 버튼 클릭 시 피드백을 숨긴다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument();
      });

      // 먼저 보기
      const showButton = screen.getByText('AI 피드백 보기');
      await user.click(showButton);

      await waitFor(() => {
        expect(screen.getByText('AI 피드백 숨기기')).toBeInTheDocument();
      });

      // 그 다음 숨기기
      const hideButton = screen.getByText('AI 피드백 숨기기');
      await user.click(hideButton);

      await waitFor(() => {
        expect(screen.queryByText('AI 피드백 내용')).not.toBeInTheDocument();
        expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument();
      });
    });

    it('rationale이 없으면 AI 피드백 버튼을 표시하지 않는다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: { ...mockArchive, rationale: undefined },
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('템플릿으로 전환')).toBeInTheDocument();
      });

      expect(screen.queryByText('AI 피드백 보기')).not.toBeInTheDocument();
    });
  });

  describe('복사 방지', () => {
    it('내용 영역에 복사 방지 클래스가 설정되어 있다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
      });

      // 부모 div가 select-none 클래스를 가지고 있음
      const contentText = screen.getByText('테스트 내용입니다.');
      const parent = contentText.parentElement?.parentElement;
      expect(parent).toHaveClass('select-none');
    });

    it('드래그 방지가 설정되어 있다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 내용입니다.')).toBeInTheDocument();
      });

      // select-none 클래스로 선택 방지 확인
      const contentText = screen.getByText('테스트 내용입니다.');
      const parent = contentText.parentElement?.parentElement;
      expect(parent).toHaveClass('select-none');
    });
  });

  describe('필터 태그 표시', () => {
    it('tone 태그를 한글로 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('격식있는')).toBeInTheDocument();
      });
    });

    it('relationship 태그를 한글로 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('교수님')).toBeInTheDocument();
      });
    });

    it('purpose 태그를 한글로 표시한다', async () => {
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('요청')).toBeInTheDocument();
      });
    });
  });

  describe('버튼 상태', () => {
    it('변환 중에는 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });
      (templatesRepository.create as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // 완료되지 않는 Promise
      );

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '템플릿으로 저장' })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();
        expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
      });
    });

    it('로딩 중에는 저장 버튼이 비활성화된다', () => {
      (archivesRepository.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<ConvertToTemplateModal {...mockProps} />);

      const saveButton = screen.getByRole('button', { name: '템플릿으로 저장' });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('취소 버튼', () => {
    it('취소 버튼 클릭 시 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      (archivesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockArchive,
      });

      render(<ConvertToTemplateModal {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });
});
