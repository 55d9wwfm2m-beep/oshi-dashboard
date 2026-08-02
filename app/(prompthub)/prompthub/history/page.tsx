import type { Metadata } from 'next';
import { HistoryView } from '@/features/history/components/history-view';

export const metadata: Metadata = { title: '利用履歴' };

export default function HistoryPage() {
  return <HistoryView />;
}
