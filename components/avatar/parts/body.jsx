/* ============================================================
   体パーツ（足・腕・首・胴）
   ------------------------------------------------------------
   レイヤーとして分離: Legs → Arms → Neck → Torso の順に
   合成される（腕と首は服の下に入る）。
   pants は服レジストリ（outfits.jsx）の各衣装が宣言する。
   ============================================================ */
import React from "react";
import { SKIN_TONE } from "../palettes";

/** 足（靴含む）。pants 指定があればズボン色で描く */
export function Legs({ skin, pants, ids }) {
  const s = SKIN_TONE[skin];
  const legColor = pants ? pants.base : s.base;
  const legShade = pants ? pants.shade : s.shade;
  const legHi = pants ? pants.light : "#FFF";
  const shoe = (cx) => (
    <g key={`sh${cx}`}>
      <ellipse cx={cx} cy="333" rx="12.5" ry="3.6" fill="#CBBEDF" filter={ids.soft1} />
      <path d={`M${cx - 10},315 C${cx - 12},327 ${cx - 4},332.5 ${cx + 4},332.5 L${cx + 10.5},332.5 C${cx + 12.5},324 ${cx + 10},316.5 ${cx + 6},314.5 Z`} fill={pants ? pants.shoe : "#FFFFFF"} stroke={pants ? pants.shoeLine : "#E4D9EF"} strokeWidth="1" />
      {!pants && <path d={`M${cx - 7.5},319 q8.5,5 15,0`} stroke="#FF9FC4" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      {!pants && <circle cx={cx + 1} cy="320.5" r="1.8" fill="#FF9FC4" />}
      <ellipse cx={cx - 2.5} cy="321" rx="3.6" ry="2.4" fill="#FFF" opacity=".5" filter={ids.soft1} />
    </g>
  );
  const leg = (cx) => (
    <g key={`lg${cx}`}>
      <path d={`M${cx},248 C${cx - 1},278 ${cx - 1},298 ${cx},310`} stroke={legColor} strokeWidth={pants ? 18 : 15} fill="none" strokeLinecap="round" />
      <path d={`M${cx - 4},258 C${cx - 5},280 ${cx - 5},296 ${cx - 4},306`} stroke={legShade} strokeWidth="3.6" fill="none" strokeLinecap="round" opacity=".35" filter={ids.soft1} />
      <path d={`M${cx + 4},262 C${cx + 4},280 ${cx + 4},296 ${cx + 4},304`} stroke={legHi} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity={pants ? ".3" : ".4"} filter={ids.soft1} />
    </g>
  );
  return <g>{leg(150)}{leg(170)}{shoe(150)}{shoe(170)}</g>;
}

/** 腕（服の下に入る） */
export function Arms({ skin, ids }) {
  const s = SKIN_TONE[skin];
  const arm = (sx, hx, sign) => (
    <g key={`a${sign}`}>
      <path d={`M${sx},196 C${sx + sign * 6},206 ${hx + sign * 2},226 ${hx},242`} stroke={s.base} strokeWidth="12.5" fill="none" strokeLinecap="round" />
      <circle cx={hx} cy="245" r="7.5" fill={s.base} />
      <circle cx={hx - sign * 2} cy="243" r="2.6" fill="#FFF" opacity=".35" filter={ids.soft1} />
      <path d={`M${sx + sign * 2},202 C${sx + sign * 8},212 ${hx + sign * 4},228 ${hx + sign * 2},238`} stroke={s.shade} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".3" filter={ids.soft1} />
    </g>
  );
  return <g>{arm(142, 136, -1)}{arm(178, 184, 1)}</g>;
}

/** 首 */
export function Neck({ skin, ids }) {
  const s = SKIN_TONE[skin];
  return (
    <g>
      <path d="M154,178 h12 v12 q-6,5 -12,0 Z" fill={s.base} />
      <path d="M154,182 q6,5 12,0 l0,4 q-6,5 -12,0 Z" fill={s.shade} opacity=".5" filter={ids.soft1} />
    </g>
  );
}

/** 胴ベース（服の下地）: 肩46・ウエスト40 */
export function Torso({ skin, ids }) {
  const s = SKIN_TONE[skin];
  return (
    <g>
      <path d="M137,192 C137,185 183,185 183,192 L180,244 C180,254 140,254 140,244 Z" fill={s.base} />
      <path d="M137,192 C137,185 183,185 183,192 L181,210 C168,218 152,218 139,210 Z" fill="#FFF" opacity=".18" filter={ids.soft2} />
    </g>
  );
}
