/* ============================================================
   背景レジストリ
   ------------------------------------------------------------
   追加方法: 関数を1つ書いて BACKGROUNDS_R に登録し、
   items.js の BACKGROUNDS に1行足すだけ。
   props.k は defs 用の名前空間付きIDプレフィックス
   （グラデーションIDは必ず k を使って一意化する）。
   ============================================================ */
import React from "react";

const star = (x, y, r, c = "#FFF", o = 1) =>
  <path key={`${x}-${y}`} d={`M${x},${y - r} L${x + r * 0.28},${y - r * 0.28} L${x + r},${y} L${x + r * 0.28},${y + r * 0.28} L${x},${y + r} L${x - r * 0.28},${y + r * 0.28} L${x - r},${y} L${x - r * 0.28},${y - r * 0.28} Z`} fill={c} opacity={o} />;
const cloud = (x, y, s, o = 0.8) =>
  <g key={`c${x}-${y}`} opacity={o} fill="#FFF" transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="0" rx="26" ry="15" /><ellipse cx="-20" cy="4" rx="16" ry="11" /><ellipse cx="20" cy="4" rx="18" ry="12" /><ellipse cx="0" cy="8" rx="30" ry="10" />
  </g>;

function Dream({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FCE4F4" /><stop offset=".45" stopColor="#ECE0FB" /><stop offset="1" stopColor="#DAF0F5" />
        </linearGradient>
        <radialGradient id={k + "g"} cx=".5" cy=".18" r=".75"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      <rect width="320" height="380" fill={`url(#${k}g)`} />
      <circle cx="54" cy="76" r="44" fill="#FFFFFF" opacity=".28" /><circle cx="272" cy="130" r="32" fill="#FFFFFF" opacity=".24" />
      <circle cx="250" cy="312" r="50" fill="#FFFFFF" opacity=".2" /><circle cx="44" cy="280" r="26" fill="#FFD9EC" opacity=".4" />
      {cloud(60, 120, 1, .85)}{cloud(258, 70, .8, .8)}{cloud(150, 326, 1.1, .7)}
      {[[44, 150], [286, 200], [120, 46], [206, 40], [300, 300], [24, 220]].map(([x, y]) =>
        <path key={`${x}h${y}`} d={`M${x},${y} q-7,-9 -13,0 q-5,7 13,18 q18,-11 13,-18 q-6,-9 -13,0 Z`} fill="#FFB6D5" opacity=".55" />)}
      {[[96, 92, 4], [232, 168, 5], [150, 104, 3], [40, 196, 3.4], [276, 260, 4], [188, 300, 3]].map(([x, y, r]) => star(x, y, r, "#FFF", .9))}
    </g>
  );
}

function Studio({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCEFF7" /><stop offset="1" stopColor="#ECE0F6" /></linearGradient>
        <radialGradient id={k + "v"} cx=".5" cy=".42" r=".75"><stop offset="0" stopColor="#FFF" stopOpacity=".5" /><stop offset="1" stopColor="#C9B6D8" stopOpacity=".35" /></radialGradient>
        <radialGradient id={k + "f"} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF" stopOpacity=".6" /><stop offset="1" stopColor="#FFF" stopOpacity="0" /></radialGradient>
        <linearGradient id={k + "fl"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EAD9C2" /><stop offset="1" stopColor="#D8BE9C" /></linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      {/* ホリゾント（背景紙の継ぎ目カーブ） */}
      <path d="M0,300 Q160,250 320,300 L320,380 L0,380 Z" fill={`url(#${k}fl)`} />
      <path d="M0,300 Q160,250 320,300" stroke="#C9AE8A" strokeWidth="2" fill="none" opacity=".6" />
      <rect width="320" height="380" fill={`url(#${k}v)`} opacity=".5" />
      {/* リングライト */}
      <circle cx="58" cy="58" r="22" fill="none" stroke="#FFF" strokeWidth="6" opacity=".7" />
      <circle cx="264" cy="74" r="14" fill="none" stroke="#FFF" strokeWidth="4" opacity=".6" />
      {/* 床のスポット光 */}
      <ellipse cx="160" cy="338" rx="120" ry="30" fill={`url(#${k}f)`} />
    </g>
  );
}

function Cafe({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBE9D6" /><stop offset="1" stopColor="#EFD2B4" /></linearGradient>
        <linearGradient id={k + "w"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCEFF6" /><stop offset="1" stopColor="#BFE0EC" /></linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      {/* 窓 */}
      <rect x="30" y="30" width="130" height="150" rx="10" fill={`url(#${k}w)`} />
      <rect x="30" y="30" width="130" height="150" rx="10" fill="none" stroke="#B07A4E" strokeWidth="7" />
      <line x1="95" y1="30" x2="95" y2="180" stroke="#B07A4E" strokeWidth="4" />
      <line x1="30" y1="105" x2="160" y2="105" stroke="#B07A4E" strokeWidth="4" />
      <path d="M44,150 l30,-40 l24,30 l18,-22 l30,32 Z" fill="#BFE0CE" opacity=".6" />
      {/* 観葉植物 */}
      <rect x="210" y="120" width="34" height="40" rx="6" fill="#C98A5C" /><path d="M227,120 C214,86 200,92 210,116 M227,120 C240,84 256,92 244,116 M227,120 C227,80 227,80 227,116" stroke="#5FA070" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* ペンダントライト */}
      <line x1="200" y1="0" x2="200" y2="34" stroke="#8A6A4A" strokeWidth="2" /><path d="M186,34 h28 l-6,16 h-16 Z" fill="#E8B45E" /><circle cx="200" cy="52" r="4" fill="#FFE9A8" />
      {/* カウンター */}
      <rect y="286" width="320" height="94" fill="#C8966A" /><rect y="286" width="320" height="8" fill="#B07A4E" />
      {/* ラテ */}
      <ellipse cx="250" cy="300" rx="20" ry="7" fill="#FFF" opacity=".9" /><path d="M232,300 q18,18 36,0 Z" fill="#E8D2B8" /><path d="M270,296 q14,4 0,16" stroke="#FFF" strokeWidth="3" fill="none" />
    </g>
  );
}

function Night({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#241F52" /><stop offset=".6" stopColor="#3B3C78" /><stop offset="1" stopColor="#6A6BA8" /></linearGradient>
        <radialGradient id={k + "m"} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF7D6" stopOpacity=".8" /><stop offset="1" stopColor="#FFF7D6" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      <circle cx="250" cy="64" r="46" fill={`url(#${k}m)`} />
      <circle cx="250" cy="64" r="26" fill="#FFF6CF" /><circle cx="240" cy="58" r="22" fill="#3B3C78" opacity=".5" />
      {[[40, 50, 2.4], [80, 92, 1.6], [132, 40, 3], [182, 72, 1.8], [210, 116, 2.2], [60, 152, 1.6], [294, 150, 2.6], [110, 124, 1.4], [162, 28, 2], [300, 60, 1.6], [24, 100, 1.8]].map(([x, y, r]) => star(x, y, r, "#FFF", .95))}
      {/* 流れ星 */}
      <path d="M70,40 l34,-14" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      {/* 街シルエット＋手すり */}
      <g fill="#1C1A40" opacity=".75"><rect x="0" y="300" width="50" height="80" /><rect x="54" y="280" width="34" height="100" /><rect x="92" y="312" width="40" height="68" /><rect x="240" y="296" width="40" height="84" /><rect x="284" y="276" width="40" height="104" /></g>
      <rect y="330" width="320" height="6" fill="#15142E" /><g stroke="#15142E" strokeWidth="4">{[30, 90, 150, 210, 270].map((x) => <line key={x} x1={x} y1="330" x2={x} y2="360" />)}</g>
    </g>
  );
}

function Stage({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E1A40" /><stop offset="1" stopColor="#3A2D63" /></linearGradient>
        <linearGradient id={k + "b1"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8AC2" stopOpacity=".7" /><stop offset="1" stopColor="#FF8AC2" stopOpacity="0" /></linearGradient>
        <linearGradient id={k + "b2"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FC2FF" stopOpacity=".7" /><stop offset="1" stopColor="#7FC2FF" stopOpacity="0" /></linearGradient>
        <linearGradient id={k + "b3"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE08A" stopOpacity=".7" /><stop offset="1" stopColor="#FFE08A" stopOpacity="0" /></linearGradient>
        <linearGradient id={k + "fl"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A3C77" /><stop offset="1" stopColor="#2A2150" /></linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      {/* トラス */}
      <rect y="0" width="320" height="12" fill="#15122E" />{[30, 90, 150, 210, 280].map((x) => <circle key={x} cx={x} cy="6" r="3" fill="#FFE08A" />)}
      {/* スポットライト */}
      <polygon points="40,12 -20,300 90,300" fill={`url(#${k}b1)`} />
      <polygon points="160,12 120,330 240,330" fill={`url(#${k}b3)`} />
      <polygon points="280,12 250,300 340,300" fill={`url(#${k}b2)`} />
      {[[44, 70, 4], [276, 96, 4], [70, 210, 3], [262, 220, 3], [120, 44, 3.4], [205, 60, 3]].map(([x, y, r]) => star(x, y, r, "#FFF", .85))}
      {/* ステージ床 */}
      <path d="M0,322 L320,322 L320,380 L0,380 Z" fill={`url(#${k}fl)`} />
      <ellipse cx="160" cy="330" rx="120" ry="14" fill="#FFF" opacity=".12" />
      {/* 客席のペンライト */}
      {[[26, 360], [54, 352], [86, 362], [232, 356], [266, 350], [296, 360]].map(([x, y], i) =>
        <g key={i}><line x1={x} y1={y} x2={x + 3} y2={y - 22} stroke={["#FF8AC2", "#7FC2FF", "#9CF0B0", "#FFE08A"][i % 4]} strokeWidth="3" strokeLinecap="round" /><circle cx={x + 3} cy={y - 22} r="4" fill={["#FF8AC2", "#7FC2FF", "#9CF0B0", "#FFE08A"][i % 4]} opacity=".7" /></g>)}
    </g>
  );
}

function Sakura({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFEFF6" /><stop offset=".6" stopColor="#FFE0EC" /><stop offset="1" stopColor="#F6D6E6" /></linearGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      {/* 遠景の丘 */}
      <path d="M0,300 Q90,272 200,292 Q280,304 320,290 L320,380 L0,380 Z" fill="#CDE6C4" opacity=".7" />
      <path d="M0,330 Q120,312 320,326 L320,380 L0,380 Z" fill="#BBD9AE" opacity=".7" />
      {/* 枝＋桜 */}
      <path d="M0,46 q46,32 96,20 q42,-10 74,16" stroke="#9A6A52" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M44,60 q-12,-18 -30,-18 M96,58 q-6,-20 -24,-24" stroke="#9A6A52" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[[24, 30], [62, 50], [104, 34], [150, 58], [38, 70], [86, 26], [128, 20]].map(([x, y], i) =>
        <g key={i}>{[0, 72, 144, 216, 288].map((a) => { const r = a * Math.PI / 180; return <ellipse key={a} cx={x + Math.cos(r) * 7} cy={y + Math.sin(r) * 7} rx="6" ry="4" fill="#FFC2DC" transform={`rotate(${a} ${x + Math.cos(r) * 7} ${y + Math.sin(r) * 7})`} />; })}<circle cx={x} cy={y} r="3" fill="#FF9EC6" /></g>)}
      {/* 散る花びら */}
      {[[80, 150], [240, 110], [286, 210], [130, 250], [200, 300], [40, 260], [260, 290], [160, 180]].map(([x, y], i) =>
        <path key={i} d={`M${x},${y} q5,-9 10,0 q5,9 0,14 q-5,-5 -10,0 q-5,-9 0,-14`} fill="#FF9EC6" opacity=".75" transform={`rotate(${i * 40} ${x} ${y})`} />)}
    </g>
  );
}

function Ocean({ k }) {
  return (
    <g>
      <defs>
        <linearGradient id={k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CDEFFB" /><stop offset=".4" stopColor="#9AD8F4" /><stop offset=".55" stopColor="#5FB6E6" /><stop offset="1" stopColor="#3E96D4" /></linearGradient>
        <radialGradient id={k + "s"} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF6C8" stopOpacity=".9" /><stop offset="1" stopColor="#FFF6C8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="320" height="380" fill={`url(#${k})`} />
      <circle cx="64" cy="62" r="40" fill={`url(#${k}s)`} /><circle cx="64" cy="62" r="22" fill="#FFF3B0" />
      {cloud(230, 58, .9, .85)}{cloud(120, 100, .7, .7)}
      {/* 水平線 */}
      <rect y="208" width="320" height="3" fill="#FFF" opacity=".4" />
      {/* 波 */}
      <path d="M0,250 q40,-14 80,0 t80,0 t80,0 t80,0 v130 H0 Z" fill="#6FBDE8" opacity=".6" />
      <path d="M0,286 q40,-14 80,0 t80,0 t80,0 t80,0 v94 H0 Z" fill="#4FA6E0" opacity=".7" />
      <path d="M0,250 q40,-14 80,0 t80,0 t80,0 t80,0" stroke="#FFF" strokeWidth="2" fill="none" opacity=".5" />
      {/* 砂浜 */}
      <path d="M0,330 q160,-24 320,0 L320,380 L0,380 Z" fill="#F3E2BC" />
      <path d="M0,330 q160,-24 320,0" stroke="#FFF" strokeWidth="2" fill="none" opacity=".5" />
      {[[60, 358, 3], [150, 366, 2.4], [250, 356, 3]].map(([x, y, r]) => star(x, y, r, "#FFF", .7))}
    </g>
  );
}

export const BACKGROUNDS_R = {
  dream: Dream,
  studio: Studio,
  cafe: Cafe,
  night: Night,
  stage: Stage,
  sakura: Sakura,
  ocean: Ocean,
};
