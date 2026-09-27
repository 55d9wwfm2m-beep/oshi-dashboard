# やりくり家計簿：Astra クラウド連携差分

## 確認済みの元コード

- Repository: `55d9wwfm2m-beep/oshi-dashboard`
- Source branch: `claude/mobile-money-calculator-ndye1f`
- Source head: `c297c1f2815d934a7a4ecf67eb626eca7af6c6d4`
- Source `site/index.html` blob: `f5a881013362068d4499338a632c1e11c37b80bc`
- Published `gh-pages` head: `52291cceca79c62a8434ebd25b1fb63c874df597`
- Published `index.html` is exactly the same blob.

既存 Next.js 部分は変更していません。既存の静的アプリ、月替わり、計算、分割払い、ロードマップを維持し、IIFE 開始前に認証・クラウド読み込みを待たせています。

## 公開差分

1. `site/index.html`
2. `site/cloud.js`（新規、Supabase JS 2.116.0 をバンドル済み）
3. `site/sw.js`

`site/yarikuri.css` は元ファイルの参照用コピーで変更不要です。元のアイコン・manifest は引き続き必要です。この作業ディレクトリだけを公開ディレクトリ全体として置換しないでください。

保守用に `cloud-entry.mjs`・`cloud-core.mjs`・`cloud-core.test.mjs`・`period.mjs`・package.json/lock を適切な専用ディレクトリへ保存してください。package.json を元アプリのルートへ上書きしないでください。

推奨配置は `tools/yarikuri-cloud/`。この名前で配置した場合、build.mjs は自動的に `../../site/cloud.js` へ出力します。単独作業フォルダでは `site/cloud.js` へ出力。必要なら `YARIKURI_OUTPUT_FILE` で出力先を明示できます。

## DB/API 契約

同じ Astra Supabase プロジェクトを利用。クライアントに含むのは既存の公開キーのみです。

`public.yarikuri_documents(user_id,payload,revision,updated_at)`

`yarikuri_write_document(expected_revision bigint, document jsonb)`

RPC は認証本人の行だけを CAS で書き込み、`{payload,revision}` を返します。競合は SQLSTATE `40001`。初回だけ expected_revision=0。

payload: `{version:1,values:{"oshi-money-accounts":..., ...},observations?:{...}}`

values は元アプリの10個の正確なキーだけです。計算結果は複製しません。RLS・RPC・Realtime publication の設定は別途必要です。この差分は DB を変更しません。

`observations` は給与実績とは別の観測履歴です。構造は `{version:1,accounts:{[accountId]:point},savings:{[scope]:point},activeSavingsScope:string|null}`。

point: `{current:number,highest:number,highestAt:ISO,observedAt:ISO}`。

現在の目標ページ対象残高の正本ポインタ: `observations.goalTargetBalance = {scope:string|null,state:'ready'|'missing',observedAt:ISO}`。readyで対応するsavings[scope]のobservedAtと一致する場合のみ、そのpoint.currentが表示額。欠落・不一致は未取得。Astraは元の口座や手入力から独自に再計算せず、この保存済み観測値を参照します。家計簿UIも同一savingsSelectionヘルパーで算出します。

LEXUS共通資金目標の正本: `values['oshi-money-roadmap'].milestones` の `sharedKey:'lexus-nx'`。既存の800万円NX goalがあればid/title/monthを保持してタグだけ付与します（実ユーザーの2032-04を2029-10へ上書きしません）。なければ旧デフォルト完全一致の300万円支出予定だけ原本を`roadmap.migrations.lexusSharedGoalV1.archivedMilestones`へ残して800万円goalに置換。カスタム旧eventは保持します。初回新規の月は2029-10。移行は一度のみ、以後の金額/年月変更や削除を元に戻しません。編集フォームでsharedKeyを保持します。

scope は手入力なら `manual`、口座集合なら `accounts:` + `JSON.stringify(sortedAccountIds)`。未指定時は budget:false の口座集合を使用。未入力・欠落口座は観測せず、0円と扱いません。RPC直前に計算してCASに含め、成功したpayloadだけを正式な記録にします。減額しても最高額は消えず、参照口座を変更すると別scopeになります。Astraでは現在のscopeと一致する履歴のみ利用し、highestAtは「確認日時」であり厳密な初回閾値到達日時ではありません。

## データ保護

- 初回ログイン後、既存データの移行か空で開始を明示選択。
- 元の `oshi-money-*` 値は削除・上書きしません。
- 初回移行前スナップショットを `yarikuri-migration-backup-v1:<user_id>` へ保持。
- 未送信変更は `yarikuri-pending-v1:<user_id>` に基準revision付きで保存。
- 競合時は自動上書きしません。バックアップ後「未送信分を取り下げてクラウドを読む」で明示解決。
- 端末に残る別データは「この端末の移行前データ」からバックアップ可能。
- 認証確認前・ログアウト後は家計UIを起動しません。
- 既存の cache-all Service Worker を静的 allowlist に更新。安全なバージョンの制御を確認するまで認証付きデータ取得を開始しません。
- オフライン初回起動で認証検証できない場合は個人データを表示しません。起動済みの編集はアカウント別 outbox に保留されます。

## 再取得

保存後／15秒周期／focus／visible／online／Realtime で確認。フォーム編集中は勝手に再読み込みせず「最新を読み込む」を表示します。未送信データを自動的に破棄しません。

## ビルドとテスト

```
npm ci --ignore-scripts
# 実際の既存プロジェクトの公開設定を環境変数に設定（値をソースへ書かない）
# YARIKURI_PUBLIC_SUPABASE_URL
# YARIKURI_PUBLIC_SUPABASE_KEY
npm run build
npm test
```

実装時、既存のインストール済み Supabase 2.116.0 を esbuild でバンドル。package-lock.json を作成済み。

`node --test cloud-core.test.mjs`: 18/18 成功。認証なしゲート、明示移行、元データ保持、バックアップ、CAS、アカウント別 outbox、競合時保護、ログアウト、給与日起点の期間、最高額保持・scope分離・欠落残高、SW安全確認後の認証取得、元アプリ構文・ID重複、800万円共通目標への安全な移行、対象残高ポインタを Node VM の模擬クライアントで検証。

実際の匿名 REST 読取は401/42501(permission denied)を確認。個人データを取得していません。

**未確認:** 実際の Auth アカウント・DB・ブラウザ操作・公開版デプロイ。この差分をそれらまで確認済みとは扱わないでください。
