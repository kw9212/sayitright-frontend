import { useState } from 'react';
import { toast } from 'sonner';

type Filters = {
  q: string;
  tone: string;
  relationship: string;
  purpose: string;
  from: string;
  to: string;
};

type Props = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
};

export default function TemplateFilters({ filters, onFiltersChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    const newFilters = { ...filters, [key]: value };

    if (newFilters.from && newFilters.to) {
      const fromDate = new Date(newFilters.from);
      const toDate = new Date(newFilters.to);

      if (fromDate > toDate) {
        toast.error('시작 날짜는 종료 날짜보다 이를 수 없습니다.');
        return;
      }
    }

    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    onFiltersChange({
      q: '',
      tone: '',
      relationship: '',
      purpose: '',
      from: '',
      to: '',
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters =
    filters.q ||
    filters.tone ||
    filters.relationship ||
    filters.purpose ||
    filters.from ||
    filters.to;

  return (
    <div className="space-y-4 bg-zinc-800 rounded-lg border border-zinc-700 p-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
            placeholder="템플릿 검색 (제목, 내용)..."
            className="w-full px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg 
              text-white placeholder-zinc-500 focus:outline-none 
              focus:border-blue-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showAdvanced ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
        >
          {showAdvanced ? '필터 접기' : '필터 열기'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="pt-4 border-t border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">관계</label>
              <select
                value={filters.relationship}
                onChange={(e) => handleChange('relationship', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg 
                  text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">전체</option>
                <option value="professor">교수님</option>
                <option value="supervisor">상사</option>
                <option value="colleague">동료</option>
                <option value="client">고객</option>
                <option value="friend">친구</option>
                <option value="__other__">기타 (사용자 정의)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">목적</label>
              <select
                value={filters.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg 
                  text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">전체</option>
                <option value="request">요청</option>
                <option value="apology">사과</option>
                <option value="thank">감사</option>
                <option value="inquiry">문의</option>
                <option value="report">보고</option>
                <option value="__other__">기타 (사용자 정의)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">톤</label>
              <select
                value={filters.tone}
                onChange={(e) => handleChange('tone', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg 
                  text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">전체</option>
                <option value="formal">격식있는</option>
                <option value="polite">공손한</option>
                <option value="casual">캐주얼</option>
                <option value="friendly">친근한</option>
                <option value="__other__">기타 (사용자 정의)</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm text-zinc-400 mb-2">기간</label>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <input
                  type="date"
                  value={filters.from}
                  max={filters.to || undefined}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  placeholder="시작일"
                  className="date-input-light flex-1 sm:max-w-[200px] px-3 py-2 bg-zinc-900 border 
                    border-zinc-700 rounded-lg text-white focus:outline-none 
                    focus:border-blue-500 transition-colors"
                />
                <span className="hidden sm:block text-zinc-500 self-center">~</span>
                <input
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  placeholder="종료일"
                  className="date-input-light flex-1 sm:max-w-[200px] px-3 py-2 bg-zinc-900 border 
                    border-zinc-700 rounded-lg text-white focus:outline-none 
                    focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
