'use client';

import { createPortal } from 'react-dom';
import { MonthlyRecord } from '@/types';
import { formatYen } from '@/lib/utils';
import { formatMonthLabel, formatYenSigned, MONEY_ACCENT, MONEY_ACCENT_BG } from '@/lib/money';

/** 結果に合わせた絵文字とねぎらいの言葉 */
export function recapMood(spendable: number): { emoji: string; note: string } {
  if (spendable < 0) {
    return { emoji: '💪', note: '今月はちょっと厳しめでした。\n来月は固定費の見直しから始めてみよう' };
  }
  if (spendable >= 30000) {
    return { emoji: '🎉', note: 'よゆうを持ってやりくりできました！\nこの調子でいきましょう' };
  }
  if (spendable >= 10000) {
    return { emoji: '✨', note: 'しっかりやりくりできた1か月でした\nおつかれさまでした' };
  }
  return { emoji: '🌱', note: 'きゅうくつな月をよく乗り切りました\n記録が残ると次に活かせます' };
}

/** 月が変わったときに出る、その月の振り返りポップアップ */
export default function MonthlyRecap({ record, onClose }: {
  record: MonthlyRecord | null;
  onClose: () => void;
}) {
  if (!record) return null;
  const mood = recapMood(record.spendable);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      style={{ background: 'rgba(24,28,23,0.42)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${formatMonthLabel(record.month)}の振り返り`}
    >
      <div
        className="w-full max-w-[400px] overflow-hidden anim-scaleIn"
        style={{ background: '#fff', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          className="px-6 pt-7 pb-6 text-center"
          style={{ background: `linear-gradient(165deg, ${MONEY_ACCENT_BG}, #fff 78%)` }}
        >
          <div className="text-[40px] leading-none" aria-hidden="true">{mood.emoji}</div>
          <p className="text-[13px] font-bold tracking-wider mt-2.5" style={{ color: MONEY_ACCENT }}>
            今月の振り返り
          </p>
          <h2 className="text-[26px] font-bold mt-1" style={{ color: '#1C1917', letterSpacing: '-0.01em' }}>
            {formatMonthLabel(record.month)}
          </h2>
        </div>

        <div className="px-6">
          {/* 使っていいお金（最も大きく） */}
          <div className="text-center pt-4 pb-3.5">
            <p className="text-xs font-semibold tracking-widest" style={{ color: '#78716C' }}>使っていいお金</p>
            <p className="text-[40px] leading-tight font-semibold font-serif-num mt-0.5" style={{ color: MONEY_ACCENT }}>
              {formatYenSigned(record.spendable)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { k: '総資産', v: record.assets },
              { k: '固定費', v: record.fixedCosts },
            ].map(cell => (
              <div key={cell.k} className="rounded-2xl px-3.5 py-3 text-center" style={{ background: '#FAF8F6' }}>
                <p className="text-[11px]" style={{ color: '#78716C' }}>{cell.k}</p>
                <p className="text-[17px] font-bold font-serif-num mt-0.5" style={{ color: '#1C1917' }}>
                  {formatYen(cell.v)}
                </p>
              </div>
            ))}
          </div>

          <p
            className="mt-3.5 px-3.5 py-3 rounded-2xl text-center text-[12.5px] font-semibold leading-relaxed whitespace-pre-line"
            style={{ background: MONEY_ACCENT_BG, color: MONEY_ACCENT }}
          >
            {mood.note}
          </p>
        </div>

        <div className="px-6 pt-4 pb-6">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl text-[15px] font-bold text-white active:scale-[0.98] transition-transform"
            style={{ background: MONEY_ACCENT }}
          >
            今月もがんばる！
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
