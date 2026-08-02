'use client';

import { useToast } from '@/components/prompthub/ui/toast';
import { SkeletonRows } from '@/components/prompthub/ui/skeleton';
import { usePromptHub } from '@/hooks/prompthub/use-prompthub';
import { CategoryManager } from './category-manager';

export function CategoriesView() {
  const { status, categories, createCategory, updateCategory, deleteCategory } = usePromptHub();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ph-fg">カテゴリー</h1>
        <p className="text-[15px] text-ph-muted">
          業務の単位でプロンプトを分類します。カテゴリーが揃っていると、必要なプロンプトに最短でたどり着けます。
        </p>
      </div>

      {status === 'loading' ? (
        <SkeletonRows rows={3} />
      ) : (
        <CategoryManager
          categories={categories}
          onCreate={(name, description) => {
            const created = createCategory(name, description);
            toast(
              created
                ? { title: `「${created.name}」を追加しました` }
                : {
                    title: '同じ名前のカテゴリーがあります',
                    description: '別の名前で登録してください。',
                    variant: 'warning',
                  }
            );
          }}
          onUpdate={(id, name, description) => {
            updateCategory(id, name, description);
            toast({ title: 'カテゴリーを更新しました' });
          }}
          onDelete={(id) => {
            deleteCategory(id);
            toast({ title: 'カテゴリーを削除しました', description: '所属していたプロンプトは「その他」へ移動しました。', variant: 'info' });
          }}
        />
      )}
    </div>
  );
}
