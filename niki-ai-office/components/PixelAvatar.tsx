import type { Employee } from '@/lib/types';

// オリジナルのドット絵キャラクター（12×14グリッド）。
// h=髪 / k=肌 / o=服 / a=アクセント / e=目。既存ゲームの模倣ではない独自デザイン。
const GRID = [
  '............',
  '...hhhhhh...',
  '..hhhhhhhh..',
  '.hhhhhhhhhh.',
  '.hhkkkkkkhh.',
  '.hkkkkkkkkh.',
  '.hkkeekkeekh',
  '.hkkkkkkkkh.',
  '..hkkkkkkh..',
  '...oaaaao...',
  '..oooaaooo..',
  '.oooooooooo.',
  '.oooooooooo.',
  '.oo.oooo.oo.',
];

const EYE = '#2a2f45';

export function PixelAvatar({
  employee,
  size = 56,
  className = '',
}: {
  employee: Employee;
  size?: number;
  className?: string;
}) {
  const { palette } = employee;
  const colorOf = (c: string): string | null => {
    switch (c) {
      case 'h':
        return palette.hair;
      case 'k':
        return palette.skin;
      case 'o':
        return palette.outfit;
      case 'a':
        return palette.accent;
      case 'e':
        return EYE;
      default:
        return null;
    }
  };

  const rects: React.ReactNode[] = [];
  for (let y = 0; y < GRID.length; y++) {
    const row = GRID[y];
    for (let x = 0; x < row.length; x++) {
      const fill = colorOf(row[x]);
      if (!fill) continue;
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />,
      );
    }
  }

  return (
    <svg
      role="img"
      aria-label={`${employee.name}のドット絵アイコン`}
      width={size}
      height={size}
      viewBox="0 0 12 14"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
    >
      {rects}
    </svg>
  );
}
