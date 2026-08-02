'use client';

import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PROMPTHUB_BASE } from '@/components/prompthub/nav-items';
import { Button } from '@/components/prompthub/ui/button';
import { ConfirmDialog, Dialog, DialogClose, DialogContent } from '@/components/prompthub/ui/dialog';
import { Field, Input } from '@/components/prompthub/ui/field';
import { FALLBACK_CATEGORY_ID } from '@/data/prompthub/categories';
import type { Category } from '@/types/prompthub';

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (name: string, description: string) => void;
  onUpdate: (id: string, name: string, description: string) => void;
  onDelete: (id: string) => void;
}

interface EditorState {
  mode: 'create' | 'edit';
  id?: string;
  name: string;
  description: string;
}

const EMPTY_EDITOR: EditorState = { mode: 'create', name: '', description: '' };

export function CategoryManager({ categories, onCreate, onUpdate, onDelete }: CategoryManagerProps) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const maxCount = categories.reduce((peak, category) => Math.max(peak, category.promptCount), 0);

  const submitEditor = () => {
    if (!editor || !editor.name.trim()) return;
    if (editor.mode === 'create') {
      onCreate(editor.name, editor.description);
    } else if (editor.id) {
      onUpdate(editor.id, editor.name, editor.description);
    }
    setEditor(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setEditor(EMPTY_EDITOR)} className="min-h-[44px]">
          <FolderPlus aria-hidden="true" className="h-4 w-4" />
          カテゴリーを追加
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-col rounded-lg border border-ph-border bg-ph-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-ph-fg">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ph-muted">{category.description || '説明は未設定です。'}</p>
              </div>
              <p className="shrink-0 text-right">
                <span className="text-2xl font-semibold tabular-nums text-ph-fg">
                  {category.promptCount}
                </span>
                <span className="ml-0.5 text-xs text-ph-subtle">件</span>
              </p>
            </div>

            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-ph-surface-2"
              role="img"
              aria-label={`登録数 ${category.promptCount}件`}
            >
              <div
                className="h-full rounded-full bg-ph-accent"
                style={{ width: `${maxCount === 0 ? 0 : (category.promptCount / maxCount) * 100}%` }}
              />
            </div>

            <div className="mt-4 flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href={`${PROMPTHUB_BASE}/prompts?category=${category.id}`}>一覧を見る</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                aria-label={`${category.name}を編集`}
                onClick={() =>
                  setEditor({
                    mode: 'edit',
                    id: category.id,
                    name: category.name,
                    description: category.description,
                  })
                }
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`${category.name}を削除`}
                disabled={category.id === FALLBACK_CATEGORY_ID}
                title={category.id === FALLBACK_CATEGORY_ID ? '「その他」は削除できません' : undefined}
                onClick={() => setDeleteTarget(category)}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4 text-ph-danger" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        {editor ? (
          <DialogContent
            title={editor.mode === 'create' ? 'カテゴリーを追加' : 'カテゴリーを編集'}
            description="カテゴリーはプロンプトの絞り込みと、ダッシュボードの集計に使われます。"
            footer={
              <>
                <DialogClose asChild>
                  <Button variant="secondary">キャンセル</Button>
                </DialogClose>
                <Button variant="primary" onClick={submitEditor} disabled={!editor.name.trim()}>
                  保存する
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Field label="カテゴリー名" htmlFor="category-name" required>
                <Input
                  id="category-name"
                  value={editor.name}
                  onChange={(event) => setEditor({ ...editor, name: event.target.value })}
                  placeholder="例: 店頭接客"
                />
              </Field>
              <Field label="説明" htmlFor="category-description">
                <Input
                  id="category-description"
                  value={editor.description}
                  onChange={(event) => setEditor({ ...editor, description: event.target.value })}
                  placeholder="例: 来店対応で使うプロンプト"
                />
              </Field>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`「${deleteTarget?.name ?? ''}」を削除しますか？`}
        description={
          deleteTarget && deleteTarget.promptCount > 0
            ? `このカテゴリーの${deleteTarget.promptCount}件のプロンプトは「その他」へ移動します。プロンプト自体は削除されません。`
            : 'このカテゴリーを削除します。プロンプトは削除されません。'
        }
        confirmLabel="削除する"
        onConfirm={() => deleteTarget && onDelete(deleteTarget.id)}
      />
    </div>
  );
}
