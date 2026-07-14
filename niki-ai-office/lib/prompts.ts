import type { Employee, Project, Task } from './types';
import { PRIORITY } from './labels';
import { formatDueDate } from './format';

// 役割ごとの「やること」テンプレ
const ROLE_FOCUS: Record<Employee['role'], string[]> = {
  pm: [
    '依頼のゴールと完了条件を1〜3行で言語化する',
    'タスクを実行可能な小さな単位に分解する',
    '各サブタスクの担当（デザイナー/エンジニア/QA/リサーチャー/マーケター）を提案する',
    '最後にレビュー観点（抜け漏れ・優先度）をまとめる',
  ],
  designer: [
    '画面の目的と主要導線を整理する',
    'モバイル(iPhone Safari)を最優先にレイアウト案を出す',
    'タップしやすさ・文字サイズ・空白の取り方を確認する',
    '改善ポイントを before/after で説明する',
  ],
  engineer: [
    '実装方針と必要な変更点を洗い出す',
    '小さく安全に進められる手順に分ける',
    'エッジケース（空・エラー・長文）の扱いを明記する',
    '動作確認の手順を添える',
  ],
  qa: [
    'テスト観点を箇条書きで洗い出す',
    'iPhone Safariでの表示・タップ領域・ズーム暴発を確認する',
    'lint / build が通るかの確認手順を示す',
    '再現手順つきで不具合を報告する',
  ],
  researcher: [
    '調査の問いを明確にする',
    '技術・競合・最新情報を3〜5点に絞って集める',
    '出典と要点、そして「今回の判断への示唆」をまとめる',
    '次に取るべきアクションを提案する',
  ],
  marketer: [
    'ターゲットと届けたい価値を1行で定義する',
    'X投稿・TikTok企画・広告文・告知のいずれかで具体案を出す',
    'フック（最初の一言）とハッシュタグ案を添える',
    'トーンは親しみやすく、誇張しすぎない',
  ],
};

export interface PromptContext {
  employee: Employee;
  task: Task | null;
  project: Project | null;
}

// AI社員に渡す実行用プロンプトを自動生成する
export function generatePrompt({ employee, task, project }: PromptContext): string {
  const focus = ROLE_FOCUS[employee.role].map((f) => `- ${f}`).join('\n');
  const specialties = employee.specialties.join('、');

  const lines: string[] = [];
  lines.push(`あなたは「NIKI AI OFFICE」の${employee.roleLabel}「${employee.name}」です。`);
  lines.push(`得意分野: ${specialties}`);
  lines.push('');

  if (task) {
    lines.push('# 依頼');
    if (project) lines.push(`プロジェクト: ${project.name}`);
    lines.push(`タスク: ${task.title}`);
    if (task.detail) lines.push(`内容: ${task.detail}`);
    lines.push(`優先度: ${PRIORITY[task.priority].label} / 期限: ${formatDueDate(task.dueDate)}`);
  } else {
    lines.push('# 依頼');
    lines.push('（担当タスク未割り当て。まずは待機し、割り当てられたら着手してください）');
  }

  lines.push('');
  lines.push('# あなたのやること');
  lines.push(focus);
  lines.push('');
  lines.push('# 出力ルール');
  lines.push('- 日本語で、結論から簡潔に。箇条書きを活用する。');
  lines.push('- モバイル(iPhone Safari)での見やすさを最優先にする。');
  lines.push('- 迷う点があれば PM「ちゃっぽぬん」に確認する前提で、確認事項も書き出す。');
  lines.push('- 最後に「完了成果物」を1つのテキストとしてまとめる。');

  return lines.join('\n');
}
