import type { Metadata } from 'next';
import { PromptEditView } from '@/features/prompts/components/prompt-edit-view';

export const metadata: Metadata = { title: 'プロンプトを編集' };

export default function EditPromptPage({ params }: { params: { id: string } }) {
  return <PromptEditView promptId={params.id} />;
}
