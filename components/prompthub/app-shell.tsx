'use client';

import { AlertTriangle } from 'lucide-react';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

const PERSISTENCE_MESSAGE = {
  unavailable:
    'このブラウザではデータを保存できません（プライベートモードなどの可能性があります）。編集内容はタブを閉じると失われます。',
  error:
    '保存容量の上限に達したため、最新の変更を保存できませんでした。不要なプロンプトを削除してから操作をやり直してください。',
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { persistence } = usePromptHub();

  return (
    <div className="flex min-h-dvh bg-ph-bg">
      <a
        href="#ph-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ph-primary focus:px-4 focus:py-2 focus:text-sm focus:text-ph-primary-fg"
      >
        本文へスキップ
      </a>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-ph-border lg:block">
        <AppSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />

        {persistence !== 'ok' ? (
          <div
            role="alert"
            className="flex items-start gap-3 border-b border-ph-warning/30 bg-ph-warning-soft px-4 py-3 text-sm text-ph-warning sm:px-6"
          >
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{PERSISTENCE_MESSAGE[persistence]}</p>
          </div>
        ) : null}

        <main id="ph-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <footer className="border-t border-ph-border px-4 py-6 text-xs text-ph-subtle sm:px-6 lg:px-8">
          PromptHub — チームのAI活用ノウハウを資産化するためのプロトタイプです。
        </footer>
      </div>
    </div>
  );
}
