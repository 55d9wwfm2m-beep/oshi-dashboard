'use client';

import {
  Check,
  Copy,
  FlaskConical,
  Loader2,
  RefreshCw,
  Replace,
  Save,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/prompthub/ui/badge';
import { Button } from '@/components/prompthub/ui/button';
import { ConfirmDialog } from '@/components/prompthub/ui/dialog';
import { Panel } from '@/components/prompthub/ui/surface';
import { Skeleton } from '@/components/prompthub/ui/skeleton';
import { useCopyToClipboard } from '@/hooks/prompthub/use-clipboard';
import { requestImprovement } from '@/services/ai/client';
import type { ImproveResult, Prompt } from '@/types/prompthub';
import { PromptPreview } from './prompt-preview';

interface ImprovePromptPanelProps {
  prompt: Prompt;
  /** 改善版を新しいプロンプトとして保存する */
  onSaveAsNew: (content: string) => void;
  /** 元のプロンプト本文を置き換える */
  onReplace: (content: string) => void;
}

export function ImprovePromptPanel({ prompt, onSaveAsNew, onReplace }: ImprovePromptPanelProps) {
  const [result, setResult] = useState<ImproveResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const copy = useCopyToClipboard();

  const run = useCallback(async () => {
    setLoading(true);
    const improved = await requestImprovement({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      aiTools: prompt.aiTools,
      caution: prompt.caution,
    });
    setResult(improved);
    setLoading(false);
  }, [prompt]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">
            <Sparkles aria-hidden="true" className="h-3 w-3" />
            AI改善
          </Badge>
          {result?.mode === 'demo' ? (
            <Badge tone="warning">
              <FlaskConical aria-hidden="true" className="h-3 w-3" />
              デモモード
            </Badge>
          ) : result ? (
            <Badge tone="success">実APIモード（{result.provider}）</Badge>
          ) : null}
        </div>
        <Button variant="secondary" onClick={() => void run()} disabled={loading}>
          <RefreshCw aria-hidden="true" className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          やり直す
        </Button>
      </div>

      {result?.mode === 'demo' ? (
        <p className="rounded-md border border-ph-warning/30 bg-ph-warning-soft px-4 py-3 text-sm leading-relaxed text-ph-warning">
          AIのAPIキーが設定されていないため、サンプルの改善結果を表示しています。環境変数
          <code className="mx-1 rounded bg-ph-surface px-1 py-0.5 text-xs">AI_API_KEY</code>
          を設定すると、同じ画面のまま実際のAIによる改善へ切り替わります。
        </p>
      ) : null}

      {/* 左右比較。狭い画面では縦に積む。 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="ph-improve-before" className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 id="ph-improve-before" className="text-sm font-medium text-ph-fg">
              元のプロンプト
            </h2>
            <span className="text-xs text-ph-subtle">{prompt.content.length} 文字</span>
          </div>
          <PromptPreview content={prompt.content} className="lg:min-h-[420px]" />
        </section>

        <section aria-labelledby="ph-improve-after" className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 id="ph-improve-after" className="text-sm font-medium text-ph-fg">
              改善されたプロンプト
            </h2>
            {result ? <span className="text-xs text-ph-subtle">{result.improved.length} 文字</span> : null}
          </div>
          {loading ? (
            <div
              className="space-y-3 rounded-md border border-ph-border bg-ph-surface-2/60 px-4 py-3.5 lg:min-h-[420px]"
              role="status"
              aria-label="改善案を生成しています"
            >
              <span className="flex items-center gap-2 text-sm text-ph-muted">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                改善案を作成しています…
              </span>
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-3.5" />
              ))}
            </div>
          ) : (
            <PromptPreview content={result?.improved ?? ''} className="lg:min-h-[420px]" />
          )}
        </section>
      </div>

      <Panel className="p-5">
        <h2 className="text-base font-semibold text-ph-fg">改善した内容</h2>
        <ul className="mt-4 space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </li>
              ))
            : result?.changes.map((change) => (
                <li key={change.kind} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ph-success" />
                  <div>
                    <p className="text-sm font-medium text-ph-fg">{change.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ph-muted">{change.detail}</p>
                  </div>
                </li>
              ))}
        </ul>
      </Panel>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          variant="secondary"
          disabled={!result}
          onClick={() => result && void copy(result.improved, '改善版のプロンプト')}
          className="min-h-[44px]"
        >
          <Copy aria-hidden="true" className="h-4 w-4" />
          改善版をコピー
        </Button>
        <Button
          variant="primary"
          disabled={!result}
          onClick={() => result && onSaveAsNew(result.improved)}
          className="min-h-[44px]"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          改善版として保存
        </Button>
        <Button
          variant="danger-outline"
          disabled={!result}
          onClick={() => setReplaceOpen(true)}
          className="min-h-[44px]"
        >
          <Replace aria-hidden="true" className="h-4 w-4" />
          元のプロンプトと置き換える
        </Button>
      </div>

      <ConfirmDialog
        open={replaceOpen}
        onOpenChange={setReplaceOpen}
        title="元のプロンプトを置き換えますか？"
        description="現在の本文が改善版で上書きされます。上書き前の本文は更新履歴に残りますが、元に戻すには手作業が必要です。"
        confirmLabel="置き換える"
        onConfirm={() => result && onReplace(result.improved)}
      />
    </div>
  );
}
