import type { Category } from '@/types/prompthub';

/** 初期カテゴリー。promptCount は読み出し時に集計するため 0 で保持する。 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'mail', name: 'メール', description: '社内外へのメール作成・返信・添削', promptCount: 0 },
  { id: 'support', name: '接客', description: '店頭・電話・チャットでのお客様対応', promptCount: 0 },
  { id: 'sales', name: '営業', description: '提案・見積・フォローアップ', promptCount: 0 },
  { id: 'office', name: '事務', description: '書類作成・データ整理・定型業務', promptCount: 0 },
  { id: 'meeting', name: '会議', description: '議事録・アジェンダ・ToDo抽出', promptCount: 0 },
  { id: 'planning', name: '企画', description: '企画立案・アイデア出し・構成案', promptCount: 0 },
  { id: 'marketing', name: 'マーケティング', description: 'SNS・広告・販促コピー', promptCount: 0 },
  { id: 'hr', name: '採用', description: '求人票・面接・オンボーディング', promptCount: 0 },
  { id: 'report', name: '報告書', description: '日報・週報・売上報告・レポート', promptCount: 0 },
  { id: 'other', name: 'その他', description: '上記に当てはまらないプロンプト', promptCount: 0 },
];

export const FALLBACK_CATEGORY_ID = 'other';
