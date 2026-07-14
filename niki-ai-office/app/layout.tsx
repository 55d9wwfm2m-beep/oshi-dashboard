import type { Metadata, Viewport } from 'next';
import './globals.css';
import { OfficeProvider } from '@/components/OfficeProvider';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'NIKI AI OFFICE',
  description: '複数のAIを、仮想オフィスで働くAI社員として管理するモバイルファーストのタスク管理アプリ。',
  applicationName: 'NIKI AI OFFICE',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NIKI AI OFFICE',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // ユーザーのピンチズームは残す（アクセシビリティ）。ズーム暴発は16pxフォントで防ぐ。
  maximumScale: 5,
  themeColor: '#8ad4f5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <OfficeProvider>
          {/* モバイルファースト: 中央寄せの単一カラム。広い画面でも読み幅を保つ */}
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col">
            <main className="flex-1 px-4 pb-28 pt-3">{children}</main>
            <BottomNav />
          </div>
        </OfficeProvider>
      </body>
    </html>
  );
}
