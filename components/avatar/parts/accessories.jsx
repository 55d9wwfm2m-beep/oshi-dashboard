/* ============================================================
   前景アクセサリーレジストリ（最前面レイヤー）
   ------------------------------------------------------------
   手持ち小物は skeleton.js の ANCHORS.handR / handL に
   合わせて配置する。
   ============================================================ */
import React from "react";
import { C } from "../palettes";

function Muffler() {
  return (
    <g><path d="M146,180 q14,12 28,0 q3,11 -7,16 q-14,7 -14,7 q0,0 -14,-7 q-10,-5 -7,-16 Z" fill="#E4607E" />
      <path d="M150,196 l-4,24 l11,2 l3,-22 Z" fill="#E4607E" />
      {[186, 198, 208].map((y, i) => <line key={i} x1="147" y1={y} x2="158" y2={y + 1} stroke="#C9445F" strokeWidth="1.6" />)}</g>
  );
}

function Necklace() {
  return (
    <g><path d="M150,188 q10,14 20,0" stroke={C.gold} strokeWidth="2" fill="none" />
      <path d="M160,196 l-6,8 l6,8 l6,-8 Z" fill="#6FB7FF" stroke={C.gold} strokeWidth="1.4" /></g>
  );
}

function Headphone() {
  return (
    <g><path d="M104,124 C104,66 216,66 216,124" stroke="#3A3550" strokeWidth="7" fill="none" />
      <rect x="96" y="116" width="20" height="28" rx="9" fill="#5B5680" /><rect x="204" y="116" width="20" height="28" rx="9" fill="#5B5680" />
      <circle cx="106" cy="130" r="5" fill={C.sakura} /><circle cx="214" cy="130" r="5" fill={C.sakura} /></g>
  );
}

function Penlight() {
  return (
    <g><rect x="184" y="246" width="8" height="38" rx="4" fill="#2A2730" transform="rotate(16 188 265)" />
      <rect x="184" y="224" width="10" height="26" rx="5" fill={C.sakura} transform="rotate(16 189 237)" />
      <ellipse cx="194" cy="228" rx="13" ry="16" fill={C.sakura} opacity=".35" />
      <ellipse cx="194" cy="228" rx="7" ry="10" fill="#FFF" opacity=".7" /></g>
  );
}

export const ACCESSORIES_R = {
  none: null,
  muffler: Muffler,
  necklace: Necklace,
  headphone: Headphone,
  penlight: Penlight,
};
