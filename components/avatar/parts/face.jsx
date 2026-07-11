/* ============================================================
   顔パーツ（顔土台・チーク・目・口）
   ------------------------------------------------------------
   レイヤーとして分離: FaceBase → Cheeks → Eyes → Mouth。
   - 目のスタイル追加は EYE_STYLE_IDS への登録＋ Eyes 内の
     分岐追加（将来的に独立レジストリ化する場合もここに集約）。
   - 口は現状「表情（eyeStyle）に連動」する仕様。
     MOUTH_FOR がその対応表（口を独立アイテム化する時は
     ここを equip.mouth 参照に差し替えるだけでよい）。
   ============================================================ */
import React from "react";
import { C, SKIN_TONE, EYE_PAL } from "../palettes";
import { HEAD_PATH, EY, ELX, ERX } from "../skeleton";

/** バリデーション用: Eyes が描けるスタイルID一覧 */
export const EYE_STYLE_IDS = ["round", "tareme", "smile", "sharp", "sparkle", "wink", "teary", "heart"];

/** 顔土台（耳・輪郭・落ち影・ツヤ・眉・鼻） */
export function FaceBase({ skin, masc, ids }) {
  const s = SKIN_TONE[skin];
  return (
    <g>
      {/* 耳 */}
      <circle cx="100" cy="128" r="9" fill={s.base} /><circle cx="100" cy="129" r="4" fill={s.line} opacity=".3" />
      <circle cx="220" cy="128" r="9" fill={s.base} /><circle cx="220" cy="129" r="4" fill={s.line} opacity=".3" />
      {/* 顔ベース（しずく型） */}
      <path d={HEAD_PATH} fill={s.base} />
      {/* あご・頬の柔らか落ち影 */}
      <path d="M108,140 Q124,178 160,180 Q196,178 212,140 Q204,176 160,176 Q116,176 108,140 Z" fill={s.shade} opacity=".22" filter={ids.soft3} />
      {/* 額・頬のツヤ */}
      <ellipse cx="158" cy="92" rx="42" ry="18" fill={ids.skinGlow} />
      <ellipse cx="124" cy={EY - 2} rx="12" ry="14" fill={ids.skinGlow} opacity=".7" />
      <ellipse cx="196" cy={EY - 2} rx="12" ry="14" fill={ids.skinGlow} opacity=".7" />
      {/* まゆ（女性=繊細アーチ／masc=やや太め・直線寄り） */}
      {masc ? (
        <g>
          <path d={`M${ELX - 14},${EY - 22} Q${ELX - 1},${EY - 26} ${ELX + 12},${EY - 23}`} stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity=".55" filter={ids.soft1} />
          <path d={`M${ERX - 12},${EY - 23} Q${ERX + 1},${EY - 26} ${ERX + 14},${EY - 22}`} stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity=".55" filter={ids.soft1} />
        </g>
      ) : (
        <g>
          <path d={`M${ELX - 13},${EY - 22} Q${ELX - 1},${EY - 27} ${ELX + 11},${EY - 24}`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".28" filter={ids.soft1} />
          <path d={`M${ERX - 11},${EY - 24} Q${ERX + 1},${EY - 27} ${ERX + 13},${EY - 22}`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".28" filter={ids.soft1} />
        </g>
      )}
      {/* 鼻 */}
      <path d={`M159,${EY + 16} q1,2 2,0`} stroke={s.line} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".6" />
    </g>
  );
}

/** チーク（全表情共通の恒常パーツ） */
export function Cheeks({ ids }) {
  return (
    <g>
      <ellipse cx="118" cy={EY + 16} rx="15" ry="9.5" fill={ids.blush} />
      <ellipse cx="202" cy={EY + 16} rx="15" ry="9.5" fill={ids.blush} />
      <circle cx="115" cy={EY + 12} r="1.8" fill="#FFF" opacity=".8" /><circle cx="205" cy={EY + 12} r="1.8" fill="#FFF" opacity=".8" />
    </g>
  );
}

/** 目（スタイル＋瞳色）。detail='simple' では虹彩の放射線を省略 */
export function Eyes({ eyeStyle, eyeColor, animated, detail, ids }) {
  const ec = EYE_PAL[eyeColor];

  const happyEye = (cx) => (
    <g key={`h${cx}`}>
      <path d={`M${cx - 17},${EY} Q${cx},${EY - 10} ${cx + 17},${EY}`} stroke={ec.light} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".25" filter={ids.soft2} />
      <path d={`M${cx - 16},${EY + 1} Q${cx},${EY - 12} ${cx + 16},${EY + 1}`} stroke={C.ink} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d={`M${cx - 16},${EY + 1} q-5,-1 -9,-4`} stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 16},${EY + 1} q5,-1 9,-4`} stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
  const winkEye = (cx) => (
    <g key={`w${cx}`}>
      <path d={`M${cx - 16},${EY} Q${cx},${EY - 9} ${cx + 16},${EY - 1}`} stroke={C.ink} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 16},${EY - 1} q6,-2 12,-5`} stroke={C.ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 12},${EY - 3} q4,-2 8,-4`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );

  const openEye = (cx, outerSign) => {
    const big = eyeStyle === "sparkle" || eyeStyle === "teary";
    const tilt = eyeStyle === "tareme" ? 5 : eyeStyle === "sharp" ? -6 : 0;
    const halfW = big ? 19 : 17;
    const innerX = cx - outerSign * (halfW - 3);
    const outerX = cx + outerSign * halfW;
    const innerY = EY + 1, outerY = EY + tilt;
    const topY = EY - (big ? 19 : 16), botY = EY + (big ? 18 : 16);
    const midX = (innerX + outerX) / 2;
    const sclera = `M${innerX},${innerY} Q${midX},${topY} ${outerX},${outerY} Q${midX},${botY} ${innerX},${innerY} Z`;
    const ir = big ? 16.5 : 15, irY = big ? 18.5 : 17, icy = EY + 2;
    const clipId = ids.id(`ec-${outerSign > 0 ? "r" : "l"}`);
    return (
      <g key={`o${cx}`} className={animated ? "oa-eye" : undefined}>
        {/* アイシャドウ（にじみ） */}
        <path d={`M${innerX},${innerY - 3} Q${midX},${topY - 4} ${outerX},${outerY - 3}`} stroke={ec.light} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".3" filter={ids.soft2} />
        <path d={sclera} fill={ids.eyewhite} />
        <clipPath id={clipId}><path d={sclera} /></clipPath>
        <g clipPath={`url(#${clipId})`}>
          <ellipse cx={cx} cy={icy} rx={ir} ry={irY} fill={ids.irisGrad(eyeColor)} />
          {detail !== "simple" && [...Array(11)].map((_, i) => {
            const a = (i / 11) * Math.PI * 2;
            return <line key={i} x1={cx} y1={icy} x2={cx + Math.cos(a) * ir} y2={icy + Math.sin(a) * irY} stroke={ec.light} strokeWidth=".7" opacity=".3" />;
          })}
          {/* 下うるみグロー */}
          <ellipse cx={cx} cy={icy + 8} rx={ir - 1} ry="6" fill={ec.light} opacity=".6" filter={ids.soft1} />
          {/* 上の影 */}
          <ellipse cx={cx} cy={icy - 11} rx={ir + 1} ry="7" fill={ec.deep} opacity=".45" filter={ids.soft1} />
          {/* 輪郭リング */}
          <ellipse cx={cx} cy={icy} rx={ir} ry={irY} fill="none" stroke={ec.deep} strokeWidth="1.6" opacity=".5" filter={ids.soft1} />
          {/* 瞳孔 */}
          <ellipse cx={cx} cy={icy + 2} rx={big ? 6.5 : 6} ry={big ? 9 : 8} fill="#1E1A2E" />
          {/* ソフトハイライト大（にじみ・必須） */}
          <ellipse cx={cx - 5} cy={icy - 7} rx="8" ry="10" fill="#FFF" opacity=".22" filter={ids.soft2} />
          {eyeStyle === "heart" ? (
            <path d={`M${cx - 5},${icy - 4} C${cx - 5},${icy - 7} ${cx - 10},${icy - 9} ${cx - 10},${icy - 6} C${cx - 10},${icy - 3} ${cx - 5},${icy - 1} ${cx - 5},${icy + 1} C${cx - 5},${icy - 1} ${cx},${icy - 3} ${cx},${icy - 6} C${cx},${icy - 9} ${cx - 5},${icy - 7} ${cx - 5},${icy - 4} Z`} fill="#FFF" />
          ) : (
            <ellipse cx={cx - 5} cy={icy - 7} rx={big ? 6 : 5} ry={big ? 7.5 : 6.5} fill="#FFF" opacity=".95" transform={`rotate(-16 ${cx - 5} ${icy - 7})`} filter={ids.soft1} />
          )}
          {/* シャープ小ハイライト */}
          <circle cx={cx + 5} cy={icy + 8} r={big ? 3.2 : 2.6} fill="#FFF" opacity=".95" />
          <circle cx={cx + 6} cy={icy - 4} r="1.4" fill="#FFF" opacity=".85" />
          {/* 下まぶた水光 */}
          <path d={`M${innerX + outerSign * 4},${botY - 3} Q${midX},${botY - 1} ${outerX - outerSign * 4},${outerY + 4}`} stroke="#FFF" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".55" />
          {big && <path d={`M${cx + 7},${icy - 9} l1.7,4.2 l4.2,1.7 l-4.2,1.7 l-1.7,4.2 l-1.7,-4.2 l-4.2,-1.7 l4.2,-1.7 Z`} fill="#FFF" opacity={eyeStyle === "sparkle" ? "1" : ".7"} />}
        </g>
        {/* 上まつげ（塗り＋柔らかさ） */}
        <g filter={ids.soft1}>
          <path d={`M${innerX},${innerY} Q${midX},${topY} ${outerX},${outerY} Q${outerX + outerSign * 9},${outerY - 7} ${outerX + outerSign * 12},${outerY - 11} Q${midX},${topY - 7} ${innerX},${innerY - 2} Z`} fill={C.ink} />
        </g>
        {[0.62, 0.78, 0.92].map((t, i) => {
          const lx = innerX + (outerX - innerX) * t;
          return <path key={i} d={`M${lx},${topY + 6} q${outerSign * 3},-7 ${outerSign * 8},-10`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />;
        })}
        <path d={`M${outerX - outerSign * 2},${outerY + 3} q${outerSign * 2},5 ${outerSign * 5},7`} stroke={C.ink} strokeWidth="1.7" fill="none" strokeLinecap="round" opacity=".8" />
        {eyeStyle === "teary" && (
          <g><path d={`M${outerX},${outerY + 9} q-3,6 0,11 q3,-5 0,-11 Z`} fill="#CDE8FB" opacity=".9" filter={ids.soft1} />
            <circle cx={outerX - 1} cy={outerY + 14} r="1.4" fill="#FFF" /></g>
        )}
      </g>
    );
  };

  const renderEye = (cx, outerSign, isLeft) => {
    if (eyeStyle === "smile") return happyEye(cx);
    if (eyeStyle === "wink" && isLeft) return winkEye(cx);
    return openEye(cx, outerSign);
  };

  return <g>{renderEye(ELX, -1, true)}{renderEye(ERX, 1, false)}</g>;
}

/** 表情（eyeStyle）→ 口の対応表 */
const MOUTH_FOR = (eyeStyle) => {
  if (eyeStyle === "sparkle" || eyeStyle === "heart") return "laugh";
  if (eyeStyle === "smile") return "smile";
  return "line";
};

/** 口 */
export function Mouth({ eyeStyle }) {
  const kind = MOUTH_FOR(eyeStyle);
  if (kind === "laugh")
    return (
      <g>
        <path d={`M152,${EY + 28} Q160,${EY + 42} 168,${EY + 28} Q160,${EY + 33} 152,${EY + 28} Z`} fill="#C9566E" />
        <path d={`M156,${EY + 30} Q160,${EY + 38} 164,${EY + 30} Z`} fill="#F49AAE" />
      </g>
    );
  if (kind === "smile")
    return <path d={`M152,${EY + 28} Q160,${EY + 38} 168,${EY + 28} Q160,${EY + 32} 152,${EY + 28} Z`} fill="#C9566E" />;
  return <path d={`M153,${EY + 28} Q160,${EY + 35} 167,${EY + 28}`} stroke="#C9566E" strokeWidth="2.6" fill="none" strokeLinecap="round" />;
}
