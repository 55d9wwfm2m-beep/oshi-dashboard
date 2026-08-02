import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { PromptsView } from '@/features/prompts/components/prompts-view';

export const metadata: Metadata = { title: 'プロンプト一覧' };

export default function PromptsPage() {
  return (
    // useSearchParams を使うため Suspense で囲む
    <Suspense fallback={<SkeletonRows rows={5} />}>
      <PromptsView />
    </Suspense>
  );
}
