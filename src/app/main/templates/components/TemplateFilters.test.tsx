/**
 * TemplateFilters 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateFilters from './TemplateFilters';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: { error: jest.fn() },
}));

const emptyFilters = {
  q: '',
  tone: '',
  relationship: '',
  purpose: '',
  from: '',
  to: '',
};

describe('TemplateFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('검색 입력창을 표시한다', () => {
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.getByPlaceholderText('템플릿 검색 (제목, 내용)...')).toBeInTheDocument();
    });

    it('"필터 열기" 버튼을 표시한다', () => {
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.getByRole('button', { name: '필터 열기' })).toBeInTheDocument();
    });

    it('초기에는 필터 패널이 접혀 있다', () => {
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.queryByLabelText('관계')).not.toBeInTheDocument();
    });

    it('활성 필터가 없으면 "초기화" 버튼이 표시되지 않는다', () => {
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);
      expect(screen.queryByRole('button', { name: '초기화' })).not.toBeInTheDocument();
    });
  });

  describe('검색어 입력', () => {
    it('검색어 입력 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      // 글자별로 호출되므로 마지막 호출만 확인
      await user.type(screen.getByPlaceholderText('템플릿 검색 (제목, 내용)...'), 'abc');

      // 'a', 'b', 'c' 순서로 각각 호출되므로 마지막은 'c'
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...emptyFilters,
        q: 'c',
      });
    });

    it('검색어가 있으면 "초기화" 버튼을 표시한다', () => {
      render(
        <TemplateFilters
          filters={{ ...emptyFilters, q: '회의' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
    });
  });

  describe('필터 열기/접기', () => {
    it('"필터 열기" 클릭 시 고급 필터 패널이 펼쳐진다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      expect(screen.getByText('관계')).toBeInTheDocument();
      expect(screen.getByText('목적')).toBeInTheDocument();
      expect(screen.getByText('톤')).toBeInTheDocument();
      expect(screen.getByText('기간')).toBeInTheDocument();
      expect(screen.getAllByRole('combobox').length).toBe(3);
    });

    it('펼쳐진 상태에서 버튼이 "필터 접기"로 바뀐다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      expect(screen.getByRole('button', { name: '필터 접기' })).toBeInTheDocument();
    });

    it('"필터 접기" 클릭 시 고급 필터 패널이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      await user.click(screen.getByRole('button', { name: '필터 접기' }));

      expect(screen.queryAllByRole('combobox').length).toBe(0);
    });
  });

  describe('고급 필터 변경', () => {
    it('관계 선택 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      // 순서: 관계(0), 목적(1), 톤(2)
      await user.selectOptions(screen.getAllByRole('combobox')[0], 'colleague');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        relationship: 'colleague',
      });
    });

    it('목적 선택 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      await user.selectOptions(screen.getAllByRole('combobox')[1], 'apology');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        purpose: 'apology',
      });
    });

    it('톤 선택 시 onFiltersChange가 호출된다', async () => {
      const user = userEvent.setup();
      render(<TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      await user.selectOptions(screen.getAllByRole('combobox')[2], 'casual');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        tone: 'casual',
      });
    });
  });

  describe('날짜 필터', () => {
    it('시작일이 종료일보다 늦으면 에러 토스트를 표시하고 변경하지 않는다', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const user = userEvent.setup();
      const filtersWithTo = { ...emptyFilters, to: '2024-01-10' };

      render(<TemplateFilters filters={filtersWithTo} onFiltersChange={mockOnFiltersChange} />);

      await user.click(screen.getByRole('button', { name: '필터 열기' }));

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

      render(<TemplateFilters filters={filtersWithTo} onFiltersChange={mockOnFiltersChange} />);

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

    it('to 날짜 필터가 활성화되면 "초기화" 버튼을 표시한다', () => {
      render(
        <TemplateFilters
          filters={{ ...emptyFilters, to: '2024-01-31' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
    });
  });

  describe('필터 초기화', () => {
    it('"초기화" 클릭 시 모든 필터가 초기화된다', async () => {
      const user = userEvent.setup();
      render(
        <TemplateFilters
          filters={{
            q: '회의',
            tone: 'formal',
            relationship: 'supervisor',
            purpose: 'request',
            from: '2024-01-01',
            to: '2024-01-31',
          }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: '초기화' }));

      expect(mockOnFiltersChange).toHaveBeenCalledWith(emptyFilters);
    });

    it('"초기화" 클릭 시 고급 필터 패널도 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <TemplateFilters
          filters={{ ...emptyFilters, q: '회의' }}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: '필터 열기' }));
      expect(screen.getAllByRole('combobox').length).toBe(3);

      await user.click(screen.getByRole('button', { name: '초기화' }));
      expect(screen.queryAllByRole('combobox').length).toBe(0);
    });
  });

  describe('통합 시나리오', () => {
    it('검색어 + 고급 필터 조합 후 초기화 전체 플로우', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TemplateFilters filters={emptyFilters} onFiltersChange={mockOnFiltersChange} />,
      );

      // 검색어 입력 (글자별로 호출되므로 한 글자 사용)
      await user.type(screen.getByPlaceholderText('템플릿 검색 (제목, 내용)...'), 'X');
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({ ...emptyFilters, q: 'X' });

      // 고급 필터 열기
      await user.click(screen.getByRole('button', { name: '필터 열기' }));

      // 톤 선택
      await user.selectOptions(screen.getAllByRole('combobox')[2], 'formal');
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({ ...emptyFilters, tone: 'formal' });

      // 상태 업데이트
      const updatedFilters = { ...emptyFilters, q: 'X', tone: 'formal' };
      rerender(<TemplateFilters filters={updatedFilters} onFiltersChange={mockOnFiltersChange} />);

      // 초기화 버튼 표시 확인
      expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();

      // 초기화
      await user.click(screen.getByRole('button', { name: '초기화' }));
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(emptyFilters);
    });
  });
});
