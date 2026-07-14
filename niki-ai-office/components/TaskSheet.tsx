'use client';

import { useEffect, useState } from 'react';
import { useOffice } from './OfficeProvider';
import { PixelAvatar } from './PixelAvatar';
import { PriorityBadge } from './Badges';
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/lib/labels';
import { formatDueDate } from '@/lib/format';

function downloadText(filename: string, text: string) {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // ダウンロード不可の環境では何もしない
  }
}

export function TaskSheet({
  taskId,
  onClose,
}: {
  taskId: string | null;
  onClose: () => void;
}) {
  const { getTask, getProject, employees, moveTask, assignTask, setDeliverable } = useOffice();
  const task = getTask(taskId);
  const [draft, setDraft] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // タスクが変わったら成果物の下書きを同期
  useEffect(() => {
    setDraft(task?.deliverable ?? '');
    setSavedAt(null);
  }, [task?.id, task?.deliverable]);

  useEffect(() => {
    if (!taskId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [taskId]);

  if (!taskId || !task) return null;

  const project = getProject(task.projectId);
  const dirty = draft !== (task.deliverable ?? '');

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={`${task.title}の詳細`}>
      <button type="button" onClick={onClose} aria-label="閉じる" className="absolute inset-0 bg-navy-900/40" />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-[560px] animate-sheet-up flex-col rounded-t-2xl border-2 border-navy-800/10 bg-cream-50 shadow-pixel">
        <div className="flex items-start justify-between gap-2 border-b-2 border-navy-800/8 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-navy-500">{project?.name ?? 'プロジェクト'}</p>
            <p className="text-lg font-black leading-tight text-navy-800">{task.title}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-quiet text-xl" aria-label="閉じる">
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            <span className="chip border-navy-800/10 bg-navy-800/5 text-navy-600">
              📅 {formatDueDate(task.dueDate)}
            </span>
          </div>

          {task.detail && <p className="text-sm leading-relaxed text-navy-700">{task.detail}</p>}

          {/* 状態変更 */}
          <div>
            <p className="label">状態</p>
            <div className="grid grid-cols-4 gap-1.5">
              {TASK_STATUS_ORDER.map((st) => {
                const active = task.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => moveTask(task.id, st)}
                    aria-pressed={active}
                    className={`min-h-[44px] rounded-pixel border-2 text-[13px] font-bold transition ${
                      active
                        ? `${TASK_STATUS[st].head} border-current/25 shadow-pixel-sm`
                        : 'border-navy-800/10 bg-white/70 text-navy-600'
                    }`}
                  >
                    {TASK_STATUS[st].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 担当割り当て */}
          <div>
            <p className="label">担当を割り当て</p>
            <div className="grid grid-cols-2 gap-2">
              {employees.map((e) => {
                const active = task.assigneeId === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => assignTask(task.id, active ? null : e.id)}
                    aria-pressed={active}
                    className={`flex min-h-[48px] items-center gap-2 rounded-pixel border-2 px-2 text-left transition ${
                      active ? 'border-sky-400 bg-sky-100 shadow-pixel-sm' : 'border-navy-800/10 bg-white/70'
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white">
                      <PixelAvatar employee={e} size={26} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-navy-800">{e.name}</span>
                      <span className="block truncate text-[11px] text-navy-500">{e.roleLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {task.assigneeId && (
              <button
                type="button"
                onClick={() => assignTask(task.id, null)}
                className="btn-quiet mt-2 text-[13px]"
              >
                担当を外す
              </button>
            )}
          </div>

          {/* 成果物のテキスト保存 */}
          <div>
            <p className="label">完了成果物（テキストで保存）</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="このタスクの成果物や結果をここに残せます。"
              className="field resize-y"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeliverable(task.id, draft);
                  setSavedAt(Date.now());
                }}
                disabled={!dirty}
                className="btn-leaf min-h-[44px] flex-1"
              >
                💾 保存する
              </button>
              <button
                type="button"
                onClick={() => downloadText(`${task.title}.txt`, draft)}
                disabled={!draft.trim()}
                className="btn-ghost min-h-[44px]"
              >
                ⬇︎ .txtで書き出し
              </button>
            </div>
            {savedAt && !dirty && (
              <p className="mt-1.5 text-xs font-bold text-leaf-500" aria-live="polite">
                ✓ 保存しました
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
