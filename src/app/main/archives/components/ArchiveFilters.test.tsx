/**
 * ArchiveFilters 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveFilters from './ArchiveFilters';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

const emptyFilters = {
  tone: '',
  relationship: '',
  purpose: '',
  from: '',
  to: '',
};

describe('ArchiveFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('"필터 열기" 버튼을 표시한다', () => {
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.getByRole('button', { name: '필터 열기' })).toBeInTheDocument();
    });

    it('초기에는 필터 패널이 접혀 있다', () => {
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.queryByLabelText('관계')).not.toBeInTheDocument();
    });

    it('활성 필터가 없으면 "필터 초기화" 버튼이 표시되지 않는다', () => {
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.queryByRole('button', { name: '필터 초기화' })).not.toBeInTheDocument();
    });
  });

  describe('필터 열기/접기', () => {
    it('"필터 열기" 클릭 시 필터 패널이 펼쳐진다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      expect(screen.getByText('관계')).toBeInTheDocument();
      expect(screen.getByText('목적')).toBeInTheDocument();
      expect(screen.getByText('톤')).toBeInTheDocument();
      expect(screen.getByText('기간')).toBeInTheDocument();
      expect(screen.getAllByRole('combobox').length).toBe(3);
    });

    it('펼쳐진 상태에서 버튼이 "필터 접기"로 바뀐다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      expect(screen.getByRole('button', { name: '필터 접기' })).toBeInTheDocument();
    });

    it('"필터 접기" 클릭 시 필터 패널이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      await user.click(screen.getByRole('button', { name: '필터 접기' }));

      expect(screen.queryAllByRole('combobox').length).toBe(0);
    });
  });

  describe('필터 변경', () => {
    it('관계 선택 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      // 순서: 관계(0), 목적(1), 톤(2)
      await user.selectOptions(screen.getAllByRole('combobox')[0], 'supervisor');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        relationship: 'supervisor',
      });
    });

    it('목적 선택 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      await user.selectOptions(screen.getAllByRole('combobox')[1], 'request');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        purpose: 'request',
      });
    });

    it('톤 선택 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      await user.selectOptions(screen.getAllByRole('combobox')[2], 'formal');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        tone: 'formal',
      });
    });
  });

  describe('날짜 필터', () => {
    it('시작일 입력 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      const dateInputs = screen.getAllByDisplayValue('');
      const fromInput =
        dateInputs.find(
          (el) => (el as HTMLInputElement).type === 'date' && el.getAttribute('max') !== undefined,
        ) ||
        screen.getAllByDisplayValue('').filter((el) => (el as HTMLInputElement).type === 'date')[0];

      // fireEvent로 날짜 입력
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.change(fromInput, { target: { value: '2024-01-01' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        from: '2024-01-01',
      });
    });

    it('시작일이 종료일보다 늦으면 에러 토스트를 표시하고 변경하지 않는다', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const user = userEvent.setup();
      const filtersWithTo = { ...emptyFilters, to: '2024-01-10' };

      render(<ArchiveFilters filters={filtersWithTo} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      const dateInputs = screen.getAllByDisplayValue('2024-01-10');
      const toInput = dateInputs[0];
      // from input은 별도 검색
      const fromInput = screen
        .getAllByDisplayValue('')
        .find((el) => (el as HTMLInputElement).type === 'date')!;

      fireEvent.change(fromInput, { target: { value: '2024-01-20' } });

      expect(toast.error).toHaveBeenCalledWith('시작 날짜는 종료 날짜보다 이를 수 없습니다.');
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it('유효한 날짜 범위는 정상 처리된다', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const user = userEvent.setup();
      const filtersWithTo = { ...emptyFilters, to: '2024-01-31' };

      render(<ArchiveFilters filters={filtersWithTo} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      const fromInput = screen
        .getAllByDisplayValue('')
        .find((el) => (el as HTMLInputElement).type === 'date')!;

      fireEvent.change(fromInput, { target: { value: '2024-01-01' } });

      expect(toast.error).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filtersWithTo,
        from: '2024-01-01',
      });
    });
  });

  describe('활성 필터 표시', () => {
    it('tone 필터가 활성화되면 배지를 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, tone: 'formal' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText(/톤: formal/)).toBeInTheDocument();
    });

    it('relationship 필터가 활성화되면 배지를 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, relationship: 'supervisor' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText(/관계: supervisor/)).toBeInTheDocument();
    });

    it('purpose 필터가 활성화되면 배지를 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, purpose: 'request' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText(/목적: request/)).toBeInTheDocument();
    });

    it('from 날짜 필터가 활성화되면 "기간 필터" 배지를 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, from: '2024-01-01' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('기간 필터')).toBeInTheDocument();
    });

    it('to 날짜 필터가 활성화되면 "기간 필터" 배지를 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, to: '2024-01-31' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('기간 필터')).toBeInTheDocument();
    });

    it('활성 필터가 있으면 "필터 초기화" 버튼을 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, tone: 'formal' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByRole('button', { name: '필터 초기화' })).toBeInTheDocument();
    });

    it('활성 필터가 있으면 "활성 필터:" 레이블을 표시한다', () => {
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, tone: 'formal' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('활성 필터:')).toBeInTheDocument();
    });
  });

  describe('필터 초기화', () => {
    it('"필터 초기화" 클릭 시 모든 필터가 초기화된다', async () => {
      const user = userEvent.setup();
      render(
        <ArchiveFilters
          filters={{
            tone: 'formal',
            relationship: 'supervisor',
            purpose: 'request',
            from: '2024-01-01',
            to: '2024-01-31',
          }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: '필터 초기화' }));

      expect(mockOnFiltersChange).toHaveBeenCalledWith(emptyFilters);
    });

    it('"필터 초기화" 클릭 시 필터 패널도 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <ArchiveFilters
          filters={{ ...emptyFilters, tone: 'formal' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      // 필터 열기
      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      expect(screen.getAllByRole('combobox').length).toBe(3);

      // 초기화 (필터 패널도 닫힘)
      await user.click(screen.getByRole('button', { name: '필터 초기화' }));
      expect(screen.queryAllByRole('combobox').length).toBe(0);
    });
  });

  describe('통합 시나리오', () => {
    it('필터를 열고 여러 조건을 설정한 뒤 초기화하는 전체 플로우', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ArchiveFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />,
      );

      // 필터 열기
      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      expect(screen.getAllByRole('combobox').length).toBe(3);

      // 관계 선택
      await user.selectOptions(screen.getAllByRole('combobox')[0], 'supervisor');
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...emptyFilters,
        relationship: 'supervisor',
      });

      // 상태 업데이트 후 재렌더링
      const updatedFilters = { ...emptyFilters, relationship: 'supervisor' };
      rerender(<ArchiveFilters filters={updatedFilters} onFiltersChange={mockOnFiltersChange} />);

      // 활성 필터 배지 확인
      expect(screen.getByText(/관계: supervisor/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '필터 초기화' })).toBeInTheDocument();

      // 초기화
      await user.click(screen.getByRole('button', { name: '필터 초기화' }));
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(emptyFilters);
    });
  });
});
