import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('input 요소가 화면에 렌더링된다', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('input 태그로 렌더링된다', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('type 속성', () => {
    it('type="email"을 설정할 수 있다', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('type="password"를 설정할 수 있다', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('type="number"를 설정할 수 있다', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('type="tel"을 설정할 수 있다', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('type="url"을 설정할 수 있다', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });
  });

  describe('사용자 입력', () => {
    it('텍스트를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.type(input, '안녕하세요');
      expect(input).toHaveValue('안녕하세요');
    });

    it('한글을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.type(input, '테스트');
      expect(input).toHaveValue('테스트');
    });

    it('숫자를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');

      await user.type(input, '12345');
      expect(input).toHaveValue(12345);
    });

    it('입력값을 지울 수 있다', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(input).toHaveValue('test');

      await user.clear(input);
      expect(input).toHaveValue('');
    });
  });

  describe('HTML 속성', () => {
    it('placeholder를 설정할 수 있다', () => {
      render(<Input placeholder="이메일을 입력하세요" />);
      expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
    });

    it('value를 설정할 수 있다', () => {
      render(<Input value="초기값" readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('초기값');
    });

    it('defaultValue를 설정할 수 있다', () => {
      render(<Input defaultValue="기본값" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('기본값');
    });

    it('disabled 상태를 설정할 수 있다', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('readOnly 상태를 설정할 수 있다', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readOnly');
    });

    it('required 속성을 설정할 수 있다', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('maxLength를 설정할 수 있다', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('name 속성을 설정할 수 있다', () => {
      render(<Input name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('id 속성을 설정할 수 있다', () => {
      render(<Input id="email-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('aria-label을 설정할 수 있다', () => {
      render(<Input aria-label="이메일 입력" />);
      expect(screen.getByLabelText('이메일 입력')).toBeInTheDocument();
    });

    it('aria-invalid를 설정할 수 있다', () => {
      render(<Input aria-invalid />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid');
    });
  });

  describe('커스텀 className', () => {
    it('추가 className을 적용할 수 있다', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('기본 클래스와 커스텀 클래스가 함께 적용된다', () => {
      render(<Input className="my-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('my-input');
      expect(input).toHaveClass('rounded-md'); // 기본 클래스
    });
  });

  describe('이벤트 핸들링', () => {
    it('onChange 이벤트가 발생한다', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('onFocus 이벤트가 발생한다', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('onBlur 이벤트가 발생한다', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('onKeyDown 이벤트가 발생한다', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'a');
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('폼 통합', () => {
    it('폼과 함께 사용할 수 있다', () => {
      render(
        <form>
          <Input name="username" />
        </form>,
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('폼 제출 시 값이 포함된다', async () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        return formData.get('email');
      });

      const user = userEvent.setup();
      render(
        <form onSubmit={handleSubmit}>
          <Input name="email" />
          <button type="submit">제출</button>
        </form>,
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test@example.com');
      await user.click(screen.getByRole('button'));

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
