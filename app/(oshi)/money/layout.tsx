import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'やりくり電卓 | 推し活ダッシュボード',
  description: '今持っているお金から未払いの固定費を引いて、使っていいお金をすぐ確認できるシンプルな電卓。',
};

export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
