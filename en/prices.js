/**
 * ==============================================================================
 * GoGoUmi paradise - Pricing & Event Configuration (English)
 * ==============================================================================
 */

/** @type {PriceConfig} */
const PRICE_CONFIG = {
  // ----------------------------------------------------------------------------
  // 1. Reservation URL
  // ----------------------------------------------------------------------------
  reserveUrl: "https://www.instagram.com/gogoumi_paradise",

  // ----------------------------------------------------------------------------
  // 2. Price Section Header
  // ----------------------------------------------------------------------------
  section: {
    kicker: "PRICE & SYSTEM",
    title: "Pricing & System",
    lead: "Our beach house operates on a <strong>reserved booth system for an all-day relaxing stay</strong>.<br>Combine the basic booth fee with your choice of BBQ sets, cafe meals, and drinks."
  },

  // ----------------------------------------------------------------------------
  // 3. STEP 1: Base Booth Rental Fee
  // ----------------------------------------------------------------------------
  basePrice: {
    stepBadge: "STEP 1 / Admission & Facility Use",
    title: "Booth Rental (Table Fee)",
    desc: "Dedicated table seating for all-day use (open partition, up to 4 guests)",
    price: "¥1,500",
    tax: "(incl. tax)",
    unit: "/ 1 table (up to 4 guests · all-day)",
    features: [
      "5 or more guests require 2 or more tables",
      "Free rental of air pumps for floaties & swim rings",
      "On-site beach mini-games with special rewards",
      "Hours: 11:00 AM – (Food L.O. 4:00 PM)"
    ],
    reserveButtonText: "Book a Table (Instagram DM) ↗"
  },

  // ----------------------------------------------------------------------------
  // 4. One-Order Policy
  // ----------------------------------------------------------------------------
  orderRule: {
    badge: "One-Order Policy",
    title: "1 Drink + 1 Food / Person (First Order)",
    desc: "We kindly ask all guests (ages 6 and above) to order at least '1 Drink + 1 Food item' upon arrival.<br><strong>*Guests ordering a BBQ Set only need to order '1 Drink'</strong> as their first order.",
    note: "Enjoy our delicious BBQ sets, island cafe specials, ramen, curry, and refreshing drinks while relaxing by the beach."
  },

  // ----------------------------------------------------------------------------
  // 5. STEP 2: Optional Plans (BBQ Set / Cafe)
  // ----------------------------------------------------------------------------
  step2Label: "STEP 2 / Add to your experience!",
  plans: [
    {
      featured: true,
      icon: "BEACH BBQ",
      title: "All-Inclusive GoGoPara BBQ Set",
      sub: "Advance Reservation Required · Seaside BBQ",
      price: "¥3,300",
      tax: "(incl. tax)",
      unit: "/ serves 1–2 (3 meats + assorted vegetables)",
      list: [
        "3 kinds of meat + assorted vegetables: ¥3,300 / serves 1–2",
        "BBQ Grill + Net: ¥1,100",
        "Charcoal (2.5kg): ¥1,100",
        "*Advance reservation required"
      ],
      hasReserveButton: true,
      reserveButtonText: "Reserve BBQ Plan (Instagram DM) ↗"
    },
    {
      featured: false,
      icon: "CAFE",
      title: "Cafe & À la Carte",
      sub: "Order at Counter · Easy Lunch & Drinks",
      price: "Order at Counter",
      priceFontSize: "20px",
      tax: "",
      unit: "Ramen, Curry, Acai Bowls, Soft Drinks, Beer & More",
      list: [
        "Acai Bowls & Shaved Ice (from ¥400)",
        "Ramen, Udon, Japanese Curry (¥500 – ¥900)",
        "Draft Beer, Highballs, Fruit Sours (¥500 – ¥700)",
        "Assorted Soft Drinks (¥300)"
      ],
      hasReserveButton: false,
      reserveButtonText: ""
    }
  ],

  // ----------------------------------------------------------------------------
  // 6. Private Charter
  // ----------------------------------------------------------------------------
  charter: {
    minGuests: 1,
    badge: "PRIVATE CHARTER",
    title: "Private Venue & Space Rental",
    lead: "Feel free to inquire about guest count, budget, and dates",
    desc: "Available for private seaside gatherings from small groups to large parties, events, photo/video shoots, offline meetups, and BBQ parties. We flexibly tailor plans to your schedule, budget, and custom food/drink needs.",
    features: [
      "Private & semi-private rentals customized to your group size",
      "Audio equipment & custom seating layout support",
      "Special food & drink catering options available"
    ],
    contactText: "Inquire About Private Rental (Instagram DM) ↗",
    contactUrl: "https://www.instagram.com/gogoumi_paradise"
  },

  // ----------------------------------------------------------------------------
  // 7. Detailed Menu
  // ----------------------------------------------------------------------------
  detailedMenu: {
    toggleText: "View Full Food & Drink Menu",
    foodTitle: "FOOD MENU",
    foodItems: [
      { name: "Edamame", price: "¥300" },
      { name: "Frankfurter Sausage", price: "¥400" },
      { name: "Fried Chicken (Karaage)", price: "¥500" },
      { name: "French Fries", price: "¥500" },
      { name: "Ramen", price: "¥700" },
      { name: "Rice Ball (Onigiri) Set", price: "¥500" },
      { name: "Japanese Curry Rice", price: "¥700" },
      { name: "Vanilla Ice Cream", price: "¥300" },
      { name: "Shaved Ice (Various Flavors)", price: "¥400" },
      { name: "GoGoPara Acai Bowl", price: "¥1,200" }
    ],
    drinkTitle: "DRINK MENU",
    drinkItems: [
      { name: "Draft Beer", price: "¥600" },
      { name: "Low-Carb Beer (Style Free)", price: "¥500" },
      { name: "Whisky Highball", price: "¥700" },
      { name: "Whisky & Coke", price: "¥800" },
      { name: "Lemon Sour", price: "¥600" },
      { name: "Grapefruit Sour", price: "¥600" },
      { name: "Peach Sour", price: "¥600" },
      { name: "Shochu Highball (Barley)", price: "¥600" },
      { name: "Coke / Orange / Apple / Oolong Tea", price: "¥300" }
    ]
  },

  // ----------------------------------------------------------------------------
  // 9. Notes
  // ----------------------------------------------------------------------------
  notesHtml: `
    ※ All prices include tax.<br>※ Please pick up your food and drinks at the counter.<br>
    ※ For BBQ sets or inquiries, please contact us via <a href="https://www.instagram.com/gogoumi_paradise" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700">Instagram DM</a> or phone (080-4999-0246).
  `
};

if (typeof window !== 'undefined') {
  window.PRICE_CONFIG = PRICE_CONFIG;
}
