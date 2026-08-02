'use client';

import { Braces, WrapText } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/prompthub/ui/button';
import { cn } from '@/lib/prompthub/utils';

interface PromptEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
}

const VARIABLE_SNIPPET = '{{ 入力内容 }}';
const SECTION_SNIPPET = '\n# 出力形式\n- \n';

/**
 * プロンプト本文用のエディター。
 * 等幅フォント・行数表示・よく使う記法の挿入ボタンで、長文でも編集しやすくする。
 */
export function PromptEditor({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
}: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insert = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    onChange(next);
    // 挿入位置の直後へカーソルを戻す
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + snippet.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const lineCount = value === '' ? 0 : value.split('\n').length;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-ph-surface',
        invalid ? 'border-ph-danger' : 'border-ph-border focus-within:border-ph-accent'
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-ph-border bg-ph-surface-2 px-2 py-1.5">
        <Button variant="ghost" size="sm" onClick={() => insert(VARIABLE_SNIPPET)} className="h-8">
          <Braces aria-hidden="true" className="h-3.5 w-3.5" />
          変数を挿入
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insert(SECTION_SNIPPET)} className="h-8">
          <WrapText aria-hidden="true" className="h-3.5 w-3.5" />
          出力形式の見出し
        </Button>
        <span className="ml-auto pr-1 text-xs tabular-nums text-ph-subtle">
          {lineCount} 行 / {value.length} 文字
        </span>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        spellCheck={false}
        placeholder={placeholder}
        className="ph-mono block min-h-[320px] w-full resize-y border-0 bg-transparent px-4 py-3 text-ph-fg placeholder:text-ph-subtle focus:outline-none"
      />
    </div>
  );
}
