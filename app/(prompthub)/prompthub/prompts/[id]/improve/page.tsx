import type { Metadata } from 'next';
import { PromptImproveView } from '@/features/prompts/components/prompt-improve-view';

export const metadata: Metadata = { title: 'AIで改善' };

export default function ImprovePromptPage({ params }: { params: { id: string } }) {
  return <PromptImproveView promptId={params.id} />;
}
