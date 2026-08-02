import type { Metadata } from 'next';
import { ImproveIndexView } from '@/features/prompts/components/improve-index-view';

export const metadata: Metadata = { title: 'AIで改善' };

export default function ImproveIndexPage() {
  return <ImproveIndexView />;
}
