/**
 * ==============================================================================
 * GoGoUmi paradise - 料金・メニュー・予約設定ファイル
 * ==============================================================================
 * 
 * 【編集方法】
 * 金額やテキストを書き換えるだけで、Webサイト上の表示が自動的に更新されます。
 * 
 * 【注意事項】
 * ・「"」や「'」（ダブルクォーテーション/シングルクォーテーション）は消さないようにしてください。
 * ・行末の「,」（カンマ）は消さないようにしてください。
 * ・メニュー項目を増やしたい場合は、行をコピーして追加してください。
/**
 * @typedef {Object} MenuItem
 * @property {string} name - メニュー名
 * @property {string} price - 価格表記
 * 
 * @typedef {Object} PlanItem
 * @property {boolean} featured - おすすめ強調表示フラグ
 * @property {string} icon - アイコン名 / バッジ
 * @property {string} title - プラン名
 * @property {string} sub - サブタイトル
 * @property {string} price - 料金
 * @property {string} [priceFontSize] - 料金フォントサイズ調整
 * @property {string} tax - 税表記
 * @property {string} unit - 単位
 * @property {string[]} list - 含まれる内容リスト
 * @property {boolean} hasReserveButton - 予約ボタン表示有無
 * @property {string} reserveButtonText - 予約ボタン文言
 * 
 * @typedef {Object} EventCategory
 * @property {string} icon - アイコン
 * @property {string} title - ジャンル名
 * @property {string} desc - 説明文
 * 
 * @typedef {Object} PriceConfig
 * @property {string} reserveUrl - Airリザーブ等の予約URL
 * @property {{ kicker: string, title: string, lead: string }} section - セクション見出し
 * @property {{ stepBadge: string, title: string, desc: string, price: string, tax: string, unit: string, features: string[], reserveButtonText: string }} basePrice - 基本貸卓料
 * @property {{ badge: string, title: string, desc: string, note: string }} orderRule - ファーストオーダー制ルール
 * @property {string} step2Label - STEP 2 ラベル
 * @property {PlanItem[]} plans - プラン一覧
 * @property {{ minGuests: number, badge: string, title: string, lead: string, desc: string, features: string[], contactText: string, contactUrl: string }} charter - 貸切・団体利用設定
 * @property {{ kicker: string, title: string, lead: string, categories: EventCategory[], supportTitle: string, supportList: string[], contactText: string, contactUrl: string }} eventRecruit - イベント募集設定
 * @property {{ toggleText: string, foodTitle: string, foodItems: MenuItem[], drinkTitle: string, drinkItems: MenuItem[] }} detailedMenu - 詳細メニュー
 * @property {string} notesHtml - 料金注記HTML
 */

/** @type {PriceConfig} */
const PRICE_CONFIG = {
  // ----------------------------------------------------------------------------
  // 1. 予約システムのURL（Airリザーブ等のリンク先）
  // ----------------------------------------------------------------------------
  reserveUrl: "https://airregi.jp/reserve/",

  // ----------------------------------------------------------------------------
  // 2. 料金セクションの見出し・説明文
  // ----------------------------------------------------------------------------
  section: {
    kicker: "PRICE & SYSTEM",
    title: "料金システム",
    lead: "当施設は <strong>1日ゆっくり過ごせる貸卓（ブース）制</strong> です。<br>基本の貸卓利用料に、お好みのBBQセットやフード＆ドリンクを組み合わせてご利用いただけます。"
  },

  // ----------------------------------------------------------------------------
  // 3. STEP 1: 基本貸卓料（ブース利用料）
  // ----------------------------------------------------------------------------
  basePrice: {
    stepBadge: "STEP 1 / 基本入場・施設利用",
    title: "貸卓（ブース利用料）",
    desc: "1日中使える専用テーブル席（仕切りなし・4名様迄）",
    price: "¥1,500",
    tax: "(税込)",
    unit: "/ 1卓（4名様迄・1日利用）",
    features: [
      "5名様以上は2卓〜",
      "浮き輪等の空気入れ無料貸出",
      "店頭限定！海の家ミニゲーム挑戦で特典あり",
      "営業時間 11:00〜16:30 (L.O)"
    ],
    reserveButtonText: "貸卓をWEB予約 ↗"
  },

  // ----------------------------------------------------------------------------
  // 4. ファーストオーダー制のご案内（1ドリンク・1フード / 人）
  // ----------------------------------------------------------------------------
  orderRule: {
    badge: "ワンオーダー制",
    title: "1ドリンク ＋ 1フード / 人（ファーストオーダー制）",
    desc: "当施設をご利用のお客様は、お一人様につき「1ドリンク＋1フード」のファーストオーダーをお願いしております。<br>（※小学生以上のお客様が対象となります）",
    note: "貸卓利用料に加え、お好みのBBQプランやカフェ・アラカルトメニューをご注文いただき、ゆったりとした海辺の時間をお楽しみください。"
  },

  // ----------------------------------------------------------------------------
  // 5. STEP 2: 選べるプラン（BBQセット / カフェ等）
  // ----------------------------------------------------------------------------
  step2Label: "STEP 2 / 楽しみ方に合わせてプラス！",
  plans: [
    {
      featured: true, // おすすめプラン（オレンジ色の枠線・バッジ）にする場合は true
      icon: "BBQ",
      title: "手ぶらBBQセット",
      sub: "事前予約制・海辺で本格BBQ",
      price: "¥3,000",
      tax: "(税込)",
      unit: "/ 1〜2人前（肉3種＋野菜盛り）",
      list: [
        "お肉3種類 ＋ 季節の野菜盛り合わせ",
        "BBQコンロ・網（1台）: ¥1,100",
        "炭（3kg）: ¥1,500",
        "※BBQセットは事前予約が必要です"
      ],
      hasReserveButton: true,
      reserveButtonText: "BBQプランをWEB予約 ↗"
    },
    {
      featured: false,
      icon: "CAFE",
      title: "カフェ＆アラカルト",
      sub: "当日カウンター注文・手軽なランチ＆カフェ",
      price: "カウンター注文",
      priceFontSize: "24px", // 文字が長い場合のフォントサイズ調整
      tax: "",
      unit: "ラーメン・カレー・アサイーボウル・ドリンク等",
      list: [
        "アサイーボウル・かき氷（¥400〜）",
        "ラーメン・うどん・カレー各種（¥500〜¥900）",
        "生ビール・サワー・ハイボール（¥500〜¥700）",
        "ソフトドリンク各種（¥300）"
      ],
      hasReserveButton: false,
      reserveButtonText: ""
    }
  ],

  // ----------------------------------------------------------------------------
  // 6. 貸切・団体利用（人数は minGuests を変更するだけで反映されます）
  // ----------------------------------------------------------------------------
  charter: {
    minGuests: 20, // 貸切可能人数（ここを変更するだけでサイト上の表記が変わります）
    badge: "PRIVATE CHARTER",
    title: "貸切・団体利用のご案内",
    lead: "名様以上で貸切承ります",
    desc: "社員旅行・オフ会・各種イベント・サークル合宿・ビーチパーティーなど、プライベートな海辺空間としてご利用いただけます。日程やご予算、お料理内容（BBQ・オードブル等）もお気軽にご相談ください。",
    features: [
      "プライベート空間でのBBQ・イベント",
      "音響設備・レイアウトのカスタマイズ相談可",
      "飲食メニュー・ドリンクの特別手配対応"
    ],
    contactText: "貸切・団体利用のお問い合わせ（Instagram DM） ↗",
    contactUrl: "https://www.instagram.com/gogoumi_paradise"
  },

  // ----------------------------------------------------------------------------
  // 7. イベント募集・スペース利用のご案内
  // ----------------------------------------------------------------------------
  eventRecruit: {
    kicker: "EVENT & SPACE RENTAL",
    title: "海辺のロケーションで<br>イベントを開催しませんか？",
    lead: "GoGoUmi paradiseでは、ビーチや海の家のスペースを活用した各種イベントの開催・コラボレーションを随時募集しています。",
    categories: [
      {
        icon: "🎵",
        title: "音楽・DJ・ライブ",
        desc: "波音と心地よい音楽が響くビーチパーティーやアコースティックライブに。"
      },
      {
        icon: "🧘‍♀️",
        title: "ビーチヨガ・フィットネス",
        desc: "朝や夕暮れの海風を感じながら行うヨガ・SUP体験・リトリートに最適。"
      },
      {
        icon: "🎪",
        title: "マルシェ・ワークショップ",
        desc: "ハンドメイド作家様の出店、ポップアップ、アート体験やものづくり企画に。"
      },
      {
        icon: "📸",
        title: "撮影・オフ会・サークル",
        desc: "MV撮影、コスプレ・ポートレート撮影、ファンミーティングなどに。"
      }
    ],
    supportTitle: "主催者様向けサポート",
    supportList: [
      "貸切・半貸切など規模に応じたスペース利用",
      "BBQ・カフェ飲食メニューのセット提供相談",
      "電源・音響設備利用のご相談対応",
      "公式Instagramでのイベント告知・集客サポート"
    ],
    contactText: "イベント開催・ご相談はこちら（Instagram DM） ↗",
    contactUrl: "https://www.instagram.com/gogoumi_paradise"
  },

  // ----------------------------------------------------------------------------
  // 8. フード＆ドリンク詳細メニュー（アコーディオン内）
  // ----------------------------------------------------------------------------
  detailedMenu: {
    toggleText: "詳しいフード＆ドリンクメニューを見る",
    foodTitle: "FOOD MENU",
    foodItems: [
      { name: "ラーメン（醤油 / 豚骨）", price: "¥700" },
      { name: "カレーライス", price: "¥700" },
      { name: "カツカレー / エビフライカレー", price: "¥900" },
      { name: "うどん（温・冷）", price: "¥500" },
      { name: "からあげ（3個） / ポテト", price: "¥500" },
      { name: "フランクフルト", price: "¥400" },
      { name: "枝豆", price: "¥300" },
      { name: "おにぎり（2個）", price: "¥500" },
      { name: "かき氷（各種）", price: "¥400" }
    ],
    drinkTitle: "DRINK MENU",
    drinkItems: [
      { name: "生ビール", price: "¥600" },
      { name: "スタイルフリー", price: "¥500" },
      { name: "ハイボール", price: "¥700" },
      { name: "レモン / グレープフルーツサワー", price: "¥600" },
      { name: "焼酎（麦）", price: "¥600" },
      { name: "コーラ / オレンジ / 烏龍茶", price: "¥300" },
      { name: "氷追加", price: "¥200" }
    ]
  },

  // ----------------------------------------------------------------------------
  // 9. 料金セクションの注記
  // ----------------------------------------------------------------------------
  notesHtml: `
    ※ 料金はすべて税込価格です。商品の受け渡しはカウンターにてお願いいたします。<br>
    ※ BBQセットやご予約に関するご相談は <a href="https://www.instagram.com/gogoumi_paradise" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700">Instagram DM</a> またはお電話（現地担当：080-4999-0246）にて承ります。
  `
};

if (typeof window !== 'undefined') {
  window.PRICE_CONFIG = PRICE_CONFIG;
}

