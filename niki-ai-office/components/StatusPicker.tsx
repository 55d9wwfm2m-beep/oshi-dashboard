'use client';

import type { Employee } from '@/lib/types';
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_ORDER } from '@/lib/labels';
import { useOffice } from './OfficeProvider';

// AI社員の状態を手動で変更するピッカー
export function StatusPicker({ employee }: { employee: Employee }) {
  const { setEmployeeStatus } = useOffice();

  return (
    <div>
      <p className="label">状態を変更</p>
      <div className="grid grid-cols-3 gap-2">
        {EMPLOYEE_STATUS_ORDER.map((st) => {
          const meta = EMPLOYEE_STATUS[st];
          const active = employee.status === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setEmployeeStatus(employee.id, st)}
              aria-pressed={active}
              className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-pixel border-2 px-2 text-[13px] font-bold transition ${
                active
                  ? `${meta.chip} ${meta.text} shadow-pixel-sm`
                  : 'border-navy-800/10 bg-white/70 text-navy-600'
              }`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
