'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { useAvatarEquip } from '@/hooks/useAvatarEquip';
import { OshiProfile, OshiEvent, AttendanceLog, Expense, WishlistItem, OSHI_COLOR_PRESETS } from '@/types';
import { daysSince } from '@/lib/utils';
import { getLevelTier, getXPProgress } from '@/lib/game';
import { showToast } from '@/components/ui/Toast';
import { AvatarSVG } from '@/components/avatar/art';
import {
  CATEGORIES, RARITY, isUnlocked, unlockLabel, unlockProgress, getUnlock,
  AvatarStats, AvatarEquip,
} from '@/components/avatar/catalog';

const DP: OshiProfile = { name:'', group:'', meetDate:'', birthday:'', photoUrl:'', themeColor:'196,164,160' };

/** カテゴリのアイコン（表示専用） */
const CATEGORY_ICONS: Record<string, string> = {
  outfit: '👗', hairStyle: '💇', hairColor: '🖌️', eyeStyle: '👁️', eyeColor: '🔮',
  skin: '🍑', headwear: '🎀', glasses: '👓', accessory: '💫', background: '🏞️',
};

/** レアリティごとのカード地色（コレクション感） */
const RARITY_TINT: Record<string, string> = {
  N: '#FFFFFF',
  R: 'linear-gradient(170deg, #FFFFFF 55%, #EAF3FF 100%)',
  SR: 'linear-gradient(170deg, #FFFFFF 45%, #F3EAFF 100%)',
  LE: 'linear-gradient(170deg, #FFFFFF 35%, #FFF3D6 100%)',
};

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
  const xp = getXPProgress(gameState.xp);
  const category = CATEGORIES[cat];
  const collectionPct = Math.round((prog.unlocked / prog.total) * 100);

  const selectItem = (itemId: string) => {
    if (!isUnlocked(category.key, itemId, stats)) {
      showToast(`🔒 ${unlockLabel(category.key, itemId)}`);
      return;
    }
    setEquip({ [category.key]: itemId });
    setBounce(b => b + 1);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* ── ヘッダー＋コレクションゲージ ── */}
      <div className="px-4 pt-7 pb-3 anim-fadeIn">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Dress up</p>
            <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>きせかえ</h1>
          </div>
          <div className="text-right pb-0.5">
            <p className="text-[10px] font-bold" style={{ color: '#8F877F' }}>🎁 コレクション</p>
            <p className="text-base font-extrabold leading-tight" style={{ color: '#1C1917' }}>
              {prog.unlocked}
              <span className="text-[10px] font-semibold" style={{ color: '#B8B0A8' }}> / {prog.total}</span>
            </p>
          </div>
        </div>
        <div className="mt-2" style={{ height: 6, borderRadius: 999, background: '#F0EAE4', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${collectionPct}%`, borderRadius: 999,
            background: `linear-gradient(90deg, ${equip.oshiColor}, #C9B4F0)`,
            animation: 'progressFill .9s cubic-bezier(.2,.8,.2,1) both',
          }} />
        </div>
      </div>

      {/* ── ステージ（スクロールしても見える主役） ── */}
      <div className="px-4 sticky z-30" style={{ top: 0, background: '#FAF8F6', paddingTop: 4, paddingBottom: 10 }}>
        <div
          className="relative overflow-hidden anim-scaleIn"
          style={{
            borderRadius: 26,
            background: `linear-gradient(160deg, #FDF3F7 0%, #EFEAF9 62%, ${equip.oshiColor}18 100%)`,
            boxShadow: '0 10px 30px rgba(90,60,110,0.16), inset 0 0 0 1.5px rgba(255,255,255,0.65)',
          }}
        >
          {/* ふわふわ光の粒 */}
          <span className="oa-float" style={{ left: '7%', top: '16%', color: '#FFC2DC', fontSize: 15 }}>✦</span>
          <span className="oa-float" style={{ right: '9%', top: '30%', color: '#C9B4F0', fontSize: 12, animationDelay: '0.9s' }}>✧</span>
          <span className="oa-float" style={{ left: '13%', bottom: '26%', color: '#A8E6E2', fontSize: 11, animationDelay: '1.7s' }}>✦</span>
          <span className="oa-float" style={{ right: '14%', bottom: '20%', color: '#F2C14E', fontSize: 10, animationDelay: '2.4s' }}>✧</span>

          {/* アバター（タップで喜ぶ） */}
          <button
            onClick={() => setBounce(b => b + 1)}
            aria-label="アバターをなでる"
            className="block mx-auto active:scale-95 transition-transform"
            style={{ paddingTop: 14 }}
          >
            <div key={bounce} className="anim-scaleIn">
              <AvatarSVG equip={equip} size={190} animated uid="stage" bounceKey={bounce} />
            </div>
          </button>

          {/* Lv メダル */}
          <div
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: 12, top: 12, width: 46, height: 46, borderRadius: '50%',
              background: '#FFF', boxShadow: `0 0 0 2.5px ${equip.oshiColor}, 0 4px 12px rgba(0,0,0,0.14)`,
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 800, color: '#B8B0A8', letterSpacing: '0.08em' }}>Lv</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: equip.oshiColor, lineHeight: 1 }}>{gameState.level}</span>
          </div>

          {/* 称号チップ */}
          <div
            className="absolute"
            style={{
              right: 12, top: 12, padding: '5px 11px', borderRadius: 999,
              background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(4px)',
              fontSize: 11, fontWeight: 700, color: '#5A4E7C',
              boxShadow: '0 2px 10px rgba(90,60,110,0.14)',
            }}
          >
            {tier.char} {tier.title}
          </div>

          {/* XPバー */}
          <div style={{ padding: '2px 16px 13px' }}>
            <div className="flex justify-between" style={{ fontSize: 9.5, fontWeight: 700, color: '#8F877F', marginBottom: 3 }}>
              <span>つぎのレベルまで</span>
              <span>あと {xp.needed - xp.current} XP</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.8)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${xp.pct}%`, borderRadius: 999,
                background: `linear-gradient(90deg, ${equip.oshiColor}, #C9B4F0)`,
                animation: 'progressFill .8s cubic-bezier(.2,.8,.2,1) both',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 推しカラー ── */}
      <div className="px-4 mt-1 mb-3">
        <div className="flex items-center gap-2.5 overflow-x-auto py-1">
          <span className="shrink-0 text-[11px] font-bold" style={{ color: '#8F877F' }}>💗 推しカラー</span>
          {OSHI_COLOR_PRESETS.map(c => {
            const selected = equip.oshiColor === c.hex;
            return (
              <button
                key={c.hex}
                onClick={() => setEquip({ oshiColor: c.hex })}
                aria-label={`推しカラー: ${c.name}`}
                aria-pressed={selected}
                className="shrink-0 active:scale-90 transition-transform"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: c.hex,
                    border: '2.5px solid #FFF',
                    boxShadow: selected ? `0 0 0 2.5px ${c.hex}, 0 3px 10px ${c.hex}70` : '0 1.5px 6px rgba(0,0,0,0.15)',
                    transform: selected ? 'scale(1.12)' : undefined,
                    transition: 'all 0.18s',
                  }}
                >
                  {selected && <span style={{ color: '#FFF', fontSize: 12, fontWeight: 800, lineHeight: 1 }}>♥</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── カテゴリ切り替え ── */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c, i) => {
            const active = cat === i;
            const got = c.items.filter(it => isUnlocked(c.key, it.id, stats)).length;
            return (
              <button
                key={c.key}
                onClick={() => setCat(i)}
                className="shrink-0 flex items-center gap-1.5 transition-all active:scale-95"
                style={{
                  padding: '9px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  ...(active
                    ? { background: equip.oshiColor, color: '#FFF', boxShadow: `0 4px 14px ${equip.oshiColor}55`, transform: 'scale(1.04)' }
                    : { background: '#FFF', color: '#78716C', border: '1px solid #EDE8E3' }),
                }}
              >
                <span style={{ fontSize: 13 }}>{CATEGORY_ICONS[c.key] ?? '✨'}</span>
                {c.label}
                <span style={{ fontSize: 9, fontWeight: 800, opacity: 0.7 }}>{got}/{c.items.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── アイテム一覧 ── */}
      <div className="px-4 grid grid-cols-3 gap-2.5">
        {category.items.map(item => {
          const unlocked = isUnlocked(category.key, item.id, stats);
          const equipped = equip[category.key] === item.id;
          const preview: AvatarEquip = { ...equip, [category.key]: item.id };
          const r = RARITY[item.rarity] ?? RARITY.N;
          const isBg = category.key === 'background';
          const cellCrop = isBg ? 'full' : category.key === 'outfit' ? 'torso' : 'bust';
          const u = getUnlock(category.key, item.id);
          const unlockPct = u.kind === 'always' ? 100 : Math.min(100, Math.round((stats[u.kind] / u.v) * 100));
          return (
            <button
              key={item.id}
              onClick={() => selectItem(item.id)}
              aria-label={unlocked ? `${item.name}を装備` : `${item.name}（${unlockLabel(category.key, item.id)}）`}
              className="p-2 pb-1.5 text-center relative transition-transform active:scale-95"
              style={{
                borderRadius: 18,
                background: RARITY_TINT[item.rarity] ?? '#FFFFFF',
                boxShadow: equipped
                  ? `0 0 0 2px ${equip.oshiColor}, 0 6px 18px ${equip.oshiColor}40`
                  : item.rarity !== 'N'
                    ? `0 0 0 1.5px ${r.ring}55, 0 4px 14px ${r.glow}`
                    : '0 2px 10px rgba(28,18,12,0.07)',
              }}
            >
              <div
                className="rounded-xl overflow-hidden mx-auto flex items-center justify-center"
                style={{
                  width: '100%', aspectRatio: '1',
                  background: isBg ? 'transparent' : 'linear-gradient(160deg,#FDF3F7,#EFEAF9)',
                  filter: unlocked ? undefined : 'saturate(0.75) brightness(0.98)',
                }}
              >
                <AvatarSVG
                  equip={preview}
                  size={isBg ? 76 : 88}
                  crop={cellCrop}
                  showBackground={isBg}
                  uid={`c${category.key}-${item.id}`}
                />
              </div>
              <p className="text-[10.5px] font-bold mt-1.5 leading-tight" style={{ color: unlocked ? '#1C1917' : '#A8A29E' }}>
                {item.name}
              </p>
              {/* レアリティバッジ */}
              {item.rarity !== 'N' && (
                <span
                  className="absolute"
                  style={{
                    top: 7, left: 7, fontSize: 8, fontWeight: 800, padding: '2px 6px',
                    borderRadius: 999, color: '#FFF', background: r.ring,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.22)', letterSpacing: '0.04em',
                  }}
                >
                  {item.rarity}
                </span>
              )}
              {/* そうび中ハート */}
              {equipped && (
                <span
                  className="absolute anim-pop flex items-center justify-center"
                  style={{
                    top: 6, right: 6, width: 20, height: 20, borderRadius: '50%',
                    background: equip.oshiColor, color: '#FFF', fontSize: 10,
                    border: '1.5px solid #FFF', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  }}
                >
                  ♥
                </span>
              )}
              {/* ロック中：アイテムは見せたまま、条件と進捗を下帯で */}
              {!unlocked && (
                <div
                  className="absolute"
                  style={{
                    left: 6, right: 6, bottom: 26, borderRadius: 10,
                    background: 'rgba(58,46,74,0.84)', backdropFilter: 'blur(2px)',
                    padding: '4px 7px 6px',
                  }}
                >
                  <p style={{ fontSize: 8.5, fontWeight: 700, color: '#FFF', lineHeight: 1.25 }}>
                    🔒 {unlockLabel(category.key, item.id)}
                  </p>
                  <div style={{ height: 3.5, borderRadius: 999, background: 'rgba(255,255,255,0.28)', marginTop: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${unlockPct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${r.ring}, #FFFFFF)` }} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] mt-5 px-8" style={{ color: '#B8B0A8' }}>
        タップですぐおきがえ完了！推し活を記録して、のこり{prog.total - prog.unlocked}このアイテムを解放しよう ✨
      </p>
    </div>
  );
}
