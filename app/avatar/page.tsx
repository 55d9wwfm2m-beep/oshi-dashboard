'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { getLevelTier } from '@/lib/game';
import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  OSHI_COLOR_PRESETS,
  HAIR_COLOR_PRESETS,
  HAIR_STYLES,
  SKIN_TONES,
} from '@/types';
import Avatar from '@/components/Avatar';

const SEX_OPTIONS: { value: AvatarConfig['sex']; label: string; emoji: string }[] = [
  { value: 'woman',   label: '女の子',  emoji: '👧' },
  { value: 'man',     label: '男の子',  emoji: '👦' },
  { value: 'neutral', label: '中性的',  emoji: '🧑' },
];

const EYE_OPTIONS: { id: string; label: string }[] = [
  { id: 'oval',   label: 'アーモンド' },
  { id: 'circle', label: 'まん丸' },
  { id: 'smile',  label: 'たれ目' },
];

export default function AvatarPage() {
  const router = useRouter();
  const [savedConfig, setSavedConfig, loaded] = useLocalStorage<AvatarConfig>(
    'oshi-avatar-config',
    DEFAULT_AVATAR_CONFIG,
  );
  const { state: gameState, loaded: gameLoaded } = useGameState();
  const [cfg, setCfg] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [saved, setSaved] = useState(false);

  // Sync from localStorage on first load
  useEffect(() => {
    if (loaded) setCfg(savedConfig);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded || !gameLoaded) return null;

  const tier = getLevelTier(gameState.level);
  const set  = <K extends keyof AvatarConfig>(key: K, val: AvatarConfig[K]) =>
    setCfg(prev => ({ ...prev, [key]: val }));

  const save = () => {
    setSavedConfig(cfg);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/achievements'); }, 1200);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 anim-fadeIn">
        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Avatar</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>アバターカスタマイズ</h1>
        <p className="text-xs mt-1" style={{ color: '#B8B0A8' }}>自分だけのキャラクターを育てよう</p>
      </div>

      {/* Live preview */}
      <div
        className="flex flex-col items-center py-8 anim-scaleIn"
        style={{
          background: `linear-gradient(160deg, ${cfg.oshiColor}18 0%, ${cfg.oshiColor}06 60%, transparent 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Bokeh */}
        {[
          { top: '15%', left: '15%', r: 3 },
          { top: '20%', left: '80%', r: 4 },
          { top: '70%', left: '10%', r: 2 },
          { top: '65%', left: '78%', r: 3 },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', top: d.top, left: d.left,
            width: d.r * 2, height: d.r * 2,
            borderRadius: '50%',
            background: cfg.oshiColor,
            opacity: 0.25,
            boxShadow: `0 0 ${d.r * 6}px ${d.r * 3}px ${cfg.oshiColor}20`,
          }}/>
        ))}

        <Avatar level={gameState.level} size="lg" config={cfg} />

        <div className="mt-4 text-center">
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>Lv.{gameState.level}</p>
          <p className="text-xs mt-0.5" style={{ color: cfg.oshiColor }}>{tier.title}</p>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-2">

        {/* 性別 */}
        <Section title="性別・体型">
          <div className="flex gap-3">
            {SEX_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => set('sex', opt.value)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all active:scale-95"
                style={{
                  background:  cfg.sex === opt.value ? cfg.oshiColor : '#F5F0EC',
                  color:       cfg.sex === opt.value ? 'white' : '#78716C',
                  border:      cfg.sex === opt.value ? 'none' : '1px solid #EAE4DF',
                  boxShadow:   cfg.sex === opt.value ? `0 4px 12px ${cfg.oshiColor}40` : 'none',
                }}
              >
                <div className="text-xl mb-0.5">{opt.emoji}</div>
                <div className="text-[11px]">{opt.label}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* 髪型 */}
        <Section title="髪型">
          <div className="grid grid-cols-3 gap-2">
            {HAIR_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => set('hairStyle', s.id)}
                className="py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{
                  background: cfg.hairStyle === s.id ? cfg.oshiColor : '#F5F0EC',
                  color:      cfg.hairStyle === s.id ? 'white' : '#78716C',
                  border:     cfg.hairStyle === s.id ? 'none' : '1px solid #EAE4DF',
                  boxShadow:  cfg.hairStyle === s.id ? `0 3px 10px ${cfg.oshiColor}40` : 'none',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Section>

        {/* 髪色 */}
        <Section title="髪の色">
          <div className="flex gap-3 flex-wrap">
            {HAIR_COLOR_PRESETS.map(c => (
              <button
                key={c.hex}
                onClick={() => set('hairColor', c.hex)}
                title={c.name}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              >
                <div style={{
                  width:        36,
                  height:       36,
                  borderRadius: '50%',
                  background:   c.hex,
                  border:       cfg.hairColor === c.hex ? `3px solid ${cfg.oshiColor}` : '3px solid transparent',
                  boxShadow:    cfg.hairColor === c.hex ? `0 0 0 2px white, 0 0 0 4px ${cfg.oshiColor}50` : '0 2px 6px rgba(0,0,0,0.15)',
                  transition:   'all 0.15s',
                }}/>
                <span className="text-[9px]" style={{ color: cfg.hairColor === c.hex ? cfg.oshiColor : '#A8A29E' }}>
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* 目の形 */}
        <Section title="目の形">
          <div className="flex gap-3">
            {EYE_OPTIONS.map(e => (
              <button
                key={e.id}
                onClick={() => set('eyeStyle', e.id)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{
                  background: cfg.eyeStyle === e.id ? cfg.oshiColor : '#F5F0EC',
                  color:      cfg.eyeStyle === e.id ? 'white' : '#78716C',
                  border:     cfg.eyeStyle === e.id ? 'none' : '1px solid #EAE4DF',
                  boxShadow:  cfg.eyeStyle === e.id ? `0 3px 10px ${cfg.oshiColor}40` : 'none',
                }}
              >
                👁 {e.label}
              </button>
            ))}
          </div>
        </Section>

        {/* 肌色 */}
        <Section title="肌の色">
          <div className="flex gap-3 flex-wrap">
            {SKIN_TONES.map(t => (
              <button
                key={t.hex}
                onClick={() => set('faceColor', t.hex)}
                title={t.name}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              >
                <div style={{
                  width:        36,
                  height:       36,
                  borderRadius: '50%',
                  background:   t.hex,
                  border:       cfg.faceColor === t.hex ? `3px solid ${cfg.oshiColor}` : '3px solid transparent',
                  boxShadow:    cfg.faceColor === t.hex ? `0 0 0 2px white, 0 0 0 4px ${cfg.oshiColor}50` : '0 2px 6px rgba(0,0,0,0.15)',
                  transition:   'all 0.15s',
                }}/>
                <span className="text-[9px]" style={{ color: cfg.faceColor === t.hex ? cfg.oshiColor : '#A8A29E' }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* 推しカラー */}
        <Section
          title="推しカラー"
          subtitle="服 / ペンライト / アクセサリーの色"
        >
          <div className="flex gap-3 flex-wrap">
            {OSHI_COLOR_PRESETS.map(c => (
              <button
                key={c.hex}
                onClick={() => set('oshiColor', c.hex)}
                title={c.name}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              >
                <div style={{
                  width:        40,
                  height:       40,
                  borderRadius: '50%',
                  background:   c.hex,
                  border:       cfg.oshiColor === c.hex ? `3px solid white` : '3px solid transparent',
                  boxShadow:    cfg.oshiColor === c.hex
                    ? `0 0 0 2px ${c.hex}, 0 4px 12px ${c.hex}60`
                    : '0 2px 8px rgba(0,0,0,0.18)',
                  transition:   'all 0.15s',
                }}/>
                <span className="text-[9px] font-medium" style={{ color: cfg.oshiColor === c.hex ? c.hex : '#A8A29E' }}>
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Save */}
        <button
          onClick={save}
          className="w-full py-4 rounded-2xl text-white text-sm font-semibold tracking-wide shadow-lg active:scale-[0.98] transition-all"
          style={{
            background: saved ? '#6B9E6B' : cfg.oshiColor,
            boxShadow:  saved ? '0 6px 20px rgba(107,158,107,0.35)' : `0 6px 20px ${cfg.oshiColor}45`,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          {saved ? '✓ 保存しました！' : '保存して実績ページへ'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 anim-fadeInUp">
      <p className="text-sm font-semibold mb-0.5" style={{ color: '#1C1917' }}>{title}</p>
      {subtitle && <p className="text-[11px] mb-3" style={{ color: '#A8A29E' }}>{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}
