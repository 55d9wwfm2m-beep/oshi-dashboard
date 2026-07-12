import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | 推し活ダッシュボード',
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'データの保存場所',
    body: [
      '推しのプロフィール・イベント・参戦ログ・支出・写真・アバターなど、このアプリで入力したすべてのデータは、お使いの端末のブラウザ内（localStorage）にのみ保存されます。',
      '外部のサーバーへ送信されることはなく、運営者を含む第三者があなたのデータを閲覧することはできません。',
    ],
  },
  {
    title: '収集しない情報',
    body: [
      'アカウント登録は不要で、氏名・メールアドレス等の個人情報を収集しません。',
      'アクセス解析ツール・広告配信・トラッキング（Cookie等による行動追跡）は使用していません。',
    ],
  },
  {
    title: '写真について',
    body: [
      'プロフィールやグッズに設定した写真は、縮小されたうえで端末内にのみ保存されます。アップロードは行われません。',
    ],
  },
  {
    title: 'バックアップと削除',
    body: [
      'プロフィール画面の「データのバックアップ」から、全データをJSONファイルとして書き出し・読み込みできます。ファイルの管理はご自身で行ってください。',
      'ブラウザのサイトデータを削除すると、このアプリのデータも完全に消去されます。復元手段はバックアップファイルのみです。',
      'なお、iOSのSafariでは、ブラウザとして7日間利用がないとサイトデータが自動削除されることがあります。「ホーム画面に追加」してご利用いただくと、この自動削除の対象外になります。',
    ],
  },
  {
    title: '免責事項',
    body: [
      '端末の故障・紛失・ブラウザのデータ削除等によるデータの消失について、運営者は責任を負いかねます。大切な思い出は定期的なバックアップをお願いします。',
    ],
  },
  {
    title: '改定について',
    body: [
      '本ポリシーの内容は、機能の追加等にともない予告なく改定されることがあります。重要な変更がある場合は、アプリ内でお知らせします。',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-8 pb-4">
        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: '#A8A29E' }}>Privacy</p>
        <h1 className="text-2xl font-semibold mt-0.5" style={{ color: '#1C1917' }}>プライバシーポリシー</h1>
        <p className="text-xs mt-2 leading-relaxed" style={{ color: '#8F877F' }}>
          「推し活ダッシュボード」は、あなたのデータがあなたの端末から出ていかない設計のアプリです。
        </p>
      </div>

      <div className="px-4 space-y-3">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-5">
            <h2 className="text-sm font-semibold mb-2" style={{ color: '#1C1917' }}>{s.title}</h2>
            {s.body.map((line, i) => (
              <p key={i} className="text-xs leading-relaxed mb-1.5 last:mb-0" style={{ color: '#78716C' }}>
                {line}
              </p>
            ))}
          </section>
        ))}

        <p className="text-[11px] text-center pt-2" style={{ color: '#B8B0A8' }}>
          制定日: 2026年7月12日
        </p>
        <div className="text-center pb-4">
          <Link href="/profile" className="text-xs" style={{ color: 'rgb(196,164,160)' }}>
            ← プロフィールに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
