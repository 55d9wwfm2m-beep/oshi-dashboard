import type { Prompt } from '@/types/prompthub';

const DAY_MS = 86_400_000;

/** 初期表示が「作りたて」に見えないよう、現在時刻からの相対日で生成する */
function daysAgo(days: number, hour = 10): string {
  const date = new Date(Date.now() - days * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

type SampleSeed = Omit<Prompt, 'createdAt' | 'updatedAt' | 'revisions'> & {
  createdDaysAgo: number;
  updatedDaysAgo: number;
  revisionNotes: string[];
};

const SEEDS: SampleSeed[] = [
  {
    id: 'sample_mail_reply',
    title: 'お客様への丁寧なメール返信ドラフト',
    description: '要件と温度感を伝えるだけで、失礼のない返信メールの下書きを作ります。',
    content: `あなたは丁寧な顧客対応に定評のあるカスタマーサポート担当者です。
以下の条件で、お客様へ返信するメールの下書きを作成してください。

# 入力
- お客様からのメール本文: {{お客様のメール}}
- 伝えたい結論: {{結論}}
- 補足したい事情: {{補足}}

# 条件
- 敬語は正しく、へりくだりすぎない自然なビジネス日本語にする
- 冒頭でお礼または謝罪を述べ、次に結論、最後に今後の対応を書く
- 専門用語は使わず、中学生でも理解できる表現にする
- 全体で400字以内に収める

# 出力形式
件名:
本文:
（署名は不要）`,
    example: `入力: 「注文した商品がまだ届かない」という問い合わせ。結論は「本日中に再発送する」。

出力例:
件名: ご注文商品の配送につきましてお詫びとご報告
本文: この度はご注文いただいた商品のお届けが遅れており、誠に申し訳ございません。
確認いたしましたところ、配送手配に不備がございました。本日中に改めて発送し、明日中にはお届けできる見込みです。…`,
    category: 'mail',
    tags: ['メール', '顧客対応', '敬語'],
    aiTools: ['ChatGPT', 'Claude'],
    author: 'Niki',
    visibility: 'team',
    caution: 'お客様の氏名・注文番号など個人情報はそのまま貼り付けず、必ず伏せ字にしてから使用してください。',
    favorite: true,
    usageCount: 48,
    rating: 5,
    version: 3,
    createdDaysAgo: 86,
    updatedDaysAgo: 4,
    revisionNotes: [
      '初版を登録',
      '出力を400字以内に制限し、冗長な前置きが出ないよう調整',
      '「件名 / 本文」の出力形式を明示し、コピペしやすくした',
    ],
  },
  {
    id: 'sample_claim_summary',
    title: 'クレーム内容の要約と一次対応方針',
    description: '長いクレーム文を、事実・ご要望・緊急度に分解して一次対応の方針まで出します。',
    content: `あなたは店舗運営部のクレーム対応責任者です。
以下のお客様の申し出を読み、対応者がすぐ動けるように整理してください。

# 入力
{{クレーム内容}}

# 条件
- 「事実」と「お客様の感情・主観」を必ず分けて書く
- 推測で事実を補わない。情報が足りない場合は「要確認」と書く
- 緊急度は 高 / 中 / 低 の3段階で判定し、判定理由も書く

# 出力形式
1. 何が起きたか（事実）
2. お客様のご要望
3. 緊急度と理由
4. 一次対応の文案（3行以内）
5. 社内で確認すべきこと`,
    example: `入力: 「先週買った端末が2日で電源が入らなくなった。仕事で使うのに困る。すぐ交換してほしい」

出力例:
1. 事実: 購入から2日で端末の電源が入らない
2. ご要望: 早期の交換
3. 緊急度: 高（業務利用に支障が出ているため）…`,
    category: 'support',
    tags: ['クレーム', '要約', '一次対応'],
    aiTools: ['ChatGPT', 'Claude', 'Gemini'],
    author: '佐藤 亮',
    visibility: 'team',
    caution: '最終的な対応判断は必ず人間が行ってください。AIの出力をそのままお客様へ送らないこと。',
    favorite: true,
    usageCount: 37,
    rating: 5,
    version: 2,
    createdDaysAgo: 71,
    updatedDaysAgo: 9,
    revisionNotes: ['初版を登録', '緊急度の判定基準を3段階で明文化'],
  },
  {
    id: 'sample_plan_compare',
    title: '携帯料金プランの比較説明',
    description: 'お客様の使い方を入力すると、料金プランの違いを店頭で話せる言葉に変換します。',
    content: `あなたは携帯ショップの販売スタッフです。
お客様に料金プランを説明するための「話す原稿」を作ってください。

# 入力
- 現在のプラン: {{現在のプラン}}
- 月々の支払い: {{現在の料金}}
- 使い方: {{通話・データ利用の傾向}}
- 提案したいプラン: {{提案プラン}}

# 条件
- 専門用語（キャリアアグリゲーション、テザリング等）は必ず言い換える
- 金額は「月々いくら変わるか」を最初に伝える
- メリットだけでなく、注意点（縛り・割引条件・データ超過時）も必ず伝える
- 押し売りに聞こえない、選択はお客様に委ねる言い回しにする

# 出力形式
- 一言でのご案内（1文）
- 今との違い（箇条書き3点）
- ご注意いただきたい点（箇条書き2点）
- お客様からよく出る質問と回答（2組）`,
    example: `入力: 現在3GBプランで月5,200円、動画をよく見る、提案は無制限プラン。

出力例:
一言: 「今よりも月900円ほど上がりますが、動画の通信量を気にしなくてよくなるプランです」…`,
    category: 'support',
    tags: ['携帯販売', '料金プラン', '接客', '説明'],
    aiTools: ['ChatGPT', 'Gemini'],
    author: 'Niki',
    visibility: 'team',
    caution: '料金・割引条件は改定されます。生成された金額は必ず最新の料金表と突き合わせてください。',
    favorite: true,
    usageCount: 62,
    rating: 5,
    version: 4,
    createdDaysAgo: 120,
    updatedDaysAgo: 2,
    revisionNotes: [
      '初版を登録',
      '注意点を必須項目に追加（説明漏れによる苦情を防ぐため）',
      'よくある質問セクションを追加',
      '押し売りに聞こえない言い回しの条件を追記',
    ],
  },
  {
    id: 'sample_quote_explain',
    title: '機種変更の見積内容をお客様向けに翻訳',
    description: '見積書の項目をそのまま貼るだけで、お客様が納得できる説明文に整えます。',
    content: `あなたは携帯ショップの説明が上手なスタッフです。
以下の見積内容を、はじめてスマートフォンを買い替えるお客様にも分かる説明へ変換してください。

# 入力
{{見積の項目と金額}}

# 条件
- 「初回に払う金額」と「毎月払う金額」を必ず分けて示す
- 分割・割引・下取りは、いつまで・いくら安くなるのかを明示する
- 途中解約や割引条件から外れた場合に起きることを1行で添える
- 数字は税込で統一する

# 出力形式
| 項目 | 金額 | ひとこと説明 |
の表を作り、そのあとに「まとめ（3行）」を書く`,
    example: `入力: 端末代143,000円（48回分割）、下取り-30,000円、月々割-1,200円×24回

出力例:
| 項目 | 金額 | ひとこと説明 |
| 端末代 | 143,000円 | 48回に分けてお支払いいただきます |…`,
    category: 'sales',
    tags: ['携帯販売', '見積', '説明', '料金'],
    aiTools: ['ChatGPT', 'Claude'],
    author: 'Niki',
    visibility: 'team',
    caution: '生成された金額は必ず販売管理システムの見積と照合してください。誤案内は苦情に直結します。',
    favorite: false,
    usageCount: 29,
    rating: 4,
    version: 2,
    createdDaysAgo: 64,
    updatedDaysAgo: 12,
    revisionNotes: ['初版を登録', '税込表記に統一する条件を追加'],
  },
  {
    id: 'sample_daily_report',
    title: '日報の文章整理',
    description: '箇条書きのメモを、そのまま提出できる日報の文章に整えます。',
    content: `あなたは読みやすい業務報告を書くのが得意な先輩社員です。
以下のメモを日報に整えてください。

# 入力
{{今日のメモ}}

# 条件
- 事実 → 所感 の順に書く。両者を混ぜない
- 言い訳めいた表現は削り、次にどうするかで締める
- 300字前後にまとめる
- ネガティブな出来事も、改善アクションとセットで書く

# 出力形式
【本日の業務】
【気づき・所感】
【明日の予定】`,
    example: `入力: 「来店12件、機種変4件、光回線1件、待ち時間長くて1件離脱、在庫確認に時間かかった」

出力例:
【本日の業務】本日は12件のご来店に対応し、機種変更4件、光回線1件を承りました。…`,
    category: 'report',
    tags: ['日報', '報告', '文章整理'],
    aiTools: ['ChatGPT', 'Gemini', 'Copilot'],
    author: '田中 美咲',
    visibility: 'team',
    caution: '',
    favorite: false,
    usageCount: 54,
    rating: 4,
    version: 2,
    createdDaysAgo: 95,
    updatedDaysAgo: 18,
    revisionNotes: ['初版を登録', '「明日の予定」を出力形式に追加'],
  },
  {
    id: 'sample_meeting_todo',
    title: '会議メモからToDoを抽出',
    description: '雑然とした議事メモから、担当者と期限つきのToDoだけを抜き出します。',
    content: `あなたはプロジェクト管理に長けたファシリテーターです。
以下の会議メモから、実行すべきタスクだけを抽出してください。

# 入力
{{会議メモ}}

# 条件
- 決定事項と、まだ決まっていない事項を分ける
- タスクには必ず「担当者」「期限」を割り当てる
- メモに担当者や期限が書かれていない場合は「未定（要確認）」と書き、勝手に決めない
- 雑談・感想はタスクにしない

# 出力形式
## 決定事項
## ToDo（表形式: タスク / 担当 / 期限）
## 次回までに決めること`,
    example: `入力: 「新プランの店頭POP、来週から掲示したい。佐藤さんがデザイン。あと在庫の棚卸しも近いうちに」

出力例:
## ToDo
| 新プランPOPのデザイン作成 | 佐藤 | 来週掲示のため今週中 |
| 在庫棚卸しの日程調整 | 未定（要確認） | 未定（要確認） |`,
    category: 'meeting',
    tags: ['会議', '議事録', 'ToDo', 'タスク管理'],
    aiTools: ['ChatGPT', 'Claude', 'Gemini'],
    author: '大西 健',
    visibility: 'team',
    caution: '',
    favorite: true,
    usageCount: 41,
    rating: 5,
    version: 1,
    createdDaysAgo: 52,
    updatedDaysAgo: 21,
    revisionNotes: ['初版を登録'],
  },
  {
    id: 'sample_manual',
    title: '新人向けの業務手順書を作る',
    description: 'ベテランの頭の中にある手順を、新人がひとりで実行できる手順書に落とし込みます。',
    content: `あなたは新人教育の担当者です。
以下の業務について、入社1週間のスタッフがひとりで実行できる手順書を作ってください。

# 入力
- 業務名: {{業務名}}
- 大まかな流れ: {{知っている手順}}
- よくある失敗: {{ミスの例}}

# 条件
- 1ステップ1動作に分解する
- 各ステップに「できたかどうかの確認方法」を添える
- 判断が必要な箇所は、判断基準と迷ったときの相談先を書く
- 略語は初出時に正式名称を書く

# 出力形式
## 目的
## 事前に用意するもの
## 手順（番号つき / 各ステップに確認方法）
## つまずきやすいポイント
## 困ったときの相談先`,
    example: `入力: 業務名「来店受付」、流れ「受付票を渡す→用件を聞く→待ち番号を発行」、失敗「本人確認書類の確認漏れ」

出力例:
## 目的 お客様をお待たせせず、正確に用件を把握して担当へつなぐ…`,
    category: 'office',
    tags: ['マニュアル', '新人教育', '業務手順'],
    aiTools: ['ChatGPT', 'Claude'],
    author: 'Niki',
    visibility: 'team',
    caution: '完成した手順書は必ず実務担当者のレビューを受けてから配布してください。',
    favorite: false,
    usageCount: 23,
    rating: 4,
    version: 2,
    createdDaysAgo: 44,
    updatedDaysAgo: 15,
    revisionNotes: ['初版を登録', '「困ったときの相談先」を追加し、新人が止まらないようにした'],
  },
  {
    id: 'sample_sns_post',
    title: 'SNS投稿案の作成（店舗キャンペーン）',
    description: '伝えたい情報を入れると、媒体ごとの文字数に合わせた投稿案を3案出します。',
    content: `あなたは店舗のSNS運用担当者です。
以下の情報からSNS投稿案を作成してください。

# 入力
- 告知内容: {{告知内容}}
- 期間: {{期間}}
- 対象のお客様: {{ターゲット}}
- 投稿する媒体: {{X / Instagram / LINE}}

# 条件
- 3案作り、それぞれ切り口を変える（お得さ / 困りごと解決 / 季節性）
- 誇大表現、断定的な効果保証は使わない
- 絵文字は各投稿2つまで
- ハッシュタグは5個以内、地域名を1つ含める

# 出力形式
案1〜3をそれぞれ「本文 / ハッシュタグ / 想定される反応」の3項目で出力`,
    example: `入力: 「学割キャンペーン、3/1〜4/30、新生活の学生と保護者、Instagram」

出力例:
案1（お得さ）本文: 新生活の準備はお済みですか？ 学割対象プランなら…`,
    category: 'marketing',
    tags: ['SNS', '販促', 'コピー'],
    aiTools: ['ChatGPT', 'Gemini'],
    author: '中村 彩',
    visibility: 'team',
    caution: '価格やキャンペーン条件を含む投稿は、公開前に必ず本部の確認を取ってください。',
    favorite: false,
    usageCount: 31,
    rating: 4,
    version: 1,
    createdDaysAgo: 38,
    updatedDaysAgo: 25,
    revisionNotes: ['初版を登録'],
  },
  {
    id: 'sample_sales_summary',
    title: '売上報告の要約',
    description: '数値データを貼るだけで、上長がそのまま読める月次サマリーを作ります。',
    content: `あなたはデータを分かりやすく伝えるのが得意な店舗マネージャーです。
以下の売上データを要約してください。

# 入力
{{売上データ（前月比・目標比を含む）}}

# 条件
- 冒頭3行で「結論・要因・次の打ち手」を述べる
- 増減は必ず「前月比」と「目標比」の両方に触れる
- 数字の羅列を避け、なぜそうなったかの仮説を1つ以上添える
- 仮説には「推測」と明記する

# 出力形式
■ サマリー（3行）
■ 数値ハイライト（箇条書き4点まで）
■ 良かった点 / 課題
■ 次月のアクション（3つ）`,
    example: `入力: 「新規契約38件（目標40件、前月32件）、機種変更76件、アクセサリ売上62万円」

出力例:
■ サマリー 新規契約は前月比+6件と回復したものの、目標には2件届きませんでした。…`,
    category: 'report',
    tags: ['売上', '報告', '要約', '分析'],
    aiTools: ['ChatGPT', 'Claude', 'Copilot'],
    author: '佐藤 亮',
    visibility: 'team',
    caution: '売上の実数値は社外秘です。個人契約のAIサービスへ貼り付けないでください。',
    favorite: true,
    usageCount: 26,
    rating: 4,
    version: 2,
    createdDaysAgo: 33,
    updatedDaysAgo: 7,
    revisionNotes: ['初版を登録', '仮説には「推測」と明記させる条件を追加'],
  },
  {
    id: 'sample_jargon',
    title: '専門用語を初心者向けに言い換える',
    description: '通信・IT用語を、お客様の理解度に合わせた表現へ変換します。',
    content: `あなたは説明が分かりやすいと評判の販売スタッフです。
以下の専門用語を、指定した相手に伝わる言葉へ言い換えてください。

# 入力
- 用語: {{用語}}
- 相手: {{相手の想定（例: スマホ初心者のご年配のお客様）}}

# 条件
- 別の専門用語で言い換えない
- 日常生活のたとえを1つ入れる
- 30秒で話せる長さ（150字以内）にする
- 正確さを損なう単純化はしない。省略した点があれば最後に1行で補足する

# 出力形式
- 言い換え（150字以内）
- 使えるたとえ
- 省略した点`,
    example: `入力: 用語「eSIM」、相手「スマホ初心者のご年配のお客様」

出力例:
言い換え: 「これまでカードを差し込んで使っていた電話番号の情報を、スマートフォンの中に直接書き込む仕組みです」…`,
    category: 'support',
    tags: ['接客', '言い換え', '説明', '携帯販売'],
    aiTools: ['ChatGPT', 'Claude', 'Gemini'],
    author: 'Niki',
    visibility: 'team',
    caution: '',
    favorite: true,
    usageCount: 58,
    rating: 5,
    version: 3,
    createdDaysAgo: 108,
    updatedDaysAgo: 5,
    revisionNotes: [
      '初版を登録',
      '150字以内の文字数条件を追加',
      '単純化しすぎて誤解を招いたため「省略した点」の明記を追加',
    ],
  },
  {
    id: 'sample_routing',
    title: '問い合わせ内容を担当部署別に分類する',
    description: '溜まった問い合わせを、担当部署・緊急度つきで仕分けします。',
    content: `あなたは問い合わせの一次受付担当です。
以下の問い合わせ一覧を、担当部署ごとに仕分けしてください。

# 入力
{{問い合わせ一覧}}

# 分類先
料金 / 故障・修理 / 契約手続き / 各種変更 / その他

# 条件
- 1件が複数に該当する場合は、主担当を1つ決めたうえで副担当を書く
- 判断できないものは「要人手確認」に入れる。無理に分類しない
- 緊急度（高 / 中 / 低）を付ける
- 個人情報が含まれる場合は該当箇所を [伏字] に置き換えて出力する

# 出力形式
表形式: No / 問い合わせ要約 / 主担当 / 副担当 / 緊急度`,
    example: `入力: 「①請求額が先月より高い ②画面が割れた ③引っ越しで住所変更したい」

出力例:
| 1 | 請求額の増加についての確認 | 料金 | — | 中 |
| 2 | 画面破損の修理相談 | 故障・修理 | — | 高 |…`,
    category: 'office',
    tags: ['分類', '問い合わせ', '業務効率化'],
    aiTools: ['ChatGPT', 'Claude', 'Copilot'],
    author: '大西 健',
    visibility: 'team',
    caution: '問い合わせ本文に含まれる氏名・電話番号は、貼り付ける前に必ず削除してください。',
    favorite: false,
    usageCount: 19,
    rating: 4,
    version: 1,
    createdDaysAgo: 27,
    updatedDaysAgo: 27,
    revisionNotes: ['初版を登録'],
  },
  {
    id: 'sample_job_posting',
    title: '販売スタッフ求人票のたたき台',
    description: '現場の実情をもとに、盛りすぎない求人票の原案を作ります。',
    content: `あなたは採用広報の担当者です。
以下の情報から求人票のたたき台を作成してください。

# 入力
- 職種: {{職種}}
- 業務内容: {{実際の1日の流れ}}
- 求める人物像: {{人物像}}
- 待遇: {{給与・休日・福利厚生}}

# 条件
- 「アットホームな職場」など、実態を伝えない決まり文句は使わない
- 大変な点も1つ正直に書く（入社後のギャップを防ぐため）
- 未経験者が不安に感じる点に、先回りして回答する
- 性別・年齢を限定する表現は使わない

# 出力形式
## 仕事内容
## 1日の流れ
## こんな方に向いています
## 大変なこと
## 待遇
## よくある質問（3つ）`,
    example: `入力: 職種「携帯ショップ販売スタッフ」、未経験歓迎、シフト制。

出力例:
## 仕事内容 ご来店されたお客様の用件をうかがい、料金プランのご案内や機種変更の手続きを行います。…`,
    category: 'hr',
    tags: ['採用', '求人票', 'ライティング'],
    aiTools: ['ChatGPT', 'Claude'],
    author: '中村 彩',
    visibility: 'private',
    caution: '労働条件の記載は労働基準法・職業安定法の要件を満たす必要があります。公開前に人事の確認を取ってください。',
    favorite: false,
    usageCount: 11,
    rating: 3,
    version: 1,
    createdDaysAgo: 16,
    updatedDaysAgo: 16,
    revisionNotes: ['初版を登録'],
  },
  {
    id: 'sample_campaign_idea',
    title: '店舗販促キャンペーンのアイデア出し',
    description: '条件を入れると、実行難易度つきで販促の企画案を出します。',
    content: `あなたは小売店の販促企画を数多く手がけてきたプランナーです。
以下の条件で、実行可能なキャンペーン案を出してください。

# 入力
- 目的: {{目的（来店数 / 契約数 / 認知）}}
- 予算: {{予算}}
- 実施期間: {{期間}}
- 店舗の強み・弱み: {{現状}}

# 条件
- 5案出し、それぞれ「準備にかかる工数」を 大 / 中 / 小 で示す
- うち2案は予算ゼロでも実行できる案にする
- 各案に、効果を測る指標を1つ添える
- 実現できない大掛かりな案は出さない

# 出力形式
案ごとに「タイトル / 内容 / 工数 / 必要なもの / 測定指標」`,
    example: `入力: 目的「来店数」、予算3万円、期間2週間、強み「駅前立地」、弱み「シニア層の来店が少ない」

出力例:
案1: スマホよろず相談デー（工数: 小 / 予算0円）…`,
    category: 'planning',
    tags: ['企画', '販促', 'アイデア出し'],
    aiTools: ['ChatGPT', 'Gemini', 'Claude'],
    author: '田中 美咲',
    visibility: 'private',
    caution: '',
    favorite: false,
    usageCount: 8,
    rating: 3,
    version: 1,
    createdDaysAgo: 6,
    updatedDaysAgo: 6,
    revisionNotes: ['初版を登録'],
  },
];

/** サンプルプロンプト（初回起動時のみ localStorage へ投入される） */
export function createSamplePrompts(): Prompt[] {
  return SEEDS.map(({ createdDaysAgo, updatedDaysAgo, revisionNotes, ...prompt }) => {
    const span = Math.max(createdDaysAgo - updatedDaysAgo, 0);
    return {
      ...prompt,
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(updatedDaysAgo),
      revisions: revisionNotes.map((note, index) => ({
        version: index + 1,
        // 初版は作成日、最新版は更新日、その間は等間隔に配置する
        updatedAt: daysAgo(
          revisionNotes.length === 1
            ? createdDaysAgo
            : createdDaysAgo - (span * index) / (revisionNotes.length - 1)
        ),
        author: prompt.author,
        note,
      })),
    };
  });
}
