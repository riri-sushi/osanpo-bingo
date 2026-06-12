# おさんぽビンゴ

散歩しながら遊ぶビンゴアプリ（PWA）。`osanpo-bingo.html` プロトタイプのデザイン・挙動・演出を Vite + React + TypeScript で再現したものです。

## 開発・ビルド

```bash
npm install
npm run dev      # 開発サーバ（http://localhost:5173）
npm run build    # 型チェック＋本番ビルド（dist/）
npm run preview  # ビルド結果をローカル配信（http://localhost:4173）
```

カメラ・シェア・PWA インストールは **HTTPS（または localhost）** が必須です。スマホ実機で確認する場合は、`dist/` を HTTPS で配信してください（例: `npx serve dist`＋トンネル、Netlify / Vercel / GitHub Pages など）。

## 技術構成

- **Vite + React + TypeScript**、スタイルは素の CSS（プロトタイプのデザイントークンを流用）。
- **PWA**（`vite-plugin-pwa`）: マニフェスト・Service Worker・オフラインキャッシュ・ホーム追加対応。アプリアイコンは `public/icon.svg` から各サイズを自動生成。
- サーバー/バックエンドなし。すべてクライアント完結。

## 主な実装

| 機能 | 実装 |
| --- | --- |
| マス入力 | `src/components/EditorSheet.tsx`（50文字・サロゲートペア対応カウンター） |
| マーク／リーチ／ビンゴ判定 | `src/bingo.ts`, `src/components/PlayScreen.tsx` |
| カメラ（長押し） | `src/components/CameraSheet.tsx`（`getUserMedia` 優先＋`<input capture>` フォールバック）、`src/imaging.ts`（中央クロップ） |
| クラッカー演出 | `src/confetti.ts`（canvas 物理・`prefers-reduced-motion` 尊重） |
| 盤面の画像化＋シェア | `src/boardImage.ts`, `src/share.ts`（`navigator.share` ＋ 保存/LINE/X フォールバック） |
| 交換コード | `src/swap.ts`（`btoa(encodeURIComponent(...))`、写真は含めない） |
| 永続化 | `src/storage.ts`（軽量データ=localStorage / 写真=IndexedDB） |

## 受け入れ基準の対応状況

- [x] ホームで 3×3 / 4×4 / 5×5 を選べる
- [x] 各マスに50文字以内で入力でき、カウンターが機能する
- [x] タップでマスが色づき／解除でき、色がポップ（5色をindexで割当）
- [x] 長押しでカメラ起動、写真がマス背景・文字は白（要 HTTPS 実機）
- [x] リーチ・ビンゴがバッジとアニメで一目で分かる
- [x] ビンゴでクラッカーが画面いっぱい（reduced-motion でオフ）
- [x] ビンゴ時に盤面プレビュー画像を生成、標準シェアシートで画像つき共有＋フォールバック
- [x] 交換コードを生成・コピー・読み込み（写真は含めない）
- [x] ブラウザを閉じても作成中／プレイ中のカードを復元
- [x] PWA としてホーム追加・オフライン基本動作
- [x] 絵文字なし（白黒ラインSVGアイコンのみ）
- [x] 見た目がプロトタイプと一致

> カメラ・標準シェアシート・PWA インストールは OS／ブラウザの API に依存するため、最終確認はスマホ実機（HTTPS）で行ってください。
