import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// ==========================================
// 1. prices.js のデータ構造 & ドメイン整合性テスト (Task 21)
// ==========================================
test("PRICE_CONFIG スキーマおよびデータ妥当性検証", () => {
  const pricesCode = fs.readFileSync("prices.js", "utf-8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(pricesCode, context);
  const cfg = context.PRICE_CONFIG || context.window.PRICE_CONFIG;

  assert.ok(cfg, "PRICE_CONFIG がエクスポートされていること");
  assert.ok(cfg.reserveUrl.startsWith("http"), "reserveUrl が有効なURLであること");
  
  // セクション情報
  assert.ok(cfg.section.title, "section.title が定義されていること");
  assert.ok(cfg.section.kicker, "section.kicker が定義されていること");

  // Step 1: 基本貸卓料
  assert.ok(cfg.basePrice.price.includes("¥"), "基本貸卓料に価格が含まれること");
  assert.ok(Array.isArray(cfg.basePrice.features), "features が配列であること");
  assert.ok(cfg.basePrice.features.length > 0, "features に1件以上の項目があること");

  // ファーストオーダー制 (Order Rule)
  assert.ok(cfg.orderRule, "orderRule が定義されていること");
  assert.ok(cfg.orderRule.title.includes("1ドリンク"), "orderRule.title に1ドリンクが含まれること");
  assert.ok(cfg.orderRule.desc, "orderRule.desc が定義されていること");

  // Step 2: プラン
  assert.ok(Array.isArray(cfg.plans), "plans が配列であること");
  assert.ok(cfg.plans.length >= 2, "2件以上のプランが存在すること");
  cfg.plans.forEach(p => {
    assert.ok(p.title, "プランにtitleがあること");
    assert.ok(p.price, "プランにpriceがあること");
    assert.ok(Array.isArray(p.list), "プランにlist配列があること");
  });

  // 貸切・団体利用 (Charter)
  assert.ok(cfg.charter, "charter 設定が定義されていること");
  assert.equal(typeof cfg.charter.minGuests, "number", "charter.minGuests が数値であること");
  assert.ok(cfg.charter.minGuests > 0, "charter.minGuests が正の数値であること");
  assert.ok(Array.isArray(cfg.charter.features), "charter.features が配列であること");
  assert.ok(cfg.charter.contactText, "charter.contactText が定義されていること");

  // イベント募集 (Event Recruit)
  assert.ok(cfg.eventRecruit, "eventRecruit 設定が定義されていること");
  assert.ok(Array.isArray(cfg.eventRecruit.categories), "eventRecruit.categories が配列であること");
  assert.ok(cfg.eventRecruit.categories.length >= 4, "イベント募集カテゴリが4件以上あること");
  assert.ok(Array.isArray(cfg.eventRecruit.supportList), "eventRecruit.supportList が配列であること");

  // 詳細メニュー
  assert.ok(Array.isArray(cfg.detailedMenu.foodItems), "foodItems が配列であること");
  assert.ok(Array.isArray(cfg.detailedMenu.drinkItems), "drinkItems が配列であること");
  cfg.detailedMenu.foodItems.forEach(item => {
    assert.ok(item.name && item.price, "フード項目に名前と価格があること");
  });
  cfg.detailedMenu.drinkItems.forEach(item => {
    assert.ok(item.name && item.price, "ドリンク項目に名前と価格があること");
  });
});

// ==========================================
// 2. index.html のセマンティクス & アセット完全性テスト (Task 1 / 4 / 23)
// ==========================================
test("index.html のアセットおよび文書構造検証", () => {
  const html = fs.readFileSync("index.html", "utf-8");

  // セマンティックタグの確認
  assert.ok(html.includes("<nav"), "<nav> タグが存在すること");
  assert.ok(html.includes("<header"), "<header> タグが存在すること");
  assert.ok(html.includes("<main>"), "<main> タグが存在すること");
  assert.ok(html.includes("</main>"), "</main> タグが存在すること");
  assert.ok(html.includes("<footer"), "<footer> タグが存在すること");

  // ナビゲーションおよび新セクションの確認
  assert.ok(html.includes('href="#events"'), "navリンクに #events が存在すること");
  assert.ok(html.includes('id="events"'), "id=events のセクションが存在すること");
  assert.ok(html.includes('id="price"'), "id=price のセクションが存在すること");

  // 外部アセット読み込みの確認
  assert.ok(html.includes('<link rel="stylesheet" href="style.css">'), "style.css がリンクされていること");
  assert.ok(html.includes('<script src="prices.js" defer></script>'), "prices.js が defer で読み込まれていること");
  assert.ok(html.includes('<script src="app.js" defer></script>'), "app.js が defer で読み込まれていること");

  // インラインスタイルの残存チェック (0件であること)
  const inlineStyles = html.match(/style=["'][^"']+["']/g);
  assert.equal(inlineStyles, null, "index.html にインラインスタイルが残存していないこと");

  // FAQボタン要素とアクセシビリティ（8問以上）
  const faqButtons = html.match(/<button [^>]*class=["']faq-q["']/g);
  assert.ok(faqButtons && faqButtons.length >= 8, "FAQ質問がすべてbutton要素であり8件以上存在すること");

  // アクセスマップ埋め込みの確認
  assert.ok(html.includes('<div class="access-map">'), "access-map コンテナが存在すること");
  assert.ok(html.includes('<iframe'), "iframe が存在すること");
  assert.ok(html.includes('loading="lazy"'), "iframe に loading=lazy が指定されていること");
  assert.ok(html.includes('referrerpolicy="no-referrer-when-downgrade"'), "iframe に安全な referrerpolicy が指定されていること");

  // 画像の存在チェック
  const imgRegex = /<img [^>]*src=["']([^"']+)["']/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    assert.ok(fs.existsSync(src), `画像ファイルが存在すること: ${src}`);
  }
});

// ==========================================
// 3. セキュリティ監査テスト (Task 19)
// ==========================================
test("セキュリティ属性（Tabnabbing対策・XSS対策）の検証", () => {
  const html = fs.readFileSync("index.html", "utf-8");
  
  // target="_blank" のリンクに rel="noopener noreferrer" があるか
  const aRegex = /<a [^>]*target=["']_blank["'][^>]*>/g;
  let match;
  while ((match = aRegex.exec(html)) !== null) {
    const tag = match[0];
    assert.ok(tag.includes('rel="noopener noreferrer"'), `target="_blank" に rel="noopener noreferrer" が付与されていること: ${tag}`);
  }

  // app.js に escapeHtml が定義されていること
  const appCode = fs.readFileSync("app.js", "utf-8");
  assert.ok(appCode.includes("function escapeHtml"), "app.js に escapeHtml 関数が実装されていること");
});

// ==========================================
// 4. style.css デザイントークン検証 (Task 7)
// ==========================================
test("style.css デザイントークンおよびレイアウト定義の検証", () => {
  const css = fs.readFileSync("style.css", "utf-8");

  // カラー変数の定義
  assert.ok(css.includes("--blue:"), "--blue が定義されていること");
  assert.ok(css.includes("--deep:"), "--deep が定義されていること");
  assert.ok(css.includes("--accent:"), "--accent が定義されていること");
  assert.ok(css.includes("--sand:"), "--sand が定義されていること");

  // FAQボタン用のリセットスタイル
  assert.ok(css.includes(".faq-q {"), ".faq-q のスタイルが定義されていること");

  // 新規追加コンポーネントのスタイル検証
  assert.ok(css.includes(".price-order-rule"), ".price-order-rule のスタイルが定義されていること");
  assert.ok(css.includes(".price-charter-card"), ".price-charter-card のスタイルが定義されていること");
  assert.ok(css.includes(".events {"), ".events のスタイルが定義されていること");
  assert.ok(css.includes(".event-grid {"), ".event-grid のスタイルが定義されていること");
  assert.ok(css.includes(".access-map"), ".access-map のスタイルが定義されていること");
  assert.ok(css.includes(".btn-map-link"), ".btn-map-link のスタイルが定義されていること");
});

// ==========================================
// 5. games/ ディレクトリおよび運用設定の整合性検証
// ==========================================
test("games/ ディレクトリおよび設定ファイルの整合性検証", () => {
  assert.ok(fs.existsSync("games/index.html"), "games/index.html が存在すること");
  assert.ok(fs.existsSync("games/config.js"), "games/config.js が存在すること");
  assert.ok(fs.existsSync("games/common/coupon-manager.js"), "coupon-manager.js が存在すること");
  assert.ok(fs.existsSync("games/apps/watermelon-game/index.html"), "スイカ割りゲームが存在すること");
  assert.ok(fs.existsSync("games/apps/bbq-game/index.html"), "BBQゲームが存在すること");
  assert.ok(fs.existsSync("games/apps/acai-game/index.html"), "アサイーゲームが存在すること");
});

// ==========================================
// 6. SEO・メタタグ・構造化データ・クローラー設定の検証
// ==========================================
test("SEOメタタグ・OGP・Twitterカードの検証", () => {
  const html = fs.readFileSync("index.html", "utf-8");

  // Title & Description & Canonical & Robots
  assert.ok(html.includes("<title>GoGoUmi paradise｜海の虜 — 愛媛県松山市・興居島の海の家＆ビーチBBQ</title>"), "SEO最適化されたtitleが存在すること");
  assert.ok(html.includes('<meta name="description"'), "meta description が存在すること");
  assert.ok(html.includes('<meta name="robots" content="index, follow">'), "robots meta tag が存在すること");
  assert.ok(html.includes('<link rel="canonical" href="https://gogoumi-paradise.com/">'), "canonical リンクが存在すること");

  // OGP Tags
  assert.ok(html.includes('<meta property="og:type" content="website">'), "og:type が存在すること");
  assert.ok(html.includes('<meta property="og:locale" content="ja_JP">'), "og:locale が存在すること");
  assert.ok(html.includes('<meta property="og:title"'), "og:title が存在すること");
  assert.ok(html.includes('<meta property="og:description"'), "og:description が存在すること");
  assert.ok(html.includes('<meta property="og:url" content="https://gogoumi-paradise.com/">'), "og:url が存在すること");
  assert.ok(html.includes('<meta property="og:image"'), "og:image が存在すること");

  // Twitter Card
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'), "twitter:card が存在すること");
  assert.ok(html.includes('<meta name="twitter:title"'), "twitter:title が存在すること");
  assert.ok(html.includes('<meta name="twitter:description"'), "twitter:description が存在すること");
  assert.ok(html.includes('<meta name="twitter:image"'), "twitter:image が存在すること");
});

test("構造化データ (JSON-LD) の構文およびスキーマ検証", () => {
  const html = fs.readFileSync("index.html", "utf-8");
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const jsonLdBlocks = [];
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    const parsed = JSON.parse(match[1].trim());
    jsonLdBlocks.push(parsed);
  }

  assert.equal(jsonLdBlocks.length, 2, "JSON-LDスクリプトが2ブロック存在すること（LocalBusiness + FAQPage）");

  // LocalBusiness スキーマ検証
  const business = jsonLdBlocks.find(b => Array.isArray(b["@type"]) ? b["@type"].includes("LocalBusiness") : b["@type"] === "LocalBusiness");
  assert.ok(business, "LocalBusiness スキーマが存在すること");
  assert.equal(business["@context"], "https://schema.org");
  assert.ok(business.name.includes("GoGoUmi paradise"), "店舗名が正しいこと");
  assert.equal(business.telephone, "080-4999-0246");
  assert.ok(business.address && business.address.addressRegion === "愛媛県", "住所情報が正しく設定されていること");
  assert.ok(business.geo && business.geo.latitude, "緯度経度が設定されていること");
  assert.ok(Array.isArray(business.openingHoursSpecification), "営業時間が設定されていること");

  // FAQPage スキーマ検証
  const faq = jsonLdBlocks.find(b => b["@type"] === "FAQPage");
  assert.ok(faq, "FAQPage スキーマが存在すること");
  assert.equal(faq["@context"], "https://schema.org");
  assert.ok(Array.isArray(faq.mainEntity), "mainEntity が配列であること");
  assert.equal(faq.mainEntity.length, 8, "FAQの質問が8問すべて構造化データに含まれること");
  faq.mainEntity.forEach(q => {
    assert.equal(q["@type"], "Question");
    assert.ok(q.name, "Questionにnameがあること");
    assert.equal(q.acceptedAnswer["@type"], "Answer");
    assert.ok(q.acceptedAnswer.text, "Answerにtextがあること");
  });
});

test("クローラー制御設定ファイル (robots.txt / sitemap.xml) の検証", () => {
  // robots.txt
  assert.ok(fs.existsSync("robots.txt"), "robots.txt が存在すること");
  const robots = fs.readFileSync("robots.txt", "utf-8");
  assert.ok(robots.includes("User-agent: *"), "robots.txt に User-agent: * が含まれること");
  assert.ok(robots.includes("Allow: /"), "robots.txt に Allow: / が含まれること");
  assert.ok(robots.includes("Sitemap:"), "robots.txt に Sitemap ディレクティブが含まれること");

  // sitemap.xml
  assert.ok(fs.existsSync("sitemap.xml"), "sitemap.xml が存在すること");
  const sitemap = fs.readFileSync("sitemap.xml", "utf-8");
  assert.ok(sitemap.includes("<urlset"), "sitemap.xml に <urlset> が含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/</loc>"), "トップページのlocが含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/games/</loc>"), "ゲームポータルのlocが含まれること");
});

