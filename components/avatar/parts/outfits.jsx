/* ============================================================
   衣装レジストリ（正式アセット版）
   ------------------------------------------------------------
   ▼ デザイン言語（レアリティ別の作り込み規格）
   - N  : 清潔なベース＋アクセント1つ（誰でも似合う入門服）
   - R  : ＋装飾レイヤー1層（プリント・帽子的な遊び）
   - SR : 多層スカート／フリル／きらめき（sparkle）
   - LE : マント・金モール・紋章＋きらめき（最上位の風格）

   ▼ 差別化ルール
   - 各衣装は「シグネチャパーツ」を1つ持つ（胸リボン・セーラー襟・
     帯・ハーネス・肩章…）。88pxサムネで判別できる大きさで描く。
   - シルエット3型: A(裾広がり) / I(ストン) / O(丸く膨らむ)。
   - 色は pal に集約（カラバリは pal 差し替えで作る）。

   ▼ 座標アンカー（skeleton.js 準拠）
   胴 x137-183 / 胸元 (160,196-216) / ウエスト y240 / 裾上限 y296
   手首 (136,244)・(184,244)
   ============================================================ */
import React from "react";
import { C, tint, deepen } from "../palettes";

/* ---------- 共通ヘルパー ---------- */
const sleeves = (fill, w = 11, full = false) => (
  <g>
    <path d={`M147,194 C137,200 133,${full ? 240 : 220} 139,${full ? 246 : 230}`} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" />
    <path d={`M173,194 C183,200 187,${full ? 240 : 220} 181,${full ? 246 : 230}`} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" />
  </g>
);
const puff = (fill) => (
  <g>
    <path d="M146,191 C131,195 127,214 139,227 C145,215 148,200 154,193 Z" fill={fill} />
    <path d="M174,191 C189,195 193,214 181,227 C175,215 172,200 166,193 Z" fill={fill} />
  </g>
);
const bodice = (fill) => <path d="M145,189 C145,183 175,183 175,189 L173,242 C173,250 147,250 147,242 Z" fill={fill} />;
const skirt = (fill, hemY = 294, half = 34) => <path d={`M148,240 L172,240 L${160 + half},${hemY} L${160 - half},${hemY} Z`} fill={fill} />;
const ruffle = (y, half, fill, n = 7, amp = 14) => {
  const w = (half * 2) / n; let d = `M${160 - half},${y}`;
  for (let i = 0; i < n; i++) { const x = 160 - half + i * w; d += ` Q${x + w / 2},${y + amp} ${x + w},${y}`; }
  d += " Z";
  return <path d={d} fill={fill} />;
};
/** きらめき（SR/LE用・4方向スター） */
const sparkle = (x, y, r, o = 0.9) => (
  <path d={`M${x},${y - r} L${x + r * 0.3},${y - r * 0.3} L${x + r},${y} L${x + r * 0.3},${y + r * 0.3} L${x},${y + r} L${x - r * 0.3},${y + r * 0.3} L${x - r},${y} L${x - r * 0.3},${y - r * 0.3} Z`} fill="#FFF" opacity={o} />
);
/** 胸リボン（シグネチャ用・s=スケール） */
const bow = (cx, cy, s, fill, dark) => (
  <g>
    <path d={`M${cx - 1},${cy} C${cx - 4 * s},${cy - 6 * s} ${cx - 11 * s},${cy - 5 * s} ${cx - 11 * s},${cy} C${cx - 11 * s},${cy + 5 * s} ${cx - 4 * s},${cy + 6 * s} ${cx - 1},${cy} Z`} fill={fill} />
    <path d={`M${cx + 1},${cy} C${cx + 4 * s},${cy - 6 * s} ${cx + 11 * s},${cy - 5 * s} ${cx + 11 * s},${cy} C${cx + 11 * s},${cy + 5 * s} ${cx + 4 * s},${cy + 6 * s} ${cx + 1},${cy} Z`} fill={fill} />
    <path d={`M${cx - 2},${cy + 2} L${cx - 5 * s},${cy + 9 * s} L${cx - 1 * s},${cy + 9 * s} Z`} fill={dark} />
    <path d={`M${cx + 2},${cy + 2} L${cx + 5 * s},${cy + 9 * s} L${cx + 1 * s},${cy + 9 * s} Z`} fill={dark} />
    <circle cx={cx} cy={cy} r={3 * s} fill={dark} />
    <circle cx={cx - s} cy={cy - s} r={s} fill="#FFF" opacity=".8" />
  </g>
);

/* ---------- レジストリ ---------- */
export const OUTFITS_R = {
  /* N: スターTee＋デニムスカート。シグネチャ=胸の星プリント */
  casual: {
    pal: { top: C.sakura, sleeve: C.sakuraDeep, star: C.gold, skirt: "#8FA9E6", stitch: "#DCE5F8", cuff: "#FFE3F0" },
    render: ({ pal }) => (
      <g>
        {sleeves(pal.sleeve, 13.5)}
        <path d="M139,232 q3,3 6,0 M175,232 q3,3 6,0" stroke={pal.cuff} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {bodice(pal.top)}
        <path d="M152,184 q8,7 16,0" stroke="#FFF" strokeWidth="2.4" fill="none" />
        {/* 星プリント */}
        <path d="M160,206 l2.6,5.4 l6,0.7 l-4.4,4.1 l1.2,5.9 l-5.4,-3 l-5.4,3 l1.2,-5.9 l-4.4,-4.1 l6,-0.7 Z" fill={pal.star} />
        {/* デニムスカート＋ステッチ */}
        {skirt(pal.skirt, 288, 31)}
        <path d="M132,282 L188,282" stroke={pal.stitch} strokeWidth="1.6" strokeDasharray="3 2.4" />
        <path d="M150,246 q4,5 9,5 M170,246 q-4,5 -9,5" stroke={pal.stitch} strokeWidth="1.4" fill="none" />
      </g>
    ),
  },

  /* N: ピクニックワンピ。シグネチャ=白丸襟＋胸リボン＋スカラップ裾 */
  onepiece: {
    pal: { main: "#F6C9DF", light: "#FBDCEC", frill: "#FFFFFF", belt: C.lavDeep, ribbon: C.sakuraDeep, button: C.gold },
    render: ({ pal }) => (
      <g>
        {puff(pal.main)}
        {skirt(pal.main, 294, 35)}
        <path d="M148,240 L172,240 L187,270 L133,270 Z" fill={pal.light} />
        {ruffle(292, 35, pal.frill, 7, 13)}
        {bodice(pal.light)}
        <rect x="146" y="238" width="28" height="6" rx="3" fill={pal.belt} opacity=".5" />
        {/* 白丸襟＋金ボタン */}
        <path d="M149,185 Q154,194 160,194 Q166,194 171,185 Q166,191 160,191 Q154,191 149,185 Z" fill="#FFF" />
        <path d="M150,184 q10,9 20,0 l-3,6 q-7,5 -14,0 Z" fill={pal.frill} />
        {[212, 224].map((y, i) => <circle key={i} cx="160" cy={y} r="2" fill={pal.button} />)}
        {bow(160, 200, 1.1, pal.ribbon, "#D9679C")}
      </g>
    ),
  },

  /* N: セーラー制服。シグネチャ=大きなセーラー襟＋スカーフ */
  seifuku: {
    pal: { main: "#3B4A7A", collar: "#FFFFFF", line: "#5C6FA8", scarf: "#E0556B", skirt: "#2E3A63", pleat: "#46568C" },
    render: ({ pal }) => (
      <g>
        {sleeves(pal.main, 13.5)}
        <path d="M138,226 q4,4 8,1 M182,226 q-4,4 -8,1" stroke={pal.collar} strokeWidth="2" fill="none" strokeLinecap="round" />
        {bodice(pal.main)}
        {/* プリーツ（2値の面で表現） */}
        <path d="M148,242 L172,242 L190,290 L130,290 Z" fill={pal.skirt} />
        {[[-1, 0], [1, 0]].map(([s], i) => (
          <g key={i}>
            <path d={`M${160 + s * 5},242 L${160 + s * 12},242 L${160 + s * 22},290 L${160 + s * 9},290 Z`} fill={pal.pleat} />
          </g>
        ))}
        <rect x="147" y="239" width="26" height="5" rx="2" fill={pal.pleat} />
        {/* 大きなセーラー襟（紺ライン入り） */}
        <path d="M144,184 L160,206 L176,184 L184,193 L160,226 L136,193 Z" fill={pal.collar} />
        <path d="M141,188 L160,214 L179,188" stroke={pal.line} strokeWidth="2" fill="none" />
        {/* スカーフ */}
        <path d="M154,202 L160,210 L166,202 L163,220 L157,220 Z" fill={pal.scarf} />
        <circle cx="160" cy="207" r="2.6" fill="#C23B52" />
      </g>
    ),
  },

  /* R: オーバーサイズのライブT。シグネチャ=「推」プリント＋裾の銀テープ */
  liveT: {
    pal: { main: "#2C2C38", print: C.gold, hem: "#5B5B70", cuff: "#44445A", band: C.sakuraDeep, tape: "#9CC8F0" },
    render: ({ pal }) => (
      <g>
        {sleeves(pal.main, 14.5)}
        <path d="M137,228 q4,4 8,0 M175,228 q4,4 8,0" stroke={pal.cuff} strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* ビッグシルエット（裾ラウンド） */}
        <path d="M143,189 C143,183 177,183 177,189 L177,252 Q160,262 143,252 Z" fill={pal.main} />
        <path d="M150,184 q10,7 20,0" stroke="#4A4A5E" strokeWidth="3" fill="none" />
        <text x="160" y="230" fontSize="19" textAnchor="middle" fill={pal.print} fontWeight="bold">推</text>
        <path d="M148,206 q12,-4 24,0" stroke={pal.print} strokeWidth="1.6" fill="none" opacity=".8" />
        {/* 裾からのぞく銀テープ */}
        <path d="M148,252 q-3,10 -7,14" stroke={pal.tape} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M170,254 q3,9 8,12" stroke={pal.tape} strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".8" />
        {/* 推し活リストバンド */}
        <path d="M180,238 q5,3 8,1" stroke={pal.band} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },

  /* SR: アイドル衣装。シグネチャ=金モールの胸元＋3層スカート＋大リボン */
  idol: {
    pal: { main: "#FFE3F0", skirtA: "#C9C2F0", skirtB: "#FFD0E6", frill: "#FFFFFF", gold: C.gold, ribbon: C.sakuraDeep, ribbonDark: "#E06CA4", wing: "#FFFFFF" },
    render: ({ pal }) => (
      <g>
        {puff(pal.main)}
        {/* 手首の白カフス */}
        <path d="M133,224 q4,4 9,2 M187,224 q-4,4 -9,2" stroke="#FFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        {skirt(pal.skirtA, 300, 41)}
        {skirt(pal.skirtB, 291, 34)}
        {ruffle(298, 41, pal.frill, 8, 13)}
        {ruffle(288, 33, pal.main, 7, 11)}
        <path d="M121,297 L199,297" stroke={pal.gold} strokeWidth="1.6" opacity=".8" />
        {bodice(pal.main)}
        {/* 金モールのV字＋ボタン */}
        <path d="M148,192 L160,214 L172,192" stroke={pal.gold} strokeWidth="2.2" fill="none" />
        {[222, 232].map((y, i) => <circle key={i} cx="160" cy={y} r="2.2" fill={pal.gold} />)}
        <rect x="146" y="238" width="28" height="6" rx="3" fill={pal.gold} opacity=".9" />
        {/* 肩の小さな羽 */}
        <path d="M141,196 q-11,3 -14,13 q11,-3 17,-9 Z" fill={pal.wing} />
        <path d="M179,196 q11,3 14,13 q-11,-3 -17,-9 Z" fill={pal.wing} />
        {/* 大きな胸リボン */}
        {bow(160, 200, 1.5, pal.ribbon, pal.ribbonDark)}
        {sparkle(140, 258, 4)}
        {sparkle(182, 272, 3.4)}
        {sparkle(158, 282, 2.8, 0.8)}
      </g>
    ),
  },

  /* SR: 推しいろステージ。シグネチャ=推しカラーが服になる（アクセントスロット）。
     白ベース×推しカラーなので、8色プリセットのどの色でも破綻しない */
  oshiStage: {
    pal: { base: "#FFFDFA", shade: "#F1E8EE", frill: "#FFFFFF" },
    render: ({ pal, ids, oshi }) => {
      const acc = oshi;
      const accLight = tint(oshi, 0.62);
      const accDeep = deepen(oshi, 0.28);
      return (
        <g>
          {puff(pal.base)}
          {/* 手首の推しカラーカフス */}
          <path d="M133,224 q4,4 9,2 M187,224 q-4,4 -9,2" stroke={accLight} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* 3層スカート（外層に推しカラー） */}
          {skirt(accLight, 299, 40)}
          {skirt(pal.base, 291, 34)}
          {ruffle(297, 40, pal.frill, 8, 13)}
          {ruffle(288, 33, accLight, 7, 11)}
          {/* 裾の推しカラーライン */}
          <path d="M121,296 L199,296" stroke={acc} strokeWidth="2" opacity=".85" />
          {/* スカートの星ワッペン */}
          <path d="M174,276 l2,4.2 l4.6,.6 l-3.4,3.2 l.9,4.6 l-4.1,-2.3 l-4.1,2.3 l.9,-4.6 l-3.4,-3.2 l4.6,-.6 Z" fill={acc} opacity=".9" />
          {bodice(pal.base)}
          <path d="M147,244 Q160,250 173,244 L173,248 Q160,254 147,248 Z" fill={pal.shade} />
          {/* 胸元の推しカラーV＋ボタン */}
          <path d="M148,192 L160,212 L172,192" stroke={acc} strokeWidth="2.2" fill="none" />
          {[220, 230].map((y, i) => <circle key={i} cx="160" cy={y} r="2" fill={accDeep} />)}
          {/* ウエストの推しカラー帯 */}
          <rect x="146" y="238" width="28" height="6" rx="3" fill={acc} />
          {/* 大きな胸リボン（推しカラー） */}
          {bow(160, 200, 1.5, acc, accDeep)}
          {sparkle(141, 258, 3.6)}
          {sparkle(181, 268, 3)}
          {sparkle(156, 284, 2.6, 0.8)}
        </g>
      );
    },
  },

  /* R: 浴衣。シグネチャ=太い帯＋帯締め＋右腰のリボン結び */
  yukata: {
    pal: { main: "#BFD9F2", shade: "#9FC2E4", collar: "#FFFFFF", collarIn: "#F2A9C4", obi: C.sakuraDeep, obiCord: C.gold, flower: "#FF9EC6", hem: "#E8F2FB" },
    render: ({ pal }) => (
      <g>
        {sleeves(pal.main, 16, true)}
        <path d="M141,214 C139,226 139,236 141,244 M179,214 C181,226 181,236 179,244" stroke={pal.shade} strokeWidth="3" fill="none" opacity=".5" />
        <path d="M146,189 L174,189 L186,298 L134,298 Z" fill={pal.main} />
        {/* 裾の流水ライン */}
        <path d="M136,286 q12,-6 24,0 t24,0" stroke={pal.hem} strokeWidth="3" fill="none" opacity=".9" />
        {/* 合わせ襟（白＋差し色） */}
        <path d="M160,188 L143,214 L160,224 Z" fill={pal.collar} />
        <path d="M160,188 L177,214 L160,224 Z" fill={pal.hem} />
        <path d="M158,192 L148,208" stroke={pal.collarIn} strokeWidth="2.4" />
        {/* 太帯＋帯締め */}
        <rect x="136" y="240" width="48" height="17" rx="2" fill={pal.obi} />
        <rect x="136" y="247" width="48" height="3" fill={pal.obiCord} opacity=".9" />
        <path d="M138,242 L182,242" stroke="#E06CA4" strokeWidth="1.6" opacity=".7" />
        {/* 右腰のリボン結び */}
        {bow(182, 248, 1.1, pal.obi, "#D9679C")}
        {[[147, 210], [176, 226], [150, 274], [177, 280], [162, 300]].map(([x, y], i) =>
          <path key={i} d={`M${x},${y} q3,-5 6,0 q3,5 0,8 q-3,-3 -6,0 q-3,-5 0,-8`} fill={pal.flower} />)}
      </g>
    ),
  },

  /* SR: ゆめかわワンピ。シグネチャ=肩ストラップ＋天使の羽ブローチ＋星キャンディ */
  yumekawa: {
    pal: { main: "#E3D6FA", skirt: "#FFDDEE", mid: "#C9BCF0", frill: "#FFFFFF", heart: C.sakuraDeep, star: C.gold, mint: "#B8EAD9" },
    render: ({ pal }) => (
      <g>
        {puff(pal.main)}
        {skirt(pal.skirt, 297, 38)}
        <path d="M148,240 L172,240 L185,270 L135,270 Z" fill={pal.mid} />
        {ruffle(295, 38, pal.frill, 8, 13)}
        {ruffle(281, 30, pal.skirt, 6, 11)}
        {bodice(pal.main)}
        {/* 肩ストラップ＋ボタン */}
        <path d="M150,186 L154,244 M170,186 L166,244" stroke={pal.frill} strokeWidth="3.4" />
        {[[154, 210], [166, 210]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill={pal.mint} />)}
        {/* 天使の羽ブローチ */}
        <path d="M156,198 q-9,-4 -12,4 q8,2 12,-1 Z" fill="#FFF" />
        <path d="M164,198 q9,-4 12,4 q-8,2 -12,-1 Z" fill="#FFF" />
        <circle cx="160" cy="199" r="3.4" fill={pal.heart} />
        {/* 星と ハートのキャンディ散らし */}
        <path d="M144,284 l1.8,3.6 l4,.5 l-2.9,2.8 l.7,4 l-3.6,-2 l-3.6,2 l.7,-4 l-2.9,-2.8 l4,-.5 Z" fill={pal.star} />
        {[[172, 288], [158, 276]].map(([x, y], i) =>
          <path key={i} d={`M${x},${y} q3,-5 6,0 q3,5 0,8 q-3,-3 -6,0 q-3,-5 0,-8`} fill={pal.heart} />)}
        {sparkle(148, 262, 3)}
        {sparkle(176, 258, 2.6, 0.8)}
      </g>
    ),
  },

  /* SR: シフォンチュールワンピ。シグネチャ=透けるチュール＋パール列＋ブローチ */
  chiffon: {
    pal: { main: "#323B6E", skirtA: "#46538F", skirtB: "#3A4680", frill: "#5A68A8", belt: "#1F2750", collar: "#EEF1FB", collarHi: "#FFFFFF", lace: "#C9D2EC", pearl: "#F2F4FC", gold: C.gold },
    render: ({ pal }) => (
      <g>
        {puff(pal.main)}
        {/* チュール（外層を半透明で重ねる） */}
        {skirt(pal.skirtB, 292, 34)}
        {ruffle(290, 34, pal.frill, 8, 12)}
        <g opacity=".62">
          {skirt(pal.skirtA, 302, 43)}
          {ruffle(300, 43, pal.skirtA, 9, 13)}
        </g>
        <path d="M119,299 L201,299" stroke={pal.lace} strokeWidth="1.2" opacity=".7" />
        {bodice(pal.main)}
        {/* パールボタン列 */}
        {[214, 224, 234].map((y, i) => <circle key={i} cx="160" cy={y} r="1.9" fill={pal.pearl} />)}
        <rect x="146" y="238" width="28" height="6" rx="3" fill={pal.belt} />
        <path d="M148,241 L172,241" stroke={pal.gold} strokeWidth="1.2" opacity=".9" />
        {/* レース襟＋ブローチ */}
        <path d="M134,196 Q160,190 186,196 Q188,210 160,216 Q132,210 134,196 Z" fill={pal.collar} />
        <path d="M136,198 Q160,194 184,198 Q184,206 160,210 Q136,206 136,198 Z" fill={pal.collarHi} />
        {[142, 152, 162, 172, 180].map((x, i) => <path key={i} d={`M${x},208 q0,4 2,7`} stroke={pal.lace} strokeWidth="1.3" fill="none" />)}
        <circle cx="170" cy="212" r="4" fill={pal.collarHi} /><circle cx="170" cy="212" r="2.2" fill={pal.gold} />
        {sparkle(146, 266, 3)}
        {sparkle(178, 284, 2.6, 0.75)}
      </g>
    ),
  },

  /* LE: 王子様風。シグネチャ=両肩マント＋金の肩章＋勲章サッシュ */
  prince: {
    pal: { cape: "#9A2C44", capeIn: "#C24560", capeTrim: C.gold, coat: "#F4EFE6", coatShade: "#E7DCC6", gold: C.gold, pants: "#3A3550", sash: "#7FB0F0" },
    pants: { base: "#3A3550", shade: "#26223A", light: "#56506E", shoe: "#2C2742", shoeLine: "#15122A" },
    render: ({ pal, ids }) => (
      <g>
        {/* 両肩の短マント */}
        <path d="M140,192 C112,202 106,248 118,296 L136,290 C126,252 130,214 146,198 Z" fill={pal.cape} />
        <path d="M180,192 C208,202 214,248 202,296 L184,290 C194,252 190,214 174,198 Z" fill={pal.cape} />
        <path d="M120,290 C112,252 116,214 140,196" stroke={pal.capeTrim} strokeWidth="2" fill="none" opacity=".9" />
        <path d="M200,290 C208,252 204,214 180,196" stroke={pal.capeTrim} strokeWidth="2" fill="none" opacity=".9" />
        <path d="M142,200 C128,214 126,248 132,284 C130,250 134,218 148,202 Z" fill={pal.capeIn} opacity=".7" filter={ids.soft1} />
        {sleeves(pal.coat, 14.5, true)}
        <path d="M146,189 C146,183 174,183 174,189 L172,266 L148,266 Z" fill={pal.coat} />
        <path d="M158,189 L154,266 L166,266 L162,189 Z" fill={pal.coatShade} />
        {/* サッシュ＋勲章 */}
        <path d="M147,192 L173,238 L173,248 L147,202 Z" fill={pal.sash} opacity=".9" />
        <path d="M170,240 l2.2,4.6 l5,.6 l-3.7,3.5 l1,5 l-4.5,-2.6 l-4.5,2.6 l1,-5 l-3.7,-3.5 l5,-.6 Z" fill={pal.gold} />
        {/* 金の肩章＋房 */}
        <path d="M141,190 q5,-5 12,-3 l-1,7 q-6,-1 -11,4 Z" fill={pal.gold} />
        <path d="M179,190 q-5,-5 -12,-3 l1,7 q6,-1 11,4 Z" fill={pal.gold} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${140 + i * 3},196 l-1,7`} stroke={pal.gold} strokeWidth="1.6" strokeLinecap="round" />)}
        {[0, 1, 2].map((i) => <path key={i} d={`M${180 - i * 3},196 l1,7`} stroke={pal.gold} strokeWidth="1.6" strokeLinecap="round" />)}
        {/* 金ボタン＋飾緒 */}
        {[0, 1].map((i) => <circle key={i} cx="160" cy={212 + i * 18} r="3" fill={pal.gold} />)}
        <path d="M146,196 q-6,10 0,20" stroke={pal.gold} strokeWidth="1.4" fill="none" opacity=".9" />
        {/* パンツ */}
        <path d="M150,250 L170,250 L173,298 L160,294 L147,298 Z" fill={pal.pants} />
        <path d="M153,296 C152,308 152,312 152,316" stroke={pal.pants} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M167,296 C168,308 168,312 168,316" stroke={pal.pants} strokeWidth="9" fill="none" strokeLinecap="round" />
        {sparkle(128, 236, 3.6)}
        {sparkle(194, 220, 3)}
        {sparkle(166, 280, 2.6, 0.8)}
      </g>
    ),
  },

  /* N: 学ラン。シグネチャ=立ち襟の白カラー＋金ボタン列 */
  gakuran: {
    pal: { main: "#1A1A2E", collar: "#252544", collarLine: "#F0F0F8", line: "#2C2C44", gold: C.gold, dark: "#0F0F22", light: "#2A2A48" },
    pants: { base: "#1A1A2E", shade: "#101022", light: "#2A2A48", shoe: "#1F1B2E", shoeLine: "#0F0D1F" },
    render: ({ pal, ids }) => (
      <g>
        {sleeves(pal.main, 15)}
        <path d="M137,228 q4,3 8,0 M175,228 q4,3 8,0" stroke={pal.light} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M137,192 C137,185 183,185 183,192 L181,250 C181,256 139,256 139,250 Z" fill={pal.main} />
        {/* 立ち襟＋白カラー */}
        <path d="M144,192 L160,200 L176,192 L172,206 L160,212 L148,206 Z" fill={pal.collar} />
        <path d="M147,193 L160,200 L173,193" stroke={pal.collarLine} strokeWidth="1.6" fill="none" opacity=".9" />
        <path d="M158,200 L162,200 L161,250 L159,250 Z" fill={pal.line} />
        {[206, 218, 230, 242].map((y, i) => <circle key={i} cx="160" cy={y} r="2.2" fill={pal.gold} />)}
        <path d="M139,248 L181,248" stroke={pal.dark} strokeWidth="2" opacity=".8" />
        <path d="M137,192 L141,192 L143,250 L139,250 Z" fill={pal.dark} opacity=".7" filter={ids.soft1} />
        <path d="M179,192 L183,192 L181,250 L177,250 Z" fill={pal.light} opacity=".6" filter={ids.soft1} />
      </g>
    ),
  },

  /* R: オーバーパーカー。シグネチャ=ねこ耳フード＋カンガルーポケット */
  hoodieB: {
    pal: { main: "#A8B5CE", dark: "#7A8AA8", hood: "#94A3BF", cord: "#FFFFFF", hem: "#5C6886", pocket: "#96A5C2" },
    pants: { base: "#454C6B", shade: "#2F344F", light: "#5C658A", shoe: "#FFFFFF", shoeLine: "#D4DCEF" },
    render: ({ pal, ids }) => (
      <g>
        <path d="M132,202 C124,206 122,228 132,246 C140,234 142,216 148,206 Z" fill={pal.dark} />
        <path d="M188,202 C196,206 198,228 188,246 C180,234 178,216 172,206 Z" fill={pal.dark} />
        <path d="M132,195 C132,188 188,188 188,195 L186,256 C186,262 134,262 134,256 Z" fill={pal.main} />
        {/* フード */}
        <path d="M134,196 C124,180 130,170 160,170 C190,170 196,180 186,196 C176,184 144,184 134,196 Z" fill={pal.dark} />
        <path d="M138,196 C130,184 138,176 160,176 C182,176 190,184 182,196 C172,186 148,186 138,196 Z" fill={pal.hood} opacity=".7" filter={ids.soft1} />
        {/* ドローコード（ビーズ付き） */}
        <path d="M154,202 L152,226" stroke={pal.cord} strokeWidth="1.6" /><circle cx="152" cy="228" r="2.2" fill={pal.cord} />
        <path d="M166,202 L168,226" stroke={pal.cord} strokeWidth="1.6" /><circle cx="168" cy="228" r="2.2" fill={pal.cord} />
        {/* カンガルーポケット＋ねこ顔プリント */}
        <path d="M146,236 L174,236 L171,254 L149,254 Z" fill={pal.pocket} />
        <path d="M146,236 L149,254 M174,236 L171,254" stroke={pal.hem} strokeWidth="1.4" opacity=".6" />
        <g fill={pal.cord}>
          <circle cx="160" cy="245" r="4.6" />
          <path d="M155.6,242 l-1.6,-3.6 l4,1 Z M164.4,242 l1.6,-3.6 l-4,1 Z" />
        </g>
        <g fill={pal.dark}>
          <circle cx="158.2" cy="244.4" r=".8" /><circle cx="161.8" cy="244.4" r=".8" />
          <path d="M159.2,246.8 q0.8,0.9 1.6,0" stroke={pal.dark} strokeWidth=".7" fill="none" />
        </g>
        {/* 裾リブ */}
        <path d="M134,252 L186,252" stroke={pal.hem} strokeWidth="3" opacity=".5" />
        {[140, 148, 156, 164, 172, 180].map((x, i) => <path key={i} d={`M${x},252 l0,6`} stroke={pal.hem} strokeWidth="1.2" opacity=".5" />)}
        <path d="M134,196 C134,192 186,192 186,196 L184,218 C170,226 150,226 136,218 Z" fill="#FFF" opacity=".18" filter={ids.soft2} />
      </g>
    ),
  },

  /* SR: 王子のシャツ。シグネチャ=3段ジャボ＋懐中時計チェーン */
  princeB: {
    pal: { sleeve: "#FFFFFF", shirt: "#F8F0E0", vest: "#7A2E48", vestLine: "#5C2236", jabot: "#FFFFFF", jabotShade: "#F2E9D8", gold: C.gold },
    pants: { base: "#FFF6E8", shade: "#E7DDC8", light: "#FFFFFF", shoe: "#7A4B66", shoeLine: "#502E44" },
    render: ({ pal, ids }) => (
      <g>
        {sleeves(pal.sleeve, 14.5, true)}
        {/* ロールアップカフス */}
        <path d="M136,240 q4,5 10,4 M184,240 q-4,5 -10,4" stroke={pal.jabotShade} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M137,192 C137,185 183,185 183,192 L181,250 C181,256 139,256 139,250 Z" fill={pal.shirt} />
        {/* ベスト＋ラペル */}
        <path d="M144,194 L160,202 L176,194 L174,250 L146,250 Z" fill={pal.vest} />
        <path d="M148,196 L156,204 L152,212 Z M172,196 L164,204 L168,212 Z" fill={pal.vestLine} />
        <path d="M158,202 L162,202 L161,250 L159,250 Z" fill={pal.vestLine} />
        {/* 懐中時計チェーン */}
        <path d="M161,226 q10,4 13,14" stroke={pal.gold} strokeWidth="1.6" fill="none" />
        <circle cx="175" cy="242" r="3" fill={pal.gold} /><circle cx="175" cy="242" r="1.4" fill={pal.shirt} />
        {[212, 224, 236].map((y, i) => <circle key={i} cx="160" cy={y} r="1.8" fill={pal.gold} />)}
        {/* 3段ジャボ */}
        <path d="M150,190 Q160,186 170,190 Q172,200 160,204 Q148,200 150,190 Z" fill={pal.jabot} />
        <path d="M153,198 Q160,208 167,198 Q166,208 160,211 Q154,208 153,198 Z" fill={pal.jabotShade} />
        <path d="M156,206 Q160,215 164,206 Q162,214 160,216 Q158,214 156,206 Z" fill={pal.jabot} />
        <circle cx="160" cy="193" r="2.2" fill={pal.gold} />
        <path d="M147,196 L149,196 L149,250 L147,250 Z" fill="#FFF" opacity=".5" filter={ids.soft1} />
        {sparkle(178, 210, 2.8, 0.8)}
      </g>
    ),
  },

  /* SR: 地雷系ジャケット。シグネチャ=Oリングハーネス＋ジップ＋安全ピン */
  jiraiB: {
    pal: { main: "#1F1A2E", inner: "#F0EAF4", harness: "#3A3252", ring: "#4A4066", accent: "#E26AA0", dark: "#0F0D1A", light: "#3A3252" },
    pants: { base: "#1F1A2E", shade: "#15102A", light: "#3A3252", shoe: "#1A1828", shoeLine: "#0F0D1F" },
    render: ({ pal, ids }) => (
      <g>
        {sleeves(pal.main, 15)}
        <path d="M137,230 q4,3 8,0 M175,230 q4,3 8,0" stroke={pal.accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
        <path d="M137,192 C137,185 183,185 183,192 L181,250 C181,256 139,256 139,250 Z" fill={pal.main} />
        <path d="M152,192 L168,192 L168,250 L152,250 Z" fill={pal.inner} />
        {/* ジップ */}
        <path d="M160,194 L160,248" stroke={pal.harness} strokeWidth="2" strokeDasharray="2.2 1.6" />
        <path d="M160,206 l3,4 l-3,3 l-3,-3 Z" fill={pal.accent} />
        {/* Oリングハーネス */}
        <path d="M146,196 L156,214 M174,196 L164,214 M156,222 L146,242 M164,222 L174,242" stroke={pal.harness} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="160" cy="218" r="5.4" fill="none" stroke={pal.ring} strokeWidth="3" />
        <circle cx="160" cy="218" r="5.4" fill="none" stroke={pal.accent} strokeWidth="1" opacity=".7" />
        {/* チョーカー＋ハート */}
        <path d="M150,184 q10,5 20,0" stroke={pal.main} strokeWidth="3.4" fill="none" />
        <path d="M158,186 q2,4 4,0 q-2,-3 -4,0 Z" fill={pal.accent} />
        {/* 安全ピン＋チェーン */}
        <path d="M144,246 l8,-4" stroke={pal.accent} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="143" cy="246" r="1.6" fill="none" stroke={pal.accent} strokeWidth="1.2" />
        {[230, 236, 242].map((y, i) => <circle key={i} cx={174 - i} cy={y} r="1.3" fill={pal.accent} />)}
        <path d="M137,192 L141,192 L143,250 L139,250 Z" fill={pal.dark} opacity=".7" filter={ids.soft1} />
        <path d="M179,192 L183,192 L181,250 L177,250 Z" fill={pal.light} opacity=".6" filter={ids.soft1} />
      </g>
    ),
  },

  /* LE: ゴシック貴族服。シグネチャ=チェーン留めマント＋ブロケードベスト＋宝石クラバット */
  gothBoyOutfit: {
    pal: { cape: "#3A2548", capeIn: "#5A3A70", capeTrim: "#8C7AAE", main: "#15131F", shirt: "#F0EAEC", broider: "#8C7AAE", cravat: "#FFFFFF", gem: "#B03A5C", button: "#C8C2D8", chain: C.gold },
    pants: { base: "#15131F", shade: "#0A0815", light: "#28253A", shoe: "#0F0D1A", shoeLine: "#04030A" },
    render: ({ pal, ids }) => (
      <g>
        {/* マント（縁に紫トリム） */}
        <path d="M134,194 C108,210 100,260 116,310 L138,304 C128,260 132,224 144,200 Z" fill={pal.cape} />
        <path d="M186,194 C212,210 220,260 204,310 L182,304 C192,260 188,224 176,200 Z" fill={pal.cape} />
        <path d="M118,306 C104,258 112,214 136,196" stroke={pal.capeTrim} strokeWidth="2" fill="none" opacity=".9" />
        <path d="M202,306 C216,258 208,214 184,196" stroke={pal.capeTrim} strokeWidth="2" fill="none" opacity=".9" />
        <path d="M138,200 C124,220 122,260 130,300 C124,260 130,228 144,206 Z" fill={pal.capeIn} opacity=".6" filter={ids.soft2} />
        {sleeves(pal.main, 14.5, true)}
        {/* 手首のレースカフス */}
        <path d="M135,242 q4,5 9,4 M185,242 q-4,5 -9,4" stroke={pal.shirt} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M147,192 C147,186 173,186 173,192 L172,250 L148,250 Z" fill={pal.shirt} />
        {/* ブロケードベスト（ダイヤ紋様） */}
        <path d="M150,200 L160,206 L170,200 L168,250 L152,250 Z" fill={pal.main} />
        {[216, 230, 244].map((y, i) => (
          <path key={i} d={`M160,${y - 4} l3.4,4 l-3.4,4 l-3.4,-4 Z`} fill="none" stroke={pal.broider} strokeWidth="1" opacity=".8" />
        ))}
        {/* マントのチェーン留め */}
        <path d="M143,198 Q160,206 177,198" stroke={pal.chain} strokeWidth="1.6" fill="none" />
        <circle cx="143" cy="198" r="2.4" fill={pal.chain} /><circle cx="177" cy="198" r="2.4" fill={pal.chain} />
        {/* クラバット＋宝石 */}
        <path d="M152,190 Q160,186 168,190 Q170,200 160,206 Q150,200 152,190 Z" fill={pal.cravat} />
        <path d="M156,200 Q160,210 164,200 Q160,206 156,200 Z" fill={pal.shirt} />
        <path d="M160,192 l3,3.6 l-3,3.6 l-3,-3.6 Z" fill={pal.gem} />
        {[218, 232].map((y, i) => <circle key={i} cx="154" cy={y} r="1.5" fill={pal.button} />)}
        {sparkle(126, 246, 3.2)}
        {sparkle(196, 262, 2.8, 0.8)}
      </g>
    ),
  },
};
