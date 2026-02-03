import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('레이블이 화면에 렌더링된다', () => {
      render(<Label>이메일</Label>);
      expect(screen.getByText('이메일')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<Label>레이블</Label>);
      const label = container.querySelector('[data-slot="label"]');
      expect(label).toBeInTheDocument();
    });

    it('children을 렌더링한다', () => {
      render(
        <Label>
          <span>사용자 이름</span>
        </Label>,
      );
      expect(screen.getByText('사용자 이름')).toBeInTheDocument();
    });
  });

  describe('HTML 속성', () => {
    it('htmlFor 속성을 설정할 수 있다', () => {
      const { container } = render(<Label htmlFor="email-input">이메일</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('id 속성을 설정할 수 있다', () => {
      const { container } = render(<Label id="email-label">이메일</Label>);
      const label = container.querySelector('label');
      expect(label).toHaveAttribute('id', 'email-label');
    });
  });

  describe('커스텀 className', () => {
    it('추가 className을 적용할 수 있다', () => {
      const { container } = render(<Label className="custom-label">레이블</Label>);
      const label = container.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('custom-label');
    });

    it('기본 클래스와 커스텀 클래스가 함께 적용된다', () => {
      const { container } = render(<Label className="text-lg">레이블</Label>);
      const label = container.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('text-lg');
      expect(label).toHaveClass('font-medium'); // 기본 클래스
    });
  });

  describe('폼과의 통합', () => {
    it('input과 연결하여 사용할 수 있다', () => {
      render(
        <div>
          <Label htmlFor="username">사용자 이름</Label>
          <input id="username" type="text" />
        </div>,
      );

      const label = screen.getByText('사용자 이름');
      const input = screen.getByRole('textbox');

      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'username');
    });

    it('textarea와 연결하여 사용할 수 있다', () => {
      render(
        <div>
          <Label htmlFor="message">메시지</Label>
          <textarea id="message" />
        </div>,
      );

      const label = screen.getByText('메시지');
      expect(label).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('label 태그로 렌더링된다', () => {
      const { container } = render(<Label>레이블</Label>);
      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
    });

    it('필수 표시를 추가할 수 있다', () => {
      render(
        <Label>
          이메일 <span className="text-red-500">*</span>
        </Label>,
      );

      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('실제 사용 시나리오', () => {
    it('폼 필드와 함께 사용된다', () => {
      render(
        <form>
          <div>
            <Label htmlFor="email">이메일</Label>
            <input id="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <input id="password" type="password" required />
          </div>
        </form>,
      );

      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('비밀번호')).toBeInTheDocument();
    });

    it('도움말과 함께 표시할 수 있다', () => {
      render(
        <div>
          <Label htmlFor="username">사용자 이름</Label>
          <p className="text-xs text-gray-500">2-20자 사이로 입력하세요</p>
          <input id="username" />
        </div>,
      );

      expect(screen.getByText('사용자 이름')).toBeInTheDocument();
      expect(screen.getByText('2-20자 사이로 입력하세요')).toBeInTheDocument();
    });
  });
});
