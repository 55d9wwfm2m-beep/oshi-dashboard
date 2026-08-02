import type { Config } from 'tailwindcss';

/**
 * このリポジトリは2つのアプリを同居させている。
 * - `app/(oshi)`      : 推し活ダッシュボード（既存・モバイル専用UI）
 * - `app/(prompthub)` : PromptHub（本アプリ・デスクトップ / モバイル両対応）
 *
 * 既存アプリのスタイルへ影響を与えないよう、PromptHub のトークンは
 * すべて `ph-` プレフィックス付きで extend にのみ追加している。
 * darkMode: 'class' も、既存アプリは dark: バリアントを使っていないため無影響。
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ph: {
          bg: 'rgb(var(--ph-bg) / <alpha-value>)',
          surface: 'rgb(var(--ph-surface) / <alpha-value>)',
          'surface-2': 'rgb(var(--ph-surface-2) / <alpha-value>)',
          border: 'rgb(var(--ph-border) / <alpha-value>)',
          'border-strong': 'rgb(var(--ph-border-strong) / <alpha-value>)',
          fg: 'rgb(var(--ph-fg) / <alpha-value>)',
          muted: 'rgb(var(--ph-muted) / <alpha-value>)',
          subtle: 'rgb(var(--ph-subtle) / <alpha-value>)',
          primary: 'rgb(var(--ph-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--ph-primary-hover) / <alpha-value>)',
          'primary-fg': 'rgb(var(--ph-primary-fg) / <alpha-value>)',
          accent: 'rgb(var(--ph-accent) / <alpha-value>)',
          'accent-soft': 'rgb(var(--ph-accent-soft) / <alpha-value>)',
          success: 'rgb(var(--ph-success) / <alpha-value>)',
          'success-soft': 'rgb(var(--ph-success-soft) / <alpha-value>)',
          warning: 'rgb(var(--ph-warning) / <alpha-value>)',
          'warning-soft': 'rgb(var(--ph-warning-soft) / <alpha-value>)',
          danger: 'rgb(var(--ph-danger) / <alpha-value>)',
          'danger-soft': 'rgb(var(--ph-danger-soft) / <alpha-value>)',
        },
      },
      boxShadow: {
        'ph-xs': '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        'ph-sm': '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        'ph-md': '0 4px 16px -2px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.05)',
        'ph-lg': '0 16px 40px -8px rgb(15 23 42 / 0.18)',
      },
      keyframes: {
        'ph-fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ph-overlay-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'ph-dialog-in': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.98)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'ph-sheet-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'ph-fade-in': 'ph-fade-in 0.18s ease-out both',
        'ph-overlay-in': 'ph-overlay-in 0.15s ease-out both',
        'ph-dialog-in': 'ph-dialog-in 0.16s ease-out both',
        'ph-sheet-in': 'ph-sheet-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
