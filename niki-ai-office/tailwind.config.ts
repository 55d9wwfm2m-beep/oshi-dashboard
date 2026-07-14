import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 水色 (light blue) — 基調カラー
        sky: {
          50: '#f0f9ff',
          100: '#e0f4fe',
          200: '#bae6fd',
          300: '#8ad4f5',
          400: '#4fbde8',
          500: '#2aa3d6',
        },
        // ネイビー (navy) — 文字・見出し
        navy: {
          500: '#3b5a86',
          600: '#2f4a72',
          700: '#243a5e',
          800: '#1c2e4a',
          900: '#152238',
        },
        // 薄緑 (light green) — アクセント・稼働中
        leaf: {
          50: '#f1faf1',
          100: '#dcf2df',
          200: '#bce6c3',
          300: '#94d5a1',
          400: '#63bd77',
          500: '#41a459',
        },
        // 温かみのあるクリーム (パネル背景)
        cream: {
          50: '#fefdf9',
          100: '#fbf7ec',
          200: '#f4ecd6',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          'Meiryo',
          'sans-serif',
        ],
      },
      boxShadow: {
        // ドット絵風のかたいカゲ
        pixel: '3px 3px 0 0 rgba(28, 46, 74, 0.14)',
        'pixel-sm': '2px 2px 0 0 rgba(28, 46, 74, 0.16)',
        'pixel-inset': 'inset 0 -3px 0 0 rgba(28, 46, 74, 0.10)',
      },
      borderRadius: {
        pixel: '10px',
      },
      keyframes: {
        'bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'zzz': {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '30%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-14px) scale(1.1)', opacity: '0' },
        },
      },
      animation: {
        bob: 'bob 2.4s ease-in-out infinite',
        pop: 'pop 0.18s ease-out',
        'sheet-up': 'sheet-up 0.24s ease-out',
        zzz: 'zzz 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
