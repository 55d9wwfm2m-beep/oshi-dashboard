'use client';

import type { Employee } from '@/lib/types';
import { useOffice } from './OfficeProvider';
import { PixelAvatar } from './PixelAvatar';
import { StatusBadge } from './Badges';

export function EmployeeCard({
  employee,
  onOpen,
}: {
  employee: Employee;
  onOpen: (id: string) => void;
}) {
  const { getTask } = useOffice();
  const currentTask = getTask(employee.currentTaskId);
  const isOff = employee.status === 'off';
  const isWorking = employee.status === 'working';

  return (
    <button
      type="button"
      onClick={() => onOpen(employee.id)}
      className={`panel flex w-full items-center gap-3 p-3 text-left transition active:translate-y-[1px] active:shadow-pixel-sm ${
        isOff ? 'opacity-60' : ''
      }`}
      aria-label={`${employee.name}（${employee.roleLabel}）の詳細をひらく`}
    >
      {/* 机の上のキャラ */}
      <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-pixel bg-sky-100/70">
        <PixelAvatar
          employee={employee}
          size={52}
          className={!isOff && isWorking ? 'animate-bob' : ''}
        />
        {isOff && (
          <span className="absolute -right-0 -top-1 animate-zzz text-sm font-black text-navy-500" aria-hidden>
            z
          </span>
        )}
        <span
          className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-cream-50 bg-white text-xs shadow-pixel-sm"
          aria-hidden
        >
          {employee.emoji}
        </span>
      </div>

      {/* テキスト */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-black text-navy-800">{employee.name}</p>
          <span className="shrink-0 rounded-full bg-navy-800/5 px-2 py-0.5 text-[11px] font-bold text-navy-600">
            {employee.roleLabel}
          </span>
        </div>
        <div className="mt-1">
          <StatusBadge status={employee.status} />
        </div>
        <p className="mt-1.5 truncate text-xs text-navy-600">
          {currentTask ? `▶ ${currentTask.title}` : '担当タスクなし'}
        </p>
      </div>

      <span className="shrink-0 self-center text-navy-500/60" aria-hidden>
        ›
      </span>
    </button>
  );
}
