'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TypingText from '@/components/TypingText';
import { useAuth } from '@/lib/auth/auth-context';

export default function IntroPage() {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRefined, setShowRefined] = useState(false);

  const beforeEmail = `안녕하세요
    지난번 말한거 있잖아요 그거 반영해서 기획서 만들어봤어요
    한번 봐주시면 좋을것같습니다 수정할거있으면 말씀해주세요`;

  const refinedEmail = `안녕하세요, 팀장님.

    지난번 회의에서 말씀해 주신 내용을 반영하여 기획서 초안을 작성했습니다.

    첨부한 문서를 검토해 주시고, 수정이 필요한 부분이 있다면 말씀해 주시면 감사하겠습니다.

    감사합니다.`;

  const auth = useAuth();

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowRefined(false);
    setResetKey((k) => k + 1);

    setTimeout(() => {
      setShowRefined(true);
      setIsGenerating(false);
    }, 300);
  };

  return (
    <main
      onClick={() => router.push(auth.status === 'authenticated' ? '/main' : '/auth')}
      className="relative min-h-screen bg-zinc-950 text-zinc-50"
    >
      {/* subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0 
          bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.10),transparent_55%)]"
      />
      {/* neon line */}
      <div
        className="pointer-events-none absolute left-1/2 
          top-0 h-full w-px -translate-x-1/2 bg-linear-to-b 
          from-transparent via-emerald-300/40 to-transparent"
      />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8">
        <div className="space-y-3">
          <div
            className="mb-4 inline-flex items-center gap-2 
              rounded-full border border-zinc-800 bg-zinc-900/40 
              px-3 py-1 text-xs text-zinc-200"
          >
            <span
              className="h-2 w-2 rounded-full bg-emerald-400 
                shadow-[0_0_12px_rgba(52,211,153,0.7)]"
            />
            say it right, fast.
          </div>
          <h1 className="text-5xl font-semibold tracking-tight">
            <span className="text-zinc-100">SayItRight</span>
            <span className="ml-3 align-middle text-sm font-normal text-emerald-300">• beta</span>
          </h1>
          <p className="max-w-xl text-sm text-zinc-400">
            상황 기반 문구 생성 · 코멘트 · 템플릿 저장
          </p>

          {/* Before & After Demo */}
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-zinc-400">정제 전</div>
                  <div className="text-xs text-red-400">❌</div>
                </div>
                <div
                  className="text-sm text-zinc-300 
                    whitespace-pre-line leading-relaxed opacity-70"
                >
                  {beforeEmail}
                </div>
              </div>

              <div
                className="rounded-xl border border-emerald-700/50 bg-zinc-900/40 
                  p-4 backdrop-blur shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-emerald-400">정제 후</div>
                  <div className="text-xs text-emerald-400">
                    {isGenerating ? '⏳ 생성중...' : showRefined ? '✓ 완료' : ''}
                  </div>
                </div>
                <div
                  className="text-sm text-zinc-100 whitespace-pre-line 
                    leading-relaxed min-h-[120px]"
                >
                  {showRefined ? (
                    <TypingText
                      key={resetKey}
                      text={refinedEmail}
                      speedMs={20}
                      startDelayMs={0}
                      onDone={() => {}}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                      &apos;이메일 생성&apos; 버튼을 눌러보세요
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              disabled={isGenerating}
              className="w-full py-4 rounded-xl bg-linear-to-r 
                from-emerald-600 to-cyan-600 hover:from-emerald-500 
                hover:to-cyan-500 disabled:from-zinc-700 disabled:to-zinc-700 
                font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] 
                hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all 
                disabled:cursor-not-allowed"
            >
              {isGenerating ? '⏳ 생성 중...' : '✨ 이메일 생성'}
            </button>

            <div className="text-center text-xs text-zinc-400">
              {showRefined ? (
                <span className="text-emerald-300">
                  💡 이제 시작해보세요! 클릭하면 로그인으로 이동합니다
                </span>
              ) : (
                <span>버튼을 눌러 이메일 생성 데모를 체험해보세요</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
