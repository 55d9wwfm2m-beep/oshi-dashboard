import { LIMITS } from '@/lib/prompthub/constants';
import type { PromptDraft } from '@/types/prompthub';

export type PromptFormErrors = Partial<Record<keyof PromptDraft, string>>;

const MIN_CONTENT_LENGTH = 10;

/** 登録・編集フォームの入力チェック。エラーがなければ空オブジェクトを返す。 */
export function validatePromptDraft(draft: PromptDraft): PromptFormErrors {
  const errors: PromptFormErrors = {};

  if (!draft.title.trim()) {
    errors.title = 'タイトルを入力してください。';
  } else if (draft.title.length > LIMITS.titleMax) {
    errors.title = `タイトルは${LIMITS.titleMax}文字以内で入力してください。`;
  }

  if (!draft.description.trim()) {
    errors.description = '一覧で内容が分かるよう、短い説明を入力してください。';
  } else if (draft.description.length > LIMITS.descriptionMax) {
    errors.description = `説明は${LIMITS.descriptionMax}文字以内で入力してください。`;
  }

  if (!draft.category) {
    errors.category = 'カテゴリーを選択してください。';
  }

  if (!draft.content.trim()) {
    errors.content = 'プロンプト本文を入力してください。';
  } else if (draft.content.trim().length < MIN_CONTENT_LENGTH) {
    errors.content = `プロンプト本文が短すぎます。${MIN_CONTENT_LENGTH}文字以上で入力してください。`;
  }

  if (draft.aiTools.length === 0) {
    errors.aiTools = '対応するAIを1つ以上選択してください。';
  }

  if (draft.caution.length > LIMITS.cautionMax) {
    errors.caution = `注意事項は${LIMITS.cautionMax}文字以内で入力してください。`;
  }

  return errors;
}

export function hasErrors(errors: PromptFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
