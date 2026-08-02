import { DEFAULT_CATEGORIES } from '@/data/prompthub/categories';
import { IMPROVEMENT_LABELS } from '@/lib/prompthub/constants';
import type { ImproveRequest, ImproveResult, ImprovementChange } from '@/types/prompthub';

/** カテゴリーごとの「役割」と「出力形式」の雛形 */
const ROLE_BY_CATEGORY: Record<string, string> = {
  mail: '社外文書の作成経験が豊富なカスタマーサポート担当者',
  support: '接客品質の指導を担当するカスタマーサポートのリーダー',
  sales: '提案書と見積説明を数多く手がけてきた営業担当者',
  office: '業務手順の標準化を担当するバックオフィス担当者',
  meeting: '議事進行と決定事項の整理に長けたファシリテーター',
  planning: '実行可能性を重視する企画担当者',
  marketing: '販促コピーの制作を担当するマーケティング担当者',
  hr: '採用広報を担当する人事担当者',
  report: '数値を分かりやすく伝えるレポート作成担当者',
  other: '依頼内容の要点を的確に整理できる実務担当者',
};

const OUTPUT_FORMAT_BY_CATEGORY: Record<string, string[]> = {
  mail: ['件名（30字以内）', '本文（400字以内）', '送信前に確認すべき点（箇条書き2点）'],
  support: ['お客様への回答文（3〜5行）', '補足説明', '社内で確認すべきこと'],
  sales: ['ご提案の要約（1文）', '比較表（項目 / 内容 / 金額）', 'ご注意いただきたい点'],
  office: ['目的', '手順（番号つき）', 'つまずきやすいポイント'],
  meeting: ['決定事項', 'ToDo（タスク / 担当 / 期限）', '次回までに決めること'],
  planning: ['案の一覧（タイトル / 内容 / 工数）', '推奨案とその理由', '効果測定の指標'],
  marketing: ['本文案（3案）', 'ハッシュタグ', '想定される反応'],
  hr: ['見出しごとの本文', '応募者が不安に感じる点への回答'],
  report: ['サマリー（3行）', '数値ハイライト（4点まで）', '次のアクション（3つ）'],
  other: ['結論（1〜2文）', '根拠', '次に取るべきアクション'],
};

/** 曖昧さの原因になりやすい表現 */
const VAGUE_EXPRESSIONS = [
  'いい感じ',
  'ちゃんと',
  'しっかり',
  'なるべく',
  'できるだけ',
  '適当に',
  'うまく',
  'それなり',
  '分かりやすく',
  'わかりやすく',
  '簡単に',
];

function categoryName(categoryId: string): string {
  return DEFAULT_CATEGORIES.find((category) => category.id === categoryId)?.name ?? 'その他';
}

/**
 * 元の本文を改善後プロンプトへ埋め込むために整形する。
 * 見出しの階層が二重にならないよう `# 見出し` は `【見出し】` へ置き換え、構造は保つ。
 */
function extractBody(content: string): string {
  return content
    .split('\n')
    .map((line) => line.trimEnd().replace(/^\s*#{1,6}\s+(.*)$/, '【$1】'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectVague(content: string): string[] {
  return VAGUE_EXPRESSIONS.filter((word) => content.includes(word));
}

function buildChanges(request: ImproveRequest): ImprovementChange[] {
  const { content } = request;
  const hasRole = /あなたは|役割/.test(content);
  const hasFormat = /出力形式|フォーマット|形式で/.test(content);
  const hasVariables = /\{\{.+?\}\}/.test(content);
  const vague = detectVague(content);

  return [
    {
      kind: 'role',
      title: IMPROVEMENT_LABELS.role,
      detail: hasRole
        ? `役割の記述はありましたが、「${categoryName(request.category)}」の実務に踏み込んだ具体的な立場へ書き換え、判断基準を持てるようにしました。`
        : `冒頭に役割の指定がなかったため、「${ROLE_BY_CATEGORY[request.category] ?? ROLE_BY_CATEGORY.other}」という立場を明示しました。回答の目線と語彙が安定します。`,
    },
    {
      kind: 'condition',
      title: IMPROVEMENT_LABELS.condition,
      detail:
        '「目的」「前提条件」「制約」を独立した見出しに分け、本文の中に混ざっていた条件を箇条書きへ整理しました。条件の追加や削除がしやすくなります。',
    },
    {
      kind: 'format',
      title: IMPROVEMENT_LABELS.format,
      detail: hasFormat
        ? '出力形式は指定済みでしたが、項目ごとの文字数目安を加え、長さのばらつきを抑えました。'
        : `出力形式が未指定だったため、${categoryName(request.category)}業務でそのまま使える見出し構成を追加しました。毎回同じ形で返ってきます。`,
    },
    {
      kind: 'clarity',
      title: IMPROVEMENT_LABELS.clarity,
      detail:
        vague.length > 0
          ? `「${vague.slice(0, 3).join('」「')}」といった受け取り方が人によって変わる表現を、数値や判断基準のある指示へ置き換えました。`
          : '解釈の幅が残る言い回しを、「〜字以内」「〜の順に」といった検証できる指示へ置き換えました。',
    },
    {
      kind: 'reproducibility',
      title: IMPROVEMENT_LABELS.reproducibility,
      detail: hasVariables
        ? '変数（{{ }}）の意味を入力セクションにまとめ、担当者が変わっても同じ手順で使えるようにしました。'
        : '差し替える箇所を {{ }} の変数に切り出し、誰が使っても同じ品質の出力になるようにしました。情報不足時は「要確認」と書かせる制約も追加しています。',
    },
  ];
}

function buildImprovedPrompt(request: ImproveRequest): string {
  const role = ROLE_BY_CATEGORY[request.category] ?? ROLE_BY_CATEGORY.other;
  const formats = OUTPUT_FORMAT_BY_CATEGORY[request.category] ?? OUTPUT_FORMAT_BY_CATEGORY.other;
  const body = extractBody(request.content) || request.description || request.title;
  const purpose = request.description || `${request.title}を実行する`;
  const cautionLine = request.caution
    ? `- 運用上の注意: ${request.caution}`
    : '- 社外秘・個人情報は入力しない。含まれる場合は [伏字] に置き換える';

  return `# 役割
あなたは${role}です。以下の依頼を、実務でそのまま使える品質で実行してください。

# 目的
${purpose}

# 入力
- 対象の内容: {{入力内容}}
- 想定する相手: {{相手（例: 初めてご利用のお客様）}}
- 譲れない条件: {{条件}}

# 依頼内容
${body}

# 手順
1. 入力内容を読み、事実・意見・要望に分けて把握する
2. 判断に必要な情報が足りない場合は、推測で補わず「要確認」と明記する
3. 下記の出力形式に沿って結果を書く
4. 書き終えたら「品質チェック」の各項目を自己点検し、満たしていなければ書き直す

# 出力形式
${formats.map((item, index) => `${index + 1}. ${item}`).join('\n')}

# 制約
- 専門用語は初出時に一言の説明を添える
- 事実と推測を混ぜない。推測には「推測」と明記する
- 全体は800字以内に収める
${cautionLine}

# 品質チェック
- 出力形式のすべての項目が埋まっているか
- 断定できない内容を断定していないか
- そのまま相手に見せられる日本語になっているか`;
}

/**
 * APIキーがない環境でも機能全体を確認できるようにするデモ実装。
 * 実APIの応答と同じ ImproveResult を返すため、呼び出し側は差分を意識しなくてよい。
 */
export function improveWithDemo(request: ImproveRequest): ImproveResult {
  return {
    improved: buildImprovedPrompt(request),
    changes: buildChanges(request),
    mode: 'demo',
    provider: 'demo',
    generatedAt: new Date().toISOString(),
  };
}
