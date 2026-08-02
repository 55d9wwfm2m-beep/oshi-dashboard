'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/prompthub/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/prompthub/ui/dialog';
import { Field, Select } from '@/components/prompthub/ui/field';
import { RatingInput } from '@/features/prompts/components/rating-stars';
import { AI_TOOLS, type AiTool, type Prompt } from '@/types/prompthub';

interface RecordUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt;
  onRecord: (aiTool: AiTool, rating: number) => void;
}

const DEFAULT_RATING = 5;

/** 「使用したことを記録」の入力ダイアログ */
export function RecordUsageDialog({ open, onOpenChange, prompt, onRecord }: RecordUsageDialogProps) {
  const [aiTool, setAiTool] = useState<AiTool>(prompt.aiTools[0] ?? 'ChatGPT');
  const [rating, setRating] = useState(DEFAULT_RATING);

  // 開くたびに初期値へ戻す
  useEffect(() => {
    if (open) {
      setAiTool(prompt.aiTools[0] ?? 'ChatGPT');
      setRating(DEFAULT_RATING);
    }
  }, [open, prompt.aiTools]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="使用したことを記録"
        description="利用回数と履歴に反映されます。チーム内でどのプロンプトが効いているかの判断材料になります。"
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">キャンセル</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={() => {
                onRecord(aiTool, rating);
                onOpenChange(false);
              }}
            >
              記録する
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="rounded-md border border-ph-border bg-ph-surface-2 px-3 py-2.5 text-sm text-ph-fg">
            {prompt.title}
          </p>

          <Field label="使用したAI" htmlFor="record-usage-ai" required>
            <Select
              id="record-usage-ai"
              value={aiTool}
              onChange={(event) => setAiTool(event.target.value as AiTool)}
            >
              {AI_TOOLS.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="今回の使い心地" hint="評価はプロンプトの平均点に反映されます。">
            <RatingInput value={rating} onChange={setRating} />
          </Field>
        </div>
      </DialogContent>
    </Dialog>
  );
}
