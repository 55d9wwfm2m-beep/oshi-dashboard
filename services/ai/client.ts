import { improveWithDemo } from './demo-improver';
import type { ImproveRequest, ImproveResult } from '@/types/prompthub';

const IMPROVE_ENDPOINT = '/api/prompthub/improve';

/**
 * クライアントから呼ぶ改善リクエスト。
 * サーバー側がAPIキーの有無を判断するため、クライアントは鍵を一切知らない。
 * 通信自体が失敗した場合のみ、ブラウザ内のデモ生成で結果を返す。
 */
export async function requestImprovement(request: ImproveRequest): Promise<ImproveResult> {
  try {
    const response = await fetch(IMPROVE_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`improve endpoint responded ${response.status}`);
    return (await response.json()) as ImproveResult;
  } catch {
    return improveWithDemo(request);
  }
}
