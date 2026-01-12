'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TypingText from '@/components/TypingText';
import { useAuth } from '@/lib/auth/auth-context';

export default function IntroPage() {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [done, setDone] = useState(false);
  const sampleEmail = `안녕하세요, 팀장님.\n
  지난번 미팅에서 말씀해 주신 내용 적용해서 기획서 초안 작성해보았습니다.\n
  첨부한 문서 검토해보시고 수정 필요한 부분 말씀해주시면 감사하겠습니다.`;

  const emailText = useMemo(() => sampleEmail, []);
  const auth = useAuth();

  return (
    <main
      onClick={() => router.push(auth.status === 'authenticated' ? '/main' : '/auth')}
      className="relative min-h-screen bg-zinc-950 text-zinc-50"
    >
      {/* subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.10),transparent_55%)]" />
      {/* neon line */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-300/40 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8">
        <div className="space-y-3">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
            say it right, fast.
          </div>
          <h1 className="text-5xl font-semibold tracking-tight">
            <span className="text-zinc-100">SayItRight</span>
            <span className="ml-3 align-middle text-sm font-normal text-emerald-300">• beta</span>
          </h1>
          <p className="max-w-xl text-sm text-zinc-400">
            상황 기반 문구 생성 · 코멘트 · 템플릿 저장
          </p>

          {/* email box */}
          <div
            className="mt-8 w-full max-w-xl cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)] backdrop-blur"
            onClick={(e) => {
              e.stopPropagation();
              setDone(false);
              setResetKey((k) => k + 1);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">이메일 생성</div>
              <div className="text-[11px] text-zinc-500">{done ? '완료' : '작성중…'}</div>
            </div>
            <div className="mt-2 text-sm font-medium text-zinc-100">
              <TypingText
                key={resetKey}
                text={emailText}
                speedMs={50}
                startDelayMs={250}
                onDone={() => setDone(true)}
              />
            </div>
          </div>

          <div className="mt-6 text-xs text-zinc-400">
            {done ? (
              <span className="text-zinc-200">클릭하면 로그인으로 이동</span>
            ) : (
              <span>로딩 중…</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
