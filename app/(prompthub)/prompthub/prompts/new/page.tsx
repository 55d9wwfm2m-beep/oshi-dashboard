import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { PromptNewView } from '@/features/prompts/components/prompt-new-view';

export const metadata: Metadata = { title: 'プロンプトを登録' };

export default function NewPromptPage() {
  return (
    <Suspense fallback={<SkeletonRows rows={3} />}>
      <PromptNewView />
    </Suspense>
  );
}
