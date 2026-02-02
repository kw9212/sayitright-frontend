import { render, screen } from '@testing-library/react';
import { renderMarkdown } from './markdown';

describe('renderMarkdown 유틸리티', () => {
  describe('기본 텍스트 렌더링', () => {
    it('일반 텍스트를 그대로 렌더링한다', () => {
      const result = renderMarkdown('안녕하세요');
      const { container } = render(<div>{result}</div>);
      expect(container.textContent).toBe('안녕하세요');
    });

    it('빈 문자열을 처리한다', () => {
      const result = renderMarkdown('');
      const { container } = render(<div>{result}</div>);
      expect(container.textContent).toBe('');
    });

    it('공백만 있는 텍스트를 처리한다', () => {
      const result = renderMarkdown('   ');
      const { container } = render(<div>{result}</div>);
      expect(container.textContent).toBe('   ');
    });
  });

  describe('볼드 텍스트 처리', () => {
    it('**텍스트**를 <strong>으로 변환한다', () => {
      const result = renderMarkdown('이것은 **강조된** 텍스트입니다');
      const { container } = render(<div>{result}</div>);

      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('강조된');
      expect(strong).toHaveClass('font-semibold');
    });

    it('여러 개의 볼드 텍스트를 처리한다', () => {
      const result = renderMarkdown('**첫째** 텍스트 **둘째** 텍스트');
      const { container } = render(<div>{result}</div>);

      const strongs = container.querySelectorAll('strong');
      expect(strongs).toHaveLength(2);
      expect(strongs[0].textContent).toBe('첫째');
      expect(strongs[1].textContent).toBe('둘째');
    });

    it('한글, 영문, 숫자가 섞인 볼드 텍스트를 처리한다', () => {
      const result = renderMarkdown('**Hello 안녕 123**');
      const { container } = render(<div>{result}</div>);

      const strong = container.querySelector('strong');
      expect(strong?.textContent).toBe('Hello 안녕 123');
    });

    it('볼드 텍스트가 문장 앞에 있어도 처리한다', () => {
      const result = renderMarkdown('**시작** 중간 끝');
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe('시작 중간 끝');
      expect(container.querySelector('strong')?.textContent).toBe('시작');
    });

    it('볼드 텍스트가 문장 끝에 있어도 처리한다', () => {
      const result = renderMarkdown('시작 중간 **끝**');
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toBe('시작 중간 끝');
      expect(container.querySelector('strong')?.textContent).toBe('끝');
    });

    it('연속된 볼드 텍스트를 처리한다', () => {
      const result = renderMarkdown('**첫째****둘째**');
      const { container } = render(<div>{result}</div>);

      const strongs = container.querySelectorAll('strong');
      expect(strongs).toHaveLength(2);
    });
  });

  describe('줄바꿈 처리', () => {
    it('한 줄 텍스트는 <br> 없이 렌더링한다', () => {
      const result = renderMarkdown('한 줄');
      const { container } = render(<div>{result}</div>);

      expect(container.querySelectorAll('br')).toHaveLength(0);
    });

    it('두 줄 텍스트는 <br>로 구분한다', () => {
      const result = renderMarkdown('첫 줄\n둘째 줄');
      const { container } = render(<div>{result}</div>);

      expect(container.querySelectorAll('br')).toHaveLength(1);
      expect(container.textContent).toBe('첫 줄둘째 줄');
    });

    it('여러 줄 텍스트를 올바르게 처리한다', () => {
      const result = renderMarkdown('1번\n2번\n3번\n4번');
      const { container } = render(<div>{result}</div>);

      expect(container.querySelectorAll('br')).toHaveLength(3);
    });

    it('빈 줄도 올바르게 처리한다', () => {
      const result = renderMarkdown('첫 줄\n\n셋째 줄');
      const { container } = render(<div>{result}</div>);

      expect(container.querySelectorAll('br')).toHaveLength(2);
    });
  });

  describe('복합 시나리오', () => {
    it('여러 줄에 걸친 볼드 텍스트를 처리한다', () => {
      const result = renderMarkdown('첫째 줄 **강조**\n둘째 줄 **강조2**');
      const { container } = render(<div>{result}</div>);

      const strongs = container.querySelectorAll('strong');
      expect(strongs).toHaveLength(2);
      expect(strongs[0].textContent).toBe('강조');
      expect(strongs[1].textContent).toBe('강조2');

      const brs = container.querySelectorAll('br');
      expect(brs).toHaveLength(1);
    });

    it('볼드 없는 줄과 볼드 있는 줄을 섞어서 처리한다', () => {
      const result = renderMarkdown('일반 텍스트\n**강조된** 텍스트\n다시 일반');
      const { container } = render(<div>{result}</div>);

      expect(container.querySelector('strong')?.textContent).toBe('강조된');
      expect(container.textContent).toContain('일반 텍스트');
      expect(container.textContent).toContain('다시 일반');
    });

    it('실제 이메일 응답 형식을 처리한다', () => {
      const emailText = `안녕하세요 **김대리님**,

요청하신 **보고서**를 첨부합니다.
감사합니다.`;

      const result = renderMarkdown(emailText);
      const { container } = render(<div>{result}</div>);

      const strongs = container.querySelectorAll('strong');
      expect(strongs).toHaveLength(2);
      expect(strongs[0].textContent).toBe('김대리님');
      expect(strongs[1].textContent).toBe('보고서');
    });

    it('마크다운 구문이 없는 긴 텍스트를 처리한다', () => {
      const longText =
        '이것은 마크다운 구문이 전혀 없는 아주 긴 텍스트입니다. 여러 단어와 문장으로 구성되어 있습니다.';
      const result = renderMarkdown(longText);
      const { container } = render(<div>{result}</div>);

      expect(container.querySelectorAll('strong')).toHaveLength(0);
      expect(container.textContent).toBe(longText);
    });

    it('불완전한 볼드 구문은 일반 텍스트로 처리한다', () => {
      const result = renderMarkdown('**시작만 있고');
      const { container } = render(<div>{result}</div>);

      expect(container.querySelectorAll('strong')).toHaveLength(0);
      expect(container.textContent).toBe('**시작만 있고');
    });
  });

  describe('특수 문자 처리', () => {
    it('특수 문자를 포함한 볼드 텍스트를 처리한다', () => {
      const result = renderMarkdown('**!@#$%**');
      const { container } = render(<div>{result}</div>);

      const strong = container.querySelector('strong');
      expect(strong?.textContent).toBe('!@#$%');
    });

    it('이모지를 포함한 텍스트를 처리한다', () => {
      const result = renderMarkdown('안녕하세요 😊 **좋은 하루** 되세요 🎉');
      const { container } = render(<div>{result}</div>);

      expect(container.textContent).toContain('😊');
      expect(container.textContent).toContain('🎉');
      expect(container.querySelector('strong')?.textContent).toBe('좋은 하루');
    });

    it('URL을 포함한 텍스트를 처리한다', () => {
      const result = renderMarkdown('링크: **https://example.com**');
      const { container } = render(<div>{result}</div>);

      const strong = container.querySelector('strong');
      expect(strong?.textContent).toBe('https://example.com');
    });
  });
});
