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
├── tests/
│   └── test_suite.js     # 自動統合テストスイート（Node.js組み込みランナー）
├── docs/
│   └── adr/              # アーキテクチャ意思決定記録（ADR）
│       └── 001-lp-modular-architecture.md
└── .github/
    └── workflows/
        └── ci.yml        # GitHub Actions CI パイプライン
```

※ `index2.html`, `index_修正版.html` 等の過去バージョンは参照用として保持されています。

---

## ⚙️ 料金・メニュー・予約URLの更新方法

金額やメニュー内容、Airリザーブのリンク先を変更する場合は、**[`prices.js`](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/prices.js) のみを編集** してください。HTMLやCSSの直接編集は不要です。

```javascript
// prices.js の例
const PRICE_CONFIG = {
  // 予約リンクのURL
  reserveUrl: "https://airregi.jp/reserve/",

  // 基本貸卓料
  basePrice: {
    price: "¥1,500",
    ...
  },

  // プラン一覧（手ぶらBBQセット等）
  plans: [ ... ],

  // 詳細メニュー（ラーメン、カレー、生ビール等）
  detailedMenu: { ... }
};
```

---

## 🚀 ローカルでのプレビュー方法

macOS のターミナルから以下のコマンドでローカルサーバーを起動し、ブラウザで確認できます。

```bash
# プロジェクトディレクトリに移動
cd GoGoUmi_paradise_LP

# ローカルHTTPサーバーを起動 (ポート8000)
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開いて確認してください。

---

## 🧪 自動テストの実行

Node.js（v20以上）の標準テストランナーを使用して、スキーマ検証・リンク切れ・セキュリティ・アセット完全性を一括テストできます。

```bash
node --test tests/test_suite.js
```

---

## 📖 設計方針・アーキテクチャ

設計判断の意図（Why）やレスポンシブ設計基準、Core Web Vitals対策等の詳細については [ADR 001](file:///Users/yuuta/Antigravity/uminoie/GoGoUmi_paradise_LP/docs/adr/001-lp-modular-architecture.md) をご参照ください。\n