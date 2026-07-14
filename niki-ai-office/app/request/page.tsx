'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOffice } from '@/components/OfficeProvider';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState, ErrorState } from '@/components/States';
import { PixelAvatar } from '@/components/PixelAvatar';
import { PRIORITY, PRIORITY_ORDER } from '@/lib/labels';
import { todayISO } from '@/lib/format';
import type { Priority, Task } from '@/lib/types';

const NEW_PROJECT = '__new__';

export default function RequestPage() {
  const office = useOffice();

  const [projectId, setProjectId] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('mid');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Task | null>(null);

  if (office.phase === 'loading') {
    return (
      <>
        <PageHeader emoji="✉️" title="新規依頼" />
        <LoadingState />
      </>
    );
  }
  if (office.phase === 'error') {
    return (
      <>
        <PageHeader emoji="✉️" title="新規依頼" />
        <ErrorState message={office.errorMessage ?? undefined} onRetry={() => location.reload()} />
      </>
    );
  }

  const { projects, addProject, consultPM, getEmployee } = office;
  const pm = getEmployee('emp_pm');
  const effectiveProjectId = projectId || projects[0]?.id || NEW_PROJECT;

  const submit = () => {
    setError(null);
    if (!title.trim()) {
      setError('依頼内容（タイトル）を入力してください。');
      return;
    }
    let pid = effectiveProjectId;
    if (pid === NEW_PROJECT) {
      if (!newProjectName.trim()) {
        setError('新しいプロジェクト名を入力してください。');
        return;
      }
      pid = addProject(newProjectName).id;
    }
    const task = consultPM({
      projectId: pid,
      title,
      detail,
      dueDate: dueDate || null,
      priority,
    });
    setCreated(task);
    // フォームをリセット
    setTitle('');
    setDetail('');
    setDueDate('');
    setPriority('mid');
    setNewProjectName('');
  };

  if (created) {
    return (
      <>
        <PageHeader emoji="✉️" title="新規依頼" />
        <div className="panel animate-pop flex flex-col items-center gap-3 p-6 text-center">
          {pm && (
            <div className="grid h-20 w-20 place-items-center rounded-pixel bg-sky-100">
              <PixelAvatar employee={pm} size={64} className="animate-bob" />
            </div>
          )}
          <div>
            <p className="text-lg font-black text-navy-800">PMに相談しました！</p>
            <p className="mt-1 text-sm text-navy-600">
              「{pm?.name ?? 'ちゃっぽぬん'}」が受け取りました。分解して担当を割り振ります。
            </p>
          </div>
          <div className="w-full rounded-pixel border-2 border-navy-800/10 bg-white p-3 text-left">
            <p className="text-xs font-bold text-navy-500">受け付けた依頼</p>
            <p className="font-bold text-navy-800">{created.title}</p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Link href="/board" className="btn-primary w-full">
              タスクボードで見る
            </Link>
            <button type="button" onClick={() => setCreated(null)} className="btn-ghost w-full">
              続けて依頼する
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader emoji="✉️" title="新規依頼" subtitle="やってほしいことをPMに相談" />

      <div className="space-y-4">
        {/* プロジェクト選択 */}
        <div>
          <label className="label" htmlFor="project">
            プロジェクト
          </label>
          <select
            id="project"
            value={effectiveProjectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="field"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value={NEW_PROJECT}>＋ 新しいプロジェクト</option>
          </select>
          {effectiveProjectId === NEW_PROJECT && (
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="新しいプロジェクト名"
              className="field mt-2"
              maxLength={40}
            />
          )}
        </div>

        {/* 依頼内容 */}
        <div>
          <label className="label" htmlFor="title">
            依頼内容
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）ホーム画面にお知らせ枠を追加したい"
            className="field"
            maxLength={80}
          />
        </div>

        <div>
          <label className="label" htmlFor="detail">
            くわしく（任意）
          </label>
          <textarea
            id="detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="背景・してほしいこと・気になる点など"
            rows={4}
            className="field resize-y"
            maxLength={600}
          />
        </div>

        {/* 期限 */}
        <div>
          <label className="label" htmlFor="due">
            期限（任意）
          </label>
          <input
            id="due"
            type="date"
            value={dueDate}
            min={todayISO()}
            onChange={(e) => setDueDate(e.target.value)}
            className="field"
          />
        </div>

        {/* 優先度 */}
        <div>
          <p className="label">優先度</p>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_ORDER.map((p) => {
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  aria-pressed={active}
                  className={`min-h-[48px] rounded-pixel border-2 text-sm font-bold transition ${
                    active ? `${PRIORITY[p].chip} shadow-pixel-sm` : 'border-navy-800/10 bg-white/70 text-navy-600'
                  }`}
                >
                  {PRIORITY[p].label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-pixel border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">
            {error}
          </p>
        )}

        <button type="button" onClick={submit} className="btn-primary w-full text-base">
          💬 PMに相談する
        </button>
        <p className="pb-2 text-center text-xs text-navy-500">
          相談すると、PM「ちゃっぽぬん」が受け取ってタスクになります。
        </p>
      </div>
    </>
  );
}
