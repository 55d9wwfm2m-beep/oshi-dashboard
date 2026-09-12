/** アセットやライブラリを追加せず、操作の意味だけを示す線画。 */
export const moneyIconPaths = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  balance: 'M4 5h15v4M4 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h17V9H4M16 13h5v4h-5z',
  budget: 'M4 5h16v16H4zM8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2',
  roadmap: 'M21 12a9 9 0 1 1-9-9m5 1v3h3M12 8a4 4 0 1 0 4 4m-4 0 8-8',
  review: 'M4 20V10m8 10V4m8 16v-7M2 22h20',
  settings: 'M4 7h16M4 17h16M9 4v6m6 4v6',
  check: 'm5 12 4 4L19 6',
  edit: 'm15 4 5 5M4 20l4-1L21 6l-4-4L4 15z',
  category: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  info: 'M12 8h.01M12 11v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
};
export type MoneyIconName = keyof typeof moneyIconPaths;
export default function MoneyIcon({ name = 'category' }: { name?: MoneyIconName }) {
  return <svg className="money-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={moneyIconPaths[name]} /></svg>;
}
