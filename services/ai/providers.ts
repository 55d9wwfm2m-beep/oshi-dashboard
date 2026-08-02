/**
 * AIプロバイダのアダプタ層（サーバー専用）。
 *
 * providerごとの差分をこのファイルへ閉じ込めているため、
 * 改善ロジック側（improve-service.ts）は provider を意識しない。
 * APIキーはサーバー環境変数からのみ読み、クライアントへは決して渡さない。
 */

export interface AiProvider {
  name: string;
  model: string;
  complete(system: string, user: string): Promise<string>;
}

const DEFAULT_MODELS = {
  anthropic: 'claude-sonnet-4-5',
  openai: 'gpt-4o-mini',
  google: 'gemini-2.0-flash',
} as const;

type ProviderName = keyof typeof DEFAULT_MODELS;

const MAX_TOKENS = 2000;

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AI provider responded ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json() as Promise<unknown>;
}

function createAnthropic(apiKey: string, model: string): AiProvider {
  return {
    name: 'anthropic',
    model,
    async complete(system, user) {
      const data = (await postJson(
        'https://api.anthropic.com/v1/messages',
        { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        { model, max_tokens: MAX_TOKENS, system, messages: [{ role: 'user', content: user }] }
      )) as { content?: { type: string; text?: string }[] };
      return data.content?.map((part) => part.text ?? '').join('') ?? '';
    },
  };
}

function createOpenAi(apiKey: string, model: string): AiProvider {
  return {
    name: 'openai',
    model,
    async complete(system, user) {
      const data = (await postJson(
        'https://api.openai.com/v1/chat/completions',
        { authorization: `Bearer ${apiKey}` },
        {
          model,
          max_tokens: MAX_TOKENS,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }
      )) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? '';
    },
  };
}

function createGoogle(apiKey: string, model: string): AiProvider {
  return {
    name: 'google',
    model,
    async complete(system, user) {
      const data = (await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {},
        {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
        }
      )) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    },
  };
}

const FACTORIES: Record<ProviderName, (apiKey: string, model: string) => AiProvider> = {
  anthropic: createAnthropic,
  openai: createOpenAi,
  google: createGoogle,
};

function isProviderName(value: string): value is ProviderName {
  return value in DEFAULT_MODELS;
}

/**
 * 環境変数からプロバイダを解決する。
 * キーが未設定なら null を返し、呼び出し側はデモモードへフォールバックする。
 */
export function resolveProvider(): AiProvider | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const requested = process.env.AI_PROVIDER ?? 'anthropic';
  if (!isProviderName(requested)) return null;

  const model = process.env.AI_MODEL || DEFAULT_MODELS[requested];
  return FACTORIES[requested](apiKey, model);
}
