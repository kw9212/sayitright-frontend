'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-sm">예기치 않은 오류가 발생했습니다.</p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 
              text-white text-sm font-medium transition-colors"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
