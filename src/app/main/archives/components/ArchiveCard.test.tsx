import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveCard from './ArchiveCard';
import { type ArchiveListItem } from '@/lib/repositories/archives.repository';

const mockArchive: ArchiveListItem = {
  id: '1',
  title: '테스트 아카이브',
  preview: '이것은 테스트 아카이브의 미리보기 텍스트입니다.',
  tone: 'formal',
  relationship: 'professor',
  purpose: 'request',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

describe('ArchiveCard 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('아카이브 카드가 화면에 렌더링된다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('테스트 아카이브')).toBeInTheDocument();
    });

    it('미리보기 텍스트를 표시한다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(
        screen.getByText('이것은 테스트 아카이브의 미리보기 텍스트입니다.'),
      ).toBeInTheDocument();
    });

    it('생성 날짜를 표시한다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      // 날짜 형식은 로케일에 따라 다르므로 연도만 확인
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('톤 레이블을 표시한다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('격식있는')).toBeInTheDocument();
    });

    it('관계 레이블을 표시한다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('교수님')).toBeInTheDocument();
    });

    it('목적 레이블을 표시한다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('요청')).toBeInTheDocument();
    });
  });

  describe('제목 처리', () => {
    it('제목이 있으면 제목을 표시한다', () => {
      render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('테스트 아카이브')).toBeInTheDocument();
    });

    it('제목이 없으면 날짜를 표시한다', () => {
      const archiveWithoutTitle = { ...mockArchive, title: '' };
      render(
        <ArchiveCard
          archive={archiveWithoutTitle}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      // 날짜가 제목으로 사용됨
      expect(screen.getAllByText(/2024/)).toHaveLength(2);
    });
  });

  describe('선택적 필드 처리', () => {
    it('relationship이 없으면 표시하지 않는다', () => {
      const archiveWithoutRelationship = { ...mockArchive, relationship: undefined };
      render(
        <ArchiveCard
          archive={archiveWithoutRelationship}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.queryByText('교수님')).not.toBeInTheDocument();
      expect(screen.getByText('격식있는')).toBeInTheDocument(); // 톤은 여전히 표시
    });

    it('purpose가 없으면 표시하지 않는다', () => {
      const archiveWithoutPurpose = { ...mockArchive, purpose: undefined };
      render(
        <ArchiveCard
          archive={archiveWithoutPurpose}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.queryByText('요청')).not.toBeInTheDocument();
      expect(screen.getByText('격식있는')).toBeInTheDocument(); // 톤은 여전히 표시
    });
  });

  describe('일반 모드', () => {
    it('클릭하면 onViewDetails가 호출된다', async () => {
      const onViewDetails = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
          onViewDetails={onViewDetails}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      if (card) {
        await user.click(card);
      }

      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('onViewDetails가 없으면 클릭해도 아무 일도 일어나지 않는다', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      if (card) {
        await user.click(card);
      }

      // 에러 없이 실행됨
      expect(true).toBe(true);
    });

    it('삭제 모드가 아닐 때는 체크박스가 표시되지 않는다', () => {
      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      // 삭제 모드가 아닐 때는 체크박스 컨테이너가 없음
      const checkboxContainer = container.querySelector('.absolute.top-4.right-4');
      expect(checkboxContainer).not.toBeInTheDocument();
    });
  });

  describe('삭제 모드', () => {
    it('체크박스가 표시된다', () => {
      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      const checkbox = container.querySelector('.w-6.h-6');
      expect(checkbox).toBeInTheDocument();
    });

    it('선택되지 않은 상태를 표시한다', () => {
      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument(); // 체크 마크가 없음
    });

    it('선택된 상태를 표시한다', () => {
      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={true}
          isSelected={true}
          onToggleSelect={jest.fn()}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument(); // 체크 마크가 있음
    });

    it('클릭하면 onToggleSelect가 호출된다', async () => {
      const onToggleSelect = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={onToggleSelect}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      if (card) {
        await user.click(card);
      }

      expect(onToggleSelect).toHaveBeenCalledTimes(1);
    });

    it('삭제 모드에서는 onViewDetails가 호출되지 않는다', async () => {
      const onViewDetails = jest.fn();
      const onToggleSelect = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <ArchiveCard
          archive={mockArchive}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={onToggleSelect}
          onViewDetails={onViewDetails}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      if (card) {
        await user.click(card);
      }

      expect(onToggleSelect).toHaveBeenCalledTimes(1);
      expect(onViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('다양한 톤 처리', () => {
    it('polite 톤을 표시한다', () => {
      const politeArchive = { ...mockArchive, tone: 'polite' };
      render(
        <ArchiveCard
          archive={politeArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('공손한')).toBeInTheDocument();
    });

    it('casual 톤을 표시한다', () => {
      const casualArchive = { ...mockArchive, tone: 'casual' };
      render(
        <ArchiveCard
          archive={casualArchive}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('캐주얼')).toBeInTheDocument();
    });
  });
});
