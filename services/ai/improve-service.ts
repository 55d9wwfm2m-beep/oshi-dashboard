import { IMPROVEMENT_LABELS } from '@/lib/prompthub/constants';
import {
  IMPROVEMENT_KINDS,
  type ImproveRequest,
  type ImproveResult,
  type ImprovementChange,
} from '@/types/prompthub';
import { improveWithDemo } from './demo-improver';
import { resolveProvider } from './providers';

const SYSTEM_PROMPT = `あなたはプロンプトエンジニアリングの専門家です。
与えられた業務用プロンプトを、日本企業の実務でそのまま使える品質へ改善してください。

必ず次のJSONのみを出力してください（前後に説明文やコードフェンスを付けない）。
{
  "improved": "改善後のプロンプト全文",
  "changes": [
    { "kind": "role|condition|format|clarity|reproducibility", "title": "短い見出し", "detail": "何をどう直したかの説明（80字程度）" }
  ]
}

改善方針:
- 役割・目的・入力・手順・出力形式・制約を見出しで分ける
- 曖昧な表現は数値や判断基準のある指示へ置き換える
- 差し替える箇所は {{変数名}} として切り出す
- 情報が不足している場合に推測させず「要確認」と書かせる
- 出力言語は日本語`;

function buildUserMessage(request: ImproveRequest): string {
  return [
    `タイトル: ${request.title}`,
    `説明: ${request.description || '（なし）'}`,
    `対応AI: ${request.aiTools.join(' / ') || '指定なし'}`,
    `注意事項: ${request.caution || '（なし）'}`,
    '',
    '--- 改善対象のプロンプト本文 ---',
    request.content,
  ].join('\n');
}

function isImprovementKind(value: unknown): value is ImprovementChange['kind'] {
  return typeof value === 'string' && (IMPROVEMENT_KINDS as readonly string[]).includes(value);
}

/** モデル出力は信用せず、想定した形だけを取り出す */
function parseModelJson(raw: string): { improved: string; changes: ImprovementChange[] } | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (typeof parsed !== 'object' || parsed === null) return null;

    const record = parsed as Record<string, unknown>;
    const improved = typeof record.improved === 'string' ? record.improved.trim() : '';
    if (!improved) return null;

    const rawChanges = Array.isArray(record.changes) ? record.changes : [];
    const changes = rawChanges.reduce<ImprovementChange[]>((acc, item) => {
      if (typeof item !== 'object' || item === null) return acc;
      const entry = item as Record<string, unknown>;
      if (!isImprovementKind(entry.kind)) return acc;
      acc.push({
        kind: entry.kind,
        title: typeof entry.title === 'string' && entry.title ? entry.title : IMPROVEMENT_LABELS[entry.kind],
        detail: typeof entry.detail === 'string' ? entry.detail : '',
      });
      return acc;
    }, []);

    return { improved, changes };
  } catch {
    return null;
  }
}

/**
 * プロンプト改善のサーバー側エントリポイント。
 * APIキーが未設定、または実APIが失敗した場合は自動的にデモモードへフォールバックする。
 * UI からはこの関数の戻り値の形（ImproveResult）だけを見ればよい。
 */
export async function improvePrompt(request: ImproveRequest): Promise<ImproveResult> {
  const provider = resolveProvider();
  if (!provider) return improveWithDemo(request);

  try {
    const raw = await provider.complete(SYSTEM_PROMPT, buildUserMessage(request));
    const parsed = parseModelJson(raw);
    if (!parsed) return improveWithDemo(request);

    return {
      improved: parsed.improved,
      // 変更点が取れなかった場合でも画面が空にならないようデモの説明で補う
      changes: parsed.changes.length > 0 ? parsed.changes : improveWithDemo(request).changes,
      mode: 'api',
      provider: `${provider.name} / ${provider.model}`,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return improveWithDemo(request);
  }
}

/** APIキーが設定されているか（クライアントへ返すのは真偽値のみ） */
export function isApiModeAvailable(): boolean {
  return resolveProvider() !== null;
}
