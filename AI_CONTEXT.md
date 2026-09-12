# AI_CONTEXT.md — oshi-dashboard 引き継ぎ仕様書

このリポジトリを初めて触る AI（Claude Code / Astra / その他）向けの現状仕様書です。
**すべて実際のコードを読んで記載しています。** 推測で書いた箇所はありません。
記載と食い違う実装を見つけたら、コードが正でこのファイルが古いので、作業のついでに直してください。

- 対象コミット: `41013e6 貯金ロードマップ機能を追加`
- 作業ブランチ: `claude/mobile-money-calculator-ndye1f`（`main` と `gh-pages` も存在）
- 最終更新: 2026-09-12

---

## 1. アプリの目的

ひとつのリポジトリに、**性質の違う2つのアプリ**が入っています。

### (A) 推し活ダッシュボード（Next.js アプリ / リポジトリ本体）
推し（アイドル・俳優など）を応援する人向けの記録アプリ。
イベント・グッズ・支出・参戦ログをまとめ、使うほど XP が貯まってレベルが上がり、
きせかえアバターのアイテムが解放される「ゲーム性のある記録アプリ」。

`app/layout.tsx` のメタデータ:
> 推しとの思い出・イベント・支出をひとつにまとめて、きせかえアバターを育てる推し活アプリ。

### (B) やりくり電卓（`app/money/*` ＋ `site/index.html`）
**現在アクティブに開発されているのはこちら。**
「いま自分が使っていいお金はいくらか」を一目で分かるようにする家計アプリ。

> 今持っているお金から未払いの固定費を引いて、使っていいお金をすぐ確認できるシンプルな電卓。
> （`app/money/layout.tsx` / `site/index.html` の `<meta name="description">`）

想定ユーザーは日本語話者・スマートフォン利用者ひとり。サーバーもアカウントもなく、
データはすべて端末のブラウザ内（localStorage）にとどまります。

> ⚠️ **最重要**: やりくり電卓は**同じ機能を2つのコードベースで二重実装**しています（§3）。
> 片方だけ直すと必ず挙動が食い違います。詳細は §12。

---

## 2. 使用技術・フレームワーク

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js **14.2.5**（App Router） |
| UI | React 18 / TypeScript 5（`strict: true`） |
| スタイル | Tailwind CSS 3.4 ＋ `app/globals.css` の自前クラス |
| フォント | `next/font/google` の Inter（本文）と Cormorant Garamond（数字） |
| 状態管理 | **ライブラリなし**。React state ＋ 自作 `useLocalStorage`（§8） |
| データ保存 | ブラウザの localStorage のみ。**サーバー・DB・API は一切なし** |
| テスト | Playwright 1.60（`devDependencies` にあるだけ。テストファイルはリポジトリに入っていない — §14） |
| Lint | ESLint / `next/core-web-vitals` |
| CI/CD | GitHub Actions → GitHub Pages（`site/` のみ） |
| 依存パッケージ | **`next` / `react` / `react-dom` の3つだけ**（`package.json`） |

外部 API 呼び出し・環境変数・認証・課金は存在しません。
唯一の環境変数は `NEXT_PUBLIC_SITE_URL`（OGP画像の絶対URL解決用・任意）です。

```bash
npm install
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run start   # 本番サーバー
npm run lint    # ESLint
npx tsc --noEmit  # 型チェック（package.json には無いので直接叩く）
```

---

## 3. 主要なディレクトリとファイルの役割

```
oshi-dashboard/
├─ AI_CONTEXT.md              ← このファイル
├─ app/                       Next.js App Router
│  ├─ layout.tsx              ルートレイアウト（フォント・BottomNav・Toaster・実績監視）
│  ├─ globals.css             デザイントークンとユーティリティクラス（★重要）
│  ├─ manifest.ts             推し活アプリの PWA マニフェスト（/manifest.webmanifest）
│  ├─ page.tsx                推し活ホーム
│  ├─ events|wishlist|expenses|logs|timeline|savings|
│  │  achievements|avatar|profile|privacy/page.tsx   推し活の各画面
│  └─ money/                  ★ やりくり電卓（Next.js 版）
│     ├─ layout.tsx           メタデータのみ（children をそのまま返す）
│     ├─ page.tsx             ホーム（使っていいお金）
│     ├─ balance/page.tsx     残高と支払い
│     ├─ budget/page.tsx      今月の予算
│     ├─ roadmap/page.tsx     貯金ロードマップ
│     ├─ review/page.tsx      振り返り
│     └─ settings/page.tsx    固定費の設定
├─ components/
│  ├─ BottomNav.tsx           アプリ全体の下部ナビ（固定・5項目）
│  ├─ ThemeProvider.tsx       推しカラー（--accent）を localStorage から適用
│  ├─ AchievementWatcher.tsx  実績の解放を監視（layout に常駐）
│  ├─ AddToHomeBanner.tsx     「ホーム画面に追加」誘導
│  ├─ Avatar.tsx              自作SVGアバター
│  ├─ avatar/                 アバターのパーツSVG・カタログ・パレット
│  └─ ui/                     ★ 共通UI（§7）
│     ├─ BottomSheet.tsx  Toast.tsx  Field.tsx
│     ├─ MoneyTabs.tsx    BudgetToggle.tsx
│     └─ ExpenseSheet.tsx MonthlyRecap.tsx
├─ hooks/
│  ├─ useLocalStorage.ts      ★ 全データ保存の中核（§8）
│  ├─ useGameState.ts         XP / レベル
│  └─ useAvatarEquip.ts       アバター装備
├─ lib/
│  ├─ money.ts                ★★ やりくり電卓の計算ロジック全部（約900行・§6）
│  ├─ utils.ts                日付・円表記・ID生成・画像リサイズ
│  └─ game.ts                 XP / レベル / 実績の定義
├─ types/index.ts             ★★ 全データモデル（§6）
├─ site/                      ★★ GitHub Pages 配信用の単体アプリ
│  ├─ index.html              **1ファイル約3,900行**（HTML+CSS+バニラJS 全部入り）
│  ├─ manifest.webmanifest    PWA マニフェスト
│  └─ sw.js                   Service Worker（ネットワーク優先・オフライン時のみキャッシュ）
├─ public/icons/              推し活アプリのPWAアイコン
└─ .github/workflows/deploy-yarikuri.yml   site/ → gh-pages 同期
```

### `site/index.html` について（最重要の前提）

やりくり電卓は **Next.js 版（`app/money/*`）と、それとは別の単体HTML版（`site/index.html`）の2つ**があります。

| | Next.js 版 | Pages 版 |
|---|---|---|
| 場所 | `app/money/*` ＋ `lib/money.ts` | `site/index.html` 単体 |
| 技術 | React / TypeScript / Tailwind | 素の HTML + CSS + バニラJS（ES5寄り・`var` と `function`） |
| 画面切替 | Next.js のルーティング | `section` の `hidden` 属性を付け外し（`show(view)`） |
| 配信 | 推し活アプリの `/money` 配下 | GitHub Pages（`gh-pages` ブランチ） |
| ダークモード | **なし**（ライト固定） | **あり**（`prefers-color-scheme`） |
| localStorage キー | **完全に同一**（§6-B） | **完全に同一** |
| 行数 | 6ファイル計 約3,300行（＋`lib/money.ts` 902行） | 1ファイル 約3,900行 |

**両者は同じ localStorage キーを読み書きします。** ロジックは別々に書かれていますが、
計算結果が一致するように意図的に揃えられています（過去の全コミットで両方同時に更新されています）。

---

## 4. 現在実装されている全機能

### 4-A. やりくり電卓（両方の版に実装済み）

1. **使っていいお金の計算**
   `予算対象残高 − 未払い固定費 − 未払いの予定支出`
   （`app/money/page.tsx:146` / `site/index.html` の `renderHero`）
2. **残額の色分けステータス** — 🟢安心 3万円〜 / 🟡少し注意 1〜3万円 / 🔴節約モード 1万円未満
   （`statusOf()` / `STATUS_META`）
3. **買う前にチェック** — 金額を入れると購入後の残額と一言判定を出す購入シミュレーター
4. **複数口座** — 現金・銀行・PayPay など、口座ごとに残高を持つ
5. **口座ごとの「計算対象」トグル** — OFF の口座は **総資産には数えるが、予算対象残高からは外れる**
6. **給料日の設定と残り日数表示** — 1〜31日
7. **給料日の自動前倒し** — 土日・日本の祝日（振替休日・国民の休日を含む）なら前の平日へ
8. **給料日を起点にした1か月** — 給料日〜次の給料日の前日を「1か月」として扱う。
   未設定（`payday=0`）なら従来どおり暦の1日〜月末（§6-D の `Period`）
9. **固定費の登録・支払いチェック** — 支払日順に並ぶ
10. **変動する固定費（予想額・確定額）** — 電気代・ガス代など。確定額がなければ予想額を使う
11. **固定費の実額入力** — 割り勘などで自分の負担額が変わったときに入力できる
12. **月替わりの自動処理** — 前月の記録を保存し、支払い状況と実額だけをリセット
    （項目名・登録金額・支払日・種類は翌月へ引き継ぐ）
13. **月末の振り返りポップアップ ＋「これまでの記録」** — 最大24か月分
14. **月予算（給料の振り分け）** — STEP1 給料 → 2 貯金 → 3 固定費（自動反映）→ 4 予定支出 → 5 生活費カテゴリー
15. **貯金の実績入力** — 目標とは別に「実際に貯金できた額」を入れ、**達成判定は実績で行う**
16. **予定支出の実額入力** — 予定額とは別に、実際にかかった額を入れられる
17. **先月と同じ予算をコピー** — 貯金目標とカテゴリー予算額のみ。給料と実績はコピーしない
18. **生活費の支出記録** — カテゴリー・日付・メモつき。任意の日付で入力できる
19. **「いつもより高い」の自動検知** — 過去の自分の月平均と比較。
    2か月以上のデータがあり、差 ≥ ¥1,000 かつ 1.2倍以上のときだけ知らせる
20. **振り返りページ** — 月のまとめ自動生成・カテゴリー別メーター・月ごとの生活費グラフ・支出一覧
21. **貯金ロードマップ**（最新機能）— §4-C

### 4-B. 推し活ダッシュボード（Next.js 版のみ）

| 画面 | 内容 |
|---|---|
| `/` | ホーム。推しプロフィール・アバター・貯金・支出・各機能への導線 |
| `/events` | イベント（ライブ・舞台・テレビ・配信・その他） |
| `/wishlist` | グッズ管理（優先度・カテゴリー・購入済み） |
| `/expenses` | 推し活支出（ライブ・グッズ・遠征・CD・FC・その他） |
| `/logs` | 参戦ログ（座席・感想・写真） |
| `/timeline` | 推し年表 |
| `/savings` | 推し活貯金（目標と現在額） |
| `/achievements` | 実績＆アバター（XP・レベル・実績解放） |
| `/avatar` | きせかえ（自作SVGアバター） |
| `/profile` | 推しプロフィール・テーマカラー・データのバックアップ／復元 |
| `/privacy` | プライバシーポリシー |

### 4-C. 貯金ロードマップ（最新実装・両方の版にあり）

「いつまでに、いくら貯めたいか」を並べ、今の貯金額と見比べる画面。タイトルは **「30歳までのロードマップ」**。

- **次の目標カード** — 目標の年月・目標額・現在・あと・達成率・進捗バー・残り月数・
  「ここから月平均いくら」（**日数ではなく月数**で表示）
- **ペース判定** — ✅達成 / 🟢順調 / 🟡あと少し / 🔴ペースアップ の4段階。
  ひとつ前の目標（なければ起点）から次の目標までを直線で見るだけ。**収入の予測はしない**
- **縦のタイムライン** — 達成済みは✓、いま向かっている目標は強調、先の目標は控えめ
- **計画された大きな支出（`kind: 'event'`）** — 初期データにレクサス購入（2031年4月・−¥3,000,000・
  購入後の目標残高 ¥1,475,000）。**失敗ではなく「計画された支出です」と明記して表示する**
- **CRUD** — 年月・金額・名前・種類（貯金の目標 / 大きな支出）を自由に追加・変更・削除
- **対象残高の設定** — 口座から（未選択なら「計算対象に含めない口座」＝貯金用とみなす）／手入力。
  ペース判定の起点となる年月と金額も設定できる
- **ホームの簡易カード** — 「次の貯金目標」。タップでロードマップへ

初期データは13件（`DEFAULT_MILESTONES` / `lib/money.ts:748`）。
2026-12 ¥150,000 から 2031-10 ¥1,900,000 まで。

---

## 5. 画面構成

### 5-A. アプリ全体のナビゲーション（Next.js 版）

`components/BottomNav.tsx` — **画面下に固定**（`fixed bottom-0 z-50`）。5項目:

```
🏠 ホーム(/) │ 📅 イベント(/events) │ 🛍 グッズ(/wishlist) │ 💴 支出(/expenses) │ 👤 プロフィール(/profile)
```

`/money` 配下はこの下部ナビに項目を持ちません。ホームの導線から入ります。

### 5-B. やりくり電卓の画面切り替え

**Next.js 版** — `components/ui/MoneyTabs.tsx`。
アプリ全体の下部ナビと二重にならないよう、**上部の横並びピルタブ**にしています（コメントに明記）。

```
🏠 ホーム(/money) │ 💴 残高(/money/balance) │ 📅 予算(/money/budget)
│ 🎯 目標(/money/roadmap) │ 📊 振り返り(/money/review) │ ⚙️ 設定(/money/settings)
```

**Pages 版** — `site/index.html` の `#tabbar`。**画面下に固定の6タブ**（単体アプリなので二重にならない）。
同じ6項目・同じ並び順・同じラベル。`VIEWS = ['home','balance','budget','roadmap','review','settings']`。

### 5-C. 各画面のカード構成（やりくり電卓）

| 画面 | 上から順に |
|---|---|
| **ホーム** | 月替わりリセット通知 → 使っていいお金（ヒーロー・給料日チップ・色の凡例）→ 買う前にチェック → いつもより多めの支出 → 今月のお金 → 次の貯金目標 → これまでの記録 → 固定費を設定する |
| **残高** | 口座一覧（残高入力＋計算対象トグル）→ 総資産／予算対象残高 → 今月の固定費（支払いチェック・実額入力） |
| **予算** | STEP1 給料 → STEP2 貯金（目標＋実績）→ STEP3 固定費（自動）→ STEP4 予定支出 → STEP5 生活費の振り分け（カテゴリー別メーター・使ったお金の記録） |
| **目標** | 次の目標カード（対象残高ボタン）→ 目標の一覧（縦タイムライン・＋追加） |
| **振り返り** | 月セレクタ → 「◯年◯月のまとめ」→ カテゴリー別メーター → 月ごとの生活費グラフ → 支出一覧 → これまでの記録 |
| **設定** | 口座の設定 → 給料日 → 固定費一覧（追加・編集・削除） |

Pages 版の DOM は `#view-home` / `#view-balance` / `#view-budget` / `#view-roadmap` /
`#view-review` / `#view-settings` の `<section>` で、同時に1つだけ `hidden` を外します。

---

## 6. データ構造と保存方法

### 6-A. 保存方法

**localStorage のみ。** サーバー・DB・Cookie・IndexedDB は使いません。
値はすべて `JSON.stringify` した文字列で保存します。

- Next.js 版: `hooks/useLocalStorage.ts`
- Pages 版: `site/index.html` の `load(key, fallback)` / `save(key, value)`

どちらも **localStorage が使えない環境（プライベートブラウズ等）でも落ちません**。
Next.js 版は保存失敗時にトーストで1回だけ警告、Pages 版は `#storage-warn` バナーを出します。

### 6-B. localStorage キー一覧（全件）

**やりくり電卓**（`MONEY_KEYS` / `lib/money.ts:9`、Pages 版の `KEYS` / `site/index.html:1391` と**完全一致**）

| キー | 型 | 内容 |
|---|---|---|
| `oshi-money-accounts` | `MoneyAccount[]` | 口座ごとの残高 |
| `oshi-money-balance` | `string` | **旧**・単一口座時代の所持金。移行後は読むだけ |
| `oshi-money-fixedcosts` | `FixedCost[]` | 固定費 |
| `oshi-money-month` | `string` | 支払い状況を最後にリセットした期間の名前（YYYY-MM） |
| `oshi-money-payday` | `number` | 給料日 1〜31。**0 は未設定** |
| `oshi-money-history` | `MonthlyRecord[]` | 月末の自動保存（最大24件） |
| `oshi-money-budget` | `MonthlyBudget \| null` | 今月の予算計画 |
| `oshi-money-budget-history` | `MonthlyBudget[]` | 過去の月予算 |
| `oshi-money-expenses` | `LivingExpense[]` | 生活費の支出記録（**全期間を1つの配列**で保持） |
| `oshi-money-roadmap` | `SavingsRoadmap \| null` | 貯金ロードマップ |

**推し活ダッシュボード**

| キー | 内容 |
|---|---|
| `oshi-profile` / `oshi-events` / `oshi-wishlist` / `oshi-expenses` / `oshi-logs` / `oshi-savings` | 各機能のデータ |
| `oshi-game` / `oshi-earned` | XP・レベル / 解放済み実績 |
| `oshi-theme-color` | 推しカラー（`"196,164,160"` 形式の RGB 文字列） |
| `oshi-avatar-v2` / `oshi-avatar-config` / `oshi-avatar-seen-unlocks` | アバター装備 / 旧DiceBear設定 / 既読の解放通知 |

> `app/profile/page.tsx` のバックアップ機能は上記キーを明示的に列挙しています。
> **新しいキーを増やしたら、`app/profile/page.tsx:66` の `OSHI_KEYS` にも足してください。**

### 6-C. 型定義（`types/index.ts` の抜粋・やりくり電卓分）

```ts
interface MoneyAccount {
  id: string;
  name: string;
  amount: string;    // 数字のみの文字列。'' は未入力
  budget?: boolean;  // 使っていいお金の計算に含めるか。省略時（旧データ）は true 扱い
}

interface FixedCost {
  id: string; name: string;
  amount: number;    // variable な項目ではこれが「予想額」
  payDay: number;    // 1〜31
  paid: boolean;     // 月が変わると false に戻る
  variable?: boolean;      // 省略時（旧データ）は false
  actual?: number | null;  // 実際に払った額。あればこちらを計算に使う。月替わりでリセット
}

interface PlannedExpense {
  id: string; name: string;
  amount: number;    // 予定額
  date: string;      // YYYY-MM-DD。未定なら ''
  paid: boolean;
  actual?: number | null;  // 実際にかかった額
}

interface BudgetCategory { id: string; name: string; emoji: string; amount: number; }

interface LivingExpense {          // ★ 推し活の Expense とは別物。名前を分けている
  id: string; categoryId: string; amount: number;
  date: string;   // YYYY-MM-DD
  memo: string;
}

interface MonthlyBudget {
  month: string;          // YYYY-MM
  income: string;         // 給料。数字のみの文字列
  savingGoal: string;     // 貯金目標
  savedActual?: string;   // 実際に貯金できた額。達成判定はこちらで行う
  planned: PlannedExpense[];
  categories: BudgetCategory[];
}

interface MonthlyRecord {
  month: string; spendable: number; assets: number; fixedCosts: number; savedAt: string;
}

interface SavingsMilestone {
  id: string;
  month: string;            // YYYY-MM
  name: string;
  kind: 'goal' | 'event';   // goal＝到達したい貯金額 / event＝計画された大きな支出
  amount: number;           // goal は目標残高、event は支出額
  after?: number | null;    // event のとき、支出後に残したい貯金額
}

interface SavingsRoadmap {
  milestones: SavingsMilestone[];
  source: 'accounts' | 'manual';
  accountIds: string[];   // source が accounts のとき対象にする口座 id
  manual: string;         // source が manual のときの手入力額
  startMonth: string;     // ペース判定の起点（YYYY-MM）
  startAmount: string;    // 起点の貯金額
}
```

### 6-D. 主要な計算ロジック（`lib/money.ts`）

すべて純関数で、UI から切り離されています。Pages 版にも同名・同挙動の関数があります。

**給料日ベースの期間**
```ts
interface Period { key: string; start: string; end: string; }
periodOfDate(date, payday)   // その日が含まれる期間
currentPeriod(payday)        // 今の期間
periodByKey(key, payday)     // 名前から期間を復元
formatPeriodRange(p)         // 「7/25〜8/24」
```
`key` は **期間の中間日が属する月**です（いちばん多く重なる月を名前にする）。
`payday=0` のときは暦の1日〜月末になります。

**祝日・給料日**
`isBusinessDay(d)` — 土日と日本の祝日を除く。祝日は固定日・ハッピーマンデー・
春分／秋分の計算式・振替休日・国民の休日まで対応（1980〜2099年ごろで有効）。
`nextPaydayInfo(day)` / `paydayLabel(info)`。

**口座**
```ts
accountAmount(a)      // 未入力は 0
isBudgetAccount(a)    // a.budget !== false（旧データは含める扱い）
accountsTotal(accts)  // 総資産：全口座
budgetTotal(accts)    // 予算対象残高：計算対象の口座だけ
legacyAccountSeed()   // 旧 oshi-money-balance からの1回きりの移行
```

**固定費 / 予定支出**
```ts
hasActual(c)         // typeof c.actual === 'number'
effectiveAmount(c)   // 実額があればそれ、なければ登録金額
unpaidTotal(costs)   // 未払いの合計
plannedEffective(p) / plannedUnpaidTotal(planned) / plannedTotal(planned)
resetCostsForNewMonth(costs)  // paid:false, actual:null にするだけ
```

**月予算**
```ts
budgetBreakdown(budget, costs)
// living = income − savingGoal − fixed − planned
savingResult(budget)   // 達成判定は savedActual（実績）で行う
copyFromBudget(current, source)  // 目標とカテゴリー額のみコピー
```

**支出の集計と検知**
```ts
expensesInMonth(expenses, month, payday)
categoryMonthlyAverage(...)  // 対象月を除き、支出があった月だけで平均する
spendingAlerts(...)          // 2か月以上 & 差 ≥ ¥1,000 & 1.2倍以上
buildReview(...)             // 月のまとめを自動生成
```

**ロードマップ**
```ts
createDefaultRoadmap(startMonth, startBalance)
sortMilestones(list)          // 年月順、同月なら goal → event
roadmapBalance(roadmap, accts)
nextGoalInfo(roadmap, current, today)  // → { goal, current, remaining, ratio,
                                       //     monthsLeft, perMonth, expected, pace }
ratioPercent(ratio)   // 達成前は 99.9% 止まり（あと数円で100%と出ないように）
formatMan(amount)     // 「15万円」「447.5万円」
```

ペース判定:
```
current >= goal.amount        → 'done'   ✅達成
current >= expected           → 'ahead'  🟢順調
current >= expected * 0.9     → 'close'  🟡あと少し
それ以外                       → 'behind' 🔴ペースアップ
```
`expected` は「ひとつ前の目標（なければ `startMonth`/`startAmount`）から次の目標まで」の直線補間です。

---

## 7. 主要コンポーネント

### 共通UI（`components/ui/`）

| コンポーネント | 役割・API |
|---|---|
| `BottomSheet` | 下から出るモーダル。`{ open, onClose, title, children }`。**`createPortal` で `document.body` 直下に描画**（ページ内に置くと `main > *` のアニメーションがスタッキングコンテキストを作り、下部ナビの下に潜って押せなくなる — コードにコメントあり） |
| `Toast` | Provider 不要のイベントバス方式。どこからでも `showToast('...')`。表示器 `<Toaster />` は `layout.tsx` に1つだけ |
| `Field` | ラベル付き入力欄。`{ label, value, onChange, placeholder, type, inputMode, max }` |
| `MoneyTabs` | やりくり電卓の上部ピルタブ（6項目）。`TABS` 配列を編集すれば増減できる |
| `BudgetToggle` | 口座トグル。`{ on, onChange, accent, label? }`。`label` 省略時は「この口座を使っていいお金の計算に含める」 |
| `ExpenseSheet` | 生活費の記録シート（新規・編集兼用）。`{ open, editing, categories, onClose, onSave, onDelete }` |
| `MonthlyRecap` | 月末の振り返りポップアップ。`{ record, onClose }`。`createPortal` |

### レイアウト常駐（`components/`）

| コンポーネント | 役割 |
|---|---|
| `BottomNav` | 全ページ共通の下部ナビ。`fixed bottom-0 z-50`、`env(safe-area-inset-bottom)` 対応 |
| `ThemeProvider` | `oshi-theme-color` を読んで `--accent` CSS変数にセット |
| `AchievementWatcher` | 実績の解放を監視してトーストを出す |
| `AddToHomeBanner` | 「ホーム画面に追加」誘導。モバイルブラウザで開いているときだけ表示 |
| `Avatar` / `components/avatar/*` | 自作SVGアバター（旧DiceBear版と同じ Props API を保っている） |

### Pages 版（`site/index.html`）の構造

React コンポーネントはありません。**`renderXxx()` 関数が DOM を組み立てる**方式です。

```
renderHome() / renderHero() / renderAlerts() / renderBudgetCard() / renderRoadmapMini()
renderBalance() / renderBudget() / renderRoadmap() / renderRoadmapHero() /
renderRoadmapTimeline() / renderReview() / renderSettings() / renderHistory()
show(view)                // タブ切り替え。該当の render を呼んで scrollTo(0,0)
rerenderCurrentView()     // 保存後の再描画。ホーム系は隠れていても必ず先に更新する
```

> `rerenderCurrentView()` は **ホーム系（hero / alerts / budgetCard / roadmapMini）を
> 隠れていても毎回描き直します。** タブを切り替えた瞬間に古い金額が見えるのを防ぐためです。
> ホームに新しいカードを足したら、この関数にも描画呼び出しを足してください。

---

## 8. 状態管理方法

**状態管理ライブラリは使っていません。** Redux も Zustand も Context も（ThemeProvider を除き）ありません。

### `useLocalStorage`（`hooks/useLocalStorage.ts`）

```ts
const [value, setValue, isLoaded] = useLocalStorage<T>(key, initialValue);
```

- 返り値は **3要素のタプル**。第3の `isLoaded` は「localStorage からの読み込みが済んだか」
- **`isLoaded` が false のあいだは `null` を返して描画しない**のが全ページ共通の約束です:
  ```tsx
  if (!accountsLoaded || !costsLoaded || /* ... */) return null;
  ```
  これをやらないと、初期値で一瞬レンダリングされてから実データに差し替わり、
  ちらつき＋ hydration の不一致が起きます
- `setValue` は関数形式（`setValue(prev => ...)`）も受け付けます
- **同一タブ内の別コンポーネントとも `CustomEvent('oshi-ls-sync')` で同期します。**
  だから残高タブで入力するとホームのヒーローも即座に変わります
- 保存に失敗（容量不足等）したら**1セッション1回だけ**トーストで警告します

### 副作用の書き方（既存の慣習）

月替わり検知や初期データ投入は `useEffect` で行い、**依存配列には `*Loaded` フラグだけ**を並べて
`// eslint-disable-line react-hooks/exhaustive-deps` を付けています（`app/money/page.tsx:82` `:89` `:120`）。
「読み込み完了時に1回だけ走らせたい」という意図です。既存コードに合わせてください。

### Pages 版

モジュールスコープの `var` がそのまま状態です（`accounts`, `costs`, `budget`, `expenses`,
`payday`, `history`, `budgetHistory`, `savedMonth`）。
変更したら `save(KEYS.xxx, value)` を呼び、`rerenderCurrentView()` で描き直します。

**起動時にデータの正規化（マイグレーション）を行います**（`site/index.html:1500`〜`1530` 付近）。
足りないフィールドだけを補い、旧データを壊しません。新しいフィールドを足すときはここにも追記してください。

---

## 9. 現在の UI / UX 方針

言語化されている方針（コード内コメントと過去の要望から）:

1. **スマートフォンファースト。** すべての判断は縦持ちスマホが基準
2. **Apple 製品のような、上質でシンプルで控えめな雰囲気。** 装飾より余白と階層で見せる
3. **一番読みたい数字を一番大きく。** 使っていいお金・目標額・使った金額は大きく、
   補足は 11〜12px に落とす
4. **色だけに意味を持たせない。** ステータスは必ず **アイコン（🟢/🟡/🔴）＋ 日本語ラベル**とセット
   （色覚特性のある人にも伝わるように）
5. **不安を煽らない文言。** 「ペースアップ」も「今のペースだと少し足りない見込みです」と
   落ち着いた言い方にする。断定・叱責はしない
6. **日本語のやさしい言葉づかい。** 「使っていいお金」「あと少し」「買う前にチェック」など、
   専門用語を避ける
7. **既存の入力を勝手に消さない。** 月替わりでも項目名・登録金額は残し、状態だけリセットする
8. **入力は数字だけ受け付ける。** `digitsOnly()` で全角→半角変換、数字以外と先頭0を除去（最大9桁）
9. **タップ領域を十分に取る。** トグルは 40×24 のトラック＋上下パディングで指で押せる高さを確保

### アクセシビリティの慣習（実際に使われているもの）

- `aria-label`（35箇所）/ `aria-hidden`（15）/ `aria-pressed`（7）/ `aria-current`（2）/
  `aria-modal`（2）/ `aria-live`（1）/ `aria-checked`（1）
- `role="group"`（セグメント切替）/ `role="img"`（グラフ・進捗バーに読み上げ用の説明）/
  `role="status"`（トースト）/ `role="dialog"`（シート）/ `role="switch"`（トグル）
- 進捗バーには必ず `role="img"` と `aria-label` を付ける:
  ```tsx
  role="img" aria-label={`目標 ${formatYen(goal)} のうち ${formatYen(current)} 達成`}
  ```
- 絵文字は装飾なら `aria-hidden="true"`

---

## 10. レスポンシブ仕様

| | Next.js 版 | Pages 版 |
|---|---|---|
| コンテナ幅 | `max-w-lg`（**512px**）中央寄せ | `.app { max-width: 480px }` 中央寄せ |
| 横パディング | 各ページで `px-4`（16px） | `.app` の `padding: ... 16px` |
| 下部の余白 | `main` に `pb-24`（96px）— 固定ナビに隠れないため | `.app` に `calc(56px + env(safe-area-inset-bottom))` |
| セーフエリア | `env(safe-area-inset-bottom)` をナビ・シート・トーストに加算 | 同左。`viewport-fit=cover` |

**検証済みの範囲: 320 / 360 / 390 / 430px の4幅 × 全6画面 × 両実装で横スクロールなし。**
（320px ではロードマップのタイトルが2行に折り返しますが、はみ出しではありません）

### 守るべき決まり

- **入力欄の `font-size` は 16px 未満にしない。**
  `globals.css` の `.input` にコメントあり — 16px 未満だと iOS Safari がフォーカス時に自動ズームします
- **ボトムシートは `max-height: 90dvh`。** iOS のツールバー伸縮に追従する `dvh` を使い、
  非対応ブラウザ向けに `@supports not (height: 90dvh)` で `90vh` のフォールバックを持たせています
- **横に長くなるものは個別に `overflow-x: auto`。** ページ本体は横スクロールさせない
- 新しい画面を足したら **320px でも確認**してください

---

## 11. デザインルール

### 11-A. Next.js 版のカラー

固定値をインラインの `style` で書く方式です（Tailwind の `theme.extend` は空）。

| 用途 | 値 |
|---|---|
| ページ背景 | `#FAF8F6`（外側は `#F5F2EE`） |
| カード | `#ffffff` |
| 面（薄いグレー） | `#F0EBE6` / `#FAF8F6` |
| 本文 | `#1C1917` |
| 補足 | `#78716C` |
| さらに薄い補足 | `#A8A29E` |
| 罫線 | `rgba(28,18,12,0.06)` 〜 `0.12` |
| **推しカラー（可変）** | CSS変数 `--accent`。既定 `196,164,160`（ダスティローズ） |

**やりくり電卓の配色は推しカラーから独立しています**（`lib/money.ts:239` にコメントあり）:

```ts
MONEY_ACCENT     = '#359277'                  // 淡い緑
MONEY_ACCENT_BG  = 'rgba(53,146,119,0.10)'
MONEY_DANGER     = '#C4574B'
MONEY_DANGER_BG  = 'rgba(196,87,75,0.10)'
WARN             = '#A8770E'                  // 各ページでローカル定義
```

ステータス色（`STATUS_META`）: 安心 `#2B7A63` / 少し注意 `#A8770E` / 節約モード `#C4574B`。

### 11-B. Pages 版のカラー

`site/index.html` の `:root` に CSS変数で定義し、`@media (prefers-color-scheme: dark)` で
**全変数をダークモード用に差し替えます**。

```
ライト: --bg #F6F7F5  --surface #FFFFFF  --surface-2 #EFF1EE  --ink #21261F
        --sub #6E756E  --muted #9AA19A  --accent #359277  --warn #A8770E  --danger #C4574B
ダーク: --bg #141816  --surface #1D2320  --surface-2 #262D29  --ink #E9ECE9
        --sub #A9B1AA  --muted #7E867F  --accent #4FB394  --warn #DFB86A  --danger #D97A6E
```

> **Pages 版に色を足すときは必ず CSS変数にして、ダークモード側にも定義を足してください。**
> 生の16進数を直書きするとダークモードで読めなくなります。

### 11-C. 形・余白・タイポグラフィ

| 要素 | 値 |
|---|---|
| カードの角丸 | Next: `24px`（`.card`）/ Pages: 同等 |
| カードの影 | `0 2px 16px rgba(28,18,12,0.06)` |
| ボトムシート | 角丸 `28px 28px 0 0`、パディング `24px 20px 36px` |
| 入力欄 | 角丸 `14px`、`1.5px` 罫線、`font-size: 16px` |
| ボタン（大） | 角丸 `2xl`（16px）、`py-3.5` |
| チップ・ピル | `rounded-full` |
| 見出し h1 | `text-2xl`（24px）。ロードマップだけ `text-xl`/21px（タイトルが長いため） |
| 本文 | 12.5〜13px |
| 補足 | 11〜11.5px |
| ラベル（`.field-label`） | 12px・`uppercase`・`letter-spacing: 0.04em`・`#A8A29E` |

### 11-D. 数字の見せ方

- **大きな金額は `.font-serif-num`（Next）/ `.serif-num`（Pages）。**
  Cormorant Garamond / Georgia のイタリック、`letter-spacing: -0.02em`
- **並ぶ数字には必ず `font-variant-numeric: tabular-nums`。** 桁がずれないように
- 円表記は `formatYen()`（`¥1,234`）、符号付きは `formatYenSigned()`（`-¥5,000`）
- 大きな貯金額は `formatMan()`（`15万円` / `447.5万円`）

### 11-E. アニメーション

`globals.css` のユーティリティを使います。自前で `@keyframes` を増やす前に既存を確認してください。

```
.anim-fadeInUp  .anim-fadeIn  .anim-scaleIn  .anim-slideRight
.stagger-1 〜 .stagger-5       （60ms 刻みの遅延）
```

イージングは `cubic-bezier(0.16,1,0.3,1)` で統一。
アバター系のアニメには `@media (prefers-reduced-motion: reduce)` で停止指定があります。

### 11-F. グラフ

過去に `dataviz` の指針に沿って作られています。
**カテゴリー別の色分けは使わず、メーター（トラック＝予算・塗り＝実績）と単一系列の棒グラフ**にしています。
新しいグラフを足すときもこの方針を踏襲してください（カテゴリカルパレットは避ける）。

---

## 12. 既存機能を変更するときの注意事項

### ⚠️ 12-1. やりくり電卓は必ず2箇所を直す

`app/money/*` ＋ `lib/money.ts` と `site/index.html` の**両方**を更新してください。
片方だけだと、同じ localStorage を読む2つのアプリで表示が食い違います。
過去の全コミットがこの原則を守っています。

### ⚠️ 12-2. 既存データを壊さない

- **新しいフィールドは必ずオプショナル（`?`）にする。**
  既存の型はすべてそうなっています（`budget?`, `variable?`, `actual?`, `savedActual?`, `after?`）
- **省略時の挙動を旧データに合わせる。**
  例: `isBudgetAccount()` は `a.budget !== false`（＝未定義なら含める）、
  `isVariable()` は `c.variable === true`（＝未定義なら固定費）
- Pages 版の起動時マイグレーション（`site/index.html:1500`〜`1530` 付近）にも新フィールドの補完を足す
- localStorage キーの**名前を変えない・意味を変えない**。ユーザーの既存データが読めなくなります

### ⚠️ 12-3. `useLocalStorage` の `isLoaded` を必ず見る

`if (!xxxLoaded) return null;` を忘れると、初期値で一瞬描画されてちらつきます。
新しくキーを増やしたら、そのページのガード条件にも足してください。

### ⚠️ 12-4. オブジェクトを更新するときはスプレッドで全フィールドを保つ

過去に**実際にバグを出した箇所**です。支払い済みトグルの実装が
`{ id, name, amount, payDay, paid }` を作り直していたため、`variable` と `actual` が消えていました。

```ts
// ✅ 正しい
setCosts(prev => prev.map(c => (c.id === id ? { ...c, paid: !c.paid } : c)));
```

### ⚠️ 12-5. 型名の衝突に注意

`types/index.ts` には**推し活の `Expense`**（推し活支出）と
**やりくり電卓の `LivingExpense`**（生活費）の2つがあります。
生活費の型を追加したときに `Expense` という名前でぶつかり、後から改名した経緯があります。
新しい型は用途が分かる名前にしてください。

### ⚠️ 12-6. `BottomSheet` はページ内に直接置かない

`createPortal` で `document.body` 直下に描画する仕組みです（コードにコメントあり）。
ページ内に置くと `main > *` の fadeIn アニメーションがスタッキングコンテキストを作り、
`z-index` を上げても下部ナビ（`z-50`）の下に潜って、シート下部のボタンが押せなくなります。

### ⚠️ 12-7. ホームに要素を足したら Pages 版の再描画にも足す

`site/index.html` の `rerenderCurrentView()` は、ホーム系の描画関数を
（隠れていても）毎回呼びます。新しいカードの `renderXxx()` をここに足さないと、
他タブで編集した内容がホームに反映されません。

### ⚠️ 12-8. バックアップ対象のキー一覧を更新する

新しい localStorage キーを追加したら `app/profile/page.tsx:66` の `OSHI_KEYS` 配列にも足してください。
足さないとバックアップ／復元から漏れます。

### ⚠️ 12-9. デプロイの範囲

`.github/workflows/deploy-yarikuri.yml` は
**`site/**` が変わったときだけ** `claude/mobile-money-calculator-ndye1f` / `main` から
`gh-pages` へ同期します。Next.js アプリ側のデプロイ設定はリポジトリにありません。

---

## 13. 変更してはいけない重要な仕様

ユーザーが明示的に指定した、**壊してはいけない約束**です。

### 🔒 13-1. 給料を口座残高に加算しない（二重計上の防止）

**月予算（`MonthlyBudget`）と、使っていいお金（`MoneyAccount`）は完全に別データです。**
給料を入力しても口座残高には一切足しません。UI 上も混同させません。

`lib/money.ts:336` のコメント:
> 「使っていいお金」（口座残高ベース）とは別の計画用データ。
> 給料は口座残高に一切加算しない（二重計上の防止）。

### 🔒 13-2. 使っていいお金の計算式

```
使っていいお金 = 予算対象残高 − 未払い固定費 − 未払いの予定支出
```
- **予算対象残高** = `budget !== false` の口座の合計（総資産ではない）
- 総資産は全口座の合計。**この2つを取り違えない**
- 口座が1つも入力されていなければ結果は 0 円扱い

### 🔒 13-3. 貯金の達成判定は「実績」で行う

`savingGoal`（目標＝計画）ではなく `savedActual`（実際に貯金できた額＝結果）で判定します。
`savedActual` が `''`（未入力）なら**達成とは言わない**（`savingResult().achieved === false`）。

### 🔒 13-4. 1か月の区切りは給料日から給料日

給料日が設定されていれば「給料日〜次の給料日の前日」が1か月です。
`payday = 0`（未設定）のときだけ暦の1日〜月末になります。
期間の名前（`key`）は**中間日が属する月**です。

### 🔒 13-5. 給料日は土日・祝日なら前の平日へ前倒し

後ろ倒しではなく**前倒し**です。祝日は振替休日・国民の休日まで含みます。

### 🔒 13-6. 月替わりでリセットするのは「状態」だけ

`resetCostsForNewMonth()` が触るのは `paid` と `actual` のみ。
**項目名・登録金額（予想額）・支払日・種類（variable）は翌月へ引き継ぎます。**
予定支出（`planned`）は翌月に持ち越しません。

### 🔒 13-7. ロードマップは収入を予測しない

「いつまでに、いくら貯めたいか」を並べて今の残高と比べるだけです。
将来の給料や貯金ペースを推定して未来の残高を予測する機能は**入れないでください**（明示的な要望）。

### 🔒 13-8. 計画された大きな支出は「失敗」として扱わない

`kind: 'event'`（レクサス購入など）は達成率にも達成✓にも数えません。
表示も **「購入後の目標残高 ¥1,475,000（計画された支出です）」** と、
計画どおりであることを明記します。

### 🔒 13-9. ペース判定の文言は不安を煽らない

```
✅ 達成       この目標を達成しました！
🟢 順調       目標ペースを上回っています
🟡 あと少し    ほぼ予定どおりのペースです
🔴 ペースアップ 今のペースだと少し足りない見込みです
```
`PACE_TEXT`（`lib/money.ts:874`）。強い言葉に書き換えないでください。

### 🔒 13-10. ホーム画面を大きく変えない

やりくり電卓のホームは完成度が高いと評価されています。
新機能はタブを増やして別画面に置き、ホームには**小さな導線カードを1枚**足すに留めてください
（ロードマップの「次の貯金目標」カードがその前例です）。

### 🔒 13-11. データは端末内だけ

外部送信・アナリティクス・エラー収集の導入は**依頼なしに追加しないでください**。
UI にも「データはこの端末のブラウザ内にのみ保存されます」と明記しています。

### 🔒 13-12. 達成率は達成前に 100% と出さない

`ratioPercent()`（`lib/money.ts:886`）は達成前（`ratio < 1`）に 99.9% を上限にします。
あと数円で「100%」と出ると紛らわしいためです。

### 🔒 13-13. 依存パッケージを増やさない

本番依存は `next` / `react` / `react-dom` の3つだけです。
UI ライブラリ・状態管理・チャートライブラリ・日付ライブラリは**入っていませんし、
入れない前提**で作られています（Pages 版は単体HTMLなので特に）。

---

## 14. 今後 AI が機能追加するときに確認すべきポイント

### 14-1. 着手前のチェックリスト

1. **やりくり電卓の機能か？** → Yes なら `app/money/*` と `site/index.html` の**両方**を直す
2. **新しいデータを保存するか？** → `types/index.ts` に型を足し、
   フィールドはオプショナルにし、`MONEY_KEYS` にキーを足し、
   `app/profile/page.tsx:66` のバックアップ一覧にも足す
3. **計算が絡むか？** → ロジックは `lib/money.ts` に純関数で置く。UI に埋め込まない
4. **新しい画面か？** → `MoneyTabs.tsx` の `TABS` と `site/index.html` の `#tabbar` /
   `VIEWS` / `show()` の両方に足す
5. **ホームに出すか？** → 小さなカード1枚まで（§13-10）。
   Pages 版は `rerenderCurrentView()`（`site/index.html:2629`）にも描画呼び出しを足す
6. **色を足すか？** → Pages 版は CSS変数にして**ダークモード側にも定義**する（§11-B）
7. **ステータス表示か？** → 色だけにせず、必ずアイコン＋日本語ラベルを添える（§9-4）

### 14-2. 実装後に必ず通すもの

```bash
npx tsc --noEmit    # 型エラー 0
npm run lint        # 新規の警告 0（既存の <img> 警告5件だけは残っている）
npm run build       # ビルド成功
```

さらに:

- **スマホ幅の確認** — 最低でも 320 / 390px。横スクロールが出ないこと
- **Pages 版の確認** — `site/` を静的配信して手で触る
  （`cd site && npx http-server -p 3199` など）
- **既存機能の回帰確認** — 特に「使っていいお金」の金額が変わっていないこと
- **ダークモードの確認**（Pages 版のみ）

### 14-3. テストについて

`playwright` は `devDependencies` に入っていますが、
**テストファイルはリポジトリにコミットされていません。**
過去の開発では一時ディレクトリに使い捨ての Playwright スクリプトを書いて検証していました。

検証時に有効だった手法:

- `page.clock.setFixedTime(new Date('2026-09-12T09:00:00'))` で日付依存の挙動を固定する
  （給料日・月替わり・ロードマップのペース判定は全部これが要る）
- localStorage に直接シードしてから `reload()` する
- **期待値はテスト側で独立に計算する。** アプリの関数を呼んで比べると同じバグを再現するだけ
- Pages 版は静的配信（3199 など）、Next.js 版は `next build && next start`（3100番台）
- 検証用スクリプトはコミットせず、スクラッチ領域に置く（`.gitignore` が `*.png` `*.log` を除外済み）

**恒久的なテストスイートを整備するのは有益な改善です。** 現状は無いという前提で計画してください。

### 14-4. 既知のギャップ（バグではないが認識しておくこと）

- **`site/` にアイコン画像が無い。**
  `site/manifest.webmanifest` は `./icon-192.png` `./icon-512.png` を、
  `index.html` は `./icon-192.png` `./apple-touch-icon.png` を参照していますが、
  `site/` には `index.html` / `manifest.webmanifest` / `sw.js` の3ファイルしかありません。
  PWA としてホーム画面に追加したときのアイコンが出ません
- **`sw.js` の `CACHE` は `'yarikuri-v1'` で固定。** 内容を大きく変えたときは
  バージョンを上げないと古いキャッシュが残る可能性があります
  （ネットワーク優先なので通常は最新が出ます）
- **Next.js 版にダークモードが無い。** Pages 版だけ対応しています
- **`app/money/*` にはページ単位のエラーバウンダリが無い**（`error.tsx` / `loading.tsx` 無し）
- **README.md も CLAUDE.md も無い。** このファイルが唯一の仕様書です

### 14-5. コミットの慣習

- **コミットメッセージは日本語。** 1行目は「〜を追加」「〜に変更」「〜に対応」の要約、
  空行のあと箇条書きで詳細、最後に設計上の判断や制約を書く
- 例: `貯金ロードマップ機能を追加` / `1か月の区切りを給料日から給料日に変更`
- **1機能1コミット。** Next.js 版と Pages 版の変更は同じコミットに入れる
- PR は明示的に依頼されたときだけ作る

### 14-6. コードスタイル

- **コメントは日本語。** 「なぜそうしたか」を書く。「何をしているか」は書かない
  （例: `// 16px未満だとiOS Safariがフォーカス時に自動ズームする`）
- Next.js 版: TypeScript strict、`'use client'` を先頭に、
  インポートは `@/` エイリアス、色はインライン `style`、レイアウトは Tailwind クラス
- Pages 版: `var` と `function`（アロー関数・`const`/`let` を混ぜない）、
  文字列連結で DOM を組む、`document.getElementById` で参照を取る
- どちらも**周りのコードと同じ書き方に揃える**のが最優先です
