import type { AiTool, Prompt, UsageHistory } from '@/types/prompthub';

const HOUR_MS = 3_600_000;

/** [プロンプトID, 何時間前, 使ったAI, 利用者, 評価] */
type HistorySeed = [string, number, AiTool, string, number];

const SEEDS: HistorySeed[] = [
  ['sample_plan_compare', 3, 'ChatGPT', 'Niki', 5],
  ['sample_mail_reply', 6, 'Claude', 'Niki', 5],
  ['sample_jargon', 9, 'Gemini', '中村 彩', 4],
  ['sample_claim_summary', 26, 'Claude', '佐藤 亮', 5],
  ['sample_daily_report', 30, 'ChatGPT', 'Niki', 4],
  ['sample_meeting_todo', 33, 'Claude', '大西 健', 5],
  ['sample_plan_compare', 50, 'ChatGPT', '田中 美咲', 5],
  ['sample_quote_explain', 54, 'ChatGPT', 'Niki', 4],
  ['sample_sales_summary', 75, 'Copilot', '佐藤 亮', 4],
  ['sample_mail_reply', 79, 'ChatGPT', '中村 彩', 5],
  ['sample_jargon', 98, 'Claude', 'Niki', 5],
  ['sample_routing', 103, 'Copilot', '大西 健', 3],
  ['sample_sns_post', 122, 'Gemini', '中村 彩', 4],
  ['sample_daily_report', 126, 'Gemini', '田中 美咲', 4],
  ['sample_manual', 148, 'Claude', 'Niki', 4],
  ['sample_plan_compare', 171, 'Gemini', 'Niki', 5],
  ['sample_claim_summary', 195, 'ChatGPT', '佐藤 亮', 4],
  ['sample_campaign_idea', 220, 'ChatGPT', '田中 美咲', 3],
  ['sample_mail_reply', 244, 'Claude', 'Niki', 5],
  ['sample_job_posting', 268, 'Claude', '中村 彩', 3],
  ['sample_jargon', 292, 'ChatGPT', 'Niki', 5],
  ['sample_sales_summary', 340, 'ChatGPT', '佐藤 亮', 4],
];

const MAX_HOURS_AGO = SEEDS.reduce((peak, [, hoursAgo]) => Math.max(peak, hoursAgo), 1);
const DEFAULT_WINDOW_HOURS = 30 * 24;

/**
 * 履歴の日時を「今月かつ直近30日以内」に収める。
 * 月初に開いたときでも今月の利用回数が0にならず、ダッシュボードが成立する。
 */
function resolveUsedAt(hoursAgo: number): string {
  const now = Date.now();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const windowStart = Math.max(monthStart.getTime(), now - DEFAULT_WINDOW_HOURS * HOUR_MS);
  const span = Math.max(now - windowStart, HOUR_MS);
  // 最古の履歴でも windowStart より新しくなるよう 0.97 を掛けている
  return new Date(now - (hoursAgo / MAX_HOURS_AGO) * span * 0.97).toISOString();
}

export function createSampleHistory(prompts: Prompt[]): UsageHistory[] {
  const titleById = new Map(prompts.map((prompt) => [prompt.id, prompt.title]));
  return SEEDS.map(([promptId, hoursAgo, aiTool, userName, rating], index) => ({
    id: `sample_history_${index + 1}`,
    promptId,
    promptTitle: titleById.get(promptId) ?? '削除されたプロンプト',
    usedAt: resolveUsedAt(hoursAgo),
    aiTool,
    userName,
    rating,
  }));
}
