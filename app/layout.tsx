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

export const metadata: Metadata = {
  title: '推し活ダッシュボード',
  description: '推しとの思い出・イベント・支出を一括管理',
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
