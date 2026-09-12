import type { Metadata, Viewport } from 'next';
import '../../site/yarikuri.css';

export const metadata: Metadata = {
  title: 'やりくり電卓 | 推し活ダッシュボード',
  description: '今持っているお金から未払いの固定費を引いて、使っていいお金をすぐ確認できるシンプルな電卓。',
};

export const viewport: Viewport = { themeColor: '#0b0d0c', colorScheme: 'dark' };

export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  return <div className="money-app money-next">{children}</div>;
}
