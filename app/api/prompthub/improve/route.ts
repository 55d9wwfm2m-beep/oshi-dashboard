import { NextResponse } from 'next/server';
import { improvePrompt } from '@/services/ai/improve-service';
import { AI_TOOLS, type AiTool, type ImproveRequest } from '@/types/prompthub';

export const runtime = 'nodejs';
/** 実APIを呼ぶ可能性があるため、常に動的実行にする */
export const dynamic = 'force-dynamic';

const MAX_CONTENT_LENGTH = 20_000;

function toStringField(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function toAiTools(value: unknown): AiTool[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AiTool => (AI_TOOLS as readonly unknown[]).includes(item));
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません。' }, { status: 400 });
  }

  const body = (typeof payload === 'object' && payload !== null ? payload : {}) as Record<string, unknown>;
  const content = toStringField(body.content, MAX_CONTENT_LENGTH);
  if (!content.trim()) {
    return NextResponse.json({ error: 'プロンプト本文が空です。' }, { status: 400 });
  }

  const improveRequest: ImproveRequest = {
    title: toStringField(body.title, 200),
    description: toStringField(body.description, 500),
    content,
    category: toStringField(body.category, 50),
    aiTools: toAiTools(body.aiTools),
    caution: toStringField(body.caution, 1000),
  };

  const result = await improvePrompt(improveRequest);
  return NextResponse.json(result);
}
