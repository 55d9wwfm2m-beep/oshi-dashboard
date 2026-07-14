// 日付・時刻のヘルパー

export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
}

export function formatDueDate(iso: string | null): string {
  if (!iso) return '期限なし';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '期限なし';
  return `${d.getMonth() + 1}/${d.getDate()} まで`;
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  return d.getTime() < today.getTime();
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 定時（19時）以降かどうか
export const CLOCK_OUT_HOUR = 19;

export function isAfterHoursNow(now = new Date()): boolean {
  return now.getHours() >= CLOCK_OUT_HOUR;
}

// 簡易ID生成（依存を増やさない）
export function makeId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
