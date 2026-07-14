'use client';

import { useMemo, useState } from 'react';
import { useOffice } from '@/components/OfficeProvider';
import { PageHeader } from '@/components/PageHeader';
import { TaskCard } from '@/components/TaskCard';
import { TaskSheet } from '@/components/TaskSheet';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/lib/labels';
import type { Task, TaskStatus } from '@/lib/types';

type Filter = TaskStatus | 'all';

export default function BoardPage() {
  const office = useOffice();
  const { tasks } = office;
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      doing: [],
      review: [],
      done: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  if (office.phase === 'loading') {
    return (
      <>
        <PageHeader emoji="🗂️" title="タスクボード" />
        <LoadingState />
      </>
    );
  }
  if (office.phase === 'error') {
    return (
      <>
        <PageHeader emoji="🗂️" title="タスクボード" />
        <ErrorState message={office.errorMessage ?? undefined} onRetry={() => location.reload()} />
      </>
    );
  }

  const visibleStatuses = filter === 'all' ? TASK_STATUS_ORDER : [filter];
  const hasAnyTask = office.tasks.length > 0;

  return (
    <>
      <PageHeader emoji="🗂️" title="タスクボード" subtitle="ボタンで状態を動かせます" />

      {/* フィルタ */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip label="すべて" active={filter === 'all'} onClick={() => setFilter('all')} count={office.tasks.length} />
        {TASK_STATUS_ORDER.map((st) => (
          <FilterChip
            key={st}
            label={TASK_STATUS[st].label}
            active={filter === st}
            onClick={() => setFilter(st)}
            count={grouped[st].length}
          />
        ))}
      </div>

      {!hasAnyTask ? (
        <EmptyState
          icon="🗂️"
          title="まだタスクがありません"
          description="「新規依頼」からPMに相談すると、ここにタスクが並びます。"
          actionLabel="依頼をする"
          actionHref="/request"
        />
      ) : (
        <div className="space-y-5">
          {visibleStatuses.map((st) => (
            <section key={st} aria-label={TASK_STATUS[st].label}>
              <div className={`mb-2 flex items-center justify-between rounded-pixel px-3 py-1.5 ${TASK_STATUS[st].head}`}>
                <h2 className="text-sm font-black">{TASK_STATUS[st].label}</h2>
                <span className="text-xs font-bold">{grouped[st].length}</span>
              </div>
              {grouped[st].length === 0 ? (
                <p className="rounded-pixel border-2 border-dashed border-navy-800/12 px-3 py-4 text-center text-xs text-navy-500">
                  ここにカードはありません
                </p>
              ) : (
                <div className="space-y-2.5">
                  {grouped[st].map((t) => (
                    <TaskCard key={t.id} task={t} onOpen={setSelectedTask} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <TaskSheet taskId={selectedTask} onClose={() => setSelectedTask(null)} />
    </>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip min-h-[38px] shrink-0 px-3 ${
        active ? 'border-sky-400 bg-sky-400 text-white' : 'border-navy-800/12 bg-white text-navy-600'
      }`}
    >
      {label}
      <span className={`ml-1 rounded-full px-1.5 text-[11px] ${active ? 'bg-white/25' : 'bg-navy-800/8'}`}>
        {count}
      </span>
    </button>
  );
}
