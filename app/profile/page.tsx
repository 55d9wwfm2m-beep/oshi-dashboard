'use client';

import { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameState } from '@/hooks/useGameState';
import { OshiProfile, THEME_PRESETS, AvatarConfig, DEFAULT_AVATAR_CONFIG } from '@/types';
import { resizeImage, todayString } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import { XP_REWARDS } from '@/lib/game';
import Link from 'next/link';

const DEFAULT: OshiProfile = { name:'', group:'', meetDate:'', birthday:'', photoUrl:'', themeColor:'196,164,160' };

export default function ProfilePage() {
  const [profile, setProfile, loaded] = useLocalStorage<OshiProfile>('oshi-profile', DEFAULT);
  const [, setThemeColor]  = useLocalStorage('oshi-theme-color', '196,164,160');
  const [avatarConfig]     = useLocalStorage<AvatarConfig>('oshi-avatar-config', DEFAULT_AVATAR_CONFIG);
  const { state: gameState, addXP } = useGameState();
  const [form, setForm]   = useState<OshiProfile|null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!loaded) return null;

  const cur = form ?? profile;
  const set = (f: keyof OshiProfile, v: string) => setForm(prev => ({ ...(prev ?? profile), [f]: v }));

  // ホーム画像の表示位置（object-position）。'50% 35%' 形式で保存
  const parsePos = (s?: string) => {
    const def = { x: 50, y: 35 };
    if (!s) return def;
    const kw: Record<string, number> = { center: 50, top: 0, left: 0, bottom: 100, right: 100 };
    const toNum = (v: string, fb: number) => (v in kw ? kw[v] : (isNaN(parseFloat(v)) ? fb : parseFloat(v)));
    const p = s.trim().split(/\s+/);
    return p.length === 1 ? { x: toNum(p[0], 50), y: 35 } : { x: toNum(p[0], 50), y: toNum(p[1], 35) };
  };
  const pos = parsePos(cur.photoPosition);
  const setPos = (x: number, y: number) => set('photoPosition', `${x}% ${y}%`);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImage(file, 600);
    set('photoUrl', b64);
  };

  const save = () => {
    if (!form) return;
    const isFirstSave = !profile.name && !!form.name;
    setProfile(form);
    setThemeColor(form.themeColor);
    document.documentElement.style.setProperty('--accent', form.themeColor);
    if (isFirstSave) addXP(XP_REWARDS.PROFILE_SET);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 anim-fadeIn">
        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Profile</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>推しプロフィール</h1>
      </div>

      {/* Avatar preview → カスタマイズへ */}
      <Link
        href="/avatar"
        className="mx-4 mb-4 card card-hover p-4 flex items-center gap-4 active:scale-[0.985] anim-scaleIn"
        style={{ textDecoration: 'none' }}
      >
        <Avatar level={gameState.level} size="md" config={avatarConfig} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#1C1917' }}>マイアバター</p>
          <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>
            髪型・推しカラーなどカスタマイズできます
          </p>
          <p className="text-xs mt-1.5 font-medium" style={{ color: avatarConfig.oshiColor }}>
            カスタマイズ画面へ →
          </p>
        </div>
      </Link>

      {/* Photo */}
      <div className="flex flex-col items-center pb-8 anim-scaleIn">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden active:scale-95 transition-transform"
          style={{
            border: `3px solid rgb(var(--accent))`,
            boxShadow: `0 4px 20px rgba(var(--accent),0.25)`,
          }}
        >
          {cur.photoUrl ? (
            <img src={cur.photoUrl} alt="推し" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-1"
              style={{ background: `rgba(var(--accent),0.1)` }}
            >
              <span className="text-3xl">✦</span>
              <span className="text-[10px]" style={{ color: '#A8A29E' }}>写真を追加</span>
            </div>
          )}
          {/* Camera overlay */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(20,14,10,0.3)' }}
          >
            <span className="text-white text-xs bg-black/30 rounded-full px-2 py-0.5">変更</span>
          </div>
        </button>
        <p className="text-xs mt-2" style={{ color: '#B8B0A8' }}>タップして写真を変更</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
      </div>

      {/* ホーム画像の表示位置調整 */}
      {cur.photoUrl && (
        <div className="mx-4 mb-4 card p-5 anim-fadeInUp">
          <p className="text-sm font-medium mb-1" style={{ color: '#1C1917' }}>ホーム画像の表示位置</p>
          <p className="text-xs mb-3" style={{ color: '#A8A29E' }}>顔や被写体が中央に来るように調整できます（ホーム画面の見え方プレビュー）</p>

          {/* ホーム表示と同じ object-position でクロップ確認 */}
          <div style={{ width: '100%', height: 150, borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: '#F0EBE6' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cur.photoUrl}
              alt="プレビュー"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${pos.x}% ${pos.y}%` }}
            />
          </div>

          <label className="field-label">上下位置</label>
          <input
            type="range" min={0} max={100} step={1} value={pos.y}
            onChange={e => setPos(pos.x, Number(e.target.value))}
            className="w-full mb-4"
            style={{ accentColor: `rgb(var(--accent))` }}
          />

          <label className="field-label">左右位置</label>
          <input
            type="range" min={0} max={100} step={1} value={pos.x}
            onChange={e => setPos(Number(e.target.value), pos.y)}
            className="w-full"
            style={{ accentColor: `rgb(var(--accent))` }}
          />

          <button
            onClick={() => setPos(50, 35)}
            className="text-xs mt-3 font-medium active:scale-95 transition-transform"
            style={{ color: '#A8A29E' }}
          >
            位置をリセット
          </button>
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Basic info */}
        <div className="card p-5 space-y-4 anim-fadeInUp">
          <Field label="推し名 *"     value={cur.name}     onChange={v=>set('name',v)}     placeholder="例：田中一郎" />
          <Field label="グループ名"   value={cur.group}    onChange={v=>set('group',v)}    placeholder="例：SuperNova" />
          <Field label="出会った日"   type="date" value={cur.meetDate}  onChange={v=>set('meetDate',v)}  max={todayString()} />
          <Field label="推しの誕生日" type="date" value={cur.birthday}  onChange={v=>set('birthday',v)} />
        </div>

        {/* Theme color */}
        <div className="card p-5 anim-fadeInUp stagger-1">
          <p className="text-sm font-medium mb-1" style={{ color: '#1C1917' }}>テーマカラー</p>
          <p className="text-xs mb-4" style={{ color: '#A8A29E' }}>全体のアクセントカラーを変えられます</p>
          <div className="flex gap-3 flex-wrap">
            {THEME_PRESETS.map(preset => {
              const active = cur.themeColor === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => set('themeColor', preset.value)}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-sm transition-all duration-200"
                    style={{
                      background: `rgb(${preset.value})`,
                      transform: active ? 'scale(1.2)' : 'scale(1)',
                      outline: active ? `3px solid rgba(${preset.value},0.4)` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                  <span className="text-[10px]" style={{ color: active ? `rgb(${preset.value})` : '#A8A29E' }}>
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={!cur.name}
          className="w-full py-4 rounded-2xl text-white text-sm font-medium tracking-wide shadow-md active:scale-[0.98] transition-all disabled:opacity-40 anim-fadeInUp stagger-2"
          style={{ background: `rgb(var(--accent))` }}
        >
          {saved ? '✓ 保存しました' : '保存する'}
        </button>

        {/* Sub links */}
        <div className="flex justify-between py-2 anim-fadeInUp stagger-3">
          <Link href="/savings" className="text-xs" style={{ color: '#B8B0A8' }}>
            推し活貯金を管理 →
          </Link>
          <Link href="/timeline" className="text-xs" style={{ color: '#B8B0A8' }}>
            推し年表を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder='', type='text', max }: {
  label: string; value: string; onChange:(v:string)=>void; placeholder?:string; type?:string; max?:string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        max={max}
        className="input"
      />
    </div>
  );
}
