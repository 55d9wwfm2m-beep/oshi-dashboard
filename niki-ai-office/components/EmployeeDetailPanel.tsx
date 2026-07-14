'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useOffice } from './OfficeProvider';
import { PixelAvatar } from './PixelAvatar';
import { StatusPicker } from './StatusPicker';
import { CopyButton } from './CopyButton';
import { generatePrompt } from '@/lib/prompts';

// 社員をタップしたときに下から出る詳細パネル（ボトムシート）
export function EmployeeDetailPanel({
  employeeId,
  onClose,
}: {
  employeeId: string | null;
  onClose: () => void;
}) {
  const { getEmployee, getTask, getProject } = useOffice();
  const employee = getEmployee(employeeId);

  // 開いている間は背景スクロールを止める
  useEffect(() => {
    if (!employeeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [employeeId]);

  // Escで閉じる
  useEffect(() => {
    if (!employeeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [employeeId, onClose]);

  if (!employeeId || !employee) return null;

  const currentTask = getTask(employee.currentTaskId);
  const project = getProject(currentTask?.projectId);
  const prompt = generatePrompt({ employee, task: currentTask ?? null, project: project ?? null });

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={`${employee.name}の詳細`}>
      {/* 背景 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="閉じる"
        className="absolute inset-0 bg-navy-900/40"
      />
      {/* シート本体 */}
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[86dvh] w-full max-w-[560px] animate-sheet-up flex-col rounded-t-2xl border-2 border-navy-800/10 bg-cream-50 shadow-pixel">
        <div className="flex items-center justify-between border-b-2 border-navy-800/8 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-pixel bg-sky-100">
              <PixelAvatar employee={employee} size={40} />
            </div>
            <div>
              <p className="text-lg font-black leading-tight text-navy-800">{employee.name}</p>
              <p className="text-xs font-bold text-navy-600">
                {employee.emoji} {employee.roleLabel}・{employee.desk}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-quiet text-xl" aria-label="閉じる">
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <p className="text-sm leading-relaxed text-navy-700">{employee.bio}</p>

          <StatusPicker employee={employee} />

          <div>
            <p className="label">現在のタスク</p>
            {currentTask ? (
              <div className="panel p-3">
                <p className="font-bold text-navy-800">{currentTask.title}</p>
                {currentTask.detail && (
                  <p className="mt-1 text-xs text-navy-600">{currentTask.detail}</p>
                )}
              </div>
            ) : (
              <p className="rounded-pixel bg-navy-800/5 px-3 py-2 text-sm text-navy-500">
                いまは担当タスクがありません。
              </p>
            )}
          </div>

          <div>
            <p className="label">得意分野</p>
            <div className="flex flex-wrap gap-1.5">
              {employee.specialties.map((s) => (
                <span key={s} className="chip border-leaf-300 bg-leaf-100 text-leaf-500">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="label mb-0">実行用プロンプト</p>
              <CopyButton text={prompt} className="btn-primary min-h-[40px] px-3 text-[13px]" />
            </div>
            <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words rounded-pixel border-2 border-navy-800/10 bg-white p-3 text-[12px] leading-relaxed text-navy-700">
              {prompt}
            </pre>
          </div>
        </div>

        <div className="border-t-2 border-navy-800/8 px-4 py-3">
          <Link href={`/employees/${employee.id}`} className="btn-ghost w-full" onClick={onClose}>
            作業履歴など、くわしく見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
