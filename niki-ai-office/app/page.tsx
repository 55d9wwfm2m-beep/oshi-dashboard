'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOffice } from '@/components/OfficeProvider';
import { PageHeader } from '@/components/PageHeader';
import { EmployeeCard } from '@/components/EmployeeCard';
import { EmployeeDetailPanel } from '@/components/EmployeeDetailPanel';
import { AfterHoursBanner } from '@/components/AfterHoursBanner';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { EMPLOYEE_STATUS } from '@/lib/labels';
import type { EmployeeStatus } from '@/lib/types';

const SUMMARY: { status: EmployeeStatus }[] = [
  { status: 'working' },
  { status: 'meeting' },
  { status: 'review' },
  { status: 'idle' },
];

export default function OfficePage() {
  const office = useOffice();
  const [selected, setSelected] = useState<string | null>(null);

  if (office.phase === 'loading') {
    return (
      <>
        <PageHeader emoji="🏢" title="オフィス" subtitle="AI社員のようす" />
        <LoadingState label="オフィスをひらいています…" />
      </>
    );
  }
  if (office.phase === 'error') {
    return (
      <>
        <PageHeader emoji="🏢" title="オフィス" />
        <ErrorState message={office.errorMessage ?? undefined} onRetry={() => location.reload()} />
      </>
    );
  }

  const { employees, saveFailed, toggleForceAfterHours } = office;
  const count = (st: EmployeeStatus) => employees.filter((e) => e.status === st).length;

  return (
    <>
      <PageHeader
        emoji="🏢"
        title="NIKI AI OFFICE"
        subtitle="AI社員たちの仮想オフィス"
        right={
          <button
            type="button"
            onClick={toggleForceAfterHours}
            className={`chip min-h-[36px] ${
              office.isAfterHours
                ? 'border-navy-700 bg-navy-700 text-white'
                : 'border-navy-800/12 bg-white text-navy-600'
            }`}
            aria-pressed={office.isAfterHours}
          >
            🌙 定時演出
          </button>
        }
      />

      {saveFailed && (
        <div className="mb-3 rounded-pixel border-2 border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          ⚠️ 保存に失敗しました。ブラウザの空き容量やプライベートモードをご確認ください（表示中のデータは残っています）。
        </div>
      )}

      <AfterHoursBanner />

      {/* 稼働サマリー */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {SUMMARY.map(({ status }) => {
          const meta = EMPLOYEE_STATUS[status];
          return (
            <div key={status} className="panel px-2 py-2.5 text-center">
              <p className={`text-xl font-black ${meta.text}`}>{count(status)}</p>
              <p className="mt-0.5 text-[11px] font-bold text-navy-600">{meta.label}</p>
            </div>
          );
        })}
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon="🪑"
          title="まだAI社員がいません"
          description="サンプルデータの読み込みに失敗した可能性があります。リロードしてみてください。"
        />
      ) : (
        <section aria-label="AI社員一覧" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-bold text-navy-600">社員 {employees.length}名</p>
            <Link href="/request" className="text-xs font-bold text-sky-500">
              ＋ 新しい依頼をする
            </Link>
          </div>
          {employees.map((e) => (
            <EmployeeCard key={e.id} employee={e} onOpen={setSelected} />
          ))}
        </section>
      )}

      <EmployeeDetailPanel employeeId={selected} onClose={() => setSelected(null)} />
    </>
  );
}
