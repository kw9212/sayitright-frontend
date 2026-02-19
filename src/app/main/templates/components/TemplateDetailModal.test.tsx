/**
 * TemplateDetailModal 컴포넌트 테스트
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateDetailModal from './TemplateDetailModal';
import * as authContext from '@/lib/auth/auth-context';
import { templatesRepository } from '@/lib/repositories/templates.repository';
import { guestTemplatesRepository } from '@/lib/repositories/guest-templates.repository';
import { toast } from 'sonner';

jest.mock('@/lib/auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/repositories/templates.repository', () => ({
  templatesRepository: { get: jest.fn(), update: jest.fn() },
}));
jest.mock('@/lib/repositories/guest-templates.repository', () => ({
  guestTemplatesRepository: { get: jest.fn(), update: jest.fn() },
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockTemplate = {
  id: '1',
  title: '회의 요청 템플릿',
  content: '안녕하세요. 다음 주 회의 일정을 조율하고자 연락드립니다.',
  tone: 'formal',
  relationship: 'supervisor',
  purpose: 'request',
  rationale: 'AI 피드백 내용입니다.',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

describe('TemplateDetailModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'authenticated' });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  // ─── 렌더링 ───────────────────────────────────────────────────────────────

  describe('렌더링', () => {
    it('templateId가 null이면 모달이 열리지 않는다', () => {
      render(<TemplateDetailModal templateId={null} onClose={mockOnClose} />);
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
    });

    it('로딩 중에는 "로딩 중..." 텍스트를 표시한다', () => {
      (templatesRepository.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('데이터 로드 후 title을 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('회의 요청 템플릿')).toBeInTheDocument());
    });

    it('title이 없으면 날짜를 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: { ...mockTemplate, title: '' },
      });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0));
    });

    it('content를 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() =>
        expect(screen.getByText(/다음 주 회의 일정을 조율하고자/)).toBeInTheDocument(),
      );
    });

    it('tone 라벨을 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('격식있는')).toBeInTheDocument());
    });

    it('relationship 라벨을 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('상사')).toBeInTheDocument());
    });

    it('purpose 라벨을 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('요청')).toBeInTheDocument());
    });

    it('relationship이 없으면 관계 배지를 표시하지 않는다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: { ...mockTemplate, relationship: undefined },
      });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('격식있는')).toBeInTheDocument());
      expect(screen.queryByText('상사')).not.toBeInTheDocument();
    });

    it('복사하기·수정·닫기 버튼을 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '복사하기' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });
    });
  });

  // ─── 데이터 로딩 ──────────────────────────────────────────────────────────

  describe('데이터 로딩', () => {
    it('authenticated 모드에서는 templatesRepository를 호출한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(templatesRepository.get).toHaveBeenCalledWith('1'));
    });

    it('guest 모드에서는 guestTemplatesRepository를 호출한다', async () => {
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestTemplatesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(guestTemplatesRepository.get).toHaveBeenCalledWith('1'));
    });

    it('templateId가 null로 변경되면 template를 초기화한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      const { rerender } = render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('회의 요청 템플릿')).toBeInTheDocument());

      rerender(<TemplateDetailModal templateId={null} onClose={mockOnClose} />);
      expect(screen.queryByText('회의 요청 템플릿')).not.toBeInTheDocument();
    });
  });

  // ─── 에러 처리 ────────────────────────────────────────────────────────────

  describe('에러 처리', () => {
    it('로딩 실패 시 에러 토스트를 표시하고 onClose를 호출한다', async () => {
      (templatesRepository.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('Error가 아닌 예외는 기본 메시지를 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockRejectedValue('unknown');
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('템플릿 조회에 실패했습니다.'));
    });
  });

  // ─── AI 피드백 ────────────────────────────────────────────────────────────

  describe('AI 피드백', () => {
    it('rationale이 있으면 "AI 피드백 보기" 버튼을 표시한다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument());
    });

    it('"AI 피드백 보기" 클릭 시 피드백 내용을 표시한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument());

      await user.click(screen.getByText('AI 피드백 보기'));
      expect(screen.getByText('AI 피드백 내용입니다.')).toBeInTheDocument();
    });

    it('피드백 패널에서 닫기 버튼 클릭 시 패널이 닫힌다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('AI 피드백 보기')).toBeInTheDocument());

      await user.click(screen.getByText('AI 피드백 보기'));
      expect(screen.getByText('AI 피드백 내용입니다.')).toBeInTheDocument();

      // 피드백 패널 내부 X 버튼 클릭 (Close sr-only 제외)
      const closeButtons = screen.getAllByRole('button');
      const tooltipCloseBtn = closeButtons.find(
        (b) => b.querySelector('svg') && b.textContent === '',
      );
      if (tooltipCloseBtn) await user.click(tooltipCloseBtn);

      expect(screen.queryByText('AI 피드백 내용입니다.')).not.toBeInTheDocument();
    });

    it('rationale이 없으면 "AI 피드백 보기" 버튼이 없다', async () => {
      (templatesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: { ...mockTemplate, rationale: undefined },
      });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByText('격식있는')).toBeInTheDocument());
      expect(screen.queryByText('AI 피드백 보기')).not.toBeInTheDocument();
    });
  });

  // ─── 복사 기능 ────────────────────────────────────────────────────────────

  describe('복사 기능', () => {
    it('복사하기 클릭 시 content를 클립보드에 복사하고 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      const writeTextMock = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '복사하기' })).toBeInTheDocument(),
      );

      await user.click(screen.getByRole('button', { name: '복사하기' }));

      expect(writeTextMock).toHaveBeenCalledWith(mockTemplate.content);
      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('클립보드에 복사되었습니다.'));
    });
  });

  // ─── 수정 모드 ────────────────────────────────────────────────────────────

  describe('수정 모드', () => {
    it('"수정" 버튼 클릭 시 편집 폼이 표시된다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));

      expect(screen.getByPlaceholderText('제목 (선택사항)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이메일 내용을 입력하세요...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('편집 폼에 기존 데이터가 채워진다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));

      expect(screen.getByPlaceholderText('제목 (선택사항)')).toHaveValue('회의 요청 템플릿');
      expect(screen.getByPlaceholderText('이메일 내용을 입력하세요...')).toHaveValue(
        mockTemplate.content,
      );
    });

    it('"취소" 클릭 시 편집 모드에서 나온다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.queryByPlaceholderText('이메일 내용을 입력하세요...')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    });

    it('"취소" 클릭 시 편집 내용이 원래대로 복원된다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));

      // 제목 변경
      const titleInput = screen.getByPlaceholderText('제목 (선택사항)');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 제목');

      // 취소
      await user.click(screen.getByRole('button', { name: '취소' }));

      // 다시 수정 모드 진입 시 원래 값 확인
      await user.click(screen.getByRole('button', { name: '수정' }));
      expect(screen.getByPlaceholderText('제목 (선택사항)')).toHaveValue('회의 요청 템플릿');
    });
  });

  // ─── 저장 ─────────────────────────────────────────────────────────────────

  describe('저장', () => {
    it('수정 후 저장 시 repository.update를 호출한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      (templatesRepository.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: { ...mockTemplate, title: '수정된 제목' },
      });

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} onUpdate={mockOnUpdate} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));

      const titleInput = screen.getByPlaceholderText('제목 (선택사항)');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 제목');

      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() =>
        expect(templatesRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            title: '수정된 제목',
            content: mockTemplate.content,
            tone: 'formal',
          }),
        ),
      );
    });

    it('저장 성공 시 성공 토스트를 표시하고 onUpdate를 호출한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      (templatesRepository.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} onUpdate={mockOnUpdate} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('템플릿이 수정되었습니다.');
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('저장 성공 후 편집 모드에서 나온다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      (templatesRepository.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() =>
        expect(
          screen.queryByPlaceholderText('이메일 내용을 입력하세요...'),
        ).not.toBeInTheDocument(),
      );
    });

    it('내용이 비어 있으면 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));

      const contentTextarea = screen.getByPlaceholderText('이메일 내용을 입력하세요...');
      await user.clear(contentTextarea);

      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(toast.error).toHaveBeenCalledWith('내용을 입력해주세요.');
      expect(templatesRepository.update).not.toHaveBeenCalled();
    });

    it('톤이 선택되지 않으면 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));

      // 톤 select에서 빈 값 선택
      await user.selectOptions(screen.getAllByRole('combobox')[0], '');

      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(toast.error).toHaveBeenCalledWith('톤을 선택해주세요.');
      expect(templatesRepository.update).not.toHaveBeenCalled();
    });

    it('저장 중에는 버튼이 "저장 중..."으로 바뀌고 비활성화된다', async () => {
      const user = userEvent.setup();
      let resolveSave!: () => void;
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      (templatesRepository.update as jest.Mock).mockReturnValue(
        new Promise((res) => {
          resolveSave = () => res({ ok: true, data: mockTemplate });
        }),
      );

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();

      resolveSave();
    });

    it('저장 실패 시 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      (templatesRepository.update as jest.Mock).mockRejectedValue(new Error('저장 실패'));

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('저장 실패'));
    });

    it('guest 모드에서 저장 시 guestTemplatesRepository.update를 사용한다', async () => {
      const user = userEvent.setup();
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestTemplatesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });
      (guestTemplatesRepository.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(guestTemplatesRepository.update).toHaveBeenCalled());
    });
  });

  // ─── 닫기 ─────────────────────────────────────────────────────────────────

  describe('닫기', () => {
    it('"닫기" 버튼 클릭 시 onClose를 호출한다', async () => {
      const user = userEvent.setup();
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);
      await waitFor(() => expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '닫기' }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // ─── 통합 시나리오 ────────────────────────────────────────────────────────

  describe('통합 시나리오', () => {
    it('보기 → 수정 → 저장 전체 플로우가 정상 동작한다', async () => {
      const user = userEvent.setup();
      const updatedTemplate = { ...mockTemplate, title: '수정된 제목' };
      (templatesRepository.get as jest.Mock).mockResolvedValue({ ok: true, data: mockTemplate });
      (templatesRepository.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: updatedTemplate,
      });

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} onUpdate={mockOnUpdate} />);

      // 보기 모드 확인
      await waitFor(() => expect(screen.getByText('회의 요청 템플릿')).toBeInTheDocument());
      expect(screen.getByText('격식있는')).toBeInTheDocument();

      // 수정 모드 진입
      await user.click(screen.getByRole('button', { name: '수정' }));
      expect(screen.getByPlaceholderText('이메일 내용을 입력하세요...')).toBeInTheDocument();

      // 제목 수정
      const titleInput = screen.getByPlaceholderText('제목 (선택사항)');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 제목');

      // 저장
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('템플릿이 수정되었습니다.');
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      // 보기 모드로 복귀
      expect(screen.queryByPlaceholderText('이메일 내용을 입력하세요...')).not.toBeInTheDocument();
    });

    it('guest 모드에서도 전체 플로우가 정상 동작한다', async () => {
      const user = userEvent.setup();
      (authContext.useAuth as jest.Mock).mockReturnValue({ status: 'guest' });
      (guestTemplatesRepository.get as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });
      (guestTemplatesRepository.update as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockTemplate,
      });

      render(<TemplateDetailModal templateId="1" onClose={mockOnClose} />);

      await waitFor(() => expect(screen.getByText('회의 요청 템플릿')).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('템플릿이 수정되었습니다.'));
    });
  });
});
