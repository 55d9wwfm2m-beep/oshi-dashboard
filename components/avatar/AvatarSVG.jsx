"use client";

/* ============================================================
   アバター合成器
   ------------------------------------------------------------
   - 全パーツを skeleton.js のレイヤースタック順に合成する。
     ここの並び順がレイヤー仕様の実体（勝手に入れ替えない）。
   - viewBox は全アイテム共通（VIEWBOX）。表示の切り抜きは
     crop プリセット（full / bust / torso）で行う。
   - defs（フィルタ・グラデーション）は makeIds で
     インスタンスごとに一意化される。
   - detail: 'full' | 'simple'。未指定なら表示サイズで自動判定
     （小サイズはぼかし・虹彩の放射線を省いた簡略描画）。
   ============================================================ */
import React, { useId } from "react";
import { C, RARITY, SKIN_TONE, HAIR_PAL, EYE_PAL, makeIds } from "./palettes";
import { VIEWBOX, CROPS, HAIR_LEGACY_FIT } from "./skeleton";
import {
  SKINS, HAIRSTYLES, HAIRCOLORS, EYESTYLES, EYECOLORS,
  OUTFITS, HEADWEAR, GLASSES, ACCESSORIES, BACKGROUNDS,
} from "./items";
import { BACKGROUNDS_R } from "./parts/backgrounds";
import { HAIR_R, HairBack, HairFront } from "./parts/hair";
import { Legs, Arms, Neck, Torso } from "./parts/body";
import { FaceBase, Cheeks, Eyes, Mouth, EYE_STYLE_IDS } from "./parts/face";
import { OUTFITS_R } from "./parts/outfits";
import { HEADWEAR_R } from "./parts/headwear";
import { GLASSES_R } from "./parts/glasses";
import { ACCESSORIES_R } from "./parts/accessories";

/* 開発時: カタログ（items.js）と描画レジストリの不整合を警告 */
if (process.env.NODE_ENV !== "production") {
  const check = (list, has, name) => {
    for (const it of list) {
      if (!has(it.id)) console.warn(`[avatar] 描画が未登録のアイテム: ${name}:${it.id}`);
    }
  };
  check(SKINS, (id) => id in SKIN_TONE, "skin");
  check(HAIRSTYLES, (id) => id in HAIR_R, "hairStyle");
  check(HAIRCOLORS, (id) => id in HAIR_PAL, "hairColor");
  check(EYESTYLES, (id) => EYE_STYLE_IDS.includes(id), "eyeStyle");
  check(EYECOLORS, (id) => id in EYE_PAL, "eyeColor");
  check(OUTFITS, (id) => id in OUTFITS_R, "outfit");
  check(HEADWEAR, (id) => id in HEADWEAR_R, "headwear");
  check(GLASSES, (id) => id in GLASSES_R, "glasses");
  check(ACCESSORIES, (id) => id in ACCESSORIES_R, "accessory");
  check(BACKGROUNDS, (id) => id in BACKGROUNDS_R, "background");
}

export function AvatarSVG({
  equip,
  size = 320,
  showBackground = true,
  bounceKey = 0,
  animated = false,
  uid = "",
  crop = "full",
  detail = "",
}) {
  const autoId = useId();
  const u = (uid || autoId).replace(/[^a-zA-Z0-9_-]/g, "");
  const lod = detail || (size < 120 ? "simple" : "full");
  const ids = makeIds(u, lod);

  const cropDef = CROPS[crop] ?? CROPS.full;
  const bust = crop === "bust";
  const h = size * cropDef.ratio;
  const showBg = showBackground && !bust;

  /* 装備の解決（未知IDは安全なデフォルトへフォールバック） */
  const skinId = equip.skin in SKIN_TONE ? equip.skin : "light";
  const hairColorId = equip.hairColor in HAIR_PAL ? equip.hairColor : "brown";
  const eyeColorId = equip.eyeColor in EYE_PAL ? equip.eyeColor : "brown";
  const hairDef = HAIR_R[equip.hairStyle] ?? HAIR_R.short;
  const outfitDef = OUTFITS_R[equip.outfit] ?? OUTFITS_R.casual;
  const Bg = BACKGROUNDS_R[equip.background] ?? BACKGROUNDS_R.dream;
  const Headwear = HEADWEAR_R[equip.headwear] ?? null;
  const Glasses = GLASSES_R[equip.glasses] ?? null;
  const Accessory = ACCESSORIES_R[equip.accessory] ?? null;

  const hairC = HAIR_PAL[hairColorId];
  const eyeC = EYE_PAL[eyeColorId];
  const hairG = ids.hairGrad(hairColorId);
  const masc = hairDef.face === "masc";
  const hairFit = hairDef.fit === "skeleton" ? undefined : HAIR_LEGACY_FIT;

  return (
    <svg
      viewBox={cropDef.vb}
      width={size}
      height={h}
      className={animated ? "oa-av-idle" : undefined}
      style={{ display: "block", overflow: "visible" }}
      key={bounceKey}
    >
      <defs>
        {/* 柔らかさ用ぼかし（simple モードでは未参照） */}
        {lod !== "simple" && (
          <>
            <filter id={ids.id("soft1")} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1" /></filter>
            <filter id={ids.id("soft2")} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id={ids.id("soft3")} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3.4" /></filter>
          </>
        )}
        <linearGradient id={ids.id("eyewhite")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6FF" /><stop offset=".55" stopColor="#FCFAFF" /><stop offset="1" stopColor="#E2E6F6" />
        </linearGradient>
        <radialGradient id={ids.id("blush")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF7FB2" stopOpacity="0.55" /><stop offset="1" stopColor="#FF7FB2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.id("skinGlow")} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".5" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        {/* 虹彩: 5段（上が濃く下が明るい）— 装備中の色のみ生成 */}
        <linearGradient id={ids.id(`irisGrad-${eyeColorId}`)} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={eyeC.deep} />
          <stop offset="0.28" stopColor={eyeC.deep} />
          <stop offset="0.52" stopColor={eyeC.base} />
          <stop offset="0.8" stopColor={eyeC.light} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity=".9" />
        </linearGradient>
        {/* 髪: 4段オンブレ — 装備中の色のみ生成 */}
        <linearGradient id={ids.id(`hairGrad-${hairColorId}`)} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor={hairC.shade} />
          <stop offset="0.3" stopColor={hairC.base} />
          <stop offset="0.7" stopColor={hairC.base} />
          <stop offset="1" stopColor={hairC.light} />
        </linearGradient>
      </defs>

      {/* 1. 背景 */}
      {showBg && <Bg k={ids.id(`bg-${equip.background}`)} />}
      {/* 2. 接地影 */}
      {showBg && <ellipse cx="160" cy="338" rx="58" ry="10" fill="#3A2E5C" opacity=".18" filter={ids.soft3} />}
      {showBg && <ellipse cx="160" cy="336" rx="70" ry="12" fill="#FFF" opacity=".22" filter={ids.soft3} />}
      {/* 3. 後ろ髪 */}
      <g transform={hairFit}><HairBack style={equip.hairStyle} c={hairC} g={hairG} ids={ids} /></g>
      {/* 4. 足 */}
      <Legs skin={skinId} pants={outfitDef.pants ?? null} ids={ids} />
      {/* 5. 腕 */}
      <Arms skin={skinId} ids={ids} />
      {/* 6. 首 */}
      <Neck skin={skinId} ids={ids} />
      {/* 7. 胴（服の下地） */}
      <Torso skin={skinId} ids={ids} />
      {/* 8. 服（oshi=推しカラー。アクセントスロットを持つ衣装が使う） */}
      {outfitDef.render({ pal: outfitDef.pal, ids, oshi: equip.oshiColor || "#E91E8C" })}
      {/* 9. 顔土台 */}
      <FaceBase skin={skinId} masc={masc} ids={ids} />
      {/* 10. チーク */}
      <Cheeks ids={ids} />
      {/* 11. 目 */}
      <Eyes eyeStyle={equip.eyeStyle} eyeColor={eyeColorId} animated={animated} detail={lod} ids={ids} />
      {/* 12. 口 */}
      <Mouth eyeStyle={equip.eyeStyle} />
      {/* 13. 前髪 */}
      <g transform={hairFit}><HairFront style={equip.hairStyle} c={hairC} g={hairG} ids={ids} /></g>
      {/* 14. メガネ */}
      {Glasses && <Glasses />}
      {/* 15. 髪飾り */}
      {Headwear && <Headwear />}
      {/* 16. 前景アクセサリー */}
      {Accessory && <Accessory />}
    </svg>
  );
}

export { C, RARITY, SKIN_TONE, HAIR_PAL, EYE_PAL };
