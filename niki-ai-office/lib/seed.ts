import type { Employee, Meeting, OfficeState, Project, Task } from './types';

// 初回起動時に投入するサンプルデータ。
// タイムスタンプは初回ロード時刻を基準に作るので「本日」判定が自然に効く。
export function createSeedState(): OfficeState {
  const now = Date.now();
  const min = 60 * 1000;
  const hour = 60 * min;

  const projects: Project[] = [
    { id: 'proj_oshi', name: '推し活ダッシュボード', createdAt: now - 6 * hour },
  ];

  const employees: Employee[] = [
    {
      id: 'emp_pm',
      name: 'ちゃっぽぬん',
      role: 'pm',
      roleLabel: 'PM',
      status: 'review',
      desk: '進行席',
      bio: '依頼を整理して、だれが・なにを・いつまでにやるかを決める案内役。最後のレビューも担当。',
      specialties: ['依頼整理', 'タスク分解', '担当割り振り', '最終レビュー'],
      currentTaskId: 'task_3',
      history: [
        { id: 'h_pm_1', taskTitle: '初回案内とサンプルデータの追加', action: 'レビュー完了', at: now - 2 * hour },
        { id: 'h_pm_2', taskTitle: 'ログインとクラウド同期の設計', action: 'レビュー開始', at: now - 40 * min },
      ],
      palette: { hair: '#7a5a3a', skin: '#f7d7b5', outfit: '#2f4a72', accent: '#8ad4f5' },
      emoji: '📋',
    },
    {
      id: 'emp_designer',
      name: 'ぱれっと',
      role: 'designer',
      roleLabel: 'UI/UXデザイナー',
      status: 'meeting',
      desk: 'デザイン席',
      bio: '画面の構成と手ざわりを整える人。迷わず・気持ちよく使えるかを何度も確認する。',
      specialties: ['画面構成', 'デザイン改善', 'ユーザー体験の確認'],
      currentTaskId: 'task_3',
      history: [
        { id: 'h_de_1', taskTitle: 'ホーム画面のワイヤー整理', action: '完了', at: now - 5 * hour },
      ],
      palette: { hair: '#d98cb3', skin: '#f6d3ad', outfit: '#b98cd6', accent: '#f4b6cf' },
      emoji: '🎨',
    },
    {
      id: 'emp_engineer',
      name: 'こつぶ',
      role: 'engineer',
      roleLabel: 'エンジニア',
      status: 'working',
      desk: '開発席',
      bio: 'こつこつ実装する働き者。バグ修正とリファクタリングが得意。小さく確実に前に進める。',
      specialties: ['コード実装', 'バグ修正', 'リファクタリング'],
      currentTaskId: 'task_2',
      history: [
        { id: 'h_en_1', taskTitle: '初回案内とサンプルデータの追加', action: '完了', at: now - 3 * hour },
        { id: 'h_en_2', taskTitle: 'ホーム画面にカウントダウンとクイック登録を追加', action: '着手', at: now - 90 * min },
      ],
      palette: { hair: '#3a3a4a', skin: '#f2c9a0', outfit: '#41a459', accent: '#8ad4f5' },
      emoji: '💻',
    },
    {
      id: 'emp_qa',
      name: 'みっけ',
      role: 'qa',
      roleLabel: 'QAスタッフ',
      status: 'idle',
      desk: '検証席',
      bio: 'こまかいところに気づく見張り番。テスト項目づくりとスマホ表示チェックを担当。',
      specialties: ['テスト項目作成', 'スマホ表示確認', 'lint / build 確認'],
      currentTaskId: null,
      history: [
        { id: 'h_qa_1', taskTitle: 'リリース前チェックリスト作成', action: '完了', at: now - 26 * hour },
      ],
      palette: { hair: '#5a4632', skin: '#ffdbc2', outfit: '#e0932f', accent: '#f4c98a' },
      emoji: '✅',
    },
    {
      id: 'emp_researcher',
      name: 'しらべ',
      role: 'researcher',
      roleLabel: 'リサーチャー',
      status: 'meeting',
      desk: '調査席',
      bio: '知りたいことをさっと調べてまとめる物知り。技術・競合・最新情報のリサーチが得意。',
      specialties: ['技術調査', '競合調査', '最新情報の整理'],
      currentTaskId: 'task_3',
      history: [
        { id: 'h_re_1', taskTitle: 'クラウド同期の選択肢を比較', action: '完了', at: now - 4 * hour },
      ],
      palette: { hair: '#243a5e', skin: '#f7d7b5', outfit: '#2aa3d6', accent: '#bae6fd' },
      emoji: '🔍',
    },
    {
      id: 'emp_marketer',
      name: 'ばずり',
      role: 'marketer',
      roleLabel: 'マーケター',
      status: 'idle',
      desk: '広報席',
      bio: '届け方を考えるムードメーカー。X投稿やTikTok企画、告知文づくりを担当。',
      specialties: ['X投稿', 'TikTok企画', '広告文', 'リリース告知'],
      currentTaskId: null,
      history: [
        { id: 'h_ma_1', taskTitle: 'ティザー告知の下書き', action: '完了', at: now - 28 * hour },
      ],
      palette: { hair: '#c98b3f', skin: '#f2c9a0', outfit: '#e8734f', accent: '#f4b48a' },
      emoji: '📣',
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task_1',
      projectId: 'proj_oshi',
      title: '初回案内とサンプルデータの追加',
      detail:
        'はじめて開いた人が迷わないよう、かんたんな案内（オンボーディング）とサンプルの推しデータを用意する。',
      status: 'done',
      priority: 'mid',
      assigneeId: 'emp_engineer',
      dueDate: null,
      createdAt: now - 6 * hour,
      updatedAt: now - 3 * hour,
      deliverable:
        '初回起動時のウェルカム画面と、サンプル推し2件を追加しました。スキップ導線あり。既存データがある場合は表示しません。',
    },
    {
      id: 'task_2',
      projectId: 'proj_oshi',
      title: 'ホーム画面にカウントダウンとクイック登録を追加',
      detail:
        '推しのイベントまでの残り日数カウントダウンと、ワンタップで予定を追加できるクイック登録をホームに置く。',
      status: 'doing',
      priority: 'high',
      assigneeId: 'emp_engineer',
      dueDate: relISODate(2),
      createdAt: now - 5 * hour,
      updatedAt: now - 90 * min,
      deliverable: '',
    },
    {
      id: 'task_3',
      projectId: 'proj_oshi',
      title: 'ログインとクラウド同期の設計',
      detail:
        'ログイン方式とクラウド同期のデータ設計を決める。まずは設計だけ（実装は次フェーズ）。',
      status: 'review',
      priority: 'mid',
      assigneeId: 'emp_pm',
      dueDate: relISODate(4),
      createdAt: now - 5 * hour,
      updatedAt: now - 40 * min,
      deliverable: '',
    },
    {
      id: 'task_4',
      projectId: 'proj_oshi',
      title: 'iPhone Safariでの表示確認',
      detail:
        '主要画面をiPhoneのSafariで確認。文字サイズ・タップ領域・ズーム暴発・レイアウト崩れをチェックする。',
      status: 'todo',
      priority: 'high',
      assigneeId: 'emp_qa',
      dueDate: relISODate(3),
      createdAt: now - 4 * hour,
      updatedAt: now - 4 * hour,
      deliverable: '',
    },
    {
      id: 'task_5',
      projectId: 'proj_oshi',
      title: 'TikTok用紹介投稿の作成',
      detail: 'アプリの魅力が伝わるTikTok向けの紹介企画と台本、キャプション案をつくる。',
      status: 'todo',
      priority: 'low',
      assigneeId: 'emp_marketer',
      dueDate: relISODate(6),
      createdAt: now - 3 * hour,
      updatedAt: now - 3 * hour,
      deliverable: '',
    },
  ];

  const meetings: Meeting[] = [
    {
      id: 'meeting_1',
      title: 'ログイン & クラウド同期の設計会議',
      taskId: 'task_3',
      participantIds: ['emp_pm', 'emp_researcher', 'emp_designer', 'emp_engineer'],
      log: [
        { id: 'm1_1', speakerId: 'emp_pm', text: 'ログインまわり、まずは設計だけ固めましょう。方式の候補を出したいです。' },
        { id: 'm1_2', speakerId: 'emp_researcher', text: '調べた感じ、メール＋マジックリンクが実装も体験もシンプルでした。SNSログインは次フェーズでも間に合いそうです。' },
        { id: 'm1_3', speakerId: 'emp_designer', text: 'ログインは後回しでも使える「あとでログイン」導線を用意したいです。最初の一歩を軽くしたいので。' },
        { id: 'm1_4', speakerId: 'emp_engineer', text: '同期はローカル保存を正として、あとからクラウドに載せ替える形なら安全に移行できます。' },
        { id: 'm1_5', speakerId: 'emp_pm', text: 'では今回は「メール＋マジックリンク」「あとでログイン導線」「ローカル優先の同期設計」で。実装は次フェーズにしましょう。' },
      ],
      decisions: [
        'ログイン方式はメール＋マジックリンクを第一候補にする',
        '「あとでログイン」導線を用意し、未ログインでも使えるようにする',
        '同期はローカル保存を正とし、後からクラウドへ載せ替える設計にする',
      ],
      nextAssigneeId: 'emp_engineer',
      createdAt: now - 50 * min,
    },
  ];

  return {
    version: 1,
    seeded: true,
    projects,
    employees,
    tasks,
    meetings,
    forceAfterHours: false,
  };
}

// 今日からn日後のYYYY-MM-DD
function relISODate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
