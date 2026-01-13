'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { MainHeader } from '@/components/layout/MainHeader';
import { useState } from 'react';

/**
 * Step 1: 기본 페이지 구조
 * - MainHeader 통합
 * - 좌우 2분할 레이아웃
 * - 텍스트 입력 + 생성 버튼
 */
export default function EmailComposePage() {
  const auth = useAuth();
  const [userInput, setUserInput] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGeneratedEmail(`[생성된 이메일]\n\n${userInput}`);
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
