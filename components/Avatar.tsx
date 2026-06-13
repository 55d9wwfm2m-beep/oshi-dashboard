'use client';

import ReactNiceAvatar from 'react-nice-avatar';
import { AVATAR_ITEMS, getLevelTier } from '@/lib/game';
import type { AvatarConfig } from '@/types';
import { DEFAULT_AVATAR_CONFIG } from '@/types';

interface Props {
  level:      number;
  size?:      'sm' | 'md' | 'lg';
  showItems?: boolean;
  config?:    Partial<AvatarConfig>;
}

export default function Avatar({ level, size = 'md', showItems = true, config: configProp }: Props) {
  const cfg  = { ...DEFAULT_AVATAR_CONFIG, ...(configProp ?? {}) };
  const tier = getLevelTier(level);

  const unlocked = showItems ? AVATAR_ITEMS.filter(i => level >= i.unlockLevel) : [];
  const has = (id: string) => unlocked.some(i => i.id === id);

  const hasPenlight = has('penlight');
  const hasShirt    = has('shirt');
  const hasGem      = has('gem');
  const hasUchiwa   = has('uchiwa');
  const hasBag      = has('bag');
  const hasCrown    = has('crown');

  const dim   = { sm: 62, md: 80, lg: 96 }[size];
  const pad   = { sm: 13, md: 15, lg: 17 }[size];
  const total = dim + pad * 2;
  const efs   = { sm: 12, md: 15, lg: 19 }[size];

  // neutral maps to 'man' with the chosen hair style (androgynous)
  const sex: 'man' | 'woman' = cfg.sex === 'woman' ? 'woman' : 'man';

  // Penlight geometry
  const tipR   = Math.max(4, Math.round(dim * 0.07));
  const stickW = Math.max(3, Math.round(dim * 0.055));
  const stickH = Math.round(dim * 0.30);

  return (
    <div style={{ width: total, height: total, position: 'relative', flexShrink: 0 }}>

      {/* ── Main avatar circle ── */}
      <div style={{
        position:     'absolute',
        left:         pad,
        top:          pad,
        width:        dim,
        height:       dim,
        borderRadius: '50%',
        overflow:     'hidden',
        boxShadow:    [
          '0 4px 16px rgba(28,18,12,0.14)',
          '0 0 0 2.5px white',
          `0 0 0 4.5px ${cfg.oshiColor}35`,
        ].join(', '),
      }}>
        <ReactNiceAvatar
          style={{ width: dim, height: dim }}
          sex={sex}
          faceColor={cfg.faceColor}
          hairStyle={cfg.hairStyle as never}
          hairColor={cfg.hairColor}
          eyeStyle={cfg.eyeStyle as never}
          noseStyle="short"
          earSize="small"
          mouthStyle="smile"
          glassesStyle="none"
          shirtStyle="short"
          shirtColor={hasShirt ? cfg.oshiColor : '#E8E0DC'}
          bgColor={tier.solidBg}
          isGradient={false}
        />
      </div>

      {/* 👑 王冠 Lv30 – circle の上 */}
      {hasCrown && (
        <span style={{
          position:    'absolute',
          top:         0,
          left:        '50%',
          transform:   'translateX(-50%)',
          fontSize:    efs * 1.4,
          lineHeight:  1,
          filter:      'drop-shadow(0 2px 5px rgba(0,0,0,0.35))',
          pointerEvents: 'none',
          userSelect:  'none',
          zIndex:      3,
        }}>👑</span>
      )}

      {/* 💎 アクセサリー Lv15 – 右上 */}
      {hasGem && (
        <span style={{
          position:    'absolute',
          top:         pad - 3,
          right:       pad - 5,
          fontSize:    efs * 0.95,
          lineHeight:  1,
          filter:      'drop-shadow(0 1px 4px rgba(0,0,0,0.28))',
          pointerEvents: 'none',
          userSelect:  'none',
          zIndex:      2,
        }}>💎</span>
      )}

      {/* 🪭 うちわ Lv20 – 左サイド */}
      {hasUchiwa && (
        <span style={{
          position:    'absolute',
          left:        0,
          top:         '50%',
          transform:   'translateY(-50%)',
          fontSize:    efs * 1.35,
          lineHeight:  1,
          filter:      'drop-shadow(0 2px 5px rgba(0,0,0,0.22))',
          pointerEvents: 'none',
          userSelect:  'none',
          zIndex:      2,
        }}>🪭</span>
      )}

      {/* 🎒 遠征バッグ Lv25 – 左下 */}
      {hasBag && (
        <span style={{
          position:    'absolute',
          bottom:      pad - 5,
          left:        pad - 5,
          fontSize:    efs * 0.9,
          lineHeight:  1,
          filter:      'drop-shadow(0 1px 3px rgba(0,0,0,0.22))',
          pointerEvents: 'none',
          userSelect:  'none',
          zIndex:      2,
        }}>🎒</span>
      )}

      {/* 🪄 ペンライト Lv5 – 右サイド（発光） */}
      {hasPenlight && (
        <div style={{
          position:      'absolute',
          right:         0,
          top:           pad + Math.round(dim * 0.18),
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          zIndex:        2,
          pointerEvents: 'none',
        }}>
          <div style={{
            width:        tipR * 2,
            height:       tipR * 2,
            borderRadius: '50%',
            background:   cfg.oshiColor,
            boxShadow:    `0 0 ${tipR * 4}px ${tipR * 2}px ${cfg.oshiColor}60`,
          }}/>
          <div style={{
            width:        stickW,
            height:       stickH,
            borderRadius: stickW / 2,
            background:   `linear-gradient(to bottom, ${cfg.oshiColor}, ${cfg.oshiColor}70)`,
            boxShadow:    `0 0 ${tipR * 2}px ${tipR}px ${cfg.oshiColor}30`,
            marginTop:    -(tipR * 0.5),
          }}/>
        </div>
      )}

      {/* Level バッジ */}
      <div style={{
        position:     'absolute',
        bottom:       pad - 9,
        right:        pad - 9,
        background:   cfg.oshiColor,
        color:        'white',
        borderRadius: 10,
        padding:      '2px 7px',
        fontSize:     10,
        fontWeight:   800,
        boxShadow:    '0 2px 8px rgba(0,0,0,0.24)',
        border:       '2.5px solid white',
        zIndex:       4,
        letterSpacing: '-0.01em',
        minWidth:     22,
        textAlign:    'center',
        lineHeight:   1.5,
      }}>
        {level}
      </div>
    </div>
  );
}

// ──── 次の解放アイテムヒント ────
export function NextUnlock({ level }: { level: number }) {
  const next = AVATAR_ITEMS.find(i => i.unlockLevel > level);
  if (!next) return <p style={{ fontSize: 11, color: '#A8A29E' }}>全アイテム解放済み ✨</p>;
  const gap = next.unlockLevel - level;
  return (
    <p style={{ fontSize: 11, color: '#A8A29E' }}>
      あと Lv.{gap} で {next.emoji}&nbsp;{next.name} 解放
    </p>
  );
}

// ──── アイテム一覧グリッド（実績ページ用） ────
export function AvatarItemGrid({ level, oshiColor }: { level: number; oshiColor?: string }) {
  const color = oshiColor ?? DEFAULT_AVATAR_CONFIG.oshiColor;
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {AVATAR_ITEMS.map(item => {
        const unlocked = level >= item.unlockLevel;
        return (
          <div key={item.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 5 }}>
            <div style={{
              width:          46,
              height:         46,
              borderRadius:   14,
              background:     unlocked ? `${color}18` : '#F0EBE6',
              border:         unlocked ? `1.5px solid ${color}45` : '1.5px solid #E8E2DC',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       22,
              position:       'relative',
              opacity:        unlocked ? 1 : 0.4,
              transition:     'all 0.2s',
            }}>
              {item.emoji}
              {!unlocked && (
                <div style={{
                  position:'absolute', inset:0, borderRadius:14,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:'rgba(250,248,246,0.55)', fontSize:14,
                }}>🔒</div>
              )}
            </div>
            <p style={{ fontSize: 9, color: unlocked ? color : '#A8A29E', textAlign:'center', lineHeight:1.3, fontWeight: unlocked ? 600 : 400 }}>
              {unlocked ? item.name : `Lv.${item.unlockLevel}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
