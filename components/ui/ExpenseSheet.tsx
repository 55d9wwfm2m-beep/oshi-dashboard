'use client';

import MoneyIcon from '@/components/ui/MoneyIcon';

import { MONEY_ACCENT, MONEY_DANGER } from '@/components/ui/money-theme';

import { useEffect, useState } from 'react';
import { LivingExpense, BudgetCategory } from '@/types';
import { generateId } from '@/lib/utils';
import { digitsOnly } from '@/lib/money';
import BottomSheet from '@/components/ui/BottomSheet';
import { showToast } from '@/components/ui/Toast';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 生活費として使ったお金を記録するシート（新規・編集の両方） */
export default function ExpenseSheet({
  open, editing, categories, onClose, onSave, onDelete,
}: {
  open: boolean;
  editing: LivingExpense | null;
  categories: BudgetCategory[];
  onClose: () => void;
  onSave: (e: LivingExpense) => void;
  onDelete: (id: string) => void;
}) {
  const [categoryId, setCategoryId] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [date, setDate] = useState('');
  const [memo, setMemo] = useState('');

  // 開くたびに、編集対象（または初期値）で作り直す
  useEffect(() => {
    if (!open) return;
    setCategoryId(editing?.categoryId ?? categories[0]?.id ?? '');
    setAmountRaw(editing ? String(editing.amount) : '');
    setDate(editing?.date ?? todayISO());
    setMemo(editing?.memo ?? '');
  }, [open, editing, categories]);

  const amount = amountRaw === '' ? 0 : parseInt(amountRaw, 10) || 0;

  const save = () => {
    if (!categoryId || amount <= 0) {
      showToast('カテゴリーと金額を入力してください');
      return;
    }
    onSave({
      id: editing?.id ?? generateId(),
      categoryId,
      amount,
      date: date || todayISO(),
      memo: memo.trim(),
    });
    showToast(editing ? '支出を更新しました' : '支出を記録しました');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? '支出を編集' : '支出を記録'}>
      <div className="space-y-4">
        <div>
          <label className="field-label" htmlFor="expense-category">カテゴリー *</label>
          <select
            id="expense-category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="input"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}><MoneyIcon name="category" /> {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="expense-amount">使った金額 *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>¥</span>
            <input
              id="expense-amount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={amountRaw === '' ? '' : amount.toLocaleString('ja-JP')}
              onChange={e => setAmountRaw(digitsOnly(e.target.value))}
              placeholder="1,200"
              className="input pl-8"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="expense-date">使った日</label>
          <input id="expense-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
        </div>

        <div>
          <label className="field-label" htmlFor="expense-memo">メモ</label>
          <input
            id="expense-memo"
            type="text"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="例：スーパー・ランチ"
            className="input"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {editing && (
          <button
            id="expense-delete"
            onClick={() => { onDelete(editing.id); showToast('支出を削除しました'); onClose(); }}
            className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
            style={{ background: MONEY_DANGER }}
          >
            削除
          </button>
        )}
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--sub)' }}
        >
          キャンセル
        </button>
        <button
          id="expense-save"
          onClick={save}
          className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white"
          style={{ background: MONEY_ACCENT }}
        >
          {editing ? '保存する' : '記録する'}
        </button>
      </div>
    </BottomSheet>
  );
}
