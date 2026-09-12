'use client';

/** 口座を「使っていいお金」の計算に含めるかのトグル（指で押しやすい高さを確保） */
export default function BudgetToggle({ on, onChange, accent, label }: {
  on: boolean;
  onChange: () => void;
  accent: string;
  /** 省略時は「使っていいお金」の説明文 */
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="flex items-center gap-2.5 w-full pt-2 pb-0.5 text-left"
    >
      <span
        className="relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200"
        style={{ background: on ? accent : '#D6D9D5' }}
        aria-hidden="true"
      >
        <span
          className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: on ? 'translateX(16px)' : 'none' }}
        />
      </span>
      <span className="text-[11.5px] leading-snug" style={{ color: on ? '#78716C' : '#A8A29E' }}>
        {label ?? 'この口座を使っていいお金の計算に含める'}
      </span>
    </button>
  );
}
