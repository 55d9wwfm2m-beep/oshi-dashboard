'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useOffice } from '@/components/OfficeProvider';
import { PageHeader } from '@/components/PageHeader';
import { PixelAvatar } from '@/components/PixelAvatar';
import { StatusBadge } from '@/components/Badges';
import { StatusPicker } from '@/components/StatusPicker';
import { CopyButton } from '@/components/CopyButton';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { generatePrompt } from '@/lib/prompts';
import { formatDateTime } from '@/lib/format';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const office = useOffice();

  if (office.phase === 'loading') {
    return (
      <>
        <BackLink />
        <LoadingState />
      </>
    );
  }
  if (office.phase === 'error') {
    return (
      <>
        <BackLink />
        <ErrorState message={office.errorMessage ?? undefined} onRetry={() => location.reload()} />
      </>
    );
  }

  const employee = office.getEmployee(id);
  if (!employee) {
    return (
      <>
        <BackLink />
        <EmptyState
          icon="🔍"
          title="社員が見つかりません"
          description="この社員は存在しないか、削除された可能性があります。"
          actionLabel="オフィスに戻る"
          actionHref="/"
        />
      </>
    );
  }

  const currentTask = office.getTask(employee.currentTaskId);
  const project = office.getProject(currentTask?.projectId);
  const prompt = generatePrompt({ employee, task: currentTask ?? null, project: project ?? null });

  return (
    <>
      <BackLink />

      {/* プロフィール */}
      <div className="panel mb-4 flex items-center gap-4 p-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-pixel bg-sky-100">
          <PixelAvatar employee={employee} size={80} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-navy-800">{employee.name}</h1>
          <p className="text-sm font-bold text-navy-600">
            {employee.emoji} {employee.roleLabel}
          </p>
          <p className="text-xs text-navy-500">{employee.desk}</p>
          <div className="mt-2">
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-navy-700">{employee.bio}</p>

      {employee.status === 'off' && (
        <button
          type="button"
          onClick={() => office.overtimeEmployee(employee.id)}
          className="btn-leaf mb-4 w-full"
        >
          🔥 残業させる（待機中に戻す）
        </button>
      )}

      <div className="space-y-5">
        <section className="panel p-4">
          <StatusPicker employee={employee} />
        </section>

        {/* 現在のタスク */}
        <section>
          <h2 className="mb-2 text-sm font-black text-navy-700">現在のタスク</h2>
          {currentTask ? (
            <div className="panel border-l-[6px] border-leaf-300 p-3">
              <p className="text-xs font-bold text-navy-500">{project?.name}</p>
              <p className="font-bold text-navy-800">{currentTask.title}</p>
              {currentTask.detail && <p className="mt-1 text-xs text-navy-600">{currentTask.detail}</p>}
              <Link href="/board" className="mt-2 inline-block text-xs font-bold text-sky-500">
                ボードで見る →
              </Link>
            </div>
          ) : (
            <p className="rounded-pixel bg-navy-800/5 px-3 py-3 text-sm text-navy-500">
              いまは担当タスクがありません。
            </p>
          )}
        </section>

        {/* 得意分野 */}
        <section>
          <h2 className="mb-2 text-sm font-black text-navy-700">得意分野</h2>
          <div className="flex flex-wrap gap-1.5">
            {employee.specialties.map((s) => (
              <span key={s} className="chip border-leaf-300 bg-leaf-100 text-leaf-500">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* 生成プロンプト */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-black text-navy-700">生成されたプロンプト</h2>
            <CopyButton text={prompt} className="btn-primary min-h-[40px] px-3 text-[13px]" />
          </div>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-pixel border-2 border-navy-800/10 bg-white p-3 text-[12px] leading-relaxed text-navy-700">
            {prompt}
          </pre>
        </section>

        {/* 作業履歴 */}
        <section className="pb-4">
          <h2 className="mb-2 text-sm font-black text-navy-700">作業履歴</h2>
          {employee.history.length === 0 ? (
            <p className="rounded-pixel bg-navy-800/5 px-3 py-3 text-sm text-navy-500">
              まだ履歴がありません。
            </p>
          ) : (
            <ol className="space-y-2">
              {employee.history.map((h) => (
                <li key={h.id} className="flex items-start gap-2 rounded-pixel border-2 border-navy-800/8 bg-white px-3 py-2">
                  <span className="mt-0.5 text-xs">•</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy-800">{h.taskTitle}</p>
                    <p className="text-xs text-navy-500">
                      {h.action}・{formatDateTime(h.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

function BackLink() {
  return (
    <div className="mb-2">
      <Link href="/" className="btn-quiet -ml-2 text-sm">
        ← オフィス
      </Link>
    </div>
  );
}
