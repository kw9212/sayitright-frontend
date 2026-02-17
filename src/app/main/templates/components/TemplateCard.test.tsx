/**
 * TemplateCard 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateCard from './TemplateCard';
import { type TemplateListItem } from '@/lib/repositories/templates.repository';

describe('TemplateCard', () => {
  const mockTemplate: TemplateListItem = {
    id: '1',
    title: '회의 요청 템플릿',
    preview: '안녕하세요. 다음 주 회의 일정 관련하여...',
    tone: 'formal',
    relationship: 'supervisor',
    purpose: 'request',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };

  const mockOnToggleSelect = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('템플릿 카드가 렌더링된다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('회의 요청 템플릿')).toBeInTheDocument();
    });

    it('title이 있으면 title을 표시한다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('회의 요청 템플릿')).toBeInTheDocument();
    });

    it('title이 없으면 날짜를 title로 표시한다', () => {
      const templateWithoutTitle = {
        ...mockTemplate,
        title: '',
      };

      render(
        <TemplateCard
          template={templateWithoutTitle}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      // 날짜가 두 번 표시됨 (title 위치 + description 위치)
      expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
    });

    it('생성 날짜를 표시한다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('preview를 표시한다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText(/안녕하세요. 다음 주 회의 일정 관련하여.../)).toBeInTheDocument();
    });

    it('tone 라벨을 표시한다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('격식있는')).toBeInTheDocument();
    });

    it('relationship 라벨을 표시한다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('상사')).toBeInTheDocument();
    });

    it('purpose 라벨을 표시한다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('요청')).toBeInTheDocument();
    });

    it('relationship이 없으면 표시하지 않는다', () => {
      const templateWithoutRelationship = {
        ...mockTemplate,
        relationship: undefined,
      };

      render(
        <TemplateCard
          template={templateWithoutRelationship}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.queryByText('상사')).not.toBeInTheDocument();
    });

    it('purpose가 없으면 표시하지 않는다', () => {
      const templateWithoutPurpose = {
        ...mockTemplate,
        purpose: undefined,
      };

      render(
        <TemplateCard
          template={templateWithoutPurpose}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.queryByText('요청')).not.toBeInTheDocument();
    });
  });

  describe('Normal 모드', () => {
    it('onViewDetails가 제공되면 클릭 시 호출된다', async () => {
      const user = userEvent.setup();
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onViewDetails={mockOnViewDetails}
        />,
      );

      const card = screen.getByText('회의 요청 템플릿').closest('[data-slot="card"]');
      if (card) await user.click(card);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnToggleSelect).not.toHaveBeenCalled();
    });

    it('onViewDetails가 없으면 클릭해도 아무 일도 일어나지 않는다', async () => {
      const user = userEvent.setup();
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const card = screen.getByText('회의 요청 템플릿').closest('[data-slot="card"]');
      if (card) await user.click(card);

      expect(mockOnViewDetails).not.toHaveBeenCalled();
      expect(mockOnToggleSelect).not.toHaveBeenCalled();
    });

    it('체크박스가 표시되지 않는다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const checkboxes = screen.queryAllByRole('img');
      const hasCheckmark = checkboxes.some((el) => el.querySelector('path'));
      expect(hasCheckmark).toBe(false);
    });

    it('hover 효과가 적용된다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('hover:border-zinc-600');
    });
  });

  describe('Delete 모드', () => {
    it('체크박스가 표시된다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const checkbox = container.querySelector('.absolute.top-4.right-4');
      expect(checkbox).toBeInTheDocument();
    });

    it('선택되지 않은 상태에서는 빈 체크박스를 표시한다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const checkbox = container.querySelector('.border-zinc-600.bg-zinc-900');
      expect(checkbox).toBeInTheDocument();
    });

    it('선택된 상태에서는 체크 표시가 있는 체크박스를 표시한다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={true}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const checkmark = container.querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('클릭 시 onToggleSelect가 호출된다', async () => {
      const user = userEvent.setup();
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const card = screen.getByText('회의 요청 템플릿').closest('[data-slot="card"]');
      if (card) await user.click(card);

      expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);
    });

    it('delete mode에서는 onViewDetails가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
          onViewDetails={mockOnViewDetails}
        />,
      );

      const card = screen.getByText('회의 요청 템플릿').closest('[data-slot="card"]');
      if (card) await user.click(card);

      expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).not.toHaveBeenCalled();
    });

    it('선택된 상태에서는 카드가 빨간색으로 표시된다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={true}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('border-red-500');
      expect(card).toHaveClass('bg-red-950/20');
    });

    it('선택되지 않은 상태에서는 기본 색상으로 표시된다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('border-zinc-700');
    });

    it('delete mode에서는 빨간색 hover 효과가 적용된다', () => {
      const { container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('hover:border-red-400');
    });
  });

  describe('다양한 tone 표시', () => {
    it('casual tone을 표시한다', () => {
      const casualTemplate = {
        ...mockTemplate,
        tone: 'casual',
      };

      render(
        <TemplateCard
          template={casualTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('캐주얼')).toBeInTheDocument();
    });

    it('friendly tone을 표시한다', () => {
      const friendlyTemplate = {
        ...mockTemplate,
        tone: 'friendly',
      };

      render(
        <TemplateCard
          template={friendlyTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('친근한')).toBeInTheDocument();
    });
  });

  describe('다양한 데이터 시나리오', () => {
    it('긴 title은 잘린다 (line-clamp-1)', () => {
      const longTitleTemplate = {
        ...mockTemplate,
        title: '아주 긴 제목입니다. '.repeat(10),
      };

      const { container } = render(
        <TemplateCard
          template={longTitleTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const titleElement = container.querySelector('.line-clamp-1');
      expect(titleElement).toBeInTheDocument();
    });

    it('긴 preview는 3줄로 잘린다 (line-clamp-3)', () => {
      const longPreviewTemplate = {
        ...mockTemplate,
        preview: '아주 긴 내용입니다. '.repeat(50),
      };

      const { container } = render(
        <TemplateCard
          template={longPreviewTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      const previewElement = container.querySelector('.line-clamp-3');
      expect(previewElement).toBeInTheDocument();
    });

    it('모든 필터 태그가 있을 때 모두 표시된다', () => {
      render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('격식있는')).toBeInTheDocument();
      expect(screen.getByText('상사')).toBeInTheDocument();
      expect(screen.getByText('요청')).toBeInTheDocument();
    });

    it('필터 태그가 하나만 있어도 표시된다', () => {
      const minimalTemplate = {
        ...mockTemplate,
        relationship: undefined,
        purpose: undefined,
      };

      render(
        <TemplateCard
          template={minimalTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.getByText('격식있는')).toBeInTheDocument();
      expect(screen.queryByText('상사')).not.toBeInTheDocument();
      expect(screen.queryByText('요청')).not.toBeInTheDocument();
    });

    it('null 값은 undefined와 동일하게 처리된다', () => {
      const templateWithNull = {
        ...mockTemplate,
        relationship: null as unknown as string,
        purpose: null as unknown as string,
      };

      render(
        <TemplateCard
          template={templateWithNull}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      expect(screen.queryByText('상사')).not.toBeInTheDocument();
      expect(screen.queryByText('요청')).not.toBeInTheDocument();
    });
  });

  describe('통합 시나리오', () => {
    it('normal mode에서 delete mode로 전환된다', () => {
      const { rerender, container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={false}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      // Normal mode: 체크박스 없음
      let checkbox = container.querySelector('.absolute.top-4.right-4');
      expect(checkbox).not.toBeInTheDocument();

      // Delete mode로 전환
      rerender(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      // Delete mode: 체크박스 있음
      checkbox = container.querySelector('.absolute.top-4.right-4');
      expect(checkbox).toBeInTheDocument();
    });

    it('delete mode에서 선택/해제가 토글된다', async () => {
      const user = userEvent.setup();
      const { rerender, container } = render(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={false}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      // 첫 클릭: 선택
      const card = screen.getByText('회의 요청 템플릿').closest('[data-slot="card"]');
      if (card) await user.click(card);
      expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);

      // 선택된 상태로 rerender
      rerender(
        <TemplateCard
          template={mockTemplate}
          isDeleteMode={true}
          isSelected={true}
          onToggleSelect={mockOnToggleSelect}
        />,
      );

      // 체크마크 표시 확인
      const checkmark = container.querySelector('svg');
      expect(checkmark).toBeInTheDocument();

      // 두 번째 클릭: 해제
      if (card) await user.click(card);
      expect(mockOnToggleSelect).toHaveBeenCalledTimes(2);
    });
  });
});
