/* ============================================================
   カラーパレット定義
   ------------------------------------------------------------
   ルール:
   - パーツの色は必ず base / shade / light(line) の3値ロールで持つ。
     単色を直書きせず3値を定義することで、色を差し替えても
     立体感（影・ハイライト）が崩れない。
   - 服の色は outfits.jsx 側で「衣装ごとの pal オブジェクト」に
     まとめる（このファイルは共通パレットのみ）。
   ============================================================ */

/** テーマ共通色（世界観のキーカラー） */
export const C = {
  lavender: "#C9C2F0",
  lavDeep: "#A99CE6",
  sakura: "#FFB6D5",
  sakuraDeep: "#FF8FBE",
  mint: "#A8E6E2",
  cream: "#FFF9FD",
  ink: "#5A4E7C",      // 目・眉・口の専用インク色
  inkSoft: "#8A7FB0",
  gold: "#F2C14E",
};

export const RARITY = {
  N: { label: "N", ring: "#B9B4D6", glow: "rgba(150,140,200,.0)" },
  R: { label: "R", ring: "#7FB0F0", glow: "rgba(120,170,255,.45)" },
  SR: { label: "SR", ring: "#C58CF0", glow: "rgba(190,130,255,.55)" },
  LE: { label: "LE", ring: "#F2C14E", glow: "rgba(255,200,80,.7)" },
};

/** 肌: base=地色 / shade=影 / line=輪郭・鼻ライン */
export const SKIN_TONE = {
  porcelain: { base: "#FFF1EC", shade: "#F2D9D1", line: "#E2BAB0" },
  light: { base: "#FFE0CE", shade: "#F3C2A6", line: "#E3A98A" },
  pinkf: { base: "#FFD8D2", shade: "#F4BBB3", line: "#E0958C" },
  medium: { base: "#F2C8A0", shade: "#E0AC7E", line: "#C9905F" },
  tan: { base: "#D7A672", shade: "#C28B53", line: "#A66F3C" },
  deep: { base: "#A86B45", shade: "#8B5435", line: "#6C3F26" },
};

/** 髪: base=地色 / shade=影 / light=ハイライト */
export const HAIR_PAL = {
  brown: { base: "#8A5A3B", shade: "#6E4429", light: "#A6764F" },
  black: { base: "#3C3A48", shade: "#26252F", light: "#565468" },
  blonde: { base: "#F1D286", shade: "#DDB358", light: "#FBE8B2" },
  pink: { base: "#FFB0CF", shade: "#F586B4", light: "#FFD3E6" },
  sky: { base: "#90AAE7", shade: "#6C86CE", light: "#B7C8F3" },
  lavender: { base: "#C9B4F0", shade: "#A98CE0", light: "#E2D4FA" },
  mint: { base: "#A6E0C7", shade: "#7CCAA7", light: "#C9EFDD" },
  silver: { base: "#D9DDE7", shade: "#B7BDCC", light: "#EFF1F7" },
  yumegrad: { base: "#C3A9EE", shade: "#A689DE", light: "#FFBEDD" },
  skygrad: { base: "#8AA6E8", shade: "#6B86CE", light: "#A9E3CB" },
};

/** 瞳: base=中間色 / light=下部の明色 / deep=上部の深色 */
export const EYE_PAL = {
  brown: { base: "#7A4E2A", light: "#C79A63", deep: "#4A2C14" },
  blue: { base: "#3F7AD6", light: "#8FC2F2", deep: "#214B9E" },
  green: { base: "#3FA877", light: "#86D9AE", deep: "#207A50" },
  pink: { base: "#E26AA0", light: "#FBAFCE", deep: "#B23E72" },
  purple: { base: "#8364D2", light: "#C0A6F0", deep: "#573B95" },
  amber: { base: "#D69431", light: "#F4C871", deep: "#9A5E16" },
};

/* ============================================================
   defs ID の名前空間化
   ------------------------------------------------------------
   フィルタ・グラデーションのIDはインスタンスごとに一意化する
   （同一ページに複数アバターを描画してもIDが衝突しない）。
   パーツは url(#...) を直書きせず、必ずこの ids 経由で参照する。
   detail='simple'（サムネイル用）ではぼかしフィルタを無効化
   （ids.soft* が undefined になり filter 属性ごと消える）。
   ============================================================ */
export function makeIds(uid, detail = "full") {
  const pfx = `av-${uid}`;
  const u = (n) => `url(#${pfx}-${n})`;
  const soft = detail === "simple" ? () => undefined : u;
  return {
    pfx,
    id: (n) => `${pfx}-${n}`,
    soft1: soft("soft1"),
    soft2: soft("soft2"),
    soft3: soft("soft3"),
    eyewhite: u("eyewhite"),
    blush: u("blush"),
    skinGlow: u("skinGlow"),
    hairGrad: (k) => u(`hairGrad-${k}`),
    irisGrad: (k) => u(`irisGrad-${k}`),
  };
}
