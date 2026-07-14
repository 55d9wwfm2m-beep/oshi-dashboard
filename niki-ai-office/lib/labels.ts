import type {
  EmployeeRole,
  EmployeeStatus,
  Priority,
  TaskStatus,
} from './types';

// ---- AI社員のステータス ----
export const EMPLOYEE_STATUS: Record<
  EmployeeStatus,
  { label: string; dot: string; chip: string; text: string }
> = {
  idle: {
    label: '待機中',
    dot: 'bg-navy-500/40',
    chip: 'bg-navy-800/5 border-navy-800/12',
    text: 'text-navy-600',
  },
  working: {
    label: '作業中',
    dot: 'bg-leaf-400',
    chip: 'bg-leaf-100 border-leaf-300',
    text: 'text-leaf-500',
  },
  review: {
    label: 'レビュー待ち',
    dot: 'bg-amber-400',
    chip: 'bg-amber-50 border-amber-200',
    text: 'text-amber-600',
  },
  meeting: {
    label: '会議中',
    dot: 'bg-sky-400',
    chip: 'bg-sky-100 border-sky-300',
    text: 'text-sky-500',
  },
  error: {
    label: 'エラー',
    dot: 'bg-rose-400',
    chip: 'bg-rose-50 border-rose-200',
    text: 'text-rose-600',
  },
  off: {
    label: '退社',
    dot: 'bg-navy-500/25',
    chip: 'bg-navy-800/5 border-navy-800/10',
    text: 'text-navy-500/70',
  },
};

export const EMPLOYEE_STATUS_ORDER: EmployeeStatus[] = [
  'idle',
  'working',
  'review',
  'meeting',
  'error',
  'off',
];

// ---- タスクのステータス ----
export const TASK_STATUS: Record<
  TaskStatus,
  { label: string; accent: string; head: string; text: string }
> = {
  todo: {
    label: '未着手',
    accent: 'border-navy-500/30',
    head: 'bg-navy-800/5 text-navy-600',
    text: 'text-navy-600',
  },
  doing: {
    label: '作業中',
    accent: 'border-leaf-300',
    head: 'bg-leaf-100 text-leaf-500',
    text: 'text-leaf-500',
  },
  review: {
    label: 'レビュー',
    accent: 'border-amber-300',
    head: 'bg-amber-50 text-amber-600',
    text: 'text-amber-600',
  },
  done: {
    label: '完了',
    accent: 'border-sky-300',
    head: 'bg-sky-100 text-sky-500',
    text: 'text-sky-500',
  },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'doing', 'review', 'done'];

// ---- 優先度 ----
export const PRIORITY: Record<
  Priority,
  { label: string; chip: string }
> = {
  high: { label: '高', chip: 'bg-rose-50 border-rose-200 text-rose-600' },
  mid: { label: '中', chip: 'bg-amber-50 border-amber-200 text-amber-600' },
  low: { label: '低', chip: 'bg-leaf-100 border-leaf-300 text-leaf-500' },
};

export const PRIORITY_ORDER: Priority[] = ['high', 'mid', 'low'];

// ---- 役割 ----
export const ROLE_LABEL: Record<EmployeeRole, string> = {
  pm: 'PM',
  designer: 'UI/UXデザイナー',
  engineer: 'エンジニア',
  qa: 'QAスタッフ',
  researcher: 'リサーチャー',
  marketer: 'マーケター',
};
