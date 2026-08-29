# ADR 001: LPモジュール分離と品質設計方針

## 1. Context（背景）
初期のLPは `index.html` 単一ファイル内に全スタイル（約1,400行のCSS）とスクリプトがインライン記述されたモノリス構成であった。
この構成は初期の即席プレビューには適していたが、以下の課題が生じていた：
1. **認知負荷と可読性の低下**: 1,800行を超えるファイル内でマークアップ、スタイル、ロジックが混在し、改修時の影響範囲特定が困難。
2. **キャッシュ効率とCore Web Vitalsの制約**: CSSやJSがHTML内に埋め込まれているため、ブラウザの静的ファイルキャッシュが効かず、HTMLペイロードサイズ肥大化によるレンダリングブロックが発生。
3. **データ更新の事故リスク**: 料金変更やメニュー追加の際に、HTML構造やCSSを誤って破壊するリスク。

## 2. Decision（意思決定）

### 2.1 モジュール分離とファイル構成
* **HTML ([index.html](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/index.html))**: セマンティックマークアップ（`<nav>`, `<header>`, `<main>`, `<section>`, `<footer>`）に特化。インラインスタイルを全廃。
* **CSS ([style.css](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/style.css))**: デザイントークン（`:root` のカラーパレット・タイポグラフィ）とコンポーネントクラスに構造化。
* **ロジック ([app.js](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/app.js))**: DOM操作、イベントリスナー、動的HTML生成、サニタイズ（`escapeHtml`）を集約。
* **設定データ ([prices.js](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/prices.js))**: 料金・メニュー・予約URLのシングルソースオブトゥルース（Single Source of Truth）。JSDoc型定義（`@typedef`）による型安全性を担保。

### 2.2 レスポンシブ設計基準
* **ブレークポイント**: `max-width: 800px`（タブレット/スマートフォン共通境界）および `max-width: 480px`（超小型デバイス）を採用。
  * 理由: 複雑な多段階ブレークポイントを排し、保守性とレイアウトの堅牢性を両立。
* **モバイルUI方針**: 800px以下ではナビリンクを非表示とし、画面右下の固定フローティングアクションバー（`.float-bar`）に予約・SNS導線を集約。

### 2.3 パフォーマンスとアクセシビリティ (Core Web Vitals & WAI-ARIA)
* **LCP対策**: ファーストビューのヒーロー背景画像に `fetchpriority="high"` を付与し、最速でデコード。
* **オフスクリーン画像**: ファーストビュー外の全画像に `loading="lazy"` および `decoding="async"` を付与。
* **イベント負荷軽減**: スクロールイベントに `{ passive: true }` を付与し、メインスレッドのブロッキングを防止。
* **FAQアコーディオン**: `<div>` ではなく `<button type="button" aria-expanded="false">` を採用し、キーボード操作およびスクリーンリーダーに対応。

### 2.4 テストとCI/CD
* **テスト基盤**: 外部依存（npmパッケージ）を追加せず、Node.js 20+ 標準の `node:test` / `node:assert` による軽量・ゼロデペンデンシーなテストスイートを構築。
* **自動化**: GitHub Actions によるプッシュ/PR時の自動テストパイプラインを配置。

### 2.5 本番ホスティングとセキュリティルーティング (Cloudflare Pages)
* **ホスティング環境**: GitHub リポジトリと Cloudflare Pages を直接連携し、`main` ブランチの更新に応じてエッジCDNへ即時自動デプロイ。
* **内部アセットの非公開化 (`_redirects`)**:
  * 静的サイトとしてリポジトリ直下をデプロイする構成上、内部ドキュメント（`docs/`、ADR、仕様書）やテストコード（`tests/`、`*.test.js`、`*.md` 等）が外部公開されるのを防ぐため、Cloudflare Pages の静的ルーティングルール（`_redirects`）を配置。
  * 該当ファイルへの直接URLアクセスを即座に `404 Not Found` として遮断し、開発用リソースの秘匿性を担保。

## 3. Consequences（影響・効果）
* **保守性の向上**: 非エンジニアは `prices.js` のみ編集すれば安全に料金・メニューを更新可能。
* **安全性の担保**: 自動回帰テストにより、リンク切れ、スキーマ不整合、セキュリティ属性漏れをCIで未然検知可能。
* **情報漏洩の防止**: Cloudflare Pages 上で内部ドキュメントやテストコードが `_redirects` により完全に遮断され、公開範囲の安全性が保証される。
* **既存資産の保全**: 旧ファイル（`index2.html`, `index_修正版.html` 等）は削除せず参照用として完全に保持。\n