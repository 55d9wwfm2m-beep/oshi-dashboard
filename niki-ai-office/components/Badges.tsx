import type { EmployeeStatus, Priority, TaskStatus } from '@/lib/types';
import { EMPLOYEE_STATUS, PRIORITY, TASK_STATUS } from '@/lib/labels';

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  const s = EMPLOYEE_STATUS[status];
  return (
    <span className={`chip ${s.chip} ${s.text}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const s = TASK_STATUS[status];
  return <span className={`chip border-current/20 ${s.head}`}>{s.label}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority];
  return <span className={`chip ${p.chip}`}>優先度 {p.label}</span>;
}
