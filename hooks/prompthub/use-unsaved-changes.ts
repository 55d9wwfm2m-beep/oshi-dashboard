'use client';

import { useEffect } from 'react';

/**
 * 未保存の入力があるときに、タブを閉じる・リロードする操作を警告する。
 * アプリ内の遷移については、各画面の「キャンセル」操作で確認ダイアログを出している。
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 一部ブラウザは returnValue が設定されている場合のみ確認ダイアログを出す
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
