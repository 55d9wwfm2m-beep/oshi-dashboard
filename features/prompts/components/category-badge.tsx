import { Badge } from '@/components/prompthub/ui/badge';
import { VISIBILITY_LABELS } from '@/lib/prompthub/constants';
import type { Visibility } from '@/types/prompthub';

export function CategoryBadge({ name }: { name: string }) {
  return <Badge tone="accent">{name}</Badge>;
}

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return (
    <Badge tone={visibility === 'team' ? 'success' : 'neutral'}>
      {VISIBILITY_LABELS[visibility]}
    </Badge>
  );
}
