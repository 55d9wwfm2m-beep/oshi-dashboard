'use client';

/** ラベル付き入力欄（全ページ共通） */
export default function Field({ label, value, onChange, placeholder = '', type = 'text', inputMode, max }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'url' | 'email';
  max?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        max={max}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        aria-label={label.replace(' *', '')}
      />
    </div>
  );
}
