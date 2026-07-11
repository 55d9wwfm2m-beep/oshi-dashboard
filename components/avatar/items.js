/* ============================================================
   アイテムメタデータ（カタログの単一ソース）
   ------------------------------------------------------------
   - 新アイテムはここに1行足し、対応する描画を parts/ の
     レジストリに1エントリ足す（それ以外の作業は不要）。
   - 解放条件の実体は catalog.ts の UNLOCKS（実データ連動）。
     source / price / ach は将来のショップ・実績経済用の
     予約フィールドで、現時点では未使用。
   ============================================================ */

export const SKINS = [
  { id: "porcelain", name: "とうき", rarity: "N", source: "default" },
  { id: "light", name: "ライト", rarity: "N", source: "default" },
  { id: "pinkf", name: "ピンク", rarity: "N", source: "default" },
  { id: "medium", name: "ヘルシー", rarity: "N", source: "default" },
  { id: "tan", name: "タン", rarity: "N", source: "default" },
  { id: "deep", name: "ディープ", rarity: "N", source: "default" },
];

export const HAIRSTYLES = [
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

export const HAIRCOLORS = [
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

export const EYESTYLES = [
  { id: "round", name: "ぱっちり", rarity: "N", source: "default" },
  { id: "tareme", name: "たれ目", rarity: "N", source: "default" },
  { id: "smile", name: "にっこり", rarity: "N", source: "default" },
  { id: "sharp", name: "クール", rarity: "R", source: "shop", price: 120 },
  { id: "sparkle", name: "きらきら", rarity: "R", source: "ach", ach: "events1" },
  { id: "wink", name: "ウインク", rarity: "R", source: "shop", price: 100 },
  { id: "teary", name: "うるうる", rarity: "SR", source: "shop", price: 180 },
  { id: "heart", name: "ハートアイ", rarity: "SR", source: "shop", price: 220 },
];

export const EYECOLORS = [
  { id: "brown", name: "ブラウン", rarity: "N", source: "default" },
  { id: "blue", name: "ブルー", rarity: "N", source: "default" },
  { id: "green", name: "グリーン", rarity: "N", source: "default" },
  { id: "amber", name: "アンバー", rarity: "R", source: "shop", price: 80 },
  { id: "pink", name: "ローズ", rarity: "R", source: "shop", price: 80 },
  { id: "purple", name: "推し紫", rarity: "SR", source: "ach", ach: "achHunter" },
];

export const OUTFITS = [
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

export const HEADWEAR = [
  { id: "none", name: "なし", rarity: "N", source: "default" },
  { id: "ribbon", name: "リボン", rarity: "N", source: "default" },
  { id: "beret", name: "ベレー帽", rarity: "R", source: "shop", price: 180 },
  { id: "cap", name: "ライブキャップ", rarity: "R", source: "ach", ach: "events5" },
  { id: "bunny", name: "うさ耳", rarity: "R", source: "shop", price: 250 },
  { id: "flower", name: "花冠", rarity: "SR", source: "ach", ach: "streak7" },
  { id: "crown", name: "ティアラ", rarity: "LE", source: "ach", ach: "legend" },
];

export const GLASSES = [
  { id: "none", name: "なし", rarity: "N", source: "default" },
  { id: "round", name: "丸メガネ", rarity: "N", source: "default" },
  { id: "black", name: "黒ぶち", rarity: "R", source: "ach", ach: "money10" },
  { id: "heart", name: "ハート型", rarity: "R", source: "shop", price: 120 },
];

export const ACCESSORIES = [
  { id: "none", name: "なし", rarity: "N", source: "default" },
  { id: "muffler", name: "マフラー", rarity: "N", source: "default" },
  { id: "penlight", name: "ペンライト", rarity: "R", source: "ach", ach: "events1" },
  { id: "necklace", name: "ネックレス", rarity: "R", source: "shop", price: 150 },
  { id: "headphone", name: "ヘッドホン", rarity: "SR", source: "ach", ach: "goods10" },
];

export const BACKGROUNDS = [
  { id: "dream", name: "ゆめパステル", rarity: "N", source: "default" },
  { id: "studio", name: "スタジオ", rarity: "N", source: "default" },
  { id: "cafe", name: "カフェ", rarity: "N", source: "default" },
  { id: "night", name: "夜空", rarity: "R", source: "ach", ach: "collector3" },
  { id: "stage", name: "ステージ", rarity: "SR", source: "ach", ach: "queen" },
  { id: "sakura", name: "さくら", rarity: "R", source: "shop", price: 200 },
  { id: "ocean", name: "うみべ", rarity: "R", source: "shop", price: 200 },
];
