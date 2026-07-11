/**
 * アバターアイテムのカタログ＆解放条件。
 * 見た目（SVG）は art.jsx、解放ロジックはこのファイルに集約。
 * 解放条件はアプリの実データ（レベル・イベント・参戦ログ・購入グッズ・推し活日数）に連動する。
 */
import {
  SKINS, HAIRSTYLES, HAIRCOLORS, EYESTYLES, EYECOLORS,
  OUTFITS, HEADWEAR, GLASSES, ACCESSORIES, BACKGROUNDS, RARITY,
} from './art';

export interface AvatarEquip {
  skin: string;
  hairStyle: string;
  hairColor: string;
  eyeStyle: string;
  eyeColor: string;
  outfit: string;
  headwear: string;
  glasses: string;
  accessory: string;
  background: string;
  /** リング・バッジ等に使う推しカラー（#hex） */
  oshiColor: string;
}

export const DEFAULT_EQUIP: AvatarEquip = {
  skin: 'light',
  hairStyle: 'long',
  hairColor: 'sky',
  eyeStyle: 'round',
  eyeColor: 'blue',
  outfit: 'onepiece',
  headwear: 'ribbon',
  glasses: 'none',
  accessory: 'none',
  background: 'dream',
  oshiColor: '#E91E8C',
};

/** 解放判定に使う実データ */
export interface AvatarStats {
  level: number;
  events: number;   // 登録イベント数
  logs: number;     // 参戦ログ数
  goods: number;    // 購入済みグッズ数（ウィッシュリスト）
  expenses: number; // 支出記録数
  days: number;     // 推しと出会ってからの日数
}

type Unlock =
  | { kind: 'always' }
  | { kind: 'level' | 'events' | 'logs' | 'goods' | 'expenses' | 'days'; v: number };

/** カテゴリ:アイテムID → 解放条件（未記載は always） */
const UNLOCKS: Record<string, Unlock> = {
  // 髪型
  'hairStyle:twin':       { kind: 'events', v: 1 },
  'hairStyle:braid':      { kind: 'level', v: 3 },
  'hairStyle:wave':       { kind: 'logs', v: 5 },
  'hairStyle:bun':        { kind: 'level', v: 5 },
  'hairStyle:hime':       { kind: 'level', v: 10 },
  'hairStyle:prince':     { kind: 'level', v: 4 },
  'hairStyle:wolfMens':   { kind: 'level', v: 8 },
  'hairStyle:gothBoy':    { kind: 'goods', v: 5 },
  // 髪色
  'hairColor:pink':       { kind: 'level', v: 2 },
  'hairColor:lavender':   { kind: 'goods', v: 3 },
  'hairColor:mint':       { kind: 'level', v: 4 },
  'hairColor:silver':     { kind: 'days', v: 100 },
  'hairColor:yumegrad':   { kind: 'level', v: 12 },
  'hairColor:skygrad':    { kind: 'days', v: 30 },
  // 目の形
  'eyeStyle:sharp':       { kind: 'level', v: 2 },
  'eyeStyle:sparkle':     { kind: 'events', v: 1 },
  'eyeStyle:wink':        { kind: 'level', v: 3 },
  'eyeStyle:teary':       { kind: 'logs', v: 3 },
  'eyeStyle:heart':       { kind: 'level', v: 7 },
  // 瞳の色
  'eyeColor:amber':       { kind: 'level', v: 2 },
  'eyeColor:pink':        { kind: 'level', v: 3 },
  'eyeColor:purple':      { kind: 'days', v: 30 },
  // 衣装
  'outfit:liveT':         { kind: 'events', v: 1 },
  'outfit:idol':          { kind: 'events', v: 5 },
  'outfit:oshiStage':     { kind: 'events', v: 10 },
  'outfit:yukata':        { kind: 'days', v: 7 },
  'outfit:yumekawa':      { kind: 'level', v: 6 },
  'outfit:chiffon':       { kind: 'goods', v: 10 },
  'outfit:prince':        { kind: 'level', v: 15 },
  'outfit:hoodieB':       { kind: 'level', v: 2 },
  'outfit:princeB':       { kind: 'level', v: 9 },
  'outfit:jiraiB':        { kind: 'goods', v: 5 },
  'outfit:gothBoyOutfit': { kind: 'level', v: 20 },
  // 頭飾り
  'headwear:beret':       { kind: 'level', v: 2 },
  'headwear:cap':         { kind: 'events', v: 3 },
  'headwear:bunny':       { kind: 'level', v: 5 },
  'headwear:flower':      { kind: 'days', v: 30 },
  'headwear:crown':       { kind: 'level', v: 10 },
  // メガネ
  'glasses:black':        { kind: 'level', v: 4 },
  'glasses:heart':        { kind: 'level', v: 6 },
  // 小物
  'accessory:penlight':   { kind: 'level', v: 5 },
  'accessory:muffler':    { kind: 'days', v: 30 },
  'accessory:necklace':   { kind: 'level', v: 8 },
  'accessory:headphone':  { kind: 'level', v: 12 },
  // 背景
  'background:sakura':    { kind: 'level', v: 4 },
  'background:ocean':     { kind: 'level', v: 6 },
  'background:night':     { kind: 'days', v: 30 },
  'background:stage':     { kind: 'events', v: 5 },
};

const UNLOCK_LABEL: Record<string, (v: number) => string> = {
  level:    v => `Lv.${v}で解放`,
  events:   v => `イベント${v}件で解放`,
  logs:     v => `参戦ログ${v}件で解放`,
  goods:    v => `グッズ${v}個で解放`,
  expenses: v => `支出${v}件で解放`,
  days:     v => `推し活${v}日で解放`,
};

export interface CatalogItem {
  id: string;
  name: string;
  rarity: keyof typeof RARITY;
}

export interface Category {
  key: keyof Omit<AvatarEquip, 'oshiColor'>;
  label: string;
  items: CatalogItem[];
}

export const CATEGORIES: Category[] = [
  { key: 'outfit',    label: 'ふく', items: OUTFITS as any },
  { key: 'hairStyle', label: 'かみがた', items: HAIRSTYLES as any },
  { key: 'hairColor', label: 'かみいろ', items: HAIRCOLORS as any },
  { key: 'eyeStyle',  label: 'ひとみ',   items: EYESTYLES as any },
  { key: 'eyeColor',  label: 'めのいろ', items: EYECOLORS as any },
  { key: 'skin',      label: 'はだ',     items: SKINS as any },
  { key: 'headwear',  label: 'あたま',   items: HEADWEAR as any },
  { key: 'glasses',   label: 'メガネ',   items: GLASSES as any },
  { key: 'accessory', label: 'こもの',   items: ACCESSORIES as any },
  { key: 'background',label: 'はいけい', items: BACKGROUNDS as any },
];

export function getUnlock(catKey: string, itemId: string): Unlock {
  return UNLOCKS[`${catKey}:${itemId}`] ?? { kind: 'always' };
}

export function isUnlocked(catKey: string, itemId: string, stats: AvatarStats): boolean {
  const u = getUnlock(catKey, itemId);
  if (u.kind === 'always') return true;
  return stats[u.kind] >= u.v;
}

export function unlockLabel(catKey: string, itemId: string): string {
  const u = getUnlock(catKey, itemId);
  if (u.kind === 'always') return '';
  return UNLOCK_LABEL[u.kind](u.v);
}

/** 総アイテム数と解放済み数（進捗表示用） */
export function unlockProgress(stats: AvatarStats): { unlocked: number; total: number } {
  let unlocked = 0, total = 0;
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      total++;
      if (isUnlocked(cat.key, item.id, stats)) unlocked++;
    }
  }
  return { unlocked, total };
}

export { RARITY };
