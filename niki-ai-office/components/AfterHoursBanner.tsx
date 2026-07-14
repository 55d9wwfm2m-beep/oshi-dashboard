'use client';

import { useOffice } from './OfficeProvider';
import { CLOCK_OUT_HOUR } from '@/lib/format';

// 19時以降に出る退勤演出バナー。全員退社 / 残業の一括操作ができる。
export function AfterHoursBanner() {
  const { isAfterHours, employees, clockOutAll, overtimeAll } = useOffice();
  if (!isAfterHours) return null;

  const working = employees.filter((e) => e.status !== 'off').length;
  const off = employees.length - working;

  return (
    <div className="mb-3 animate-pop rounded-pixel border-2 border-navy-800/12 bg-gradient-to-br from-navy-700 to-navy-800 p-4 text-white shadow-pixel">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🌆
        </span>
        <div className="min-w-0">
          <p className="text-base font-black">定時（{CLOCK_OUT_HOUR}時）になりました</p>
          <p className="text-xs text-white/80">きょうもおつかれさまでした。退社にするか、残業をお願いできます。</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={clockOutAll}
          disabled={working === 0}
          className="btn min-h-[44px] border-white/20 bg-white/15 text-white hover:bg-white/25 disabled:opacity-40"
        >
          🏠 全員を退社にする
        </button>
        <button
          type="button"
          onClick={overtimeAll}
          disabled={off === 0}
          className="btn min-h-[44px] border-white/20 bg-white/15 text-white hover:bg-white/25 disabled:opacity-40"
        >
          🔥 全員を残業させる
        </button>
      </div>
      <p className="mt-2 text-[11px] text-white/70">
        いま {working} 名が在席・{off} 名が退社中です。社員をタップすると個別にも切り替えられます。
      </p>
    </div>
  );
}
