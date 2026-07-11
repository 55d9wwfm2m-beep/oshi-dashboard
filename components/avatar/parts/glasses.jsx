/* ============================================================
   メガネレジストリ（前髪より上・髪飾りより下のレイヤー）
   ============================================================ */
import React from "react";
import { C } from "../palettes";

function Round() {
  return (
    <g fill="none" stroke="#6B6480" strokeWidth="2.6">
      <circle cx="133" cy="128" r="16" /><circle cx="187" cy="128" r="16" />
      <line x1="149" y1="128" x2="171" y2="128" /><line x1="117" y1="126" x2="106" y2="122" /><line x1="203" y1="126" x2="214" y2="122" /></g>
  );
}

function Black() {
  return (
    <g fill="rgba(255,255,255,.1)" stroke="#2A2730" strokeWidth="4.5">
      <rect x="113" y="114" width="38" height="30" rx="9" /><rect x="169" y="114" width="38" height="30" rx="9" />
      <line x1="151" y1="127" x2="169" y2="127" /></g>
  );
}

function Heart() {
  return (
    <g fill="rgba(255,180,210,.22)" stroke={C.sakuraDeep} strokeWidth="2.6">
      <path d="M133,120 q-9,-9 -15,0 q-5,7 15,20 q20,-13 15,-20 q-6,-9 -15,0 Z" />
      <path d="M187,120 q-9,-9 -15,0 q-5,7 15,20 q20,-13 15,-20 q-6,-9 -15,0 Z" />
      <line x1="152" y1="128" x2="168" y2="128" /></g>
  );
}

export const GLASSES_R = {
  none: null,
  round: Round,
  black: Black,
  heart: Heart,
};
