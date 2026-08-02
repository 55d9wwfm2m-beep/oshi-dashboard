'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/prompthub/ui/toast';

/**
 * クリップボードへコピーし、結果をトーストで知らせる。
 * navigator.clipboard が使えない環境（http、古いブラウザ）では textarea 経由へフォールバックする。
 */
export function useCopyToClipboard() {
  const { toast } = useToast();

  return useCallback(
    async (text: string, label = 'プロンプト') => {
      const copied = await copyText(text);
      if (copied) {
        toast({ title: `${label}をコピーしました`, description: 'AIツールの入力欄に貼り付けて使えます。' });
      } else {
        toast({
          title: 'コピーできませんでした',
          description: 'お手数ですが、本文を選択して手動でコピーしてください。',
          variant: 'error',
        });
      }
      return copied;
    },
    [toast]
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // フォールバックへ進む
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
