'use client';

import type { Task } from '@/lib/types';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/lib/labels';
import { formatDueDate, isOverdue } from '@/lib/format';
import { useOffice } from './OfficeProvider';
import { PixelAvatar } from './PixelAvatar';
import { PriorityBadge } from './Badges';

export function TaskCard({
  task,
  onOpen,
}: {
  task: Task;
  onOpen: (id: string) => void;
}) {
  const { getEmployee, moveTask } = useOffice();
  const assignee = getEmployee(task.assigneeId);
  const idx = TASK_STATUS_ORDER.indexOf(task.status);
  const prev = idx > 0 ? TASK_STATUS_ORDER[idx - 1] : null;
  const next = idx < TASK_STATUS_ORDER.length - 1 ? TASK_STATUS_ORDER[idx + 1] : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <div className={`panel border-l-[6px] p-3 ${TASK_STATUS[task.status].accent}`}>
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        <span
          className={`chip border-navy-800/10 bg-navy-800/5 ${
            overdue ? 'text-rose-600' : 'text-navy-600'
          }`}
        >
          {overdue ? '⏰ ' : '📅 '}
          {formatDueDate(task.dueDate)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="block w-full text-left"
        aria-label={`${task.title} の詳細をひらく`}
      >
        <p className="font-bold leading-snug text-navy-800">{task.title}</p>
        {task.detail && (
          <p className="mt-1 line-clamp-2 text-xs text-navy-600">{task.detail}</p>
        )}
      </button>

      <div className="mt-2 flex items-center gap-2">
        {assignee ? (
          <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-sky-100/70 py-1 pl-1 pr-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white">
              <PixelAvatar employee={assignee} size={20} />
            </span>
            <span className="truncate text-xs font-bold text-navy-700">{assignee.name}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(task.id)}
            className="chip border-dashed border-navy-800/20 bg-white text-navy-500"
          >
            ＋ 担当を割り当て
          </button>
        )}
      </div>

      {/* ボタンによる状態変更 */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => prev && moveTask(task.id, prev)}
          disabled={!prev}
          className="btn-ghost min-h-[40px] flex-1 px-2 text-[13px]"
          aria-label={prev ? `${TASK_STATUS[prev].label}へ戻す` : '戻せません'}
        >
          ◀ {prev ? TASK_STATUS[prev].label : '—'}
        </button>
        <button
          type="button"
          onClick={() => next && moveTask(task.id, next)}
          disabled={!next}
          className="btn-primary min-h-[40px] flex-1 px-2 text-[13px]"
          aria-label={next ? `${TASK_STATUS[next].label}へ進める` : '完了済み'}
        >
          {next ? TASK_STATUS[next].label : '完了'} ▶
        </button>
      </div>
    </div>
  );
}
