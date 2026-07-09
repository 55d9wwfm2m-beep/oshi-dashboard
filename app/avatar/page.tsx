'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { useAvatarEquip } from '@/hooks/useAvatarEquip';
import { OshiProfile, OshiEvent, AttendanceLog, Expense, WishlistItem, OSHI_COLOR_PRESETS } from '@/types';
import { daysSince } from '@/lib/utils';
import { getLevelTier } from '@/lib/game';
import { showToast } from '@/components/ui/Toast';
import { AvatarSVG } from '@/components/avatar/art';
import {
  CATEGORIES, RARITY, isUnlocked, unlockLabel, unlockProgress,
  AvatarStats, AvatarEquip,
} from '@/components/avatar/catalog';

const DP: OshiProfile = { name:'', group:'', meetDate:'', birthday:'', photoUrl:'', themeColor:'196,164,160' };

export default function AvatarPage() {
  const { equip, setEquip, loaded } = useAvatarEquip();
  const { state: gameState, loaded: gameLoaded } = useGameState();
  const [profile]  = useLocalStorage<OshiProfile>('oshi-profile', DP);
  const [events]   = useLocalStorage<OshiEvent[]>('oshi-events', []);
  const [logs]     = useLocalStorage<AttendanceLog[]>('oshi-logs', []);
  const [expenses] = useLocalStorage<Expense[]>('oshi-expenses', []);
  const [wishlist] = useLocalStorage<WishlistItem[]>('oshi-wishlist', []);
  const [cat, setCat] = useState(0);
  const [bounce, setBounce] = useState(0);

  if (!loaded || !gameLoaded) return null;

  const stats: AvatarStats = {
    level:    gameState.level,
    events:   events.length,
    logs:     logs.length,
    goods:    wishlist.filter(w => w.purchased).length,
    expenses: expenses.length,
    days:     profile.meetDate ? daysSince(profile.meetDate) : 0,
  };
  const prog = unlockProgress(stats);
  const tier = getLevelTier(gameState.level);
  const category = CATEGORIES[cat];

  const selectItem = (itemId: string) => {
    if (!isUnlocked(category.key, itemId, stats)) {
      showToast(`🔒 ${unlockLabel(category.key, itemId)}`);
      return;
    }
    setEquip({ [category.key]: itemId });
    setBounce(b => b + 1);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 anim-fadeIn">
        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Avatar</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>きせかえ</h1>
        <p className="text-xs mt-1" style={{ color: '#8F877F' }}>
          推し活するほどアイテムが解放されます — {prog.unlocked}/{prog.total} 解放中
        </p>
      </div>

      {/* Stage */}
      <div
        className="mx-4 mb-4 card overflow-hidden anim-scaleIn"
        style={{ background: 'linear-gradient(160deg, #FDF3F7 0%, #EFEAF9 100%)' }}
      >
        <div className="flex flex-col items-center pt-5 pb-4">
          <div key={bounce} className="anim-scaleIn">
            <AvatarSVG equip={equip} size={216} animated uid="stage" bounceKey={bounce} />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>Lv.{gameState.level}</p>
            <p className="text-xs mt-0.5" style={{ color: equip.oshiColor }}>{tier.title}</p>
          </div>
        </div>
      </div>

      {/* 推しカラー */}
      <div className="mx-4 mb-4 card p-4 anim-fadeInUp">
        <p className="text-sm font-semibold mb-3" style={{ color: '#1C1917' }}>推しカラー</p>
        <div className="flex gap-3 flex-wrap">
          {OSHI_COLOR_PRESETS.map(c => (
            <button
              key={c.hex}
              onClick={() => setEquip({ oshiColor: c.hex })}
              aria-label={`推しカラー: ${c.name}`}
              className="active:scale-90 transition-transform"
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: c.hex,
                border: equip.oshiColor === c.hex ? '3px solid white' : '3px solid transparent',
                boxShadow: equip.oshiColor === c.hex
                  ? `0 0 0 2px ${c.hex}, 0 4px 12px ${c.hex}60`
                  : '0 2px 8px rgba(0,0,0,0.18)',
                transition: 'all 0.15s',
              }} />
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.key}
              onClick={() => setCat(i)}
              className="shrink-0 text-xs px-3.5 py-2 rounded-full font-medium transition-all"
              style={cat === i
                ? { background: 'rgb(var(--accent))', color: 'white' }
                : { background: 'white', color: '#78716C', border: '1px solid #EDE8E3' }
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="px-4 grid grid-cols-3 gap-2.5">
        {category.items.map(item => {
          const unlocked = isUnlocked(category.key, item.id, stats);
          const equipped = equip[category.key] === item.id;
          const preview: AvatarEquip = { ...equip, [category.key]: item.id };
          const r = RARITY[item.rarity] ?? RARITY.N;
          const isBg = category.key === 'background';
          return (
            <button
              key={item.id}
              onClick={() => selectItem(item.id)}
              aria-label={unlocked ? `${item.name}を装備` : `${item.name}（${unlockLabel(category.key, item.id)}）`}
              className="card p-2 pb-2.5 text-center transition-transform active:scale-95 relative"
              style={equipped ? { boxShadow: `0 0 0 2px ${equip.oshiColor}, 0 2px 16px rgba(28,18,12,0.06)` } : undefined}
            >
              <div
                className="rounded-xl overflow-hidden mx-auto flex items-center justify-center"
                style={{
                  width: '100%', aspectRatio: '1',
                  background: isBg ? 'transparent' : 'linear-gradient(160deg,#FDF3F7,#EFEAF9)',
                }}
              >
                <AvatarSVG
                  equip={preview}
                  size={isBg ? 76 : 88}
                  crop={isBg ? undefined : 'bust'}
                  showBackground={isBg}
                  uid={`c${category.key}-${item.id}`}
                />
              </div>
              <p className="text-[11px] font-medium mt-1.5 leading-tight" style={{ color: '#1C1917' }}>
                {item.name}
              </p>
              {item.rarity !== 'N' && (
                <span
                  className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: r.ring }}
                >
                  {item.rarity}
                </span>
              )}
              {equipped && (
                <span
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ background: equip.oshiColor }}
                >
                  ✓
                </span>
              )}
              {!unlocked && (
                <div
                  className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-1"
                  style={{ background: 'rgba(250,248,246,0.72)', backdropFilter: 'blur(1px)' }}
                >
                  <span className="text-base">🔒</span>
                  <span className="text-[9px] font-medium px-1 leading-tight" style={{ color: '#78716C' }}>
                    {unlockLabel(category.key, item.id)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] mt-5 px-8" style={{ color: '#B8B0A8' }}>
        タップですぐ保存されます。イベントやログを記録して、もっと解放しよう ✨
      </p>
    </div>
  );
}
