import { formatYen } from '@/lib/utils';
/** 既存の内訳をそのまま可視化する。上限超過はバーだけをクランプする。 */
export default function BudgetBars({ income, saving, fixed, planned, living }: {
  income: number; saving: number; fixed: number; planned: number; living: number;
}) {
  const rows = [['貯金', saving], ['固定費', fixed], ['予定支出', planned], ['生活費', living]] as const;
  return <div className="budget-bars" role="img" aria-label={`給料 ${formatYen(income)} の配分。${rows.map(([label, amount]) => `${label} ${formatYen(amount)}`).join('、')}`}>
    {rows.map(([label, amount]) => <div className="budget-bar-row" key={label} aria-hidden="true">
      <span>{label}</span><div className="budget-bar-track"><i className="budget-bar-fill" style={{ width: `${income > 0 ? Math.max(0, Math.min(100, amount / income * 100)) : 0}%` }} /></div>
    </div>)}
  </div>;
}
