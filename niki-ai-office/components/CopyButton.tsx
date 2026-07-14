'use client';

import { useCallback, useRef, useState } from 'react';

// クリップボードにコピー。navigator.clipboardが使えない環境ではtextareaでフォールバック。
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // フォールバックへ
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = 'コピー',
  className = 'btn-primary',
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onClick = useCallback(async () => {
    const ok = await copyText(text);
    setState(ok ? 'done' : 'fail');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1800);
  }, [text]);

  return (
    <button type="button" onClick={onClick} className={className} aria-live="polite">
      {state === 'done' ? '✓ コピーしました' : state === 'fail' ? 'コピー失敗' : `📋 ${label}`}
    </button>
  );
}
