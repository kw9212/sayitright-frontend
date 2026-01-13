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
  const [generatedRationale, setGeneratedRationale] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [missingFilters, setMissingFilters] = useState<string[]>([]);

  // 입력 제한 계산
  const getInputLimit = (): number => {
    const isKorean = filters.language === 'ko';

    if (!isAdvancedMode) {
      return isKorean ? 750 : 3000;
    }

    const limits: Record<string, { ko: number; en: number }> = {
      short: { ko: 600, en: 2400 },
      medium: { ko: 750, en: 3000 },
      long: { ko: 1200, en: 4800 },
    };

    const lengthLimit = filters.length ? limits[filters.length] : limits.medium;
    return isKorean ? lengthLimit.ko : lengthLimit.en;
  };

  const inputLimit = getInputLimit();
  const currentLength = userInput.length;
  const isOverLimit = currentLength > inputLimit;
  const limitPercentage = (currentLength / inputLimit) * 100;

  const handleFilterChange = (key: keyof EmailFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (auth.status === 'loading') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50">로딩중...</div>;
  }

  const isGuest = auth.status === 'guest';

  // 필터 완성도 체크
  const checkFiltersComplete = (): {
    complete: boolean;
    missing: string[];
  } => {
    const missing: string[] = [];

    if (!filters.relationship) missing.push('관계');
    if (!filters.purpose) missing.push('목적');

    if (isAdvancedMode) {
      if (!filters.tone) missing.push('톤');
      if (!filters.length) missing.push('길이');
    }

    return { complete: missing.length === 0, missing };
  };

  // 크레딧 체크
  const checkCreditForAdvanced = (): boolean => {
    const usesAdvancedFilters = filters.tone || filters.length;

    if (!usesAdvancedFilters) return true;

    if (isGuest) {
      setToastMessage('💡 체험 모드: 고급 기능을 무료로 사용 중입니다!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return true;
    }

    const creditBalance = auth.user?.creditBalance ?? 0;
    if (creditBalance < 1) {
      setToastMessage('⚠️ 크레딧이 부족합니다. 충전이 필요합니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setToastMessage('⚠️ 이메일 내용을 입력해주세요.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // 필터 완성도 체크
    const { complete, missing } = checkFiltersComplete();
    if (!complete) {
      setMissingFilters(missing);
      setShowConfirmModal(true);
      return;
    }

    // 크레딧 체크
    if (!checkCreditForAdvanced()) {
      return;
    }

    await executeGeneration();
  };

  // 실제 생성 로직
  const executeGeneration = async () => {
    setIsGenerating(true);
    try {
      // 직접 입력 값 병합 (고급 모드가 아니면 tone, length 제외)
      const finalFilters = {
        relationship:
          filters.relationship === 'custom' ? customInputs.relationship : filters.relationship,
        purpose: filters.purpose === 'custom' ? customInputs.purpose : filters.purpose,
        tone:
          isAdvancedMode && filters.tone === 'custom'
            ? customInputs.tone
            : isAdvancedMode
              ? filters.tone
              : undefined,
        length: isAdvancedMode ? filters.length : undefined,
      };

      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const usesAdvanced = isAdvancedMode && (finalFilters.tone || finalFilters.length);

      let email = `안녕하세요,\n\n${userInput}\n\n감사합니다.`;
      if (usesAdvanced) {
        email += `\n\n[고급 필터 적용: 톤=${finalFilters.tone}, `;
        email += `길이=${finalFilters.length}]`;
      }
      setGeneratedEmail(email);

      // 고급 기능 사용 시 피드백 추가
      if (usesAdvanced && isAdvancedMode) {
        const feedback = [
          `📋 개선 피드백:\n\n`,
          `1. 관계(${finalFilters.relationship})와 `,
          `목적(${finalFilters.purpose})을 고려하여 `,
          `적절한 표현을 선택했습니다.\n`,
          `2. 톤(${finalFilters.tone})에 맞춰 `,
          `문장의 형식과 어휘를 조정했습니다.\n`,
          `3. 길이(${finalFilters.length})를 고려하여 `,
          `핵심 내용을 효과적으로 구성했습니다.\n\n`,
          `이러한 요소들을 종합하여 수신자에게 `,
          `가장 적절한 형태로 메시지를 전달합니다.`,
        ].join('');

        setGeneratedRationale(feedback);

        // TODO: 크레딧 차감 API 호출
        if (!isGuest) {
          console.log('크레딧 1 차감됨');
        }
      } else {
        setGeneratedRationale('');
      }
    } catch (error) {
      console.error('이메일 생성 실패:', error);
      setToastMessage('❌ 이메일 생성에 실패했습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // 복사 버튼 핸들러
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setToastMessage('✅ 클립보드에 복사되었습니다!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('복사 실패:', error);
      setToastMessage('❌ 복사에 실패했습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // 템플릿 저장 핸들러
  const handleSaveTemplate = () => {
    setToastMessage('💾 템플릿 저장 기능은 곧 제공될 예정입니다.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
            <div
              className="flex-1 flex flex-col rounded-lg 
              bg-zinc-900 p-6 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">이메일 내용 작성</h2>

                {/* 글자수 카운터 */}
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-medium ${
                      isOverLimit
                        ? 'text-red-400'
                        : limitPercentage > 80
                          ? 'text-yellow-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {currentLength.toLocaleString()} /{inputLimit.toLocaleString()}
                  </div>
                  {isOverLimit && <span className="text-xs text-red-400">⚠️ 제한 초과</span>}
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="mb-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverLimit
                      ? 'bg-red-500'
                      : limitPercentage > 80
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(limitPercentage, 100)}%` }}
                />
              </div>

              {/* 경고 메시지 */}
              {isOverLimit && (
                <div
                  className="mb-3 p-3 rounded-lg bg-red-900/20 
                    border border-red-700/30"
                >
                  <p className="text-xs text-red-300">
                    ⚠️ 입력 제한을 초과했습니다.
                    {isAdvancedMode && filters.length && (
                      <span className="ml-1">길이 설정을 변경하면 더 많이 작성할 수 있습니다.</span>
                    )}
                  </p>
                </div>
              )}

              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="전달하고 싶은 내용을 자유롭게 작성하세요..."
                maxLength={inputLimit + 100}
                className={`flex-1 w-full px-4 py-3 rounded-lg bg-zinc-800 
                  border ${
                    isOverLimit
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-zinc-700 focus:border-blue-500'
                  } focus:outline-none transition-colors 
                  resize-none min-h-[300px]`}
              />
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isOverLimit}
              className={`w-full py-4 rounded-lg font-semibold 
                transition-colors ${
                  isOverLimit
                    ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700'
                }`}
            >
              {isGenerating ? '생성 중...' : isOverLimit ? '⚠️ 입력 제한 초과' : '이메일 생성'}
            </button>

            {/* 예상 출력 길이 */}
            {!isOverLimit && userInput && (
              <div className="text-xs text-zinc-500 text-center">
                💡 예상 출력: 약{' '}
                {filters.language === 'ko'
                  ? `${
                      filters.length === 'long'
                        ? '1500-2000'
                        : filters.length === 'medium'
                          ? '750-1000'
                          : '450-600'
                    }자`
                  : `${
                      filters.length === 'long'
                        ? '700-800'
                        : filters.length === 'medium'
                          ? '350-400'
                          : '200-250'
                    }단어`}
              </div>
            )}
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
                <p className="text-xs text-zinc-400 mt-1">
                  추가 필터 + 개선 피드백 제공 {!isGuest && '(크레딧 1)'}
                </p>
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
                <>
                  <div className="flex-1 overflow-auto mb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedEmail}
                    </pre>
                  </div>

                  {/* 피드백 (고급 기능) */}
                  {generatedRationale && (
                    <div
                      className="mb-4 p-4 rounded-lg bg-yellow-900/20 
                      border border-yellow-700/30"
                    >
                      <pre
                        className="whitespace-pre-wrap text-xs 
                        leading-relaxed text-yellow-200"
                      >
                        {generatedRationale}
                      </pre>
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="space-y-3">
                    <button
                      onClick={handleCopy}
                      className="w-full py-3 rounded-lg bg-green-600 
                        hover:bg-green-700 font-semibold transition-colors"
                    >
                      📋 복사하기
                    </button>

                    <button
                      onClick={handleSaveTemplate}
                      className="w-full py-3 rounded-lg bg-purple-600 
                        hover:bg-purple-700 font-semibold transition-colors"
                    >
                      💾 템플릿으로 저장
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 토스트 알림 */}
      {showToast && (
        <div
          className="fixed bottom-8 right-8 bg-zinc-800 
            border border-zinc-700 text-white px-6 py-3 
            rounded-lg shadow-lg animate-bounce max-w-sm"
        >
          {toastMessage}
        </div>
      )}

      {/* 필터 미설정 확인 모달 */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center 
          justify-center z-50"
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-lg 
            p-6 max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold mb-4">⚠️ 필터 미설정 확인</h3>
            <p className="text-zinc-300 mb-4">다음 필터가 설정되지 않았습니다:</p>
            <ul className="list-disc list-inside text-zinc-400 mb-6 space-y-1">
              {missingFilters.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-sm text-zinc-400 mb-6">
              이대로 진행하면 AI가 상황에 맞게 자동으로 판단합니다.
              <br />
              계속 진행하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-lg bg-zinc-700 
                  hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  if (checkCreditForAdvanced()) {
                    await executeGeneration();
                  }
                }}
                className="flex-1 py-3 rounded-lg bg-blue-600 
                  hover:bg-blue-700 transition-colors font-semibold"
              >
                진행하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
