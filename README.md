# GoGoUmi paradise LP（興居島海の家 海の虜）

愛媛県松山市・興居島の海の家「GoGoUmi paradise（海の虜）」の公式ランディングページです。

---

## 📁 ディレクトリ・ファイル構成

```
.
├── index.html            # メインLP本体（日本語 / セマンティックHTML / 高速表示最適化）
├── style.css             # スタイルシート（デザイントークン / レスポンシブ定義）
├── app.js                # メインスクリプト（動的描画 / イベント制御 / XSSサニタイズ）
├── prices.js             # 料金・メニュー・予約URL設定ファイル（日本語マスターデータ）
├── images/               # 画像アセット（ロゴ・写真群）
├── en/                   # 英語版LP（index.html, prices.js）※インバウンド最適化
├── ko/                   # 韓国語版LP（index.html, prices.js）※インバウンド最適化
├── zh/                   # 繁体字中国語版LP（index.html, prices.js）※インバウンド最適化
├── games/                # 海の家 ミニゲームコレクション（WebGames）
│   ├── index.html        # ゲームポータル / 週替わりリダイレクト
│   ├── config.js         # 今週のゲーム・運用スケジュール設定
│   ├── config.test.js    # 設定・リダイレクト判定テスト
│   ├── style.css         # ポータル画面用スタイル
│   ├── common/           # 共通コンポーネント（クーポンマネージャー等）
│   └── apps/             # 各ミニゲーム
│       ├── watermelon-game/ # スイカ割りタイミングゲーム
│       ├── bbq-game/        # 爆速BBQ串メーカー
│       └── acai-game/       # 映えアサイー職人
├── tests/
│   └── test_suite.js     # 自動統合テストスイート（スキーマ検証・マスター突合・CI連動）
├── docs/
│   └── adr/              # アーキテクチャ意思決定記録（ADR）
│       ├── 001-lp-modular-architecture.md
│       └── 002-multilingual-inbound-strategy.md
├── _redirects            # Cloudflare Pages セキュリティルーティング（内部ファイル遮断）
└── .github/
    └── workflows/
        └── ci.yml        # GitHub Actions CI パイプライン（LP + 多言語 + 全ゲーム一括テスト）
```

※ `index2.html`, `index_修正版.html` 等の過去バージョンは参照用として保持されています。

---

## ⚙️ 運用設定・更新方法

### 1. LP料金・メニュー・予約URLの更新
金額やメニュー内容、Airリザーブのリンク先を変更する場合は、**[`prices.js`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/prices.js) のみを編集** してください。

### 2. 多言語（英語・韓国語・繁体字中国語）の運用と仕様
- **ファイル場所:** 各言語ディレクトリ内の `prices.js`（[`en/prices.js`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/en/prices.js), [`ko/prices.js`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/ko/prices.js), [`zh/prices.js`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/zh/prices.js)）を編集します。
- **インバウンド最適化仕様（イベント募集の非表示）:**
  海外観光客向けにノイズとなるイベント募集（マルシェ・DJ・ヨガ・撮影等の主催者募集）は、多言語版では**意図的に非表示**（`eventRecruit` 削除）にしています。一般観光（貸卓・手ぶらBBQ・カフェ・アクセス）に特化した構成です。
- **更新漏れ防止（マスター突合テスト）:**
  日本語版 `prices.js` をマスターデータとして、他言語版の金額・品目数・予約URLが一致しているかを自動テスト（`test_suite.js`）で検証しています。

### 3. 「今週のゲーム」週替わり切り替え
`games/config.js` の `activeGame`（または `schedule`）を編集します。
- 手動切り替え: `activeGame: 'watermelon'` / `'bbq'` / `'acai'` / `'portal'`
- スケジュール運用: `activeGame: null` に設定し `schedule` 配列に開始日を指定

---

## 🚀 ローカルでのプレビュー方法

macOS のターミナルから以下のコマンドでローカルサーバーを起動し、ブラウザで確認できます。

```bash
# プロジェクトディレクトリに移動
cd GoGoUmi_paradise_LP

# ローカルHTTPサーバーを起動 (ポート8000)
python3 -m http.server 8000
```

* 日本語LPトップ: `http://localhost:8000/`
* 英語版LP: `http://localhost:8000/en/`
* 韓国語版LP: `http://localhost:8000/ko/`
* 繁体字中国語版LP: `http://localhost:8000/zh/`
* ゲームポータル: `http://localhost:8000/games/`

---

## 🧪 自動テストの実行

Node.js（v20以上）を使用して、LP（日本語＋全多言語）および各ミニゲームの単体・統合テストを一括実行できます。

```bash
# LP統合テスト（スキーマ検証・多言語マスター突合・XSS・SEO・構造化データ）
node --test tests/test_suite.js

# WebGamesテスト
node games/config.test.js
node games/common/coupon-manager.test.js
node games/apps/watermelon-game/script.test.js
node games/apps/bbq-game/script.test.js
node games/apps/acai-game/script.test.js
node games/apps/acai-tower/script.test.js
```

---

## 🌐 本番環境・デプロイ構成

本プロジェクトは **Cloudflare Pages** と GitHub リポジトリを連携（Git統合）してホスティング・自動デプロイを行っています。

* **ホスティング基盤:** Cloudflare Pages（エッジCDN配信 / 高速グローバルルーティング）
* **デプロイフロー:** `main` ブランチへのプッシュにより自動デプロイ（即時エッジ反映）
* **内部アセットの保護（`_redirects`）:**
  静的サイトとしてリポジトリ直下を直接配信しているため、内部設計ドキュメント（`docs/`、ADR、仕様書）やテストコード（`tests/`、`*.test.js`、`*.md` 等）への直接URLアクセスは、[`_redirects`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/_redirects) によりすべて **404 Not Found** として遮断・非公開化されています。

---

## 📖 設計方針・アーキテクチャ

設計判断の意図（Why）や詳細については以下の ADR をご参照ください。
* [ADR 001: LPモジュール分離と品質設計方針](docs/adr/001-lp-modular-architecture.md)
* [ADR 002: 多言語対応とインバウンド向けコンテンツ最適化方針](docs/adr/002-multilingual-inbound-strategy.md)\n