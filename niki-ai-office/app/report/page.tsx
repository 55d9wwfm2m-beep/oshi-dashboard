'use client';

import { Children } from 'react';
import Link from 'next/link';
import { useOffice } from '@/components/OfficeProvider';
import { PageHeader } from '@/components/PageHeader';
import { PixelAvatar } from '@/components/PixelAvatar';
import { StatusBadge } from '@/components/Badges';
import { LoadingState, ErrorState } from '@/components/States';
import type { Task } from '@/lib/types';

function isToday(ms: number): boolean {
  const d = new Date(ms);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function todayLabel(): string {
  const n = new Date();
  const week = ['日', '月', '火', '水', '木', '金', '土'][n.getDay()];
  return `${n.getFullYear()}/${n.getMonth() + 1}/${n.getDate()}（${week}）`;
}

export default function ReportPage() {
  const office = useOffice();

  if (office.phase === 'loading') {
    return (
      <>
        <PageHeader emoji="📊" title="日報" />
        <LoadingState />
      </>
    );
  }
  if (office.phase === 'error') {
    return (
      <>
        <PageHeader emoji="📊" title="日報" />
        <ErrorState message={office.errorMessage ?? undefined} onRetry={() => location.reload()} />
      </>
    );
  }

  const { tasks, employees, getEmployee } = office;
  const doneToday = tasks.filter((t) => t.status === 'done' && isToday(t.updatedAt));
  const inProgress = tasks.filter((t) => t.status === 'doing');
  const tomorrow = tasks.filter((t) => t.status === 'todo' || t.status === 'review');
  const errorEmployees = employees.filter((e) => e.status === 'error');

  return (
    <>
      <PageHeader emoji="📊" title="日報" subtitle={todayLabel()} />

      {/* サマリー */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <SummaryTile value={doneToday.length} label="本日完了" accent="text-sky-500" />
        <SummaryTile value={inProgress.length} label="作業中" accent="text-leaf-500" />
        <SummaryTile value={tomorrow.length} label="明日以降" accent="text-navy-600" />
      </div>

      <div className="space-y-5">
        <ReportSection emoji="✅" title="本日完了した作業" empty="今日はまだ完了したタスクがありません。">
          {doneToday.map((t) => (
            <TaskLine key={t.id} task={t} assigneeName={getEmployee(t.assigneeId)?.name} />
          ))}
        </ReportSection>

        <ReportSection emoji="🛠" title="作業中の仕事" empty="いま作業中のタスクはありません。">
          {inProgress.map((t) => (
            <TaskLine key={t.id} task={t} assigneeName={getEmployee(t.assigneeId)?.name} />
          ))}
        </ReportSection>

        {/* エラー */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-black text-navy-700">
            <span aria-hidden>⚠️</span> エラー
          </h2>
          {errorEmployees.length === 0 ? (
            <p className="rounded-pixel border-2 border-leaf-300 bg-leaf-50 px-3 py-3 text-sm font-bold text-leaf-500">
              いまエラーはありません。順調です！
            </p>
          ) : (
            <div className="space-y-2">
              {errorEmployees.map((e) => (
                <Link
                  key={e.id}
                  href={`/employees/${e.id}`}
                  className="panel flex items-center gap-2 border-rose-200 bg-rose-50/60 p-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white">
                    <PixelAvatar employee={e} size={28} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-rose-700">{e.name}</p>
                    <p className="text-xs text-rose-600">エラー状態です。確認してください。</p>
                  </div>
                  <span className="text-rose-400" aria-hidden>›</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <ReportSection emoji="📅" title="明日の予定" empty="予定されたタスクはありません。">
          {tomorrow.map((t) => (
            <TaskLine key={t.id} task={t} assigneeName={getEmployee(t.assigneeId)?.name} />
          ))}
        </ReportSection>

        {/* 各AI社員の稼働状況 */}
        <section className="pb-4">
          <h2 className="mb-2 text-sm font-black text-navy-700">各AI社員の稼働状況</h2>
          <div className="space-y-2">
            {employees.map((e) => {
              const current = office.getTask(e.currentTaskId);
              return (
                <Link
                  key={e.id}
                  href={`/employees/${e.id}`}
                  className="panel flex items-center gap-3 p-2.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-100">
                    <PixelAvatar employee={e} size={30} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-800">
                      {e.name}
                      <span className="ml-1 text-[11px] font-normal text-navy-500">{e.roleLabel}</span>
                    </p>
                    <p className="truncate text-xs text-navy-500">
                      {current ? current.title : '担当タスクなし'}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function SummaryTile({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div className="panel px-2 py-3 text-center">
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-bold text-navy-600">{label}</p>
    </div>
  );
}

function ReportSection({
  emoji,
  title,
  empty,
  children,
}: {
  emoji: string;
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasItems = Children.count(children) > 0;
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-black text-navy-700">
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      {hasItems ? (
        <div className="space-y-2">{children}</div>
      ) : (
        <p className="rounded-pixel bg-navy-800/5 px-3 py-3 text-sm text-navy-500">{empty}</p>
      )}
    </section>
  );
}

function TaskLine({ task, assigneeName }: { task: Task; assigneeName?: string }) {
  return (
    <div className="panel flex items-center justify-between gap-2 p-3">
      <p className="min-w-0 flex-1 truncate text-sm font-bold text-navy-800">{task.title}</p>
      {assigneeName && (
        <span className="chip shrink-0 border-navy-800/10 bg-navy-800/5 text-navy-600">{assigneeName}</span>
      )}
    </div>
  );
}
