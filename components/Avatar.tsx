'use client';

import { AvatarSVG } from '@/components/avatar/art';
import { AvatarEquip, DEFAULT_EQUIP } from '@/components/avatar/catalog';

/**
 * 円形バストアップのちびアバター（ポケコロツイン風・自作SVG）。
 * 旧DiceBear版と同じProps API（level / size / config）を保つ。
 */
interface Props {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  /** 旧API互換（新アバターでは装備がアイテムそのものなので未使用） */
  showItems?: boolean;
  config?: Partial<AvatarEquip>;
}

export default function Avatar({ level, size = 'md', config }: Props) {
  const equip: AvatarEquip = { ...DEFAULT_EQUIP, ...(config ?? {}) };
  const dim = { sm: 62, md: 80, lg: 96 }[size];

  return (
    <div style={{ width: dim + 8, height: dim + 8, position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          position: 'absolute', left: 4, top: 4,
          width: dim, height: dim,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #FDF3F7 0%, #EFEAF9 100%)',
          boxShadow: [
            '0 4px 16px rgba(28,18,12,0.14)',
            '0 0 0 2.5px white',
            `0 0 0 4.5px ${equip.oshiColor}35`,
          ].join(', '),
        }}
      >
        <AvatarSVG equip={equip} size={dim} crop="bust" uid={`b${size}`} />
      </div>
      {/* Level バッジ */}
      <div
        style={{
          position: 'absolute', bottom: -2, right: -2,
          background: equip.oshiColor, color: 'white',
          borderRadius: 10, padding: '2px 7px',
          fontSize: 10, fontWeight: 800,
          boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
          border: '2.5px solid white',
          minWidth: 22, textAlign: 'center', lineHeight: 1.5,
          letterSpacing: '-0.01em',
        }}
      >
        {level}
      </div>
    </div>
  );
}
