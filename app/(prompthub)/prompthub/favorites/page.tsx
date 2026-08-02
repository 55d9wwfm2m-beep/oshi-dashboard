import type { Metadata } from 'next';
import { FavoritesView } from '@/features/prompts/components/favorites-view';

export const metadata: Metadata = { title: 'お気に入り' };

export default function FavoritesPage() {
  return <FavoritesView />;
}
