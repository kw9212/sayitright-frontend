'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { MainHeader } from '@/components/layout/MainHeader';
import { useState } from 'react';

type EmailFilters = {
  relationship: string;
  purpose: string;
  tone: string;
  length: string;
  language: string;
};

export default function EmailComposePage() {
  const auth = useAuth();
  const [filters, setFilters] = useState<EmailFilters>({
    relationship: '',
    purpose: '',
    tone: '',
    length: '',
    language: 'ko',
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [customInputs, setCustomInputs] = useState({
    relationship: '',
    purpose: '',
    tone: '',
  });
  const [userInput, setUserInput] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFilterChange = (key: keyof EmailFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (auth.status === 'loading') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50">로딩중...</div>;
  }

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      alert('이메일 내용을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      // 직접 입력 값 병합
      const finalFilters = {
        relationship:
          filters.relationship === 'custom' ? customInputs.relationship : filters.relationship,
        purpose: filters.purpose === 'custom' ? customInputs.purpose : filters.purpose,
        tone: filters.tone === 'custom' ? customInputs.tone : filters.tone,
        length: filters.length,
      };

      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let email = `[생성된 이메일]\n\n${userInput}`;
      if (finalFilters.relationship || finalFilters.purpose) {
        email += `\n\n[필터: 관계=${finalFilters.relationship}, `;
        email += `목적=${finalFilters.purpose}`;

        if (finalFilters.tone) {
          email += `, 톤=${finalFilters.tone}`;
        }

        if (finalFilters.length) {
          email += `, 길이=${finalFilters.length}`;
        }
        email += `]`;
      }
      setGeneratedEmail(email);
    } catch (error) {
      console.error('생성 실패:', error);
      alert('이메일 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <MainHeader title="이메일 작성" showBackButton={true} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {/* 왼쪽: 입력 영역 */}
          <div className="flex flex-col gap-6">
            {/* 필터 섹션 */}
            <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-4">필터 설정</h2>
              {/* 언어 선택 */}
              <div className="mb-6 p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                <label className="block text-sm font-medium text-zinc-300 mb-3">🌐 언어 선택</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('language', 'ko')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium 
                      transition-all ${
                        filters.language === 'ko'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => handleFilterChange('language', 'en')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium 
                      transition-all ${
                        filters.language === 'en'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* 관계 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    관계 <span className="text-xs text-green-400">(기본)</span>
                  </label>
                  <select
                    value={filters.relationship}
                    onChange={(e) => handleFilterChange('relationship', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 
                      border border-zinc-700 focus:border-blue-500 
                      focus:outline-none transition-colors"
                  >
                    <option value="">선택하세요</option>
                    <option value="professor">교수님</option>
                    <option value="supervisor">상사</option>
                    <option value="colleague">동료</option>
                    <option value="client">고객</option>
                    <option value="friend">친구</option>
                    <option value="custom">직접 입력</option>
                  </select>

                  {/* 직접 입력 필드 */}
                  {filters.relationship === 'custom' && (
                    <input
                      type="text"
                      value={customInputs.relationship}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({
                          ...prev,
                          relationship: e.target.value,
                        }))
                      }
                      placeholder="예: 사촌, 선배님 등"
                      className="mt-2 w-full px-4 py-2 rounded-lg bg-zinc-800 
                        border border-zinc-700 focus:border-blue-500 
                        focus:outline-none transition-colors"
                    />
                  )}
                </div>

                {/* 목적 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    목적 <span className="text-xs text-green-400">(기본)</span>
                  </label>
                  <select
                    value={filters.purpose}
                    onChange={(e) => handleFilterChange('purpose', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 
                      border border-zinc-700 focus:border-blue-500 
                      focus:outline-none transition-colors"
                  >
                    <option value="">선택하세요</option>
                    <option value="request">요청</option>
                    <option value="apology">사과</option>
                    <option value="thank">감사</option>
                    <option value="inquiry">문의</option>
                    <option value="report">보고</option>
                    <option value="custom">직접 입력</option>
                  </select>

                  {/* 직접 입력 필드 */}
                  {filters.purpose === 'custom' && (
                    <input
                      type="text"
                      value={customInputs.purpose}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({
                          ...prev,
                          purpose: e.target.value,
                        }))
                      }
                      placeholder="예: 축하, 위로 등"
                      className="mt-2 w-full px-4 py-2 rounded-lg bg-zinc-800 
                        border border-zinc-700 focus:border-blue-500 
                        focus:outline-none transition-colors"
                    />
                  )}
                </div>

                {/* 톤 (고급) */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    톤 <span className="text-xs text-yellow-400">(고급)</span>
                  </label>
                  <select
                    value={filters.tone}
                    onChange={(e) => handleFilterChange('tone', e.target.value)}
                    disabled={!isAdvancedMode}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 
                      border border-zinc-700 focus:border-blue-500 
                      focus:outline-none transition-colors 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">선택하세요</option>
                    <option value="formal">격식있는</option>
                    <option value="polite">공손한</option>
                    <option value="casual">캐주얼</option>
                    <option value="friendly">친근한</option>
                    <option value="custom">직접 입력</option>
                  </select>

                  {/* 직접 입력 필드 */}
                  {filters.tone === 'custom' && (
                    <input
                      type="text"
                      value={customInputs.tone}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({
                          ...prev,
                          tone: e.target.value,
                        }))
                      }
                      placeholder="예: 유머러스한, 진지한 등"
                      disabled={!isAdvancedMode}
                      className="mt-2 w-full px-4 py-2 rounded-lg bg-zinc-800 
                        border border-zinc-700 focus:border-blue-500 
                        focus:outline-none transition-colors 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  )}
                </div>

                {/* 길이 (고급) */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    길이 <span className="text-xs text-yellow-400">(고급)</span>
                  </label>
                  <select
                    value={filters.length}
                    onChange={(e) => handleFilterChange('length', e.target.value)}
                    disabled={!isAdvancedMode}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 
                      border border-zinc-700 focus:border-blue-500 
                      focus:outline-none transition-colors 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">선택하세요</option>
                    <option value="short">짧게 (간결)</option>
                    <option value="medium">보통</option>
                    <option value="long">길게 (상세)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 텍스트 입력 */}
            <div className="flex-1 flex flex-col rounded-lg bg-zinc-900 p-6 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-4">이메일 내용 작성</h2>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="전달하고 싶은 내용을 자유롭게 작성하세요..."
                className="flex-1 w-full px-4 py-3 rounded-lg bg-zinc-800 
                  border border-zinc-700 focus:border-blue-500 
                  focus:outline-none transition-colors resize-none min-h-[400px]"
              />
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 
                disabled:bg-zinc-700 disabled:cursor-not-allowed 
                font-semibold transition-colors"
            >
              {isGenerating ? '생성 중...' : '이메일 생성'}
            </button>
          </div>

          {/* 오른쪽: 결과 영역 */}
          <div className="flex flex-col gap-6">
            {/* 고급 기능 토글 */}
            <div
              className="flex items-center justify-between rounded-lg 
              bg-zinc-900 p-4 border border-zinc-800"
            >
              <div>
                <h3 className="font-semibold">고급 기능</h3>
                <p className="text-xs text-zinc-400 mt-1">추가 필터 + 개선 근거 제공</p>
              </div>
              <button
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className={`px-6 py-2 rounded-lg font-medium 
                  transition-colors ${
                    isAdvancedMode
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
              >
                {isAdvancedMode ? '활성화됨 ✓' : '활성화'}
              </button>
            </div>

            <div className="flex-1 rounded-lg bg-zinc-900 p-6 border border-zinc-800 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">생성된 이메일</h2>

              {!generatedEmail && !isGenerating && (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">✉️</div>
                    <p>왼쪽에서 내용을 작성하고</p>
                    <p>&apos;이메일 생성&apos; 버튼을 눌러주세요</p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="flex-1 flex items-center justify-center text-zinc-400">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p>이메일을 생성하고 있습니다...</p>
                  </div>
                </div>
              )}

              {generatedEmail && !isGenerating && (
                <div className="flex-1 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedEmail}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
