# GoGoUmi paradise LP（興居島海の家 海の虜）

愛媛県松山市・興居島の海の家「GoGoUmi paradise（海の虜）」の公式ランディングページです。

---

## 📁 ディレクトリ・ファイル構成

```
.
├── index.html            # メインLP本体（セマンティックHTML / 高速表示最適化）
├── style.css             # スタイルシート（デザイントークン / レスポンシブ定義）
├── app.js                # メインスクリプト（動的描画 / イベント制御 / XSSサニタイズ）
├── prices.js             # 料金・メニュー・予約URL設定ファイル（設定のシングルソース）
├── images/               # 画像アセット（ロゴ・写真群）
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
│   └── test_suite.js     # 自動統合テストスイート（Node.js組み込みランナー）
├── docs/
│   └── adr/              # アーキテクチャ意思決定記録（ADR）
│       └── 001-lp-modular-architecture.md
└── .github/
    └── workflows/
        └── ci.yml        # GitHub Actions CI パイプライン（LP + 全ゲーム一括テスト）
```

※ `index2.html`, `index_修正版.html` 等の過去バージョンは参照用として保持されています。

---

## ⚙️ 運用設定・更新方法

### 1. LP料金・メニュー・予約URLの更新
金額やメニュー内容、Airリザーブのリンク先を変更する場合は、**[`prices.js`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/prices.js) のみを編集** してください。

### 2. 「今週のゲーム」週替わり切り替え
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

* LPトップ: `http://localhost:8000/`
* ゲームポータル: `http://localhost:8000/games/`

---

## 🧪 自動テストの実行

Node.js（v20以上）を使用して、LPおよび各ミニゲームの単体・統合テストを一括実行できます。

```bash
# LPテスト
node --test tests/test_suite.js

# WebGamesテスト
node games/config.test.js
node games/common/coupon-manager.test.js
node games/apps/watermelon-game/script.test.js
node games/apps/bbq-game/script.test.js
node games/apps/acai-game/script.test.js
```

---

## 📖 設計方針・アーキテクチャ

設計判断の意図（Why）やレスポンシブ設計基準、Core Web Vitals対策等の詳細については [ADR 001](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/docs/adr/001-lp-modular-architecture.md) をご参照ください。\n