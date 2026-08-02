'use client';

import { Database, Monitor, Moon, RotateCcw, Sun, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useTheme, type ThemePreference } from '@/components/prompthub/theme-provider';
import { Badge } from '@/components/prompthub/ui/badge';
import { Button } from '@/components/prompthub/ui/button';
import { ConfirmDialog } from '@/components/prompthub/ui/dialog';
import { Panel, Section } from '@/components/prompthub/ui/surface';
import { useToast } from '@/components/prompthub/ui/toast';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { CURRENT_USER } from '@/lib/prompthub/constants';
import { cn } from '@/lib/prompthub/utils';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'ライト', icon: Sun },
  { value: 'dark', label: 'ダーク', icon: Moon },
  { value: 'system', label: 'OSに合わせる', icon: Monitor },
];

export function SettingsView() {
  const { preference, setPreference } = useTheme();
  const { prompts, history, persistence, resetData } = usePromptHub();
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">設定</h1>
        <p className="text-[15px] text-ph-muted">表示や保存データに関する設定を行います。</p>
      </div>

      <Section title="表示" description="画面全体の外観を切り替えます。">
        <Panel className="p-5">
          <fieldset>
            <legend className="sr-only">テーマ</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={preference === option.value}
                  onClick={() => setPreference(option.value)}
                  className={cn(
                    'flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-4 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ph-accent',
                    preference === option.value
                      ? 'border-ph-accent bg-ph-accent-soft font-medium text-ph-accent'
                      : 'border-ph-border text-ph-muted hover:bg-ph-surface-2'
                  )}
                >
                  <option.icon aria-hidden="true" className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </Panel>
      </Section>

      <Section title="アカウント" description="MVPではログイン機能を持たず、擬似ユーザーで動作します。">
        <Panel className="flex flex-wrap items-center gap-4 p-5">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ph-accent-soft text-sm font-semibold text-ph-accent"
          >
            {CURRENT_USER.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ph-fg">{CURRENT_USER.name}</p>
            <p className="text-sm text-ph-muted">{CURRENT_USER.role}</p>
          </div>
          <Badge tone="outline">
            <UserRound aria-hidden="true" className="h-3 w-3" />
            認証は未実装
          </Badge>
        </Panel>
      </Section>

      <Section title="AI改善の動作モード" description="APIキーの有無で自動的に切り替わります。">
        <Panel className="space-y-3 p-5 text-sm leading-relaxed text-ph-muted">
          <p>
            サーバーに <code className="rounded bg-ph-surface-2 px-1 py-0.5 text-xs">AI_API_KEY</code>{' '}
            が設定されていない場合はデモモードで動作し、サンプルの改善結果を表示します。キーを設定すると同じ画面のまま実APIモードへ切り替わります。
          </p>
          <p>
            APIキーはサーバー側の環境変数としてのみ読み込み、ブラウザへは渡していません。プロバイダは
            <code className="mx-1 rounded bg-ph-surface-2 px-1 py-0.5 text-xs">AI_PROVIDER</code>
            （anthropic / openai / google）で切り替えられます。
          </p>
        </Panel>
      </Section>

      <Section title="データ" description="このアプリのデータはブラウザのローカルストレージに保存されます。">
        <Panel className="p-5">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-ph-muted">登録プロンプト</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ph-fg">{prompts.length} 件</dd>
            </div>
            <div>
              <dt className="text-xs text-ph-muted">利用履歴</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-ph-fg">{history.length} 件</dd>
            </div>
            <div>
              <dt className="text-xs text-ph-muted">保存状態</dt>
              <dd className="mt-1">
                {persistence === 'ok' ? (
                  <Badge tone="success">
                    <Database aria-hidden="true" className="h-3 w-3" />
                    正常に保存されています
                  </Badge>
                ) : (
                  <Badge tone="warning">保存できません</Badge>
                )}
              </dd>
            </div>
          </dl>

          <hr className="my-5 border-0 border-t border-ph-border" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ph-fg">サンプルデータの状態に戻す</p>
              <p className="mt-1 text-sm text-ph-muted">
                登録・編集した内容はすべて削除され、初期のサンプルプロンプトに戻ります。
              </p>
            </div>
            <Button variant="danger-outline" onClick={() => setResetOpen(true)} className="min-h-[44px]">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              初期状態に戻す
            </Button>
          </div>
        </Panel>
      </Section>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="データを初期状態に戻しますか？"
        description="登録・編集したプロンプトと利用履歴がすべて削除され、サンプルデータの状態に戻ります。この操作は取り消せません。"
        confirmLabel="初期状態に戻す"
        onConfirm={() => {
          void resetData().then(() => {
            toast({ title: 'データを初期状態に戻しました', variant: 'info' });
          });
        }}
      />
    </div>
  );
}
