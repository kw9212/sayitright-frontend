import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './card';

describe('Card 컴포넌트', () => {
  describe('Card', () => {
    it('카드가 화면에 렌더링된다', () => {
      render(<Card>카드 내용</Card>);
      expect(screen.getByText('카드 내용')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<Card />);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
    });

    it('children을 렌더링한다', () => {
      render(
        <Card>
          <div>자식 요소</div>
        </Card>,
      );
      expect(screen.getByText('자식 요소')).toBeInTheDocument();
    });

    it('커스텀 className을 적용할 수 있다', () => {
      const { container } = render(<Card className="custom-card" />);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('custom-card');
    });

    it('기본 스타일 클래스가 적용된다', () => {
      const { container } = render(<Card />);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('shadow-sm');
    });
  });

  describe('CardHeader', () => {
    it('카드 헤더가 렌더링된다', () => {
      render(
        <Card>
          <CardHeader>헤더</CardHeader>
        </Card>,
      );
      expect(screen.getByText('헤더')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<CardHeader />);
      const header = container.querySelector('[data-slot="card-header"]');
      expect(header).toBeInTheDocument();
    });

    it('커스텀 className을 적용할 수 있다', () => {
      const { container } = render(<CardHeader className="custom-header" />);
      const header = container.querySelector('[data-slot="card-header"]');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('카드 제목이 렌더링된다', () => {
      render(
        <Card>
          <CardTitle>제목</CardTitle>
        </Card>,
      );
      expect(screen.getByText('제목')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<CardTitle>제목</CardTitle>);
      const title = container.querySelector('[data-slot="card-title"]');
      expect(title).toBeInTheDocument();
    });

    it('font-semibold 클래스가 적용된다', () => {
      const { container } = render(<CardTitle>제목</CardTitle>);
      const title = container.querySelector('[data-slot="card-title"]');
      expect(title).toHaveClass('font-semibold');
    });

    it('커스텀 className을 적용할 수 있다', () => {
      const { container } = render(<CardTitle className="text-2xl">제목</CardTitle>);
      const title = container.querySelector('[data-slot="card-title"]');
      expect(title).toHaveClass('text-2xl');
    });
  });

  describe('CardDescription', () => {
    it('카드 설명이 렌더링된다', () => {
      render(
        <Card>
          <CardDescription>설명</CardDescription>
        </Card>,
      );
      expect(screen.getByText('설명')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<CardDescription>설명</CardDescription>);
      const description = container.querySelector('[data-slot="card-description"]');
      expect(description).toBeInTheDocument();
    });

    it('text-sm 클래스가 적용된다', () => {
      const { container } = render(<CardDescription>설명</CardDescription>);
      const description = container.querySelector('[data-slot="card-description"]');
      expect(description).toHaveClass('text-sm');
    });
  });

  describe('CardAction', () => {
    it('카드 액션이 렌더링된다', () => {
      render(
        <Card>
          <CardAction>
            <button>액션</button>
          </CardAction>
        </Card>,
      );
      expect(screen.getByText('액션')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(
        <CardAction>
          <button>액션</button>
        </CardAction>,
      );
      const action = container.querySelector('[data-slot="card-action"]');
      expect(action).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('카드 본문이 렌더링된다', () => {
      render(
        <Card>
          <CardContent>본문 내용</CardContent>
        </Card>,
      );
      expect(screen.getByText('본문 내용')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<CardContent>본문</CardContent>);
      const content = container.querySelector('[data-slot="card-content"]');
      expect(content).toBeInTheDocument();
    });

    it('px-6 클래스가 적용된다', () => {
      const { container } = render(<CardContent>본문</CardContent>);
      const content = container.querySelector('[data-slot="card-content"]');
      expect(content).toHaveClass('px-6');
    });
  });

  describe('CardFooter', () => {
    it('카드 푸터가 렌더링된다', () => {
      render(
        <Card>
          <CardFooter>푸터</CardFooter>
        </Card>,
      );
      expect(screen.getByText('푸터')).toBeInTheDocument();
    });

    it('data-slot 속성이 설정된다', () => {
      const { container } = render(<CardFooter>푸터</CardFooter>);
      const footer = container.querySelector('[data-slot="card-footer"]');
      expect(footer).toBeInTheDocument();
    });

    it('flex 클래스가 적용된다', () => {
      const { container } = render(<CardFooter>푸터</CardFooter>);
      const footer = container.querySelector('[data-slot="card-footer"]');
      expect(footer).toHaveClass('flex');
    });
  });

  describe('통합 시나리오', () => {
    it('모든 카드 컴포넌트를 조합하여 사용할 수 있다', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>카드 제목</CardTitle>
            <CardDescription>카드 설명</CardDescription>
          </CardHeader>
          <CardContent>본문 내용입니다.</CardContent>
          <CardFooter>푸터 영역</CardFooter>
        </Card>,
      );

      expect(screen.getByText('카드 제목')).toBeInTheDocument();
      expect(screen.getByText('카드 설명')).toBeInTheDocument();
      expect(screen.getByText('본문 내용입니다.')).toBeInTheDocument();
      expect(screen.getByText('푸터 영역')).toBeInTheDocument();
    });

    it('헤더에 액션 버튼을 추가할 수 있다', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>제목</CardTitle>
            <CardAction>
              <button>수정</button>
            </CardAction>
          </CardHeader>
        </Card>,
      );

      expect(screen.getByText('제목')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    });

    it('여러 개의 카드를 렌더링할 수 있다', () => {
      render(
        <div>
          <Card>
            <CardTitle>첫 번째 카드</CardTitle>
          </Card>
          <Card>
            <CardTitle>두 번째 카드</CardTitle>
          </Card>
        </div>,
      );

      expect(screen.getByText('첫 번째 카드')).toBeInTheDocument();
      expect(screen.getByText('두 번째 카드')).toBeInTheDocument();
    });

    it('실제 사용 예시: 프로필 카드', () => {
      render(
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>사용자 프로필</CardTitle>
            <CardDescription>계정 정보를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div>이름: 홍길동</div>
            <div>이메일: hong@example.com</div>
          </CardContent>
          <CardFooter>
            <button>프로필 수정</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('사용자 프로필')).toBeInTheDocument();
      expect(screen.getByText('계정 정보를 확인하세요')).toBeInTheDocument();
      expect(screen.getByText('이름: 홍길동')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '프로필 수정' })).toBeInTheDocument();
    });

    it('실제 사용 예시: 템플릿 카드', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>이메일 템플릿</CardTitle>
            <CardAction>
              <button>삭제</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>템플릿 내용이 여기에 표시됩니다.</p>
          </CardContent>
          <CardFooter>
            <span>작성일: 2024-01-01</span>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('이메일 템플릿')).toBeInTheDocument();
      expect(screen.getByText('템플릿 내용이 여기에 표시됩니다.')).toBeInTheDocument();
      expect(screen.getByText('작성일: 2024-01-01')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });
  });

  describe('HTML 속성', () => {
    it('onClick 이벤트를 처리할 수 있다', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>클릭 가능한 카드</Card>);

      const card = screen.getByText('클릭 가능한 카드');
      card.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('role 속성을 설정할 수 있다', () => {
      const { container } = render(<Card role="article">기사</Card>);
      const card = container.querySelector('[role="article"]');
      expect(card).toBeInTheDocument();
    });

    it('data-* 속성을 설정할 수 있다', () => {
      const { container } = render(<Card data-testid="my-card">카드</Card>);
      expect(container.querySelector('[data-testid="my-card"]')).toBeInTheDocument();
    });
  });
});
