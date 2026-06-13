export interface OshiProfile {
  name: string;
  group: string;
  meetDate: string;
  birthday: string;
  photoUrl: string;
  themeColor: string;
}

export interface OshiEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  memo: string;
  type: EventType;
}

export type EventType = 'ライブ' | '舞台' | 'テレビ' | '配信' | 'その他';
export const EVENT_TYPES: EventType[] = ['ライブ', '舞台', 'テレビ', '配信', 'その他'];
export const EVENT_TYPE_EMOJI: Record<EventType, string> = {
  ライブ: '🎤',
  舞台:   '🎭',
  テレビ: '📺',
  配信:   '📡',
  その他: '✦',
};

export interface Savings {
  goal: number;
  current: number;
}

export type ExpenseCategory = 'ライブ' | 'グッズ' | '遠征' | 'CD' | 'FC' | 'その他';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
}

export interface AttendanceLog {
  id: string;
  date: string;
  eventName: string;
  seat: string;
  impression: string;
  photoUrl?: string;
}

export interface GameState {
  xp: number;
  level: number;
  lastLoginDate: string;
}

// ──── ウィッシュリスト / コレクション ────
export type WishlistPriority = '高' | '中' | '低';
export type GoodsCategory = 'アクスタ' | 'うちわ' | 'トレカ' | 'ぬいぐるみ' | 'CD' | 'DVD' | 'グッズ' | 'その他';

export const GOODS_CATEGORIES: GoodsCategory[] = [
  'アクスタ', 'うちわ', 'トレカ', 'ぬいぐるみ', 'CD', 'DVD', 'グッズ', 'その他',
];
export const GOODS_CATEGORY_EMOJI: Record<GoodsCategory, string> = {
  アクスタ:   '🪆',
  うちわ:     '🪭',
  トレカ:     '🃏',
  ぬいぐるみ: '🧸',
  CD:         '💿',
  DVD:        '📀',
  グッズ:     '🛍️',
  その他:     '📦',
};

export interface WishlistItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  purchaseUrl: string;
  priority: WishlistPriority;
  category: GoodsCategory;
  memo: string;
  purchased: boolean;
  purchasedDate: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'ライブ', 'グッズ', '遠征', 'CD', 'FC', 'その他',
];

export const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  ライブ: '🎵',
  グッズ: '🛍️',
  遠征:   '🚄',
  CD:     '💿',
  FC:     '💳',
  その他: '✨',
};

export const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  ライブ: '#C4A4A0',
  グッズ: '#A79CB5',
  遠征:   '#8EAEC5',
  CD:     '#B59DB5',
  FC:     '#9BB5A8',
  その他: '#A8A29E',
};

export const THEME_PRESETS = [
  { name: 'ダスティローズ',   value: '196,164,160' },
  { name: 'モカブラウン',     value: '161,132,118' },
  { name: 'ラベンダー',      value: '167,156,181' },
  { name: 'スモーキーブルー', value: '142,174,197' },
  { name: 'セージグリーン',   value: '139,158,133' },
  { name: 'テラコッタ',      value: '189,140,122' },
];

export const DEFAULT_GAME_STATE: GameState = {
  xp: 0,
  level: 1,
  lastLoginDate: '',
};

// ──── アバターカスタマイズ ────
export interface AvatarConfig {
  sex:       'woman' | 'man' | 'neutral';
  hairStyle: string;
  hairColor: string;
  eyeStyle:  string;
  faceColor: string;
  oshiColor: string;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  sex:       'woman',
  hairStyle: 'womanLong',
  hairColor: '#2A1832',
  eyeStyle:  'oval',
  faceColor: '#F9C9B6',
  oshiColor: '#E91E8C',
};

export const OSHI_COLOR_PRESETS = [
  { name: 'ピンク',   hex: '#E91E8C' },
  { name: '赤',       hex: '#E53935' },
  { name: '青',       hex: '#1E88E5' },
  { name: '紫',       hex: '#8E24AA' },
  { name: '黄',       hex: '#F9A825' },
  { name: '緑',       hex: '#43A047' },
  { name: '水色',     hex: '#29B6F6' },
  { name: 'オレンジ', hex: '#F4511E' },
];

export const HAIR_COLOR_PRESETS = [
  { name: '黒',   hex: '#1A1A2E' },
  { name: '茶',   hex: '#6D4C2B' },
  { name: '明茶', hex: '#C4834A' },
  { name: '金',   hex: '#E8C050' },
  { name: 'ピンク', hex: '#D4608A' },
  { name: '紫',   hex: '#7B3FA0' },
  { name: '水色', hex: '#4B9CD3' },
  { name: '白',   hex: '#E8E0D8' },
];

export const SKIN_TONES = [
  { name: 'フェア',     hex: '#FFDBB4' },
  { name: 'ライト',     hex: '#F9C9B6' },
  { name: 'ミディアム', hex: '#F4A072' },
  { name: 'タン',       hex: '#D4956A' },
  { name: 'ブラウン',   hex: '#A0714F' },
];

export const HAIR_STYLES: { id: string; label: string }[] = [
  { id: 'womanLong',  label: 'ロングヘア' },
  { id: 'womanShort', label: 'ショートボブ' },
  { id: 'normal',     label: 'ミディアム' },
  { id: 'thick',      label: 'ウェーブ' },
  { id: 'boy',        label: 'ショート' },
  { id: 'mohawk',     label: 'モヒカン' },
];
