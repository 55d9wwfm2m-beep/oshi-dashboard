/* ============================================================
   互換レイヤー（旧 art.jsx の公開APIを維持する再エクスポート）
   ------------------------------------------------------------
   実体は以下に分離されている:
   - skeleton.js        共通スケルトン座標・レイヤー仕様・crop
   - palettes.js        カラーパレット・defs ID 名前空間
   - items.js           アイテムメタデータ（カタログ）
   - parts/*.jsx        パーツ描画レジストリ
   - AvatarSVG.jsx      合成器（レイヤースタック）
   新規アイテムの追加手順は items.js と各 parts/ の冒頭コメント参照。
   ============================================================ */
export { C, RARITY, SKIN_TONE, HAIR_PAL, EYE_PAL } from "./palettes";
export {
  SKINS, HAIRSTYLES, HAIRCOLORS, EYESTYLES, EYECOLORS,
  OUTFITS, HEADWEAR, GLASSES, ACCESSORIES, BACKGROUNDS,
} from "./items";
export { AvatarSVG } from "./AvatarSVG";
