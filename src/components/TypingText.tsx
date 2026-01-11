'use client';

import { useEffect, useMemo, useState } from 'react';

type TypingTextProps = {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
  className?: string;
  onDone?: () => void;
  setDone?: (done: boolean) => void;
  cursor?: boolean;
  resetKey?: number | string;
};

export default function TypingText({
  text,
  setDone,
  speedMs = 60,
  startDelayMs = 200,
  className,
  onDone,
  cursor = true,
}: TypingTextProps) {
  const [idx, setIdx] = useState(0);

  const done = useMemo(() => idx >= text.length, [idx, text.length]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;

    if (idx === 0 && startDelayMs > 0) {
      t = setTimeout(() => setIdx(1), startDelayMs);
      return () => {
        if (t !== null) clearTimeout(t);
      };
    }

    if (!done) {
      t = setTimeout(() => setIdx((p) => Math.min(p + 1, text.length)), speedMs);
      return () => {
        if (t !== null) clearTimeout(t);
      };
    }

    setDone?.(true);
    onDone?.();
  }, [idx, text.length, speedMs, startDelayMs, done, onDone, setDone]);

  const shown = text.slice(0, Math.min(idx, text.length));

  return (
    <span className={`whitespace-pre-line ${className ?? ''}`}>
      {shown}
      {cursor && (
        <span className="inline-block w-[10px] animate-pulse align-middle text-emerald-300">▍</span>
      )}
    </span>
  );
}
