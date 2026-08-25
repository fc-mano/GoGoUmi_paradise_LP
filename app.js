/**
 * ==============================================================================
 * GoGoUmi paradise - メインスクリプト (app.js)
 * ==============================================================================
 * 
 * 責務:
 * 1. prices.js の設定オブジェクト (PRICE_CONFIG) に基づく料金セクション動的生成
 * 2. ページ全体の予約ボタンに対する Airリザーブ URL の一括バインド
 * 3. スクロールに応じたナビゲーションバーのスタイル制御（passive listener）
 * 4. FAQ アコーディオンの開閉制御
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 料金セクションの動的レンダリング
  renderPriceSection();

  // 2. イベント募集セクションの動的レンダリング
  renderEventSection();

  // 3. 予約リンクの一括設定
  setupReserveLinks();

  // 4. ナビゲーションバーのスクロール連動
  setupNavScroll();

  // 5. FAQアコーディオン
  setupFaqAccordion();
});

/**
 * HTML特殊文字をエスケープして XSS (Cross-Site Scripting) を防止 (Task 19)
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * prices.js (PRICE_CONFIG) のデータを元に #price .container に HTML を注入
 */
function renderPriceSection() {
  if (typeof PRICE_CONFIG === 'undefined') return;
  const cfg = PRICE_CONFIG;
  const container = document.querySelector('#price .container');
  if (!container) return;

  const reserveUrl = cfg.reserveUrl || "https://airregi.jp/reserve/";

  // STEP 1 特徴リスト
  const baseFeaturesHtml = (cfg.basePrice.features || [])
    .map(f => `<li>✓ ${escapeHtml(f)}</li>`)
    .join('');

  // ファーストオーダー制案内バナー
  let orderRuleHtml = '';
  if (cfg.orderRule) {
    orderRuleHtml = `
    <div class="price-order-rule">
      <div class="order-rule-badge">${escapeHtml(cfg.orderRule.badge)}</div>
      <div class="order-rule-content">
        <h4>${escapeHtml(cfg.orderRule.title)}</h4>
        <p class="order-rule-desc">${cfg.orderRule.desc}</p>
        ${cfg.orderRule.note ? `<p class="order-rule-note">${escapeHtml(cfg.orderRule.note)}</p>` : ''}
      </div>
    </div>`;
  }

  // STEP 2 プランカード
  const plansHtml = (cfg.plans || []).map(plan => {
    const featuredClass = plan.featured ? ' featured' : '';
    // CSSインジェクション対策: フォントサイズは英数字/px/rem/emのみ許可
    const safeFontSize = /^[0-9]+(px|rem|em|%)?$/.test(plan.priceFontSize || '') ? plan.priceFontSize : '';
    const priceStyle = safeFontSize ? ` style="font-size:${safeFontSize};margin:8px 0 6px"` : '';
    const taxHtml = plan.tax ? `<span class="price-tax">${escapeHtml(plan.tax)}</span>` : '';
    const listHtml = (plan.list || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const btnHtml = plan.hasReserveButton
      ? `<a class="btn-reserve-featured" href="${encodeURI(reserveUrl)}" data-reserve-link target="_blank" rel="noopener noreferrer">${escapeHtml(plan.reserveButtonText)}</a>`
      : '';

    return `
    <div class="price-card${featuredClass}">
      <div class="price-icon">${escapeHtml(plan.icon)}</div>
      <h3>${escapeHtml(plan.title)}</h3>
      <p class="price-sub">${escapeHtml(plan.sub)}</p>
      <div class="price-amount"${priceStyle}>${escapeHtml(plan.price)}${taxHtml}</div>
      <p class="price-unit">${escapeHtml(plan.unit)}</p>
      <ul class="price-list">
        ${listHtml}
      </ul>
      ${btnHtml}
    </div>`;
  }).join('\n');

  // 貸切・団体利用案内カード
  let charterHtml = '';
  if (cfg.charter) {
    const charterFeaturesHtml = (cfg.charter.features || [])
      .map(f => `<li>✓ ${escapeHtml(f)}</li>`)
      .join('');
    const charterLeadText = cfg.charter.lead
      ? escapeHtml(cfg.charter.lead)
      : `${escapeHtml(String(cfg.charter.minGuests || ''))}名様以上で貸切承ります`;
    const contactUrl = cfg.charter.contactUrl || "https://www.instagram.com/gogoumi_paradise";

    charterHtml = `
    <div class="price-charter-card">
      <div class="charter-badge">${escapeHtml(cfg.charter.badge)}</div>
      <div class="charter-body">
        <div class="charter-main">
          <h3>${escapeHtml(cfg.charter.title)}</h3>
          <div class="charter-highlight">${charterLeadText}</div>
          <p class="charter-desc">${escapeHtml(cfg.charter.desc)}</p>
          <ul class="charter-features">
            ${charterFeaturesHtml}
          </ul>
        </div>
        <div class="charter-action">
          <a class="btn-charter" href="${encodeURI(contactUrl)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(cfg.charter.contactText)}
          </a>
        </div>
      </div>
    </div>`;
  }

  // 詳細メニュー（フード & ドリンク）
  const foodItemsHtml = (cfg.detailedMenu.foodItems || [])
    .map(item => `<div class="menu-item"><span>${escapeHtml(item.name)}</span><b>${escapeHtml(item.price)}</b></div>`)
    .join('\n');

  const drinkItemsHtml = (cfg.detailedMenu.drinkItems || [])
    .map(item => `<div class="menu-item"><span>${escapeHtml(item.name)}</span><b>${escapeHtml(item.price)}</b></div>`)
    .join('\n');

  container.innerHTML = `
  <div class="kicker">${escapeHtml(cfg.section.kicker)}</div>
  <h2>${escapeHtml(cfg.section.title)}</h2>
  <p class="lead">${cfg.section.lead}</p>

  <!-- Step 1: 基本貸卓料バナー -->
  <div class="price-base-card">
    <div class="base-badge">${escapeHtml(cfg.basePrice.stepBadge)}</div>
    <div class="base-body">
      <div class="base-main">
        <h3>${escapeHtml(cfg.basePrice.title)}</h3>
        <p>${escapeHtml(cfg.basePrice.desc)}</p>
        <ul class="base-features">
          ${baseFeaturesHtml}
        </ul>
      </div>
      <div class="base-price-box">
        <div class="base-amount">${escapeHtml(cfg.basePrice.price)}<span class="price-tax">${escapeHtml(cfg.basePrice.tax)}</span></div>
        <div class="base-unit">${escapeHtml(cfg.basePrice.unit)}</div>
        <a class="btn-reserve-sm" href="${encodeURI(reserveUrl)}" data-reserve-link target="_blank" rel="noopener noreferrer" style="margin-top:10px">${escapeHtml(cfg.basePrice.reserveButtonText)}</a>
      </div>
    </div>
  </div>

  <!-- ファーストオーダー制のご案内 -->
  ${orderRuleHtml}

  <!-- Step 2: 選べる楽しみ方（BBQ or フード） -->
  <div class="price-step-label">${escapeHtml(cfg.step2Label)}</div>

  <div class="price-grid-2col">
    ${plansHtml}
  </div>

  <!-- フード＆ドリンクの折りたたみメニュー表 -->
  <details class="menu-details">
    <summary class="menu-summary">
      <span>${escapeHtml(cfg.detailedMenu.toggleText)}</span>
      <span style="font-size:11px;opacity:.7">▼</span>
    </summary>
    <div class="menu-breakdown">
      <div class="menu-col">
        <h4>${escapeHtml(cfg.detailedMenu.foodTitle)}</h4>
        <div class="menu-items">
          ${foodItemsHtml}
        </div>
      </div>
      <div class="menu-col">
        <h4>${escapeHtml(cfg.detailedMenu.drinkTitle)}</h4>
        <div class="menu-items">
          ${drinkItemsHtml}
        </div>
      </div>
    </div>
  </details>

  <!-- 貸切・団体利用のご案内 -->
  ${charterHtml}

  <div class="price-notes">
    ${cfg.notesHtml}
  </div>
  `;
}

/**
 * prices.js (PRICE_CONFIG.eventRecruit) のデータを元に #events .container に HTML を注入
 */
function renderEventSection() {
  if (typeof PRICE_CONFIG === 'undefined' || !PRICE_CONFIG.eventRecruit) return;
  const ev = PRICE_CONFIG.eventRecruit;
  const container = document.querySelector('#events .container');
  if (!container) return;

  const categoriesHtml = (ev.categories || []).map(cat => {
    const visualContent = cat.image
      ? `<img src="${escapeHtml(cat.image)}" alt="${escapeHtml(cat.title)}" loading="lazy" decoding="async">`
      : `<div class="event-cat-icon">${escapeHtml(cat.icon || '')}</div>`;

    return `
    <div class="event-cat-card">
      <div class="event-cat-visual">${visualContent}</div>
      <h4>${escapeHtml(cat.title)}</h4>
      <p>${escapeHtml(cat.desc)}</p>
    </div>`;
  }).join('\n');

  const supportListHtml = (ev.supportList || []).map(item => `
    <li>✓ ${escapeHtml(item)}</li>
  `).join('\n');

  const contactUrl = ev.contactUrl || "https://www.instagram.com/gogoumi_paradise";

  container.innerHTML = `
    <div class="kicker">${escapeHtml(ev.kicker)}</div>
    <h2>${ev.title}</h2>
    <p class="lead">${escapeHtml(ev.lead)}</p>

    <div class="event-grid">
      ${categoriesHtml}
    </div>

    <div class="event-support-box">
      <div class="event-support-main">
        <h3>${escapeHtml(ev.supportTitle)}</h3>
        <ul class="event-support-list">
          ${supportListHtml}
        </ul>
      </div>
      <div class="event-support-action">
        <a class="btn btn-primary" href="${encodeURI(contactUrl)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(ev.contactText)}
        </a>
      </div>
    </div>
  `;
}

/**
 * data-reserve-link 属性を持つ全アンカータグに prices.js の reserveUrl を適用
 */
function setupReserveLinks() {
  const reserveUrl = (typeof PRICE_CONFIG !== 'undefined' && PRICE_CONFIG.reserveUrl)
    ? PRICE_CONFIG.reserveUrl
    : "https://airregi.jp/reserve/";

  document.querySelectorAll('[data-reserve-link]').forEach(el => {
    el.href = reserveUrl;
  });
}

/**
 * ナビゲーションバーの背景透過切り替え
 * スクロール時のメインスレッド負荷を軽減するため passive: true を指定
 */
function setupNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/**
 * FAQアコーディオンの排他開閉制御 (WAI-ARIA aria-expanded 準拠)
 */
function setupFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-q');
  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      const isCurrentlyOpen = item.classList.contains('open');

      // ユーザーの認知負荷軽減のため、開く項目以外を閉じる（単一オープン）
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        const openBtn = openItem.querySelector('.faq-q');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isCurrentlyOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      } else {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

