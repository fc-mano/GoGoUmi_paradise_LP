import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// テスト対象言語リスト（ルートは日本語、他は各言語ディレクトリ）
const LANGUAGES = [
  { code: "ja", dir: ".", pricesFile: "prices.js", htmlFile: "index.html" },
  { code: "en", dir: "en", pricesFile: "en/prices.js", htmlFile: "en/index.html" },
  { code: "ko", dir: "ko", pricesFile: "ko/prices.js", htmlFile: "ko/index.html" },
  { code: "zh", dir: "zh", pricesFile: "zh/prices.js", htmlFile: "zh/index.html" }
];

// prices.js 設定読み込みヘルパー
function loadPriceConfig(pricesFile) {
  assert.ok(fs.existsSync(pricesFile), `${pricesFile} が存在すること`);
  const pricesCode = fs.readFileSync(pricesFile, "utf-8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(pricesCode, context);
  const cfg = context.PRICE_CONFIG || context.window.PRICE_CONFIG;
  assert.ok(cfg, `${pricesFile} から PRICE_CONFIG がエクスポートされていること`);
  return cfg;
}

// ==========================================
// 1. prices.js の多言語データ構造 & ドメイン整合性テスト
// ==========================================
test("PRICE_CONFIG スキーマおよびデータ妥当性検証 (多言語: ja, en, ko, zh)", () => {
  for (const lang of LANGUAGES) {
    const cfg = loadPriceConfig(lang.pricesFile);

    assert.ok(cfg.reserveUrl.startsWith("http"), `[${lang.code}] reserveUrl が有効なURLであること`);

    // セクション情報
    assert.ok(cfg.section.title, `[${lang.code}] section.title が定義されていること`);
    assert.ok(cfg.section.kicker, `[${lang.code}] section.kicker が定義されていること`);

    // Step 1: 基本貸卓料
    assert.ok(cfg.basePrice.price.includes("¥"), `[${lang.code}] 基本貸卓料に価格が含まれること`);
    assert.ok(Array.isArray(cfg.basePrice.features), `[${lang.code}] features が配列であること`);
    assert.ok(cfg.basePrice.features.length > 0, `[${lang.code}] features に1件以上の項目があること`);

    // ファーストオーダー制 (Order Rule)
    assert.ok(cfg.orderRule, `[${lang.code}] orderRule が定義されていること`);
    assert.ok(cfg.orderRule.badge, `[${lang.code}] orderRule.badge が定義されていること`);
    assert.ok(cfg.orderRule.title, `[${lang.code}] orderRule.title が定義されていること`);
    assert.ok(cfg.orderRule.desc, `[${lang.code}] orderRule.desc が定義されていること`);

    // Step 2: プラン
    assert.ok(Array.isArray(cfg.plans), `[${lang.code}] plans が配列であること`);
    assert.ok(cfg.plans.length >= 2, `[${lang.code}] 2件以上のプランが存在すること`);
    cfg.plans.forEach(p => {
      assert.ok(p.title, `[${lang.code}] プランにtitleがあること`);
      assert.ok(p.price, `[${lang.code}] プランにpriceがあること`);
      assert.ok(Array.isArray(p.list), `[${lang.code}] プランにlist配列があること`);
    });

    // 貸切・団体利用 (Charter)
    assert.ok(cfg.charter, `[${lang.code}] charter 設定が定義されていること`);
    assert.equal(typeof cfg.charter.minGuests, "number", `[${lang.code}] charter.minGuests が数値であること`);
    assert.ok(cfg.charter.minGuests > 0, `[${lang.code}] charter.minGuests が正の数値であること`);
    assert.ok(Array.isArray(cfg.charter.features), `[${lang.code}] charter.features が配列であること`);
    assert.ok(cfg.charter.contactText, `[${lang.code}] charter.contactText が定義されていること`);

    // イベント募集 (Event Recruit: 日本語のみ必須、多言語版はインバウンド向けに非表示)
    if (lang.code === "ja") {
      assert.ok(cfg.eventRecruit, `[${lang.code}] eventRecruit 設定が定義されていること`);
      assert.ok(Array.isArray(cfg.eventRecruit.categories), `[${lang.code}] eventRecruit.categories が配列であること`);
      assert.ok(cfg.eventRecruit.categories.length >= 4, `[${lang.code}] イベント募集カテゴリが4件以上あること`);
      assert.ok(Array.isArray(cfg.eventRecruit.supportList), `[${lang.code}] eventRecruit.supportList が配列であること`);
    } else {
      assert.equal(cfg.eventRecruit, undefined, `[${lang.code}] 多言語版ではインバウンド最適化のため eventRecruit が未定義であること`);
    }

    // 詳細メニュー
    assert.ok(Array.isArray(cfg.detailedMenu.foodItems), `[${lang.code}] foodItems が配列であること`);
    assert.ok(Array.isArray(cfg.detailedMenu.drinkItems), `[${lang.code}] drinkItems が配列であること`);
    cfg.detailedMenu.foodItems.forEach(item => {
      assert.ok(item.name && item.price, `[${lang.code}] フード項目に名前と価格があること: ${item.name}`);
    });
    cfg.detailedMenu.drinkItems.forEach(item => {
      assert.ok(item.name && item.price, `[${lang.code}] ドリンク項目に名前と価格があること: ${item.name}`);
    });
  }
});

// 価格文字列から数値を抽出（例: "¥1,500" -> 1500, "カウンター注文" -> null）
function extractPriceNumber(priceStr) {
  if (typeof priceStr !== "string") return null;
  const digits = priceStr.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

// ==========================================
// 1-2. 日本語マスター(prices.js)と多言語(en, ko, zh)のクロスバリデーション検証
// ==========================================
test("多言語 prices.js の金額・品目数・予約URLのマスター突合検証 (更新漏れ検知)", () => {
  const jaCfg = loadPriceConfig("prices.js");

  const foreignLangs = LANGUAGES.filter(l => l.code !== "ja");

  for (const lang of foreignLangs) {
    const targetCfg = loadPriceConfig(lang.pricesFile);

    // 1. 予約URLの一致
    assert.equal(
      targetCfg.reserveUrl,
      jaCfg.reserveUrl,
      `[${lang.code}] reserveUrl (${targetCfg.reserveUrl}) が日本語マスター (${jaCfg.reserveUrl}) と一致すること`
    );

    // 2. 基本貸卓料 (basePrice.price) の数値一致
    const jaBasePriceNum = extractPriceNumber(jaCfg.basePrice.price);
    const targetBasePriceNum = extractPriceNumber(targetCfg.basePrice.price);
    assert.equal(
      targetBasePriceNum,
      jaBasePriceNum,
      `[${lang.code}] 基本貸卓料の金額 (${targetBasePriceNum}) が日本語マスター (${jaBasePriceNum}) と一致すること`
    );

    // 3. プラン数および各プラン金額・属性の一致
    assert.equal(
      targetCfg.plans.length,
      jaCfg.plans.length,
      `[${lang.code}] プラン数 (${targetCfg.plans.length}) が日本語マスター (${jaCfg.plans.length}) と一致すること`
    );

    targetCfg.plans.forEach((p, i) => {
      const jaPlan = jaCfg.plans[i];
      const jaPlanPriceNum = extractPriceNumber(jaPlan.price);
      const targetPlanPriceNum = extractPriceNumber(p.price);

      if (jaPlanPriceNum !== null) {
        // 数値価格プラン（BBQセット等）: 金額が完全に一致すること
        assert.equal(
          targetPlanPriceNum,
          jaPlanPriceNum,
          `[${lang.code}] プラン[${i}]「${jaPlan.title}」の金額 (${targetPlanPriceNum}) が日本語マスター (${jaPlanPriceNum}) と一致すること`
        );
      } else {
        // テキスト表記プラン（カウンター注文等）: 各言語で空文字でないこと
        assert.ok(
          typeof p.price === "string" && p.price.trim().length > 0,
          `[${lang.code}] プラン[${i}]「${jaPlan.title}」の価格表記が定義されていること`
        );
      }

      assert.equal(
        p.featured,
        jaPlan.featured,
        `[${lang.code}] プラン[${i}]「${jaPlan.title}」のおすすめフラグ (featured) が一致すること`
      );
      assert.equal(
        p.hasReserveButton,
        jaPlan.hasReserveButton,
        `[${lang.code}] プラン[${i}]「${jaPlan.title}」の予約ボタン有無 (hasReserveButton) が一致すること`
      );
    });

    // 4. 団体・貸切 (charter.minGuests, contactUrl) の一致
    assert.equal(
      targetCfg.charter.minGuests,
      jaCfg.charter.minGuests,
      `[${lang.code}] charter.minGuests が日本語マスターと一致すること`
    );
    assert.equal(
      targetCfg.charter.contactUrl,
      jaCfg.charter.contactUrl,
      `[${lang.code}] charter.contactUrl が日本語マスターと一致すること`
    );

    // 5. フード詳細メニュー (foodItems) の品目数および価格の一致
    assert.equal(
      targetCfg.detailedMenu.foodItems.length,
      jaCfg.detailedMenu.foodItems.length,
      `[${lang.code}] フードメニュー品目数 (${targetCfg.detailedMenu.foodItems.length}) が日本語マスター (${jaCfg.detailedMenu.foodItems.length}) と一致すること`
    );

    targetCfg.detailedMenu.foodItems.forEach((item, i) => {
      const jaItem = jaCfg.detailedMenu.foodItems[i];
      const jaItemPriceNum = extractPriceNumber(jaItem.price);
      const targetItemPriceNum = extractPriceNumber(item.price);
      assert.equal(
        targetItemPriceNum,
        jaItemPriceNum,
        `[${lang.code}] フード[${i}]「${jaItem.name}」の価格 (${targetItemPriceNum}) が日本語マスター (${jaItemPriceNum}) と一致すること`
      );
    });

    // 6. ドリンク詳細メニュー (drinkItems) の品目数および価格の一致
    assert.equal(
      targetCfg.detailedMenu.drinkItems.length,
      jaCfg.detailedMenu.drinkItems.length,
      `[${lang.code}] ドリンクメニュー品目数 (${targetCfg.detailedMenu.drinkItems.length}) が日本語マスター (${jaCfg.detailedMenu.drinkItems.length}) と一致すること`
    );

    targetCfg.detailedMenu.drinkItems.forEach((item, i) => {
      const jaItem = jaCfg.detailedMenu.drinkItems[i];
      const jaItemPriceNum = extractPriceNumber(jaItem.price);
      const targetItemPriceNum = extractPriceNumber(item.price);
      assert.equal(
        targetItemPriceNum,
        jaItemPriceNum,
        `[${lang.code}] ドリンク[${i}]「${jaItem.name}」の価格 (${targetItemPriceNum}) が日本語マスター (${jaItemPriceNum}) と一致すること`
      );
    });
  }
});

// ==========================================
// 2. index.html の多言語セマンティクス & アセット完全性テスト
// ==========================================
test("index.html のアセットおよび文書構造検証 (多言語: ja, en, ko, zh)", () => {
  for (const lang of LANGUAGES) {
    assert.ok(fs.existsSync(lang.htmlFile), `[${lang.code}] ${lang.htmlFile} が存在すること`);
    const html = fs.readFileSync(lang.htmlFile, "utf-8");

    // セマンティックタグの確認
    assert.ok(html.includes("<nav"), `[${lang.code}] <nav> タグが存在すること`);
    assert.ok(html.includes("<header"), `[${lang.code}] <header> タグが存在すること`);
    assert.ok(html.includes("<main>"), `[${lang.code}] <main> タグが存在すること`);
    assert.ok(html.includes("</main>"), `[${lang.code}] </main> タグが存在すること`);
    assert.ok(html.includes("<footer"), `[${lang.code}] <footer> タグが存在すること`);

    // 主要セクションの確認
    assert.ok(html.includes('id="price"'), `[${lang.code}] id=price のセクションが存在すること`);

    // インラインスタイルの残存チェック (0件であること)
    const inlineStyles = html.match(/style=["'][^"']+["']/g);
    assert.equal(inlineStyles, null, `[${lang.code}] index.html にインラインスタイルが残存していないこと`);

    // アクセスマップ埋め込みの確認
    assert.ok(html.includes('<div class="access-map">'), `[${lang.code}] access-map コンテナが存在すること`);
    assert.ok(html.includes('<iframe'), `[${lang.code}] iframe が存在すること`);
    assert.ok(html.includes('loading="lazy"'), `[${lang.code}] iframe に loading=lazy が指定されていること`);

    // 画像の存在チェック（各HTMLの階層を考慮してパス解決）
    const imgRegex = /<img [^>]*src=["']([^"']+)["']/g;
    let match;
    const htmlDir = path.dirname(lang.htmlFile);
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (src.startsWith("http")) continue;
      const resolvedPath = path.resolve(htmlDir, src);
      assert.ok(fs.existsSync(resolvedPath), `[${lang.code}] 画像ファイルが存在すること: ${src} (resolved: ${resolvedPath})`);
    }

    // 言語スイッチャー (Language Switcher) の存在確認
    assert.ok(html.includes('class="lang-switcher"'), `[${lang.code}] lang-switcher コンテナが存在すること`);
    assert.ok(html.includes('class="lang-btn"'), `[${lang.code}] lang-btn が存在すること`);
    assert.ok(html.includes('class="lang-dropdown"'), `[${lang.code}] lang-dropdown が存在すること`);
    assert.ok(html.includes('class="footer-lang"'), `[${lang.code}] footer-lang が存在すること`);

    // target="_blank" のリンクに rel="noopener" または rel="noopener noreferrer" があるか
    const aRegex = /<a [^>]*target=["']_blank["'][^>]*>/g;
    while ((match = aRegex.exec(html)) !== null) {
      const tag = match[0];
      assert.ok(tag.includes('rel="noopener'), `[${lang.code}] target="_blank" に rel="noopener" が付与されていること: ${tag}`);
    }
  }
});

// ==========================================
// 3. セキュリティ & escapeHtml 単体テスト
// ==========================================
test("XSSサニタイズ (escapeHtml) の単体テストおよびセキュリティ検証", () => {
  const { escapeHtml, setupLanguageSwitcher } = require("../app.js");
  assert.equal(typeof escapeHtml, "function", "escapeHtml 関数がインポートできること");
  assert.equal(typeof setupLanguageSwitcher, "function", "setupLanguageSwitcher 関数がインポートできること");

  // XSS 危険文字のエスケープ検証
  assert.equal(
    escapeHtml('<script>alert("XSS")</script>'),
    "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
    "< > \" がエスケープされること"
  );
  assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry", "& がエスケープされること");
  assert.equal(escapeHtml("It's fine"), "It&#039;s fine", "' がエスケープされること");
  assert.equal(escapeHtml("<b>Safe text</b>"), "&lt;b&gt;Safe text&lt;/b&gt;");

  // 異常値入力に対する安全性
  assert.equal(escapeHtml(null), "", "null は空文字を返すこと");
  assert.equal(escapeHtml(undefined), "", "undefined は空文字を返すこと");
  assert.equal(escapeHtml(123), "", "数値は空文字を返すこと");
  assert.equal(escapeHtml({}), "", "オブジェクトは空文字を返すこと");
});

// ==========================================
// 4. style.css デザイントークン検証
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
  assert.ok(css.includes(".lang-switcher"), ".lang-switcher のスタイルが定義されていること");
  assert.ok(css.includes(".lang-dropdown"), ".lang-dropdown のスタイルが定義されていること");
  assert.ok(css.includes(".footer-lang"), ".footer-lang のスタイルが定義されていること");
});

// ==========================================
// 5. games/ ディレクトリおよび運用設定の整合性検証
// ==========================================
test("games/ ディレクトリおよび設定ファイルの整合性検証 (全ゲーム)", () => {
  assert.ok(fs.existsSync("games/index.html"), "games/index.html が存在すること");
  assert.ok(fs.existsSync("games/config.js"), "games/config.js が存在すること");
  assert.ok(fs.existsSync("games/common/coupon-manager.js"), "coupon-manager.js が存在すること");
  assert.ok(fs.existsSync("games/apps/watermelon-game/index.html"), "スイカ割りゲームが存在すること");
  assert.ok(fs.existsSync("games/apps/bbq-game/index.html"), "BBQゲームが存在すること");
  assert.ok(fs.existsSync("games/apps/acai-game/index.html"), "アサイー職人ゲームが存在すること");
  assert.ok(fs.existsSync("games/apps/acai-tower/index.html"), "アサイータワーゲームが存在すること");
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

  // sitemap.xml（多言語全URLの登録検証）
  assert.ok(fs.existsSync("sitemap.xml"), "sitemap.xml が存在すること");
  const sitemap = fs.readFileSync("sitemap.xml", "utf-8");
  assert.ok(sitemap.includes("<urlset"), "sitemap.xml に <urlset> が含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/</loc>"), "トップページのlocが含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/en/</loc>"), "英語版のlocが含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/zh/</loc>"), "中国語版のlocが含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/ko/</loc>"), "韓国語版のlocが含まれること");
  assert.ok(sitemap.includes("<loc>https://gogoumi-paradise.com/games/</loc>"), "ゲームポータルのlocが含まれること");
});

test("Cloudflare Pages セキュリティルーティング (_redirects) の検証", () => {
  assert.ok(fs.existsSync("_redirects"), "_redirects ファイルが存在すること");
  const redirects = fs.readFileSync("_redirects", "utf-8");

  // 内部ドキュメント・テストコードの 404 遮断ルール検証
  assert.ok(redirects.includes("/docs/* / 404"), "/docs/* が 404 遮断されていること");
  assert.ok(redirects.includes("/tests/* / 404"), "/tests/* が 404 遮断されていること");
  assert.ok(redirects.includes("/*.md / 404"), "Markdownファイルが 404 遮断されていること");
  assert.ok(redirects.includes("/*.test.js / 404"), "テストスクリプトが 404 遮断されていること");
});

test("Cloudflare Pages レスポンスヘッダーおよびキャッシュ制御 (_headers) の検証", () => {
  assert.ok(fs.existsSync("_headers"), "_headers ファイルが存在すること");
  const headers = fs.readFileSync("_headers", "utf-8");

  // キャッシュ制御ディレクティブの検証
  assert.ok(headers.includes("Cache-Control: public, max-age=0, must-revalidate"), "must-revalidate キャッシュディレクティブが指定されていること");
  assert.ok(headers.includes("X-Content-Type-Options: nosniff"), "X-Content-Type-Options が指定されていること");
  assert.ok(headers.includes("X-Frame-Options: SAMEORIGIN"), "X-Frame-Options が指定されていること");
});

