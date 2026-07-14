'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Employee,
  EmployeeStatus,
  Meeting,
  OfficeState,
  Priority,
  Project,
  Task,
  TaskStatus,
} from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CLOCK_OUT_HOUR, makeId } from '@/lib/format';

type Phase = 'loading' | 'ready' | 'error';

export interface NewTaskInput {
  projectId: string;
  title: string;
  detail: string;
  dueDate: string | null;
  priority: Priority;
}

interface OfficeContextValue {
  phase: Phase;
  errorMessage: string | null;
  saveFailed: boolean;
  isAfterHours: boolean;

  projects: Project[];
  employees: Employee[];
  tasks: Task[];
  meetings: Meeting[];

  // 参照ヘルパー
  getEmployee: (id: string | null | undefined) => Employee | undefined;
  getTask: (id: string | null | undefined) => Task | undefined;
  getProject: (id: string | null | undefined) => Project | undefined;

  // 依頼・タスク
  addProject: (name: string) => Project;
  addTask: (input: NewTaskInput) => Task;
  consultPM: (input: NewTaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  assignTask: (taskId: string, employeeId: string | null) => void;
  setDeliverable: (taskId: string, text: string) => void;

  // 社員
  setEmployeeStatus: (employeeId: string, status: EmployeeStatus) => void;

  // 退勤・残業
  clockOutAll: () => void;
  overtimeEmployee: (employeeId: string) => void;
  overtimeAll: () => void;
  toggleForceAfterHours: () => void;
}

const OfficeContext = createContext<OfficeContextValue | null>(null);

export function OfficeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OfficeState | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [nowTs, setNowTs] = useState<number>(() => Date.now());
  const didHydrate = useRef(false);

  // 初回ロード（クライアントのみ）
  useEffect(() => {
    const result = loadState();
    if (result.ok) {
      setState(result.state);
      setPhase('ready');
      // 新規（seed）の場合は即保存して次回リロードで保持されるようにする
      if (result.fresh) {
        const ok = saveState(result.state);
        if (!ok) setSaveFailed(true);
      }
      didHydrate.current = true;
    } else if (result.error === 'no-window') {
      // 何もしない（サーバー側）
    } else {
      setPhase('error');
      setErrorMessage(result.error);
    }
  }, []);

  // 変更のたびに保存（ハイドレート後のみ）
  useEffect(() => {
    if (!didHydrate.current || !state) return;
    const ok = saveState(state);
    setSaveFailed(!ok);
  }, [state]);

  // 時刻の更新（退勤演出の自動判定用）
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  const isAfterHours = useMemo(() => {
    const forced = state?.forceAfterHours ?? false;
    return forced || new Date(nowTs).getHours() >= CLOCK_OUT_HOUR;
  }, [state?.forceAfterHours, nowTs]);

  // ---- ヘルパー ----
  const getEmployee = useCallback(
    (id: string | null | undefined) => state?.employees.find((e) => e.id === id),
    [state?.employees],
  );
  const getTask = useCallback(
    (id: string | null | undefined) => state?.tasks.find((t) => t.id === id),
    [state?.tasks],
  );
  const getProject = useCallback(
    (id: string | null | undefined) => state?.projects.find((p) => p.id === id),
    [state?.projects],
  );

  // ---- 更新アクション ----
  const addProject = useCallback((name: string): Project => {
    const project: Project = { id: makeId('proj'), name: name.trim(), createdAt: Date.now() };
    setState((s) => (s ? { ...s, projects: [...s.projects, project] } : s));
    return project;
  }, []);

  const addTask = useCallback((input: NewTaskInput): Task => {
    const now = Date.now();
    const task: Task = {
      id: makeId('task'),
      projectId: input.projectId,
      title: input.title.trim(),
      detail: input.detail.trim(),
      status: 'todo',
      priority: input.priority,
      assigneeId: null,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
      deliverable: '',
    };
    setState((s) => (s ? { ...s, tasks: [task, ...s.tasks] } : s));
    return task;
  }, []);

  // 「PMに相談する」: タスクを作り、PMを担当・作業中にして受領履歴を残す
  const consultPM = useCallback((input: NewTaskInput): Task => {
    const now = Date.now();
    const task: Task = {
      id: makeId('task'),
      projectId: input.projectId,
      title: input.title.trim(),
      detail: input.detail.trim(),
      status: 'todo',
      priority: input.priority,
      assigneeId: 'emp_pm',
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
      deliverable: '',
    };
    setState((s) => {
      if (!s) return s;
      const employees = s.employees.map((e) => {
        if (e.role !== 'pm') return e;
        const history = [
          { id: makeId('h'), taskTitle: task.title, action: '依頼を受領', at: now },
          ...e.history,
        ];
        return { ...e, status: 'working' as EmployeeStatus, currentTaskId: task.id, history };
      });
      return { ...s, tasks: [task, ...s.tasks], employees };
    });
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setState((s) =>
      s
        ? {
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
            ),
          }
        : s,
    );
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    const now = Date.now();
    setState((s) => {
      if (!s) return s;
      const task = s.tasks.find((t) => t.id === id);
      if (!task) return s;
      const tasks = s.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: now } : t,
      );
      let employees = s.employees;
      if (task.assigneeId) {
        const actionLabel =
          status === 'done'
            ? '完了'
            : status === 'doing'
              ? '着手'
              : status === 'review'
                ? 'レビュー提出'
                : '差し戻し';
        employees = s.employees.map((e) => {
          if (e.id !== task.assigneeId) return e;
          const history = [
            { id: makeId('h'), taskTitle: task.title, action: actionLabel, at: now },
            ...e.history,
          ];
          // 完了したら担当社員の現在タスクを解放し待機に戻す
          if (status === 'done' && e.currentTaskId === id) {
            return { ...e, currentTaskId: null, status: 'idle' as EmployeeStatus, history };
          }
          // 作業中/レビューなら現在タスクとして紐づける
          if (status === 'doing' || status === 'review') {
            return { ...e, currentTaskId: id, history };
          }
          return { ...e, history };
        });
      }
      return { ...s, tasks, employees };
    });
  }, []);

  const assignTask = useCallback((taskId: string, employeeId: string | null) => {
    const now = Date.now();
    setState((s) => {
      if (!s) return s;
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task) return s;
      const prevAssignee = task.assigneeId;
      const tasks = s.tasks.map((t) =>
        t.id === taskId ? { ...t, assigneeId: employeeId, updatedAt: now } : t,
      );
      const employees = s.employees.map((e) => {
        // 旧担当から現在タスクを外す
        if (e.id === prevAssignee && e.currentTaskId === taskId) {
          return { ...e, currentTaskId: null };
        }
        // 新担当に履歴を残し、作業中/レビューなら現在タスクに紐づける
        if (e.id === employeeId) {
          const history = [
            { id: makeId('h'), taskTitle: task.title, action: '担当になった', at: now },
            ...e.history,
          ];
          const linked =
            task.status === 'doing' || task.status === 'review'
              ? { currentTaskId: taskId }
              : {};
          return { ...e, ...linked, history };
        }
        return e;
      });
      return { ...s, tasks, employees };
    });
  }, []);

  const setDeliverable = useCallback((taskId: string, text: string) => {
    setState((s) =>
      s
        ? {
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, deliverable: text, updatedAt: Date.now() } : t,
            ),
          }
        : s,
    );
  }, []);

  const setEmployeeStatus = useCallback((employeeId: string, status: EmployeeStatus) => {
    setState((s) =>
      s
        ? {
            ...s,
            employees: s.employees.map((e) =>
              e.id === employeeId ? { ...e, status } : e,
            ),
          }
        : s,
    );
  }, []);

  const clockOutAll = useCallback(() => {
    setState((s) =>
      s
        ? { ...s, employees: s.employees.map((e) => ({ ...e, status: 'off' as EmployeeStatus })) }
        : s,
    );
  }, []);

  const overtimeEmployee = useCallback((employeeId: string) => {
    setState((s) =>
      s
        ? {
            ...s,
            employees: s.employees.map((e) =>
              e.id === employeeId && e.status === 'off'
                ? { ...e, status: 'idle' as EmployeeStatus }
                : e,
            ),
          }
        : s,
    );
  }, []);

  const overtimeAll = useCallback(() => {
    setState((s) =>
      s
        ? {
            ...s,
            employees: s.employees.map((e) =>
              e.status === 'off' ? { ...e, status: 'idle' as EmployeeStatus } : e,
            ),
          }
        : s,
    );
  }, []);

  const toggleForceAfterHours = useCallback(() => {
    setState((s) => (s ? { ...s, forceAfterHours: !s.forceAfterHours } : s));
  }, []);

  const value: OfficeContextValue = {
    phase,
    errorMessage,
    saveFailed,
    isAfterHours,
    projects: state?.projects ?? [],
    employees: state?.employees ?? [],
    tasks: state?.tasks ?? [],
    meetings: state?.meetings ?? [],
    getEmployee,
    getTask,
    getProject,
    addProject,
    addTask,
    consultPM,
    updateTask,
    moveTask,
    assignTask,
    setDeliverable,
    setEmployeeStatus,
    clockOutAll,
    overtimeEmployee,
    overtimeAll,
    toggleForceAfterHours,
  };

  return <OfficeContext.Provider value={value}>{children}</OfficeContext.Provider>;
}

export function useOffice(): OfficeContextValue {
  const ctx = useContext(OfficeContext);
  if (!ctx) throw new Error('useOffice must be used within OfficeProvider');
  return ctx;
}
