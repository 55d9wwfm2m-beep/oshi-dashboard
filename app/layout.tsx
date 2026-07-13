import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import ThemeProvider from '@/components/ThemeProvider';
import Toaster from '@/components/ui/Toast';
import AchievementWatcher from '@/components/AchievementWatcher';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const APP_TITLE = '推し活ダッシュボード';
const APP_DESC = '推しとの思い出・イベント・支出をひとつにまとめて、きせかえアバターを育てる推し活アプリ。';
// 本番デプロイ時は環境変数 NEXT_PUBLIC_SITE_URL に公開URLを設定するとOGP画像が絶対URLで解決される。
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oshi-dashboard.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: APP_TITLE,
  description: APP_DESC,
  applicationName: APP_TITLE,
  // ホーム画面追加（PWA）時のiOS向け設定。
  // アイコンは app/icon.png（favicon）と app/apple-icon.png のファイル規約で自動リンクされる。
  appleWebApp: {
    capable: true,
    title: '推し活',
    statusBarStyle: 'default',
  },
  // SNSシェア用カード。画像は app/opengraph-image.png / app/twitter-image.png を自動採用。
  openGraph: {
    title: APP_TITLE,
    description: APP_DESC,
    type: 'website',
    locale: 'ja_JP',
    siteName: APP_TITLE,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_TITLE,
    description: APP_DESC,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF8F6',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-[family:var(--font-inter)]`}>
        <ThemeProvider>
          <div className="min-h-screen" style={{ background: '#F5F2EE' }}>
            <main className="pb-24 max-w-lg mx-auto min-h-screen" style={{ background: '#FAF8F6' }}>
              {children}
            </main>
            <BottomNav />
            <Toaster />
            <AchievementWatcher />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
