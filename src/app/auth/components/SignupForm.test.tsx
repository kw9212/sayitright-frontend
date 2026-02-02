import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from './SignupForm';
import { toast } from 'sonner';

// toast 모의 객체
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// fetch 모의 객체
global.fetch = jest.fn();

describe('SignupForm 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('1단계: 이메일 입력', () => {
    it('처음에는 이메일 입력 화면이 표시된다', () => {
      render(<SignupForm />);

      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeInTheDocument();
    });

    it('이메일을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('유효한 이메일로 인증 코드를 발송할 수 있다', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(<SignupForm />);

      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/send-verification-code',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com' }),
          }),
        );
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('인증 코드가 이메일로 발송되었습니다.');
      });
    });

    it('잘못된 이메일 형식은 거부된다', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByRole('textbox'), 'invalid-email');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      // API 호출이 되지 않아야 함
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('인증 코드 발송 실패 시 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: '이미 가입된 이메일입니다.' } }),
      });

      render(<SignupForm />);

      await user.type(screen.getByRole('textbox'), 'existing@example.com');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('이미 가입된 이메일입니다.');
      });
    });
  });

  describe('2단계: 인증 코드 확인', () => {
    beforeEach(async () => {
      // 1단계를 먼저 완료
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      await waitFor(() => {
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      });
    });

    it('인증 코드 입력 화면이 표시된다', () => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '인증하기' })).toBeInTheDocument();
    });

    it('이메일 주소가 표시된다', () => {
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('이메일을 변경할 수 있다', async () => {
      const user = userEvent.setup();

      await user.click(screen.getByText('이메일 변경'));

      // 다시 이메일 입력 화면으로 돌아감
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeInTheDocument();
    });

    it('인증 코드를 입력할 수 있다', async () => {
      const user = userEvent.setup();

      const codeInput = screen.getByPlaceholderText('000000');
      await user.type(codeInput, '123456');

      expect(codeInput).toHaveValue('123456');
    });

    it('유효한 인증 코드로 인증할 수 있다', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const codeInput = screen.getByPlaceholderText('000000');
      await user.type(codeInput, '123456');
      await user.click(screen.getByRole('button', { name: '인증하기' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('이메일 인증이 완료되었습니다!');
      });
    });
  });

  describe('3단계: 회원가입', () => {
    beforeEach(async () => {
      // 1, 2단계를 먼저 완료
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      render(<SignupForm />);

      // 1단계: 이메일 입력
      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'test@example.com');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      // 2단계: 인증 코드 확인
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('000000'), '123456');
      await user.click(screen.getByRole('button', { name: '인증하기' }));

      await waitFor(() => {
        expect(screen.getByText(/✓ 이메일 인증 완료/)).toBeInTheDocument();
      });
    });

    it('회원가입 폼이 표시된다', () => {
      const inputs = screen.getAllByRole('textbox');
      // 닉네임 입력란이 있는지 확인
      expect(inputs.length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
    });

    it('인증 완료 메시지가 표시된다', () => {
      expect(screen.getByText(/✓ 이메일 인증 완료: test@example.com/)).toBeInTheDocument();
    });

    it('닉네임, 비밀번호를 입력하고 회원가입할 수 있다', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // 이미 렌더링된 컴포넌트에서 입력
      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], '테스터');

      // 비밀번호 필드 찾기
      const allInputs = document.querySelectorAll('input');
      const passwordInputs = Array.from(allInputs).filter(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('회원가입이 완료되었습니다!');
      });
    });

    it('비밀번호가 일치하지 않으면 에러를 표시한다', async () => {
      const user = userEvent.setup();

      const allInputs = document.querySelectorAll('input');
      const passwordInputs = Array.from(allInputs).filter(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'different');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      // 폼 유효성 검사 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('비밀번호가 일치하지 않아요')).toBeInTheDocument();
      });
    });

    it('비밀번호가 8자 미만이면 에러를 표시한다', async () => {
      const user = userEvent.setup();

      const allInputs = document.querySelectorAll('input');
      const passwordInputs = Array.from(allInputs).filter(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(passwordInputs[0], 'short');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByText('비밀번호는 8자 이상')).toBeInTheDocument();
      });
    });
  });

  describe('onSuccess 콜백', () => {
    it('회원가입 성공 시 onSuccess가 호출된다', async () => {
      const onSuccess = jest.fn();
      const user = userEvent.setup();

      // 모든 단계 모의
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      render(<SignupForm onSuccess={onSuccess} />);

      // 1단계
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      // 2단계
      await waitFor(() => {
        expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      });
      await user.type(screen.getByPlaceholderText('000000'), '123456');
      await user.click(screen.getByRole('button', { name: '인증하기' }));

      // 3단계
      await waitFor(() => {
        expect(screen.getByText(/✓ 이메일 인증 완료/)).toBeInTheDocument();
      });

      // 닉네임 입력 (선택사항이지만 입력하려면 2글자 이상)
      const textboxes = screen.getAllByRole('textbox');
      await user.type(textboxes[0], '테스터닉네임');

      const allInputs = document.querySelectorAll('input');
      const passwordInputs = Array.from(allInputs).filter(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });
});
