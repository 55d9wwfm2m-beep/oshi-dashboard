import type { MetadataRoute } from 'next';

/**
 * PWAマニフェスト（/manifest.webmanifest として自動配信・自動リンク）。
 * ホーム画面に追加して使うことを前提とした設定。
 * ※ iOS Safariはホーム画面追加(PWA)にするとITPの7日ストレージ削除の対象外になる。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '推し活ダッシュボード',
    short_name: '推し活',
    description: '推しとの思い出・イベント・支出をひとつにまとめて、きせかえアバターを育てるアプリ',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF8F6',
    theme_color: '#FAF8F6',
    lang: 'ja',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
