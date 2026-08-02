import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppShell } from '@/components/prompthub/app-shell';
import { ThemeProvider, themeInitScript } from '@/components/prompthub/theme-provider';
import { ToastProvider } from '@/components/prompthub/ui/toast';
import { PromptHubProvider } from '@/hooks/prompthub/use-prompthub';
import { APP_NAME, APP_TAGLINE } from '@/lib/prompthub/constants';
import './prompthub.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ph-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    '社内のAIプロンプトを保存・検索・共有・改善できる、チームのためのAI活用資産管理ツール。',
  applicationName: APP_NAME,
  openGraph: {
    title: APP_NAME,
    description: APP_TAGLINE,
    type: 'website',
    locale: 'ja_JP',
    siteName: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#161a22' },
  ],
};

/**
 * PromptHub のルートレイアウト。
 * 既存の推し活ダッシュボード（app/(oshi)）とは別のルートレイアウトとして分離しているため、
 * 双方のグローバルCSS・フォント・画面構成が干渉しない。
 */
export default function PromptHubRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 初回描画前にテーマを当て、ダークモード時のちらつきを防ぐ */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-[family:var(--font-ph-sans),system-ui,sans-serif] antialiased">
        <ThemeProvider>
          <ToastProvider>
            <PromptHubProvider>
              <AppShell>{children}</AppShell>
            </PromptHubProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
