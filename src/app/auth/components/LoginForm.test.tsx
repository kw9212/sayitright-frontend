import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

// useAuth와 useRouter를 모의 객체로 대체
const mockLoginLocal = jest.fn();
const mockLoginAsGuest = jest.fn();
const mockPush = jest.fn();

jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    loginLocal: mockLoginLocal,
    loginAsGuest: mockLoginAsGuest,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginForm 컴포넌트', () => {
  // 각 테스트 전에 모의 함수 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('로그인 폼이 화면에 표시된다', () => {
      render(<LoginForm />);

      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('비밀번호')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('게스트 모드 버튼이 표시된다', () => {
      render(<LoginForm />);

      expect(screen.getByText(/게스트 모드로 사용해보기/)).toBeInTheDocument();
    });

    it('안내 문구가 표시된다', () => {
      render(<LoginForm />);

      expect(screen.getByText(/로그인 없이 모든 기능을 체험해볼 수 있습니다/)).toBeInTheDocument();
    });

    it('비밀번호 입력란이 password 타입이다', () => {
      render(<LoginForm />);

      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('사용자 입력', () => {
    it('이메일 입력이 정상적으로 동작한다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const inputs = screen.getAllByRole('textbox');
      const emailInput = inputs[0]; // 첫 번째 input이 이메일
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('비밀번호 입력이 정상적으로 동작한다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );
      await user.type(passwordInput!, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('여러 필드에 동시에 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const textboxes = screen.getAllByRole('textbox');
      const emailInput = textboxes[0];

      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(emailInput, 'user@test.com');
      await user.type(passwordInput!, 'mypassword');

      expect(emailInput).toHaveValue('user@test.com');
      expect(passwordInput).toHaveValue('mypassword');
    });
  });

  describe('폼 제출', () => {
    it('유효한 데이터로 로그인을 시도한다', async () => {
      const user = userEvent.setup();
      mockLoginLocal.mockResolvedValue(undefined);

      render(<LoginForm />);

      // 폼 입력
      const textboxes = screen.getAllByRole('textbox');
      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(textboxes[0], 'test@example.com');
      await user.type(passwordInput!, 'password123');

      // 제출
      await user.click(screen.getByRole('button', { name: '로그인' }));

      // loginLocal이 올바른 값으로 호출되었는지 확인
      await waitFor(() => {
        expect(mockLoginLocal).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('로그인 실패 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockLoginLocal.mockRejectedValue(new Error('인증 실패'));

      render(<LoginForm />);

      // 폼 입력
      const textboxes = screen.getAllByRole('textbox');
      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(textboxes[0], 'wrong@example.com');
      await user.type(passwordInput!, 'wrongpass');

      // 제출
      await user.click(screen.getByRole('button', { name: '로그인' }));

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('인증 실패')).toBeInTheDocument();
      });
    });

    it('알 수 없는 에러가 발생하면 기본 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockLoginLocal.mockRejectedValue('unknown error');

      render(<LoginForm />);

      const textboxes = screen.getAllByRole('textbox');
      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(textboxes[0], 'test@example.com');
      await user.type(passwordInput!, 'password123');
      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(screen.getByText('로그인 실패')).toBeInTheDocument();
      });
    });
  });

  describe('게스트 모드', () => {
    it('게스트 모드 버튼을 클릭하면 게스트로 로그인한다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const guestButton = screen.getByText(/게스트 모드로 사용해보기/);
      await user.click(guestButton);

      expect(mockLoginAsGuest).toHaveBeenCalledTimes(1);
    });

    it('게스트 모드로 로그인하면 /main으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const guestButton = screen.getByText(/게스트 모드로 사용해보기/);
      await user.click(guestButton);

      expect(mockPush).toHaveBeenCalledWith('/main');
    });
  });

  describe('폼 유효성 검사', () => {
    it('이메일 형식이 잘못되면 제출되지 않는다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const textboxes = screen.getAllByRole('textbox');
      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(textboxes[0], 'invalid-email');
      await user.type(passwordInput!, 'password123');
      await user.click(screen.getByRole('button', { name: '로그인' }));

      // loginLocal이 호출되지 않아야 함
      expect(mockLoginLocal).not.toHaveBeenCalled();
    });

    it('비밀번호가 8자 미만이면 제출되지 않는다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const textboxes = screen.getAllByRole('textbox');
      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(textboxes[0], 'test@example.com');
      await user.type(passwordInput!, 'short');
      await user.click(screen.getByRole('button', { name: '로그인' }));

      // loginLocal이 호출되지 않아야 함
      expect(mockLoginLocal).not.toHaveBeenCalled();
    });
  });

  describe('제출 중 상태', () => {
    it('제출 중에는 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      // 로그인이 천천히 완료되도록 설정
      mockLoginLocal.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginForm />);

      const textboxes = screen.getAllByRole('textbox');
      const allInputs = document.querySelectorAll('input');
      const passwordInput = Array.from(allInputs).find(
        (input) => input.getAttribute('type') === 'password',
      );

      await user.type(textboxes[0], 'test@example.com');
      await user.type(passwordInput!, 'password123');

      const submitButton = screen.getByRole('button', { name: '로그인' });
      await user.click(submitButton);

      // 제출 중에는 버튼이 비활성화됨
      expect(submitButton).toBeDisabled();

      // 제출 완료 후 다시 활성화됨
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});
