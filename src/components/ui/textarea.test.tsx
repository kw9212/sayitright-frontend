import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './textarea';

describe('Textarea 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('textarea 요소가 화면에 렌더링된다', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('textarea 태그로 렌더링된다', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('사용자 입력', () => {
    it('텍스트를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '안녕하세요');
      expect(textarea).toHaveValue('안녕하세요');
    });

    it('여러 줄 텍스트를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      const multilineText = '첫 줄\n둘째 줄\n셋째 줄';
      await user.type(textarea, multilineText);
      expect(textarea).toHaveValue(multilineText);
    });

    it('한글을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '한글 테스트');
      expect(textarea).toHaveValue('한글 테스트');
    });

    it('긴 텍스트를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      const longText = 'a'.repeat(500);
      await user.type(textarea, longText);
      expect(textarea).toHaveValue(longText);
    });

    it('입력값을 지울 수 있다', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test content');
      expect(textarea).toHaveValue('test content');

      await user.clear(textarea);
      expect(textarea).toHaveValue('');
    });
  });

  describe('HTML 속성', () => {
    it('placeholder를 설정할 수 있다', () => {
      render(<Textarea placeholder="내용을 입력하세요" />);
      expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeInTheDocument();
    });

    it('value를 설정할 수 있다', () => {
      render(<Textarea value="초기 내용" readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('초기 내용');
    });

    it('defaultValue를 설정할 수 있다', () => {
      render(<Textarea defaultValue="기본 내용" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('기본 내용');
    });

    it('disabled 상태를 설정할 수 있다', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('readOnly 상태를 설정할 수 있다', () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readOnly');
    });

    it('required 속성을 설정할 수 있다', () => {
      render(<Textarea required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('rows 속성을 설정할 수 있다', () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('cols 속성을 설정할 수 있다', () => {
      render(<Textarea cols={50} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });

    it('maxLength를 설정할 수 있다', () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('name 속성을 설정할 수 있다', () => {
      render(<Textarea name="message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('id 속성을 설정할 수 있다', () => {
      render(<Textarea id="message-input" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'message-input');
    });

    it('aria-label을 설정할 수 있다', () => {
      render(<Textarea aria-label="메시지 입력" />);
      expect(screen.getByLabelText('메시지 입력')).toBeInTheDocument();
    });

    it('aria-invalid를 설정할 수 있다', () => {
      render(<Textarea aria-invalid />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid');
    });
  });

  describe('커스텀 className', () => {
    it('추가 className을 적용할 수 있다', () => {
      render(<Textarea className="custom-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('기본 클래스와 커스텀 클래스가 함께 적용된다', () => {
      render(<Textarea className="my-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('my-textarea');
      expect(textarea).toHaveClass('rounded-md'); // 기본 클래스
    });
  });

  describe('이벤트 핸들링', () => {
    it('onChange 이벤트가 발생한다', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('onFocus 이벤트가 발생한다', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      render(<Textarea onFocus={handleFocus} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('onBlur 이벤트가 발생한다', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(<Textarea onBlur={handleBlur} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('onKeyDown 이벤트가 발생한다', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();
      render(<Textarea onKeyDown={handleKeyDown} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'a');
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('폼 통합', () => {
    it('폼과 함께 사용할 수 있다', () => {
      render(
        <form>
          <Textarea name="content" />
        </form>,
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'content');
    });

    it('폼 제출 시 값이 포함된다', async () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        return formData.get('message');
      });

      const user = userEvent.setup();
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" />
          <button type="submit">제출</button>
        </form>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '테스트 메시지');
      await user.click(screen.getByRole('button'));

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('실제 사용 시나리오', () => {
    it('이메일 본문 작성에 사용할 수 있다', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="이메일 본문을 입력하세요" rows={10} />);
      const textarea = screen.getByRole('textbox');

      const emailContent = `안녕하세요,

요청하신 자료를 첨부드립니다.
감사합니다.`;

      await user.type(textarea, emailContent);
      expect(textarea).toHaveValue(emailContent);
    });

    it('노트 작성에 사용할 수 있다', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Textarea placeholder="노트를 작성하세요" onChange={handleChange} maxLength={500} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '중요한 회의 내용');
      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('중요한 회의 내용');
    });
  });
});
