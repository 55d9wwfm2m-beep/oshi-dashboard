import type { Metadata } from 'next';
import { PromptDetailView } from '@/features/prompts/components/prompt-detail-view';

export const metadata: Metadata = { title: 'プロンプト詳細' };

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  return <PromptDetailView promptId={params.id} />;
}
