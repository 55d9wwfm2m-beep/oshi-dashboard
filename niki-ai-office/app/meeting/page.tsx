'use client';

import Link from 'next/link';
import { useOffice } from '@/components/OfficeProvider';
import { PageHeader } from '@/components/PageHeader';
import { PixelAvatar } from '@/components/PixelAvatar';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatDateTime } from '@/lib/format';
import type { Meeting } from '@/lib/types';

export default function MeetingPage() {
  const office = useOffice();

  if (office.phase === 'loading') {
    return (
      <>
        <PageHeader emoji="💬" title="会議室" />
        <LoadingState />
      </>
    );
  }
  if (office.phase === 'error') {
    return (
      <>
        <PageHeader emoji="💬" title="会議室" />
        <ErrorState message={office.errorMessage ?? undefined} onRetry={() => location.reload()} />
      </>
    );
  }

  const meetings = [...office.meetings].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <PageHeader emoji="💬" title="会議室" subtitle="AI社員たちの相談ログ" />
      {meetings.length === 0 ? (
        <EmptyState
          icon="💬"
          title="まだ会議はありません"
          description="タスクについての相談ログがここに表示されます。"
        />
      ) : (
        <div className="space-y-5">
          {meetings.map((m) => (
            <MeetingBlock key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </>
  );
}

function MeetingBlock({ meeting }: { meeting: Meeting }) {
  const { getEmployee, getTask } = useOffice();
  const task = getTask(meeting.taskId);
  const participants = meeting.participantIds
    .map((id) => getEmployee(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const nextAssignee = getEmployee(meeting.nextAssigneeId);

  return (
    <article className="panel overflow-hidden p-0">
      {/* ヘッダー：会議シーン */}
      <div className="bg-gradient-to-br from-sky-100 to-leaf-100 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-navy-500">
              {formatDateTime(meeting.createdAt)}
            </p>
            <h2 className="text-base font-black text-navy-800">{meeting.title}</h2>
            {task && <p className="mt-0.5 truncate text-xs text-navy-600">対象タスク：{task.title}</p>}
          </div>
          <span className="chip shrink-0 border-sky-300 bg-white/70 text-sky-500">🗣 相談中</span>
        </div>
        {/* 参加者アバター */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {participants.map((e) => (
            <div key={e.id} className="flex items-center gap-1 rounded-full bg-white/80 py-1 pl-1 pr-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-100">
                <PixelAvatar employee={e} size={20} />
              </span>
              <span className="text-[11px] font-bold text-navy-700">{e.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 会議ログ */}
      <div className="space-y-3 px-4 py-4">
        <h3 className="text-xs font-black text-navy-500">会議ログ</h3>
        {meeting.log.map((msg) => {
          const speaker = getEmployee(msg.speakerId);
          return (
            <div key={msg.id} className="flex items-start gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100">
                {speaker ? <PixelAvatar employee={speaker} size={26} /> : <span>🤖</span>}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-navy-500">{speaker?.name ?? '不明'}</p>
                <div className="mt-0.5 inline-block rounded-pixel rounded-tl-none border-2 border-navy-800/8 bg-white px-3 py-2 text-sm leading-relaxed text-navy-700">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 決定事項 */}
      <div className="border-t-2 border-navy-800/8 px-4 py-4">
        <h3 className="mb-2 text-xs font-black text-navy-500">決定事項</h3>
        {meeting.decisions.length === 0 ? (
          <p className="text-sm text-navy-500">まだ決定事項はありません。</p>
        ) : (
          <ul className="space-y-1.5">
            {meeting.decisions.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                <span className="mt-0.5 text-leaf-500" aria-hidden>
                  ✓
                </span>
                <span className="flex-1">{d}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 次の担当者 */}
      {nextAssignee && (
        <div className="flex items-center justify-between border-t-2 border-navy-800/8 bg-cream-100/60 px-4 py-3">
          <div>
            <p className="text-[11px] font-bold text-navy-500">次の担当者</p>
            <p className="text-sm font-black text-navy-800">
              {nextAssignee.emoji} {nextAssignee.name}
            </p>
          </div>
          <Link href={`/employees/${nextAssignee.id}`} className="btn-ghost min-h-[40px] px-3 text-[13px]">
            詳細 →
          </Link>
        </div>
      )}
    </article>
  );
}
