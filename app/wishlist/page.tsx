'use client';

import { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  WishlistItem, WishlistPriority, GoodsCategory,
  GOODS_CATEGORIES, GOODS_CATEGORY_EMOJI,
} from '@/types';
import { formatYen, generateId, todayString, formatDateShort, resizeImage } from '@/lib/utils';

const PRIORITIES: WishlistPriority[] = ['高', '中', '低'];
const PRIORITY_COLOR: Record<WishlistPriority, string> = {
  高: '#E53935',
  中: '#F9A825',
  低: '#78716C',
};

const EMPTY_FORM = {
  name: '',
  imageUrl: '',
  price: '',
  purchaseUrl: '',
  priority: '中' as WishlistPriority,
  category: 'グッズ' as GoodsCategory,
  memo: '',
};

type Tab = 'wishlist' | 'collection';

export default function WishlistPage() {
  const [items, setItems, loaded] = useLocalStorage<WishlistItem[]>('oshi-wishlist', []);
  const [tab, setTab]       = useState<Tab>('wishlist');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState({ ...EMPTY_FORM });
  const [filter, setFilter] = useState<WishlistPriority | 'すべて'>('すべて');
  const [catFilter, setCatFilter] = useState<GoodsCategory | 'すべて'>('すべて');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!loaded) return null;

  const wishlist   = items.filter(i => !i.purchased);
  const collection = items.filter(i =>  i.purchased);

  const filteredWishlist = filter === 'すべて'
    ? wishlist
    : wishlist.filter(i => i.priority === filter);

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    const po: Record<WishlistPriority, number> = { 高: 0, 中: 1, 低: 2 };
    return po[a.priority] - po[b.priority];
  });

  const filteredCollection = catFilter === 'すべて'
    ? collection
    : collection.filter(i => i.category === catFilter);

  const collectionByCategory = GOODS_CATEGORIES
    .map(cat => ({ cat, items: collection.filter(i => i.category === cat) }))
    .filter(g => g.items.length > 0);

  const totalValue = collection.reduce((s, i) => s + i.price, 0);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item: WishlistItem) => {
    setForm({
      name:        item.name,
      imageUrl:    item.imageUrl,
      price:       item.price ? String(item.price) : '',
      purchaseUrl: item.purchaseUrl,
      priority:    item.priority,
      category:    item.category,
      memo:        item.memo,
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    const price = parseInt(form.price) || 0;
    if (editId) {
      setItems(prev => prev.map(i => i.id === editId
        ? { ...i, name: form.name, imageUrl: form.imageUrl, price, purchaseUrl: form.purchaseUrl, priority: form.priority, category: form.category, memo: form.memo }
        : i
      ));
    } else {
      const newItem: WishlistItem = {
        id: generateId(),
        name: form.name,
        imageUrl: form.imageUrl,
        price,
        purchaseUrl: form.purchaseUrl,
        priority: form.priority,
        category: form.category,
        memo: form.memo,
        purchased: false,
        purchasedDate: '',
      };
      setItems(prev => [newItem, ...prev]);
    }
    setShowForm(false);
  };

  const markPurchased = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, purchased: true, purchasedDate: todayString() } : i
    ));
  };

  const markUnpurchased = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, purchased: false, purchasedDate: '' } : i
    ));
  };

  const del = (id: string) => {
    if (confirm('削除しますか？')) setItems(prev => prev.filter(i => i.id !== id));
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImage(file, 400);
    setForm(prev => ({ ...prev, imageUrl: b64 }));
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 flex items-end justify-between anim-fadeIn">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Goods</p>
          <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>グッズ管理</h1>
        </div>
        <button
          onClick={openAdd}
          aria-label="グッズを追加"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl shadow-md active:scale-90 transition-transform"
          style={{ background: 'rgb(var(--accent))' }}
        >
          +
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-[#F0EBE6] rounded-2xl p-1">
          <TabBtn label={`欲しいもの (${wishlist.length})`}   active={tab==='wishlist'}    onClick={() => setTab('wishlist')} />
          <TabBtn label={`コレクション (${collection.length})`} active={tab==='collection'} onClick={() => setTab('collection')} />
        </div>
      </div>

      {/* ── 欲しいもの tab ── */}
      {tab === 'wishlist' && (
        <div className="px-4 space-y-3">
          {/* Priority summary */}
          <div className="flex gap-2">
            {(['すべて', ...PRIORITIES] as const).map(p => {
              const count = p === 'すべて' ? wishlist.length : wishlist.filter(i => i.priority === p).length;
              return (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: filter === p
                      ? (p === 'すべて' ? 'rgb(var(--accent))' : PRIORITY_COLOR[p as WishlistPriority])
                      : '#F5F0EC',
                    color:  filter === p ? 'white' : '#78716C',
                    border: filter === p ? 'none' : '1px solid #EAE4DF',
                  }}
                >
                  {p === 'すべて' ? `すべて` : `${p}優先`}
                  <span className="ml-1 opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {sortedWishlist.length === 0 && (
            <div className="text-center py-20 space-y-3 anim-fadeIn">
              <p className="text-5xl">🛍️</p>
              <p className="text-sm font-medium" style={{ color: '#1C1917' }}>欲しいグッズをメモしよう</p>
              <p className="text-xs" style={{ color: '#A8A29E' }}>追加ボタンから登録できます</p>
            </div>
          )}

          {sortedWishlist.map((item, idx) => (
            <WishlistCard
              key={item.id}
              item={item}
              idx={idx}
              onEdit={() => openEdit(item)}
              onPurchase={() => markPurchased(item.id)}
              onDelete={() => del(item.id)}
            />
          ))}
        </div>
      )}

      {/* ── コレクション tab ── */}
      {tab === 'collection' && (
        <div className="px-4 space-y-3">
          {/* Summary */}
          {collection.length > 0 && (
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between anim-fadeIn"
              style={{ background: 'rgba(var(--accent),0.08)', border: '1px solid rgba(var(--accent),0.14)' }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgb(var(--accent))' }}>コレクション合計</p>
                <p className="text-2xl font-semibold font-serif-num mt-0.5" style={{ color: '#1C1917' }}>
                  {collection.length}<span className="text-sm font-normal ml-1" style={{ color: '#A8A29E' }}>個</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#A8A29E' }}>累計</p>
                <p className="text-lg font-semibold font-serif-num" style={{ color: '#1C1917' }}>{formatYen(totalValue)}</p>
              </div>
            </div>
          )}

          {collection.length === 0 && (
            <div className="text-center py-20 space-y-3 anim-fadeIn">
              <p className="text-5xl">🧸</p>
              <p className="text-sm font-medium" style={{ color: '#1C1917' }}>コレクションはまだありません</p>
              <p className="text-xs" style={{ color: '#A8A29E' }}>欲しいものリストで「購入済み」にすると追加されます</p>
            </div>
          )}

          {/* Category groups */}
          {collectionByCategory.map(({ cat, items: catItems }) => (
            <div key={cat} className="space-y-2 anim-fadeInUp">
              <div className="flex items-center gap-2 px-1">
                <span className="text-lg">{GOODS_CATEGORY_EMOJI[cat]}</span>
                <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>{cat}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(var(--accent),0.1)', color: 'rgb(var(--accent))' }}>
                  {catItems.length}個
                </span>
              </div>
              {catItems.map((item, idx) => (
                <CollectionCard
                  key={item.id}
                  item={item}
                  idx={idx}
                  onEdit={() => openEdit(item)}
                  onUnpurchase={() => markUnpurchased(item.id)}
                  onDelete={() => del(item.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit bottom sheet ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(28,18,12,0.45)' }}
          onClick={() => setShowForm(false)}
        >
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#E0D8D2' }} />
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#1C1917' }}>
              {editId ? 'グッズを編集' : 'グッズを追加'}
            </h2>

            <div className="space-y-4">
              {/* Image */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                  style={{ background: '#F0EBE6', border: '1.5px dashed #D0C8C2' }}
                >
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl">📷</p>
                      <p className="text-[9px] mt-0.5" style={{ color: '#A8A29E' }}>画像を追加</p>
                    </div>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                <div className="flex-1">
                  <label className="field-label">商品名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="例：缶バッジセット"
                    className="input"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="field-label">カテゴリ</label>
                <div className="flex flex-wrap gap-2">
                  {GOODS_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(p => ({ ...p, category: cat }))}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-95"
                      style={form.category === cat
                        ? { background: 'rgb(var(--accent))', color: 'white', border: 'none' }
                        : { background: 'white', color: '#78716C', borderColor: '#EDE8E3' }
                      }
                    >
                      {GOODS_CATEGORY_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="field-label">価格</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A8A29E' }}>¥</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="0"
                    className="input pl-8"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="field-label">優先度</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                      style={{
                        background: form.priority === p ? PRIORITY_COLOR[p] : '#F5F0EC',
                        color:      form.priority === p ? 'white' : '#78716C',
                        border:     form.priority === p ? 'none' : '1px solid #EAE4DF',
                        boxShadow:  form.priority === p ? `0 3px 10px ${PRIORITY_COLOR[p]}45` : 'none',
                      }}
                    >
                      {p}優先
                    </button>
                  ))}
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="field-label">購入先URL</label>
                <input
                  type="url"
                  value={form.purchaseUrl}
                  onChange={e => setForm(p => ({ ...p, purchaseUrl: e.target.value }))}
                  placeholder="https://..."
                  className="input"
                />
              </div>

              {/* Memo */}
              <div>
                <label className="field-label">メモ</label>
                <input
                  type="text"
                  value={form.memo}
                  onChange={e => setForm(p => ({ ...p, memo: e.target.value }))}
                  placeholder="サイズ・カラーなど"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium"
                style={{ background: '#F0EBE6', color: '#78716C' }}
              >
                キャンセル
              </button>
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40"
                style={{ background: 'rgb(var(--accent))' }}
              >
                {editId ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──── WishlistCard ────
function WishlistCard({
  item, idx, onEdit, onPurchase, onDelete,
}: {
  item: WishlistItem; idx: number;
  onEdit: () => void; onPurchase: () => void; onDelete: () => void;
}) {
  return (
    <div
      className="card p-4 flex gap-3 anim-fadeInUp"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Thumbnail */}
      <div
        className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: '#F0EBE6' }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{GOODS_CATEGORY_EMOJI[item.category]}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug" style={{ color: '#1C1917' }}>{item.name}</p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: `${PRIORITY_COLOR[item.priority]}18`,
              color:       PRIORITY_COLOR[item.priority],
            }}
          >
            {item.priority}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color: '#A8A29E' }}>{GOODS_CATEGORY_EMOJI[item.category]} {item.category}</span>
          {item.price > 0 && (
            <span className="text-[11px] font-semibold" style={{ color: 'rgb(var(--accent))' }}>
              {formatYen(item.price)}
            </span>
          )}
        </div>

        {item.memo ? (
          <p className="text-[11px] mt-1 truncate" style={{ color: '#A8A29E' }}>{item.memo}</p>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5">
          {item.purchaseUrl && (
            <a
              href={item.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
              style={{ background: '#F0EBE6', color: '#78716C' }}
            >
              購入先 →
            </a>
          )}
          <button
            onClick={onEdit}
            className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
            style={{ background: '#F0EBE6', color: '#78716C' }}
          >
            編集
          </button>
          <button
            onClick={onPurchase}
            className="text-[11px] px-2.5 py-1 rounded-lg font-semibold text-white ml-auto"
            style={{ background: 'rgb(var(--accent))' }}
          >
            ✓ 購入済み
          </button>
          <button onClick={onDelete} className="text-[11px] active:text-red-400" style={{ color: '#D0C8C2' }}>
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

// ──── CollectionCard ────
function CollectionCard({
  item, idx, onEdit, onUnpurchase, onDelete,
}: {
  item: WishlistItem; idx: number;
  onEdit: () => void; onUnpurchase: () => void; onDelete: () => void;
}) {
  return (
    <div
      className="card p-4 flex gap-3 anim-fadeInUp"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div
        className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: '#F0EBE6' }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">{GOODS_CATEGORY_EMOJI[item.category]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.price > 0 && (
            <span className="text-[11px] font-semibold" style={{ color: 'rgb(var(--accent))' }}>
              {formatYen(item.price)}
            </span>
          )}
          {item.purchasedDate && (
            <span className="text-[11px]" style={{ color: '#A8A29E' }}>
              {formatDateShort(item.purchasedDate)} 購入
            </span>
          )}
        </div>
        {item.memo ? <p className="text-[11px] mt-0.5 truncate" style={{ color: '#A8A29E' }}>{item.memo}</p> : null}
        <div className="flex gap-2 mt-2">
          <button onClick={onEdit} className="text-[11px] px-2 py-0.5 rounded-lg" style={{ background: '#F0EBE6', color: '#78716C' }}>編集</button>
          <button onClick={onUnpurchase} className="text-[11px] px-2 py-0.5 rounded-lg" style={{ background: '#F0EBE6', color: '#78716C' }}>欲しいものへ戻す</button>
          <button onClick={onDelete} className="text-[11px] ml-auto active:text-red-400" style={{ color: '#D0C8C2' }}>削除</button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 text-xs font-medium rounded-xl transition-all"
      style={active
        ? { background: 'white', color: '#1C1917', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
        : { color: '#A8A29E' }
      }
    >
      {label}
    </button>
  );
}
