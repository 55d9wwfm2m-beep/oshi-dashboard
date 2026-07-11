/* ============================================================
   髪飾りレジストリ（前髪より上のレイヤー）
   ------------------------------------------------------------
   追加方法: コンポーネントを書いて HEADWEAR_R に登録し、
   items.js の HEADWEAR に1行足す。'none' は null。
   帽子領域 (y<84) に入る髪型（お団子等）との併用は要確認。
   ============================================================ */
import React from "react";
import { C } from "../palettes";

function Ribbon() {
  return (
    <g><path d="M200,58 q-22,-14 -2,17 q-23,4 2,11 q25,-7 2,-11 q22,-31 -2,-17 Z" fill={C.sakuraDeep} />
      <circle cx="200" cy="69" r="5.5" fill="#FFF" opacity=".8" /></g>
  );
}

function Beret() {
  return (
    <g><ellipse cx="156" cy="58" rx="54" ry="27" fill="#C0506E" />
      <ellipse cx="156" cy="54" rx="54" ry="23" fill="#D86A88" /><circle cx="156" cy="36" r="6" fill="#C0506E" /></g>
  );
}

function Cap() {
  return (
    <g><path d="M100,84 C100,46 220,46 220,82 L100,84 Z" fill="#26252E" />
      <ellipse cx="160" cy="82" rx="60" ry="13" fill="#26252E" />
      <path d="M212,80 C248,82 252,98 246,106 L212,94 Z" fill="#1B1A22" />
      {/* フロントの星ワッペン */}
      <path d="M160,60 l2.4,5.4 l5.8,0.6 l-4.3,4 l1.2,5.8 l-5.1,-3 l-5.1,3 l1.2,-5.8 l-4.3,-4 l5.8,-0.6 Z" fill="#FFF" opacity=".92" />
      <circle cx="160" cy="50" r="3.6" fill="#3A3946" /></g>
  );
}

function Bunny() {
  return (
    <g><path d="M126,60 C118,12 138,10 144,52 Z" fill="#FFF" stroke={C.sakuraDeep} strokeWidth="2" />
      <path d="M130,54 C126,24 138,22 140,50 Z" fill={C.sakura} />
      <path d="M194,60 C202,12 182,10 176,52 Z" fill="#FFF" stroke={C.sakuraDeep} strokeWidth="2" />
      <path d="M190,54 C194,24 182,22 180,50 Z" fill={C.sakura} />
      <path d="M112,72 q48,-22 96,0" stroke="#FFF" strokeWidth="6" fill="none" /></g>
  );
}

function Flower() {
  return (
    <g><path d="M104,82 q56,-34 112,0" stroke="#7FB87A" strokeWidth="5" fill="none" />
      {[[110, 78], [132, 66], [160, 60], [188, 66], [210, 78]].map(([x, y], i) =>
        <g key={i}>{[0, 72, 144, 216, 288].map((a) => {
          const r = (a * Math.PI) / 180; return <ellipse key={a} cx={x + Math.cos(r) * 6} cy={y + Math.sin(r) * 6} rx="4.5" ry="3" fill="#FFF" transform={`rotate(${a} ${x + Math.cos(r) * 6} ${y + Math.sin(r) * 6})`} />;
        })}<circle cx={x} cy={y} r="3" fill={C.gold} /></g>)}</g>
  );
}

function Crown() {
  return (
    <g><path d="M122,68 L122,44 L140,58 L160,38 L180,58 L198,44 L198,68 Z" fill={C.gold} stroke="#D9A22E" strokeWidth="2" />
      <circle cx="140" cy="50" r="3.2" fill="#FF6B9A" /><circle cx="160" cy="44" r="4.2" fill="#6FB7FF" /><circle cx="180" cy="50" r="3.2" fill="#FF6B9A" />
      <rect x="122" y="66" width="76" height="5" rx="2.5" fill="#D9A22E" /></g>
  );
}

export const HEADWEAR_R = {
  none: null,
  ribbon: Ribbon,
  beret: Beret,
  cap: Cap,
  bunny: Bunny,
  flower: Flower,
  crown: Crown,
};
