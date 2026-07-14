// NIKI AI OFFICE — ドメイン型定義

export type EmployeeRole =
  | 'pm'
  | 'designer'
  | 'engineer'
  | 'qa'
  | 'researcher'
  | 'marketer';

// 待機中 / 作業中 / レビュー待ち / 会議中 / エラー / 退社
export type EmployeeStatus =
  | 'idle'
  | 'working'
  | 'review'
  | 'meeting'
  | 'error'
  | 'off';

// 未着手 / 作業中 / レビュー / 完了
export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';

export type Priority = 'low' | 'mid' | 'high';

export interface WorkHistoryItem {
  id: string;
  taskTitle: string;
  action: string; // 例: 着手 / 完了 / レビュー
  at: number; // epoch ms
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  roleLabel: string;
  status: EmployeeStatus;
  desk: string; // 席・チーム名
  bio: string;
  specialties: string[]; // 得意分野
  currentTaskId: string | null;
  history: WorkHistoryItem[];
  // ドット絵アバターの配色シード
  palette: {
    hair: string;
    skin: string;
    outfit: string;
    accent: string;
  };
  emoji: string; // 役割を表す小さなグリフ
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  detail: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  deliverable: string; // 完了成果物（テキスト保存）
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export interface MeetingMessage {
  id: string;
  speakerId: string;
  text: string;
}

export interface Meeting {
  id: string;
  title: string;
  taskId: string | null;
  participantIds: string[];
  log: MeetingMessage[];
  decisions: string[];
  nextAssigneeId: string | null;
  createdAt: number;
}

export interface OfficeState {
  version: number;
  seeded: boolean;
  projects: Project[];
  employees: Employee[];
  tasks: Task[];
  meetings: Meeting[];
  // 退勤演出を手動で有効化したか（時刻に関係なく試せるように）
  forceAfterHours: boolean;
}
