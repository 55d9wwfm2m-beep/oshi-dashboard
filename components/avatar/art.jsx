"use client";

/* ============================================================
   ポケコロツイン風 ちびアバター描画エンジン
   （SVGパーツ・パレット・アイテムID定義。ロジックは catalog.ts 側）
   ============================================================ */
import React from "react";
const C = {
  lavender: "#C9C2F0",
  lavDeep: "#A99CE6",
  sakura: "#FFB6D5",
  sakuraDeep: "#FF8FBE",
  mint: "#A8E6E2",
  cream: "#FFF9FD",
  ink: "#5A4E7C",
  inkSoft: "#8A7FB0",
  gold: "#F2C14E",
};

const RARITY = {
  N: { label: "N", ring: "#B9B4D6", glow: "rgba(150,140,200,.0)" },
  R: { label: "R", ring: "#7FB0F0", glow: "rgba(120,170,255,.45)" },
  SR: { label: "SR", ring: "#C58CF0", glow: "rgba(190,130,255,.55)" },
  LE: { label: "LE", ring: "#F2C14E", glow: "rgba(255,200,80,.7)" },
};

/* ---------- カラーパレット（パーツ用） ---------- */
const SKIN_TONE = {
  porcelain: { base: "#FFF1EC", shade: "#F2D9D1", line: "#E2BAB0" },
  light: { base: "#FFE0CE", shade: "#F3C2A6", line: "#E3A98A" },
  pinkf: { base: "#FFD8D2", shade: "#F4BBB3", line: "#E0958C" },
  medium: { base: "#F2C8A0", shade: "#E0AC7E", line: "#C9905F" },
  tan: { base: "#D7A672", shade: "#C28B53", line: "#A66F3C" },
  deep: { base: "#A86B45", shade: "#8B5435", line: "#6C3F26" },
};

const HAIR_PAL = {
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

const EYE_PAL = {
  brown: { base: "#7A4E2A", light: "#C79A63", deep: "#4A2C14" },
  blue: { base: "#3F7AD6", light: "#8FC2F2", deep: "#214B9E" },
  green: { base: "#3FA877", light: "#86D9AE", deep: "#207A50" },
  pink: { base: "#E26AA0", light: "#FBAFCE", deep: "#B23E72" },
  purple: { base: "#8364D2", light: "#C0A6F0", deep: "#573B95" },
  amber: { base: "#D69431", light: "#F4C871", deep: "#9A5E16" },
};

/* ============================== アイテム定義 ==============================
   source: "default" 最初から / "ach" 実績解放 / "shop" ♡で購入
   ach: 解放する実績ID  /  price: ショップ価格(♡)
*/
const SKINS = [
  { id: "porcelain", name: "とうき", rarity: "N", source: "default" },
  { id: "light", name: "ライト", rarity: "N", source: "default" },
  { id: "pinkf", name: "ピンク", rarity: "N", source: "default" },
  { id: "medium", name: "ヘルシー", rarity: "N", source: "default" },
  { id: "tan", name: "タン", rarity: "N", source: "default" },
  { id: "deep", name: "ディープ", rarity: "N", source: "default" },
];

const HAIRSTYLES = [
  { id: "short", name: "ショート", rarity: "N", source: "default" },
  { id: "bob", name: "ぱっつんボブ", rarity: "N", source: "default" },
  { id: "long", name: "ロング", rarity: "N", source: "default" },
  { id: "ponytail", name: "ポニーテール", rarity: "N", source: "default" },
  { id: "twin", name: "ツインテール", rarity: "R", source: "ach", ach: "events1" },
  { id: "braid", name: "ツイン三つ編み", rarity: "R", source: "shop", price: 280 },
  { id: "wave", name: "ウェーブロング", rarity: "SR", source: "ach", ach: "achHunter" },
  { id: "bun", name: "お団子", rarity: "R", source: "shop", price: 300 },
  { id: "hime", name: "お姫様ロング", rarity: "SR", source: "shop", price: 450 },
  /* 男性向け（中性〜地雷〜王子〜ゴシック）*/
  { id: "centerPart", name: "センターパート", rarity: "N", source: "default" },
  { id: "prince", name: "王子ヘア", rarity: "R", source: "shop", price: 260 },
  { id: "wolfMens", name: "病みウルフ", rarity: "SR", source: "shop", price: 380 },
  { id: "gothBoy", name: "ゴシックメッシュ", rarity: "SR", source: "ach", ach: "collector3" },
];

const HAIRCOLORS = [
  { id: "brown", name: "ブラウン", rarity: "N", source: "default" },
  { id: "black", name: "ブラック", rarity: "N", source: "default" },
  { id: "blonde", name: "ブロンド", rarity: "N", source: "default" },
  { id: "sky", name: "そらいろ", rarity: "N", source: "default" },
  { id: "pink", name: "さくら", rarity: "R", source: "shop", price: 150 },
  { id: "lavender", name: "ラベンダー", rarity: "R", source: "ach", ach: "goods5" },
  { id: "mint", name: "ミント", rarity: "R", source: "shop", price: 200 },
  { id: "silver", name: "シルバー", rarity: "SR", source: "ach", ach: "shine8" },
  { id: "yumegrad", name: "ゆめグラデ", rarity: "SR", source: "shop", price: 350 },
  { id: "skygrad", name: "そらグラデ", rarity: "SR", source: "ach", ach: "achHunter" },
];

const EYESTYLES = [
  { id: "round", name: "ぱっちり", rarity: "N", source: "default" },
  { id: "tareme", name: "たれ目", rarity: "N", source: "default" },
  { id: "smile", name: "にっこり", rarity: "N", source: "default" },
  { id: "sharp", name: "クール", rarity: "R", source: "shop", price: 120 },
  { id: "sparkle", name: "きらきら", rarity: "R", source: "ach", ach: "events1" },
  { id: "wink", name: "ウインク", rarity: "R", source: "shop", price: 100 },
  { id: "teary", name: "うるうる", rarity: "SR", source: "shop", price: 180 },
  { id: "heart", name: "ハートアイ", rarity: "SR", source: "shop", price: 220 },
];

const EYECOLORS = [
  { id: "brown", name: "ブラウン", rarity: "N", source: "default" },
  { id: "blue", name: "ブルー", rarity: "N", source: "default" },
  { id: "green", name: "グリーン", rarity: "N", source: "default" },
  { id: "amber", name: "アンバー", rarity: "R", source: "shop", price: 80 },
  { id: "pink", name: "ローズ", rarity: "R", source: "shop", price: 80 },
  { id: "purple", name: "推し紫", rarity: "SR", source: "ach", ach: "achHunter" },
];

const OUTFITS = [
  { id: "casual", name: "カジュアル", rarity: "N", source: "default" },
  { id: "onepiece", name: "ワンピース", rarity: "N", source: "default" },
  { id: "seifuku", name: "制服", rarity: "N", source: "default" },
  { id: "liveT", name: "ライブT", rarity: "R", source: "ach", ach: "events1" },
  { id: "idol", name: "アイドル衣装", rarity: "SR", source: "ach", ach: "queen" },
  { id: "yukata", name: "浴衣", rarity: "R", source: "ach", ach: "days7" },
  { id: "yumekawa", name: "ゆめかわワンピ", rarity: "SR", source: "shop", price: 400 },
  { id: "chiffon", name: "シフォンチュールワンピ", rarity: "SR", source: "ach", ach: "goods10" },
  { id: "prince", name: "王子様風", rarity: "LE", source: "ach", ach: "legend" },
  /* 中性〜男性向け（量産・地雷・王子・ゴシック）*/
  { id: "gakuran", name: "学ラン", rarity: "N", source: "default" },
  { id: "hoodieB", name: "オーバーパーカー", rarity: "R", source: "shop", price: 180 },
  { id: "princeB", name: "王子のシャツ", rarity: "SR", source: "shop", price: 420 },
  { id: "jiraiB", name: "地雷系ジャケット", rarity: "SR", source: "shop", price: 380 },
  { id: "gothBoyOutfit", name: "ゴシック貴族服", rarity: "LE", source: "ach", ach: "legend" },
];

const HEADWEAR = [
  { id: "none", name: "なし", rarity: "N", source: "default" },
  { id: "ribbon", name: "リボン", rarity: "N", source: "default" },
  { id: "beret", name: "ベレー帽", rarity: "R", source: "shop", price: 180 },
  { id: "cap", name: "pktwキャップ", rarity: "R", source: "ach", ach: "events5" },
  { id: "bunny", name: "うさ耳", rarity: "R", source: "shop", price: 250 },
  { id: "flower", name: "花冠", rarity: "SR", source: "ach", ach: "streak7" },
  { id: "crown", name: "ティアラ", rarity: "LE", source: "ach", ach: "legend" },
];

const GLASSES = [
  { id: "none", name: "なし", rarity: "N", source: "default" },
  { id: "round", name: "丸メガネ", rarity: "N", source: "default" },
  { id: "black", name: "黒ぶち", rarity: "R", source: "ach", ach: "money10" },
  { id: "heart", name: "ハート型", rarity: "R", source: "shop", price: 120 },
];

const ACCESSORIES = [
  { id: "none", name: "なし", rarity: "N", source: "default" },
  { id: "muffler", name: "マフラー", rarity: "N", source: "default" },
  { id: "penlight", name: "ペンライト", rarity: "R", source: "ach", ach: "events1" },
  { id: "necklace", name: "ネックレス", rarity: "R", source: "shop", price: 150 },
  { id: "headphone", name: "ヘッドホン", rarity: "SR", source: "ach", ach: "goods10" },
];

const BACKGROUNDS = [
  { id: "dream", name: "ゆめパステル", rarity: "N", source: "default" },
  { id: "studio", name: "スタジオ", rarity: "N", source: "default" },
  { id: "cafe", name: "カフェ", rarity: "N", source: "default" },
  { id: "night", name: "夜空", rarity: "R", source: "ach", ach: "collector3" },
  { id: "stage", name: "ステージ", rarity: "SR", source: "ach", ach: "queen" },
  { id: "sakura", name: "さくら", rarity: "R", source: "shop", price: 200 },
  { id: "ocean", name: "うみべ", rarity: "R", source: "shop", price: 200 },
];

const CATEGORIES = [
  { key: "outfit", label: "服", icon: "👗", items: OUTFITS },
  { key: "hairStyle", label: "髪型", icon: "💇", items: HAIRSTYLES },
  { key: "hairColor", label: "髪色", icon: "🎨", items: HAIRCOLORS },
  { key: "eyeStyle", label: "目", icon: "👁", items: EYESTYLES },
  { key: "eyeColor", label: "瞳", icon: "✨", items: EYECOLORS },
  { key: "glasses", label: "メガネ", icon: "👓", items: GLASSES },
  { key: "headwear", label: "あたま", icon: "🎀", items: HEADWEAR },
  { key: "accessory", label: "小物", icon: "💎", items: ACCESSORIES },
  { key: "background", label: "背景", icon: "🌈", items: BACKGROUNDS },
  { key: "skin", name: "skin", label: "はだ", icon: "🧒", items: SKINS },
];

/* ============================== SVGパーツ ============================== */
/* --- 背景 --- */
function Background({ id }) {
  const k = `bg-${id}`;
  const star = (x, y, r, c = "#FFF", o = 1) =>
    <path key={`${x}-${y}`} d={`M${x},${y - r} L${x + r * 0.28},${y - r * 0.28} L${x + r},${y} L${x + r * 0.28},${y + r * 0.28} L${x},${y + r} L${x - r * 0.28},${y + r * 0.28} L${x - r},${y} L${x - r * 0.28},${y - r * 0.28} Z`} fill={c} opacity={o} />;
  const cloud = (x, y, s, o = 0.8) =>
    <g key={`c${x}-${y}`} opacity={o} fill="#FFF" transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="26" ry="15" /><ellipse cx="-20" cy="4" rx="16" ry="11" /><ellipse cx="20" cy="4" rx="18" ry="12" /><ellipse cx="0" cy="8" rx="30" ry="10" />
    </g>;

  if (id === "dream")
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
  if (id === "studio")
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
  if (id === "cafe")
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
  if (id === "night")
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
  if (id === "stage")
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
  if (id === "sakura")
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
  // ocean
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

/* --- 後ろ髪 --- */
function HairBack({ style, ck }) {
  const c = HAIR_PAL[ck];
  const g = `url(#hairGrad-${ck})`;
  const crown = <ellipse cx="160" cy="104" rx="66" ry="58" fill={g} />;
  switch (style) {
    case "bob":
      return <g>
        <path d="M96,110 C92,150 104,176 124,184 L196,184 C216,176 228,150 224,110 C224,80 200,58 160,58 C120,58 96,80 96,110 Z" fill={g} />
        <path d="M100,120 C98,150 108,174 122,180 C112,162 108,140 110,120 Z" fill={c.light} opacity=".4" />
        <path d="M220,120 C222,150 212,174 198,180 C208,162 212,140 210,120 Z" fill={c.light} opacity=".4" />
      </g>;
    case "long":
      return <g>
        <path d="M94,112 C74,210 84,300 102,326 L126,326 C114,256 116,160 124,112 Z" fill={g} />
        <path d="M226,112 C246,210 236,300 218,326 L194,326 C206,256 204,160 196,112 Z" fill={g} />
        {crown}
        <path d="M104,150 C96,220 100,290 108,322 C104,256 104,196 110,150 Z" fill={c.light} opacity=".5" />
        <path d="M216,150 C224,220 220,290 212,322 C216,256 216,196 210,150 Z" fill={c.light} opacity=".5" />
        <path d="M120,140 C114,210 116,280 122,324 L132,324 C124,264 124,184 130,140 Z" fill={c.shade} opacity=".35" />
        <path d="M200,140 C206,210 204,280 198,324 L188,324 C196,264 196,184 190,140 Z" fill={c.shade} opacity=".35" />
      </g>;
    case "hime":
      return <g>
        <path d="M96,112 C80,214 90,306 108,330 L130,330 C118,256 118,158 126,112 Z" fill={g} />
        <path d="M224,112 C240,214 230,306 212,330 L190,330 C202,256 202,158 194,112 Z" fill={g} />
        {crown}
        <path d="M108,150 C100,224 104,296 112,326 C108,258 108,196 114,150 Z" fill={c.light} opacity=".5" />
        <path d="M212,150 C220,224 216,296 208,326 C212,258 212,196 206,150 Z" fill={c.light} opacity=".5" />
      </g>;
    case "wave":
      return <g>
        <path d="M92,110 C70,170 100,200 80,244 C108,266 96,308 118,330 L132,326 C114,250 118,158 126,110 Z" fill={g} />
        <path d="M228,110 C250,170 220,200 240,244 C212,266 224,308 202,330 L188,326 C206,250 202,158 194,110 Z" fill={g} />
        {crown}
        <ellipse cx="116" cy="240" rx="12" ry="20" fill={c.shade} opacity=".4" /><ellipse cx="204" cy="240" rx="12" ry="20" fill={c.shade} opacity=".4" />
        <path d="M104,150 C92,200 110,228 96,266 C112,250 108,300 116,326 C106,260 108,196 112,150 Z" fill={c.light} opacity=".45" />
        <path d="M216,150 C228,200 210,228 224,266 C208,250 212,300 204,326 C214,260 212,196 208,150 Z" fill={c.light} opacity=".45" />
      </g>;
    case "twin":
      return <g>{crown}
        <path d="M78,140 C44,176 50,250 78,282 C100,266 96,196 106,150 Z" fill={g} />
        <path d="M242,140 C276,176 270,250 242,282 C220,266 224,196 214,150 Z" fill={g} />
        <circle cx="86" cy="138" r="11" fill={c.shade} /><circle cx="234" cy="138" r="11" fill={c.shade} />
        <path d="M84,156 C64,186 68,244 82,272 C90,244 88,196 96,160 Z" fill={c.light} opacity=".45" />
        <path d="M236,156 C256,186 252,244 238,272 C230,244 232,196 224,160 Z" fill={c.light} opacity=".45" />
      </g>;
    case "ponytail":
      return <g>{crown}
        <path d="M208,112 C264,144 256,262 224,302 C212,290 212,196 192,148 Z" fill={g} />
        <path d="M212,124 C252,152 246,254 226,296 C220,248 216,188 202,150 Z" fill={c.light} opacity=".45" />
        <circle cx="206" cy="120" r="10" fill={c.shade} />
      </g>;
    case "braid":
      return <g>{crown}
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={"l" + i} cx={90 + i} cy={150 + i * 30} rx={13 - i * 1.4} ry="14" fill={g} />)}
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={"r" + i} cx={230 - i} cy={150 + i * 30} rx={13 - i * 1.4} ry="14" fill={g} />)}
        {[0, 1, 2, 3].map((i) => <path key={"sl" + i} d={`M${80 + i},${158 + i * 30} q11,5 22,0`} stroke={c.shade} strokeWidth="1.6" fill="none" opacity=".4" />)}
        <circle cx="92" cy="140" r="10" fill={c.shade} /><circle cx="228" cy="140" r="10" fill={c.shade} />
      </g>;
    case "bun":
      return <g>{crown}
        <circle cx="128" cy="54" r="22" fill={g} /><circle cx="192" cy="54" r="22" fill={g} />
        <circle cx="122" cy="48" r="7" fill={c.light} opacity=".6" /><circle cx="186" cy="48" r="7" fill={c.light} opacity=".6" />
        <path d="M128,54 a22,22 0 0 1 0,44" fill={c.shade} opacity=".3" /><path d="M192,54 a22,22 0 0 0 0,44" fill={c.shade} opacity=".3" />
      </g>;
    case "centerPart":
      return <g>
        <path d="M96,108 C92,144 102,168 124,178 L196,178 C218,168 228,144 224,108 C224,76 200,58 160,58 C120,58 96,76 96,108 Z" fill={g} />
        <path d="M100,118 C98,148 108,170 120,176 C112,160 106,138 108,118 Z" fill={c.light} opacity=".4" filter="url(#soft2)" />
        <path d="M220,118 C222,148 212,170 200,176 C208,160 214,138 212,118 Z" fill={c.light} opacity=".4" filter="url(#soft2)" />
        <path d="M118,136 C112,160 116,176 124,178 C118,162 116,144 118,134 Z" fill={c.shade} opacity=".35" filter="url(#soft1)" />
        <path d="M202,136 C208,160 204,176 196,178 C202,162 204,144 202,134 Z" fill={c.shade} opacity=".35" filter="url(#soft1)" />
      </g>;
    case "prince":
      return <g>{crown}
        <path d="M94,110 C84,160 92,200 108,224 L130,222 C118,180 116,140 122,108 Z" fill={g} />
        <path d="M226,110 C236,160 228,200 212,224 L190,222 C202,180 204,140 198,108 Z" fill={g} />
        <path d="M98,120 C90,158 96,192 108,216 C102,180 100,144 106,116 Z" fill={c.light} opacity=".5" filter="url(#soft2)" />
        <path d="M222,120 C230,158 224,192 212,216 C218,180 220,144 214,116 Z" fill={c.light} opacity=".5" filter="url(#soft2)" />
      </g>;
    case "wolfMens":
      return <g>{crown}
        {/* 病みウルフ：ふぞろいの長さ・毛先がギザ */}
        <path d="M92,110 C76,180 86,236 110,256 L130,250 C114,200 118,144 124,108 Z" fill={g} />
        <path d="M228,110 C244,180 234,236 210,256 L190,250 C206,200 202,144 196,108 Z" fill={g} />
        {/* ギザの毛先 */}
        <path d="M110,250 l4,12 l4,-8 l4,12 l4,-10 l4,8 l-2,-22 Z" fill={g} />
        <path d="M210,250 l-4,12 l-4,-8 l-4,12 l-4,-10 l-4,8 l2,-22 Z" fill={g} />
        <path d="M98,130 C88,180 96,224 108,244 C104,196 102,156 106,128 Z" fill={c.light} opacity=".5" filter="url(#soft2)" />
        <path d="M222,130 C232,180 224,224 212,244 C216,196 218,156 214,128 Z" fill={c.light} opacity=".5" filter="url(#soft2)" />
        <path d="M124,134 C118,180 122,224 130,250 L138,250 C130,210 128,168 132,134 Z" fill={c.shade} opacity=".35" filter="url(#soft1)" />
        <path d="M196,134 C202,180 198,224 190,250 L182,250 C190,210 192,168 188,134 Z" fill={c.shade} opacity=".35" filter="url(#soft1)" />
      </g>;
    case "gothBoy":
      return <g>{crown}
        <path d="M92,108 C72,200 84,288 108,318 L132,314 C118,250 120,158 126,108 Z" fill={g} />
        <path d="M228,108 C248,200 236,288 212,318 L188,314 C202,250 200,158 194,108 Z" fill={g} />
        {/* メッシュ（白/銀の縦帯） */}
        <path d="M100,118 C92,200 98,270 110,310" stroke={c.light} strokeWidth="6" fill="none" opacity=".6" filter="url(#soft1)" />
        <path d="M118,120 C112,210 116,280 124,310" stroke="#FFF" strokeWidth="3" fill="none" opacity=".5" filter="url(#soft1)" />
        <path d="M220,118 C228,200 222,270 210,310" stroke={c.light} strokeWidth="6" fill="none" opacity=".6" filter="url(#soft1)" />
        <path d="M202,120 C208,210 204,280 196,310" stroke="#FFF" strokeWidth="3" fill="none" opacity=".5" filter="url(#soft1)" />
      </g>;
    default: // short
      return <g><ellipse cx="160" cy="108" rx="70" ry="60" fill={g} />
        <path d="M94,140 C90,166 96,184 106,196 C100,176 100,158 104,140 Z" fill={c.shade} opacity=".3" />
        <path d="M226,140 C230,166 224,184 214,196 C220,176 220,158 216,140 Z" fill={c.shade} opacity=".3" />
      </g>;
  }
}

/* --- 前髪 --- */
function HairFront({ style, ck }) {
  const c = HAIR_PAL[ck];
  const g = `url(#hairGrad-${ck})`;
  const blunt = style === "bob" || style === "hime";
  const roundedBangs = (
    <g>
      <path d="M106,122 C104,66 124,56 160,56 C196,56 216,66 214,122 C209,92 192,84 180,102 C175,84 166,82 160,102 C154,82 145,84 140,102 C128,84 111,92 106,122 Z" fill={g} />
      <path d="M214,122 C209,92 192,84 180,102 C190,94 204,96 214,122 Z" fill={c.shade} opacity=".45" />
      <path d="M106,122 C111,92 128,84 140,102 C130,94 116,96 106,122 Z" fill={c.shade} opacity=".35" />
      <path d="M160,102 C166,86 176,84 180,102 C174,94 166,94 160,102 Z" fill={c.shade} opacity=".3" />
      <path d="M150,62 C140,80 132,94 126,104 C132,86 142,70 150,62 Z" fill={c.light} opacity=".7" />
    </g>
  );
  const bluntBangs = (
    <g>
      <path d="M108,116 C106,62 126,54 160,54 C194,54 214,62 212,116 C212,119 209,121 204,121 L116,121 C111,121 108,119 108,116 Z" fill={g} />
      <path d="M118,118 q42,9 84,0 l0,4 q-42,8 -84,0 Z" fill={c.shade} opacity=".35" />
      <path d="M120,60 C116,82 116,100 118,116 L126,116 C124,98 124,80 128,62 Z" fill={c.light} opacity=".5" />
      <path d="M148,60 C146,82 146,100 148,116 L154,116 C152,98 152,80 154,62 Z" fill={c.light} opacity=".3" />
    </g>
  );
  const sideLocks = (
    <g>
      <path d="M104,116 C98,168 104,206 116,232 C110,194 110,154 112,114 Z" fill={g} />
      <path d="M216,116 C222,168 216,206 204,232 C210,194 210,154 208,114 Z" fill={g} />
      <path d="M108,124 C104,168 108,202 116,226 C112,192 112,156 114,124 Z" fill={c.light} opacity=".4" />
      <path d="M212,124 C216,168 212,202 204,226 C208,192 208,156 206,124 Z" fill={c.light} opacity=".4" />
    </g>
  );
  const himeLocks = (
    <g>
      <path d="M104,112 C100,150 104,178 110,192 L124,192 C118,168 114,138 114,112 Z" fill={g} />
      <path d="M216,112 C220,150 216,178 210,192 L196,192 C202,168 206,138 206,112 Z" fill={g} />
      <path d="M106,116 C104,150 106,176 111,188 C108,160 108,140 110,116 Z" fill={c.light} opacity=".45" />
      <path d="M214,116 C216,150 214,176 209,188 C212,160 212,140 210,116 Z" fill={c.light} opacity=".45" />
      <path d="M104,188 q10,5 20,0 l0,5 q-10,5 -20,0 Z" fill={c.shade} opacity=".4" />
      <path d="M196,188 q10,5 20,0 l0,5 q-10,5 -20,0 Z" fill={c.shade} opacity=".4" />
    </g>
  );
  const centerPartBangs = (
    <g>
      <path d="M108,120 C104,68 130,56 160,56 C190,56 216,68 212,120 C200,98 174,86 160,108 C146,86 120,98 108,120 Z" fill={g} />
      {/* 真ん中の分け目（額の三角の透明部分） */}
      <path d="M156,72 L160,108 L164,72 Z" fill={c.shade} opacity=".55" />
      <path d="M108,120 C112,90 130,80 160,108 C140,96 122,100 108,120 Z" fill={c.shade} opacity=".4" filter="url(#soft1)" />
      <path d="M212,120 C208,90 190,80 160,108 C180,96 198,100 212,120 Z" fill={c.shade} opacity=".4" filter="url(#soft1)" />
      <path d="M124,72 C118,90 114,108 116,118 C120,100 128,82 134,68 Z" fill={c.light} opacity=".6" filter="url(#soft2)" />
      <path d="M196,72 C202,90 206,108 204,118 C200,100 192,82 186,68 Z" fill={c.light} opacity=".6" filter="url(#soft2)" />
    </g>
  );
  const princeBangs = (
    <g>
      {/* 王子：流し前髪（左から右へ） */}
      <path d="M104,118 C100,64 126,54 160,54 C194,54 218,64 216,118 C206,96 188,86 170,98 C156,88 138,90 122,104 C112,92 108,108 104,118 Z" fill={g} />
      <path d="M122,68 C112,86 106,104 110,118 C116,98 124,82 134,66 Z" fill={c.light} opacity=".7" filter="url(#soft2)" />
      <path d="M170,98 C188,86 206,96 216,118 C202,102 184,98 170,98 Z" fill={c.shade} opacity=".5" filter="url(#soft1)" />
      <path d="M138,92 C152,86 168,90 178,100 C168,96 154,98 140,108 Z" fill={c.shade} opacity=".35" filter="url(#soft1)" />
    </g>
  );
  const wolfMensBangs = (
    <g>
      {/* 病みウルフ：束で割れた前髪・目にかかる */}
      <path d="M104,122 C100,68 128,56 160,56 C192,56 220,68 216,122 C208,108 196,102 188,116 L182,108 L174,118 L168,108 L160,120 L152,108 L146,118 L138,108 L132,116 C124,102 112,108 104,122 Z" fill={g} />
      <path d="M104,122 C108,100 124,96 132,116 C120,108 110,114 104,122 Z" fill={c.shade} opacity=".5" filter="url(#soft1)" />
      <path d="M216,122 C212,100 196,96 188,116 C200,108 210,114 216,122 Z" fill={c.shade} opacity=".5" filter="url(#soft1)" />
      <path d="M124,66 C116,86 110,104 114,120 C120,100 130,80 138,64 Z" fill={c.light} opacity=".55" filter="url(#soft2)" />
    </g>
  );
  const gothBoyBangs = (
    <g>
      {/* ゴシック：重め前髪＋メッシュ */}
      <path d="M104,124 C100,64 124,54 160,54 C196,54 220,64 216,124 C216,128 210,130 204,130 L116,130 C110,130 104,128 104,124 Z" fill={g} />
      <path d="M116,128 q44,10 88,0 l0,6 q-44,8 -88,0 Z" fill={c.shade} opacity=".5" filter="url(#soft1)" />
      <path d="M132,62 C128,90 130,114 134,128 L142,128 C140,108 140,84 144,62 Z" fill={c.light} opacity=".55" filter="url(#soft2)" />
      <path d="M176,62 C172,90 174,114 178,128 L186,128 C184,108 184,84 188,62 Z" fill="#FFF" opacity=".5" filter="url(#soft2)" />
      <path d="M154,62 C150,90 152,114 156,128 L162,128 C160,108 160,84 164,62 Z" fill={c.shade} opacity=".45" filter="url(#soft1)" />
    </g>
  );
  const crownShine = <ellipse cx="148" cy="72" rx="34" ry="11" fill={c.light} opacity=".5" transform="rotate(-9 148 72)" filter="url(#soft2)" />;
  const foreheadShadow = <path d="M112,112 Q160,128 208,112 Q160,134 112,112 Z" fill="#3A2E4A" opacity=".12" filter="url(#soft3)" />;
  /* 男性髪の前髪選択 */
  let menBangs = null;
  if (style === "centerPart") menBangs = centerPartBangs;
  else if (style === "prince") menBangs = princeBangs;
  else if (style === "wolfMens") menBangs = wolfMensBangs;
  else if (style === "gothBoy") menBangs = gothBoyBangs;
  const framing = style === "hime" ? himeLocks
    : (["long", "wave", "twin", "ponytail", "braid"].includes(style) ? sideLocks : null);
  return <g>{framing}{menBangs ? menBangs : (blunt ? bluntBangs : roundedBangs)}{foreheadShadow}{crownShine}</g>;
}

/* --- 体（肌＋ベース） --- */
function Body({ skin, pants }) {
  const s = SKIN_TONE[skin];
  const legColor = pants ? pants.base : s.base;
  const legShade = pants ? pants.shade : s.shade;
  const legHi = pants ? pants.light : "#FFF";
  const shoe = (cx) => (
    <g>
      <ellipse cx={cx} cy="333" rx="10" ry="3.2" fill="#CBBEDF" filter="url(#soft1)" />
      <path d={`M${cx - 8},318 C${cx - 9},328 ${cx - 3},332 ${cx + 4},332 L${cx + 9},332 C${cx + 10},325 ${cx + 8},319 ${cx + 5},317 Z`} fill={pants ? pants.shoe : "#FFFFFF"} stroke={pants ? pants.shoeLine : "#E4D9EF"} strokeWidth="1" />
      {!pants && <path d={`M${cx - 6},320 q7,4 12,0`} stroke="#FF9FC4" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
      {!pants && <circle cx={cx + 1} cy="321" r="1.6" fill="#FF9FC4" />}
      <ellipse cx={cx - 2} cy="322" rx="3" ry="2" fill="#FFF" opacity=".5" filter="url(#soft1)" />
    </g>
  );
  const leg = (cx) => (
    <g>
      <path d={`M${cx},248 C${cx - 1},278 ${cx - 1},300 ${cx},312`} stroke={legColor} strokeWidth={pants ? 13 : 10.5} fill="none" strokeLinecap="round" />
      <path d={`M${cx - 3},258 C${cx - 4},280 ${cx - 4},296 ${cx - 3},308`} stroke={legShade} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".35" filter="url(#soft1)" />
      <path d={`M${cx + 3},262 C${cx + 3},280 ${cx + 3},296 ${cx + 3},306`} stroke={legHi} strokeWidth="2" fill="none" strokeLinecap="round" opacity={pants ? ".3" : ".4"} filter="url(#soft1)" />
    </g>
  );
  const arm = (sx, hx, sign) => (
    <g>
      <path d={`M${sx},196 C${sx + sign * 6},206 ${hx + sign * 2},226 ${hx},244`} stroke={s.base} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx={hx} cy="246" r="6" fill={s.base} />
      <path d={`M${sx + sign * 2},202 C${sx + sign * 7},212 ${hx + sign * 3},228 ${hx + sign * 1},240`} stroke={s.shade} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".3" filter="url(#soft1)" />
    </g>
  );
  return (
    <g>
      {leg(150)}{leg(170)}
      {shoe(150)}{shoe(170)}
      {arm(142, 136, -1)}{arm(178, 184, 1)}
      {/* 細い首 */}
      <path d="M154,178 h12 v12 q-6,5 -12,0 Z" fill={s.base} />
      <path d="M154,182 q6,5 12,0 l0,4 q-6,5 -12,0 Z" fill={s.shade} opacity=".5" filter="url(#soft1)" />
      {/* 胴ベース（服の下地）：肩46・ウエスト40 */}
      <path d="M137,192 C137,185 183,185 183,192 L180,244 C180,254 140,254 140,244 Z" fill={s.base} />
      <path d="M137,192 C137,185 183,185 183,192 L181,210 C168,218 152,218 139,210 Z" fill="#FFF" opacity=".18" filter="url(#soft2)" />
    </g>
  );
}

/* 衣装ID→ズボン色（指定がない衣装は素肌色＝脚出し） */
const PANTS_BY_OUTFIT = {
  gakuran: { base: "#1A1A2E", shade: "#101022", light: "#2A2A48", shoe: "#1F1B2E", shoeLine: "#0F0D1F" },
  hoodieB: { base: "#454C6B", shade: "#2F344F", light: "#5C658A", shoe: "#FFFFFF", shoeLine: "#D4DCEF" },
  princeB: { base: "#FFF6E8", shade: "#E7DDC8", light: "#FFFFFF", shoe: "#7A4B66", shoeLine: "#502E44" },
  jiraiB: { base: "#1F1A2E", shade: "#15102A", light: "#3A3252", shoe: "#1A1828", shoeLine: "#0F0D1F" },
  gothBoyOutfit: { base: "#15131F", shade: "#0A0815", light: "#28253A", shoe: "#0F0D1A", shoeLine: "#04030A" },
  prince: { base: "#3A3550", shade: "#26223A", light: "#56506E", shoe: "#2C2742", shoeLine: "#15122A" },
};

/* --- 服 --- */
function Outfit({ id }) {
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
  switch (id) {
    case "onepiece":
      return <g>
        {puff("#F6C9DF")}
        {skirt("#F6C9DF", 296, 36)}
        <path d="M148,240 L172,240 L188,272 L132,272 Z" fill="#FBDCEC" />
        {ruffle(294, 36, "#FFFFFF", 7, 14)}
        {ruffle(280, 30, "#FBDCEC", 6, 12)}
        {bodice("#FBDCEC")}
        <rect x="146" y="239" width="28" height="6" rx="3" fill={C.lavDeep} opacity=".4" />
        <path d="M150,184 q10,9 20,0 l-4,7 h-12 Z" fill="#FFF" />
        <path d="M160,200 q-11,-6 -2,8 q-11,2 2,6 q13,-4 2,-6 q11,-14 -2,-8 Z" fill={C.sakuraDeep} />
        <circle cx="160" cy="208" r="2.6" fill="#FFF" opacity=".85" />
      </g>;
    case "seifuku":
      return <g>
        {sleeves("#3B4A7A", 11)}
        {bodice("#3B4A7A")}
        <path d="M146,186 L160,204 L174,186 L182,192 L160,222 L138,192 Z" fill="#FFF" />
        <path d="M157,204 L163,204 L161,224 L159,224 Z" fill="#E0556B" />
        <path d="M148,242 L172,242 L190,292 L130,292 Z" fill="#2E3A63" />
        {[136, 148, 160, 172, 184].map((x, i) => <line key={i} x1={x} y1="246" x2={160 + (x - 160) * 1.6} y2="290" stroke="#46568C" strokeWidth="1.6" />)}
      </g>;
    case "liveT":
      return <g>
        {sleeves("#2C2C38", 11)}
        <path d="M145,189 C145,183 175,183 175,189 L174,250 C174,256 146,256 146,250 Z" fill="#2C2C38" />
        <text x="160" y="232" fontSize="20" textAnchor="middle" fill={C.gold} fontWeight="bold">推</text>
        <path d="M147,250 L173,250 L176,270 L161,265 L144,270 Z" fill="#5B5B70" />
      </g>;
    case "idol":
      return <g>
        {puff("#FFE3F0")}
        {skirt("#C9C2F0", 300, 40)}
        {skirt("#FFD0E6", 292, 34)}
        {ruffle(298, 40, "#FFFFFF", 8, 14)}
        {ruffle(286, 32, "#FFE3F0", 7, 12)}
        {bodice("#FFE3F0")}
        <path d="M146,240 q14,7 28,0" stroke={C.gold} strokeWidth="2.2" fill="none" />
        <circle cx="160" cy="206" r="4" fill={C.gold} /><circle cx="160" cy="222" r="3" fill={C.gold} />
        <path d="M146,196 l14,-7 l14,7 l-6,9 h-16 Z" fill={C.sakuraDeep} />
        <path d="M140,196 q-10,4 -12,12 q10,-4 16,-8 Z" fill="#FFF" />
        <path d="M180,196 q10,4 12,12 q-10,-4 -16,-8 Z" fill="#FFF" />
      </g>;
    case "yukata":
      return <g>
        {sleeves("#BFD9F2", 13, true)}
        <path d="M146,189 L174,189 L186,300 L134,300 Z" fill="#BFD9F2" />
        <path d="M160,189 L146,210 L160,220 Z" fill="#FFF" />
        <path d="M160,189 L174,210 L160,220 Z" fill="#E8F0FB" />
        <rect x="138" y="244" width="44" height="14" fill={C.sakuraDeep} />
        <rect x="138" y="244" width="44" height="4" fill={C.gold} opacity=".7" />
        {[[148, 214], [176, 224], [150, 278], [178, 282]].map(([x, y], i) =>
          <path key={i} d={`M${x},${y} q3,-5 6,0 q3,5 0,8 q-3,-3 -6,0 q-3,-5 0,-8`} fill="#FF9EC6" />)}
      </g>;
    case "yumekawa":
      return <g>
        {puff("#E3D6FA")}
        {skirt("#FFDDEE", 298, 38)}
        <path d="M148,240 L172,240 L186,272 L134,272 Z" fill="#C9BCF0" />
        {ruffle(296, 38, "#FFFFFF", 8, 14)}
        {ruffle(282, 30, "#FFDDEE", 6, 12)}
        {bodice("#E3D6FA")}
        {[[146, 288], [174, 290], [160, 300]].map(([x, y], i) =>
          <path key={i} d={`M${x},${y} q3,-5 6,0 q3,5 0,8 q-3,-3 -6,0 q-3,-5 0,-8`} fill={C.sakuraDeep} />)}
        <circle cx="160" cy="204" r="5" fill="#FFF" />
        <path d="M150,184 q10,8 20,0" stroke="#FFF" strokeWidth="2.4" fill="none" />
      </g>;
    case "chiffon":
      return <g>
        {puff("#323B6E")}
        {skirt("#2C3566", 302, 42)}
        {skirt("#3A4680", 294, 36)}
        {ruffle(300, 42, "#3A4680", 9, 14)}
        {ruffle(288, 34, "#46538F", 8, 12)}
        {bodice("#323B6E")}
        <rect x="146" y="239" width="28" height="6" rx="3" fill="#1F2750" />
        <path d="M134,196 Q160,190 186,196 Q188,210 160,216 Q132,210 134,196 Z" fill="#EEF1FB" />
        <path d="M136,198 Q160,194 184,198 Q184,206 160,210 Q136,206 136,198 Z" fill="#FFF" />
        {[142, 152, 162, 172, 180].map((x, i) => <path key={i} d={`M${x},208 q0,4 2,7`} stroke="#C9D2EC" strokeWidth="1.3" fill="none" />)}
        <circle cx="170" cy="212" r="4" fill="#FFF" /><circle cx="170" cy="212" r="2" fill="#D6DEF2" />
      </g>;
    case "prince":
      return <g>
        <path d="M140,192 C112,200 104,250 118,300 L134,296 C124,256 128,216 144,198 Z" fill="#9A2C44" />
        {sleeves("#F4EFE6", 12, true)}
        <path d="M146,189 C146,183 174,183 174,189 L172,266 L148,266 Z" fill="#F4EFE6" />
        <path d="M158,189 L154,266 L166,266 L162,189 Z" fill="#E7DCC6" />
        {[0, 1].map((i) => <circle key={i} cx="160" cy={210 + i * 20} r="3.4" fill={C.gold} />)}
        <path d="M146,190 L160,190 L156,210 L148,212 Z" fill={C.gold} opacity=".85" />
        <path d="M150,250 L170,250 L173,298 L160,294 L147,298 Z" fill="#3A3550" />
        <path d="M153,296 C152,308 152,312 152,316" stroke="#3A3550" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M167,296 C168,308 168,312 168,316" stroke="#3A3550" strokeWidth="9" fill="none" strokeLinecap="round" />
      </g>;
    case "gakuran":
      return <g>
        {/* 学ラン（黒・立ち襟・金ボタン） */}
        {sleeves("#1A1A2E", 13)}
        <path d="M137,192 C137,185 183,185 183,192 L181,250 C181,256 139,256 139,250 Z" fill="#1A1A2E" />
        {/* 立ち襟 */}
        <path d="M144,192 L160,200 L176,192 L172,206 L160,212 L148,206 Z" fill="#252544" />
        <path d="M158,200 L162,200 L161,250 L159,250 Z" fill="#2C2C44" />
        {/* 金ボタン */}
        {[208, 222, 236].map((y, i) => <circle key={i} cx="160" cy={y} r="2.2" fill={C.gold} />)}
        {/* 影＋ハイライト */}
        <path d="M137,192 L141,192 L143,250 L139,250 Z" fill="#0F0F22" opacity=".7" filter="url(#soft1)" />
        <path d="M179,192 L183,192 L181,250 L177,250 Z" fill="#2A2A48" opacity=".6" filter="url(#soft1)" />
      </g>;
    case "hoodieB":
      return <g>
        {/* ビッグパーカー（中性・量産・くすみカラー） */}
        <path d="M132,202 C124,206 122,228 132,246 C140,234 142,216 148,206 Z" fill="#7A8AA8" />
        <path d="M188,202 C196,206 198,228 188,246 C180,234 178,216 172,206 Z" fill="#7A8AA8" />
        <path d="M132,195 C132,188 188,188 188,195 L186,256 C186,262 134,262 134,256 Z" fill="#A8B5CE" />
        {/* フード */}
        <path d="M134,196 C124,180 130,170 160,170 C190,170 196,180 186,196 C176,184 144,184 134,196 Z" fill="#7A8AA8" />
        <path d="M138,196 C130,184 138,176 160,176 C182,176 190,184 182,196 C172,186 148,186 138,196 Z" fill="#94A3BF" opacity=".7" filter="url(#soft1)" />
        {/* ドローコード */}
        <path d="M154,202 L152,224" stroke="#FFF" strokeWidth="1.6" /><circle cx="152" cy="226" r="2" fill="#FFF" />
        <path d="M166,202 L168,224" stroke="#FFF" strokeWidth="1.6" /><circle cx="168" cy="226" r="2" fill="#FFF" />
        {/* ハイライト＆影 */}
        <path d="M134,196 C134,192 186,192 186,196 L184,220 C170,228 150,228 136,220 Z" fill="#FFF" opacity=".18" filter="url(#soft2)" />
        <path d="M134,250 L186,250 L185,258 L135,258 Z" fill="#5C6886" opacity=".5" filter="url(#soft1)" />
      </g>;
    case "princeB":
      return <g>
        {/* 王子の白シャツ＋ジャボ＋ベスト */}
        {sleeves("#FFFFFF", 12, true)}
        <path d="M137,192 C137,185 183,185 183,192 L181,250 C181,256 139,256 139,250 Z" fill="#F8F0E0" />
        {/* ベスト（ワインレッド） */}
        <path d="M145,196 L160,202 L175,196 L173,250 L147,250 Z" fill="#7A2E48" />
        <path d="M158,202 L162,202 L161,250 L159,250 Z" fill="#5C2236" />
        {/* ジャボ（フリル襟） */}
        <path d="M150,192 Q160,188 170,192 Q172,202 160,206 Q148,202 150,192 Z" fill="#FFFFFF" />
        <path d="M152,194 Q160,191 168,194 Q168,200 160,202 Q152,200 152,194 Z" fill="#F2E9D8" />
        {[154, 160, 166].map((x, i) => <circle key={i} cx={x} cy="200" r="1.2" fill="#D8C9A8" />)}
        {/* 金ボタン */}
        {[212, 226, 240].map((y, i) => <circle key={i} cx="160" cy={y} r="1.8" fill={C.gold} />)}
        {/* ハイライト */}
        <path d="M147,196 L149,196 L149,250 L147,250 Z" fill="#FFF" opacity=".5" filter="url(#soft1)" />
      </g>;
    case "jiraiB":
      return <g>
        {/* 地雷系ボーイ：黒ジャケ＋十字ハーネス＋ピンク差し色 */}
        {sleeves("#1F1A2E", 13)}
        <path d="M137,192 C137,185 183,185 183,192 L181,250 C181,256 139,256 139,250 Z" fill="#1F1A2E" />
        {/* インナー白 */}
        <path d="M152,192 L168,192 L168,250 L152,250 Z" fill="#F0EAF4" />
        {/* ハーネス（十字） */}
        <path d="M148,196 L172,222" stroke="#3A3252" strokeWidth="3" strokeLinecap="round" />
        <path d="M172,196 L148,222" stroke="#3A3252" strokeWidth="3" strokeLinecap="round" />
        <circle cx="160" cy="209" r="3" fill="#E26AA0" />
        {/* チョーカー */}
        <path d="M150,184 q10,5 20,0" stroke="#1F1A2E" strokeWidth="3" fill="none" />
        <path d="M158,186 q2,4 4,0 q-2,-3 -4,0 Z" fill="#E26AA0" />
        {/* チェーン（ピンク） */}
        {[228, 234, 240].map((y, i) => <circle key={i} cx={146 + i * 2} cy={y} r="1.2" fill="#E26AA0" />)}
        {/* 影＆ハイライト */}
        <path d="M137,192 L141,192 L143,250 L139,250 Z" fill="#0F0D1A" opacity=".7" filter="url(#soft1)" />
        <path d="M179,192 L183,192 L181,250 L177,250 Z" fill="#3A3252" opacity=".6" filter="url(#soft1)" />
      </g>;
    case "gothBoyOutfit":
      return <g>
        {/* ゴシック貴族服：紫マント＋黒ベスト＋クラバット */}
        {/* マント */}
        <path d="M134,194 C108,210 100,260 116,310 L138,304 C128,260 132,224 144,200 Z" fill="#3A2548" />
        <path d="M186,194 C212,210 220,260 204,310 L182,304 C192,260 188,224 176,200 Z" fill="#3A2548" />
        <path d="M138,200 C124,220 122,260 130,300 C124,260 130,228 144,206 Z" fill="#5A3A70" opacity=".6" filter="url(#soft2)" />
        {/* 袖 */}
        {sleeves("#15131F", 12, true)}
        {/* 中の白シャツ */}
        <path d="M147,192 C147,186 173,186 173,192 L172,250 L148,250 Z" fill="#F0EAEC" />
        {/* ベスト（黒・銀刺繍） */}
        <path d="M150,200 L160,206 L170,200 L168,250 L152,250 Z" fill="#15131F" />
        <path d="M154,212 q6,3 12,0 M154,224 q6,3 12,0 M154,236 q6,3 12,0" stroke="#8C7AAE" strokeWidth="1" fill="none" opacity=".7" />
        {/* クラバット（白フリル） */}
        <path d="M152,190 Q160,186 168,190 Q170,200 160,206 Q150,200 152,190 Z" fill="#FFF" />
        <path d="M156,200 Q160,210 164,200 Q160,206 156,200 Z" fill="#F0EAEC" />
        <path d="M158,194 q2,2 4,0" stroke="#7A4B66" strokeWidth="1.5" fill="none" />
        {/* 銀ボタン */}
        {[214, 226, 238].map((y, i) => <circle key={i} cx="160" cy={y} r="1.6" fill="#C8C2D8" />)}
      </g>;
    default: // casual
      return <g>
        {sleeves(C.sakuraDeep, 11)}
        {bodice(C.sakura)}
        <path d="M152,184 q8,7 16,0" stroke="#FFF" strokeWidth="2.4" fill="none" />
        {skirt("#8FA9E6", 292, 30)}
        {ruffle(290, 30, "#A6BCF0", 6, 12)}
      </g>;
  }
}

/* --- 顔（しずく型・大きな瞳） --- */
const HEAD_PATH = "M160,44 C126,44 102,76 100,118 C98,150 122,180 160,180 C198,180 222,150 220,118 C218,76 194,44 160,44 Z";
const EY = 134, ELX = 132, ERX = 188;
/* 髪（旧ヘッド基準で作図）を新しいしずく型ヘッドにフィットさせる整合変換 */
const HAIR_T = "translate(160 112) scale(1.09 1.08) translate(-160 -113)";

function Face({ skin, eyeStyle, eyeColor, animated, uid = "a", hairStyle = "" }) {
  const s = SKIN_TONE[skin];
  const ec = EYE_PAL[eyeColor];
  const masc = ["centerPart", "prince", "wolfMens", "gothBoy"].includes(hairStyle);

  const happyEye = (cx) => (
    <g>
      <path d={`M${cx - 17},${EY} Q${cx},${EY - 10} ${cx + 17},${EY}`} stroke={ec.light} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".25" filter="url(#soft2)" />
      <path d={`M${cx - 16},${EY + 1} Q${cx},${EY - 12} ${cx + 16},${EY + 1}`} stroke={C.ink} strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d={`M${cx - 16},${EY + 1} q-5,-1 -9,-4`} stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d={`M${cx + 16},${EY + 1} q5,-1 9,-4`} stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
  const winkEye = (cx) => (
    <g>
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
    const clipId = `ec-${uid}-${outerSign > 0 ? "r" : "l"}`;
    return (
      <g className={animated ? "oa-eye" : undefined}>
        {/* アイシャドウ（にじみ） */}
        <path d={`M${innerX},${innerY - 3} Q${midX},${topY - 4} ${outerX},${outerY - 3}`} stroke={ec.light} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".3" filter="url(#soft2)" />
        <path d={sclera} fill="url(#eyewhite)" />
        <clipPath id={clipId}><path d={sclera} /></clipPath>
        <g clipPath={`url(#${clipId})`}>
          <ellipse cx={cx} cy={icy} rx={ir} ry={irY} fill={`url(#irisGrad-${eyeColor})`} />
          {[...Array(11)].map((_, i) => {
            const a = (i / 11) * Math.PI * 2;
            return <line key={i} x1={cx} y1={icy} x2={cx + Math.cos(a) * ir} y2={icy + Math.sin(a) * irY} stroke={ec.light} strokeWidth=".7" opacity=".3" />;
          })}
          {/* 下うるみグロー */}
          <ellipse cx={cx} cy={icy + 8} rx={ir - 1} ry="6" fill={ec.light} opacity=".6" filter="url(#soft1)" />
          {/* 上の影 */}
          <ellipse cx={cx} cy={icy - 11} rx={ir + 1} ry="7" fill={ec.deep} opacity=".45" filter="url(#soft1)" />
          {/* 輪郭リング */}
          <ellipse cx={cx} cy={icy} rx={ir} ry={irY} fill="none" stroke={ec.deep} strokeWidth="1.6" opacity=".5" filter="url(#soft1)" />
          {/* 瞳孔 */}
          <ellipse cx={cx} cy={icy + 2} rx={big ? 6.5 : 6} ry={big ? 9 : 8} fill="#1E1A2E" />
          {/* ソフトハイライト大（にじみ・必須） */}
          <ellipse cx={cx - 5} cy={icy - 7} rx="8" ry="10" fill="#FFF" opacity=".22" filter="url(#soft2)" />
          {eyeStyle === "heart" ? (
            <path d={`M${cx - 5},${icy - 4} C${cx - 5},${icy - 7} ${cx - 10},${icy - 9} ${cx - 10},${icy - 6} C${cx - 10},${icy - 3} ${cx - 5},${icy - 1} ${cx - 5},${icy + 1} C${cx - 5},${icy - 1} ${cx},${icy - 3} ${cx},${icy - 6} C${cx},${icy - 9} ${cx - 5},${icy - 7} ${cx - 5},${icy - 4} Z`} fill="#FFF" />
          ) : (
            <ellipse cx={cx - 5} cy={icy - 7} rx={big ? 6 : 5} ry={big ? 7.5 : 6.5} fill="#FFF" opacity=".95" transform={`rotate(-16 ${cx - 5} ${icy - 7})`} filter="url(#soft1)" />
          )}
          {/* シャープ小ハイライト */}
          <circle cx={cx + 5} cy={icy + 8} r={big ? 3.2 : 2.6} fill="#FFF" opacity=".95" />
          <circle cx={cx + 6} cy={icy - 4} r="1.4" fill="#FFF" opacity=".85" />
          {/* 下まぶた水光 */}
          <path d={`M${innerX + outerSign * 4},${botY - 3} Q${midX},${botY - 1} ${outerX - outerSign * 4},${outerY + 4}`} stroke="#FFF" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".55" />
          {big && <path d={`M${cx + 7},${icy - 9} l1.7,4.2 l4.2,1.7 l-4.2,1.7 l-1.7,4.2 l-1.7,-4.2 l-4.2,-1.7 l4.2,-1.7 Z`} fill="#FFF" opacity={eyeStyle === "sparkle" ? "1" : ".7"} />}
        </g>
        {/* 上まつげ（塗り＋柔らかさ） */}
        <g filter="url(#soft1)">
          <path d={`M${innerX},${innerY} Q${midX},${topY} ${outerX},${outerY} Q${outerX + outerSign * 9},${outerY - 7} ${outerX + outerSign * 12},${outerY - 11} Q${midX},${topY - 7} ${innerX},${innerY - 2} Z`} fill={C.ink} />
        </g>
        {[0.62, 0.78, 0.92].map((t, i) => {
          const lx = innerX + (outerX - innerX) * t;
          return <path key={i} d={`M${lx},${topY + 6} q${outerSign * 3},-7 ${outerSign * 8},-10`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />;
        })}
        <path d={`M${outerX - outerSign * 2},${outerY + 3} q${outerSign * 2},5 ${outerSign * 5},7`} stroke={C.ink} strokeWidth="1.7" fill="none" strokeLinecap="round" opacity=".8" />
        {eyeStyle === "teary" && (
          <g><path d={`M${outerX},${outerY + 9} q-3,6 0,11 q3,-5 0,-11 Z`} fill="#CDE8FB" opacity=".9" filter="url(#soft1)" />
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

  return (
    <g>
      {/* 耳 */}
      <circle cx="100" cy="128" r="9" fill={s.base} /><circle cx="100" cy="129" r="4" fill={s.line} opacity=".3" />
      <circle cx="220" cy="128" r="9" fill={s.base} /><circle cx="220" cy="129" r="4" fill={s.line} opacity=".3" />
      {/* 顔ベース（しずく型） */}
      <path d={HEAD_PATH} fill={s.base} />
      {/* あご・頬の柔らか落ち影 */}
      <path d="M108,140 Q124,178 160,180 Q196,178 212,140 Q204,176 160,176 Q116,176 108,140 Z" fill={s.shade} opacity=".22" filter="url(#soft3)" />
      {/* 額・頬のツヤ */}
      <ellipse cx="158" cy="92" rx="42" ry="18" fill="url(#skinGlow)" />
      <ellipse cx="124" cy={EY - 2} rx="12" ry="14" fill="url(#skinGlow)" opacity=".7" />
      <ellipse cx="196" cy={EY - 2} rx="12" ry="14" fill="url(#skinGlow)" opacity=".7" />
      {/* ほっぺ */}
      <ellipse cx="118" cy={EY + 16} rx="15" ry="9.5" fill="url(#blush)" />
      <ellipse cx="202" cy={EY + 16} rx="15" ry="9.5" fill="url(#blush)" />
      <circle cx="115" cy={EY + 12} r="1.8" fill="#FFF" opacity=".8" /><circle cx="205" cy={EY + 12} r="1.8" fill="#FFF" opacity=".8" />
      {/* まゆ（女性=繊細アーチ／masc=やや太め・直線寄り） */}
      {masc ? (
        <g>
          <path d={`M${ELX - 14},${EY - 22} Q${ELX - 1},${EY - 26} ${ELX + 12},${EY - 23}`} stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity=".55" filter="url(#soft1)" />
          <path d={`M${ERX - 12},${EY - 23} Q${ERX + 1},${EY - 26} ${ERX + 14},${EY - 22}`} stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity=".55" filter="url(#soft1)" />
        </g>
      ) : (
        <g>
          <path d={`M${ELX - 13},${EY - 22} Q${ELX - 1},${EY - 27} ${ELX + 11},${EY - 24}`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".28" filter="url(#soft1)" />
          <path d={`M${ERX - 11},${EY - 24} Q${ERX + 1},${EY - 27} ${ERX + 13},${EY - 22}`} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".28" filter="url(#soft1)" />
        </g>
      )}
      {renderEye(ELX, -1, true)}
      {renderEye(ERX, 1, false)}
      {/* 鼻 */}
      <path d={`M159,${EY + 16} q1,2 2,0`} stroke={s.line} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".6" />
      {/* 口 */}
      {eyeStyle === "sparkle" || eyeStyle === "heart" ? (
        <g>
          <path d={`M152,${EY + 28} Q160,${EY + 42} 168,${EY + 28} Q160,${EY + 33} 152,${EY + 28} Z`} fill="#C9566E" />
          <path d={`M156,${EY + 30} Q160,${EY + 38} 164,${EY + 30} Z`} fill="#F49AAE" />
        </g>
      ) : eyeStyle === "smile" ? (
        <path d={`M152,${EY + 28} Q160,${EY + 38} 168,${EY + 28} Q160,${EY + 32} 152,${EY + 28} Z`} fill="#C9566E" />
      ) : (
        <path d={`M153,${EY + 28} Q160,${EY + 35} 167,${EY + 28}`} stroke="#C9566E" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

/* --- メガネ --- */
function Glasses({ id }) {
  if (id === "round")
    return <g fill="none" stroke="#6B6480" strokeWidth="2.6">
      <circle cx="133" cy="128" r="16" /><circle cx="187" cy="128" r="16" />
      <line x1="149" y1="128" x2="171" y2="128" /><line x1="117" y1="126" x2="106" y2="122" /><line x1="203" y1="126" x2="214" y2="122" /></g>;
  if (id === "black")
    return <g fill="rgba(255,255,255,.1)" stroke="#2A2730" strokeWidth="4.5">
      <rect x="113" y="114" width="38" height="30" rx="9" /><rect x="169" y="114" width="38" height="30" rx="9" />
      <line x1="151" y1="127" x2="169" y2="127" /></g>;
  if (id === "heart")
    return <g fill="rgba(255,180,210,.22)" stroke={C.sakuraDeep} strokeWidth="2.6">
      <path d="M133,120 q-9,-9 -15,0 q-5,7 15,20 q20,-13 15,-20 q-6,-9 -15,0 Z" />
      <path d="M187,120 q-9,-9 -15,0 q-5,7 15,20 q20,-13 15,-20 q-6,-9 -15,0 Z" />
      <line x1="152" y1="128" x2="168" y2="128" /></g>;
  return null;
}

/* --- 頭の装飾 --- */
function Headwear({ id }) {
  switch (id) {
    case "ribbon":
      return <g><path d="M200,58 q-22,-14 -2,17 q-23,4 2,11 q25,-7 2,-11 q22,-31 -2,-17 Z" fill={C.sakuraDeep} />
        <circle cx="200" cy="69" r="5.5" fill="#FFF" opacity=".8" /></g>;
    case "beret":
      return <g><ellipse cx="156" cy="58" rx="54" ry="27" fill="#C0506E" />
        <ellipse cx="156" cy="54" rx="54" ry="23" fill="#D86A88" /><circle cx="156" cy="36" r="6" fill="#C0506E" /></g>;
    case "cap":
      return <g><path d="M100,84 C100,46 220,46 220,82 L100,84 Z" fill="#26252E" />
        <ellipse cx="160" cy="82" rx="60" ry="13" fill="#26252E" />
        <path d="M212,80 C248,82 252,98 246,106 L212,94 Z" fill="#1B1A22" />
        <text x="160" y="72" fontSize="12" textAnchor="middle" fill="#FFF" fontStyle="italic">pktw</text>
        <circle cx="160" cy="50" r="3.6" fill="#3A3946" /></g>;
    case "bunny":
      return <g><path d="M126,60 C118,12 138,10 144,52 Z" fill="#FFF" stroke={C.sakuraDeep} strokeWidth="2" />
        <path d="M130,54 C126,24 138,22 140,50 Z" fill={C.sakura} />
        <path d="M194,60 C202,12 182,10 176,52 Z" fill="#FFF" stroke={C.sakuraDeep} strokeWidth="2" />
        <path d="M190,54 C194,24 182,22 180,50 Z" fill={C.sakura} />
        <path d="M112,72 q48,-22 96,0" stroke="#FFF" strokeWidth="6" fill="none" /></g>;
    case "flower":
      return <g><path d="M104,82 q56,-34 112,0" stroke="#7FB87A" strokeWidth="5" fill="none" />
        {[[110, 78], [132, 66], [160, 60], [188, 66], [210, 78]].map(([x, y], i) =>
          <g key={i}>{[0, 72, 144, 216, 288].map((a) => {
            const r = (a * Math.PI) / 180; return <ellipse key={a} cx={x + Math.cos(r) * 6} cy={y + Math.sin(r) * 6} rx="4.5" ry="3" fill="#FFF" transform={`rotate(${a} ${x + Math.cos(r) * 6} ${y + Math.sin(r) * 6})`} />;
          })}<circle cx={x} cy={y} r="3" fill={C.gold} /></g>)}</g>;
    case "crown":
      return <g><path d="M122,68 L122,44 L140,58 L160,38 L180,58 L198,44 L198,68 Z" fill={C.gold} stroke="#D9A22E" strokeWidth="2" />
        <circle cx="140" cy="50" r="3.2" fill="#FF6B9A" /><circle cx="160" cy="44" r="4.2" fill="#6FB7FF" /><circle cx="180" cy="50" r="3.2" fill="#FF6B9A" />
        <rect x="122" y="66" width="76" height="5" rx="2.5" fill="#D9A22E" /></g>;
    default:
      return null;
  }
}

/* --- 小物（前面） --- */
function Accessory({ id }) {
  switch (id) {
    case "muffler":
      return <g><path d="M146,180 q14,12 28,0 q3,11 -7,16 q-14,7 -14,7 q0,0 -14,-7 q-10,-5 -7,-16 Z" fill="#E4607E" />
        <path d="M150,196 l-4,24 l11,2 l3,-22 Z" fill="#E4607E" />
        {[186, 198, 208].map((y, i) => <line key={i} x1="147" y1={y} x2="158" y2={y + 1} stroke="#C9445F" strokeWidth="1.6" />)}</g>;
    case "necklace":
      return <g><path d="M150,188 q10,14 20,0" stroke={C.gold} strokeWidth="2" fill="none" />
        <path d="M160,196 l-6,8 l6,8 l6,-8 Z" fill="#6FB7FF" stroke={C.gold} strokeWidth="1.4" /></g>;
    case "headphone":
      return <g><path d="M104,124 C104,66 216,66 216,124" stroke="#3A3550" strokeWidth="7" fill="none" />
        <rect x="96" y="116" width="20" height="28" rx="9" fill="#5B5680" /><rect x="204" y="116" width="20" height="28" rx="9" fill="#5B5680" />
        <circle cx="106" cy="130" r="5" fill={C.sakura} /><circle cx="214" cy="130" r="5" fill={C.sakura} /></g>;
    case "penlight":
      return <g><rect x="184" y="246" width="8" height="38" rx="4" fill="#2A2730" transform="rotate(16 188 265)" />
        <rect x="184" y="224" width="10" height="26" rx="5" fill={C.sakura} transform="rotate(16 189 237)" />
        <ellipse cx="194" cy="228" rx="13" ry="16" fill={C.sakura} opacity=".35" />
        <ellipse cx="194" cy="228" rx="7" ry="10" fill="#FFF" opacity=".7" /></g>;
    default:
      return null;
  }
}

/* --- アバター本体 --- */
function Avatar({ equip, size = 320, showBackground = true, bounceKey, animated = false, uid = "a", crop }) {
  const ck = equip.hairColor;
  const bust = crop === "bust";
  const vb = bust ? "44 22 232 232" : "0 0 320 380";
  const h = bust ? size : (size * 380) / 320;
  const showBg = showBackground && !bust;
  return (
    <svg viewBox={vb} width={size} height={h}
      className={animated ? "oa-av-idle" : undefined} style={{ display: "block", overflow: "visible" }} key={bounceKey}>
      <defs>
        {/* 柔らかさ用ぼかし（塗り質感の要） */}
        <filter id="soft1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1" /></filter>
        <filter id="soft2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id="soft3" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3.4" /></filter>
        <linearGradient id="eyewhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6FF" /><stop offset=".55" stopColor="#FCFAFF" /><stop offset="1" stopColor="#E2E6F6" />
        </linearGradient>
        <radialGradient id="blush" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF7FB2" stopOpacity="0.55" /><stop offset="1" stopColor="#FF7FB2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="skinGlow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".5" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        {/* 虹彩：5段（上が濃く下が明るい） */}
        {Object.entries(EYE_PAL).map(([k, v]) => (
          <linearGradient key={k} id={`irisGrad-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={v.deep} />
            <stop offset="0.28" stopColor={v.deep} />
            <stop offset="0.52" stopColor={v.base} />
            <stop offset="0.8" stopColor={v.light} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity=".9" />
          </linearGradient>
        ))}
        {/* 髪：4段オンブレ */}
        {Object.entries(HAIR_PAL).map(([k, v]) => (
          <linearGradient key={k} id={`hairGrad-${k}`} x1="0" y1="0" x2="0.12" y2="1">
            <stop offset="0" stopColor={v.shade} />
            <stop offset="0.3" stopColor={v.base} />
            <stop offset="0.7" stopColor={v.base} />
            <stop offset="1" stopColor={v.light} />
          </linearGradient>
        ))}
      </defs>
      {showBg && <Background id={equip.background} />}
      {/* 接地シャドウ（ぼかし） */}
      {showBg && <ellipse cx="160" cy="338" rx="58" ry="10" fill="#3A2E5C" opacity=".18" filter="url(#soft3)" />}
      {showBg && <ellipse cx="160" cy="336" rx="70" ry="12" fill="#FFF" opacity=".22" filter="url(#soft3)" />}
      <g transform={HAIR_T}><HairBack style={equip.hairStyle} ck={ck} /></g>
      <Body skin={equip.skin} pants={PANTS_BY_OUTFIT[equip.outfit] || null} />
      <Outfit id={equip.outfit} />
      <Face skin={equip.skin} eyeStyle={equip.eyeStyle} eyeColor={equip.eyeColor} animated={animated} uid={uid} hairStyle={equip.hairStyle} />
      <g transform={HAIR_T}><HairFront style={equip.hairStyle} ck={ck} /></g>
      <Glasses id={equip.glasses} />
      <Headwear id={equip.headwear} ck={ck} />
      <Accessory id={equip.accessory} />
    </svg>
  );
}

/* ─── エクスポート ─── */
export {
  C, RARITY, SKIN_TONE, HAIR_PAL, EYE_PAL,
  SKINS, HAIRSTYLES, HAIRCOLORS, EYESTYLES, EYECOLORS,
  OUTFITS, HEADWEAR, GLASSES, ACCESSORIES, BACKGROUNDS,
  Avatar as AvatarSVG,
};
