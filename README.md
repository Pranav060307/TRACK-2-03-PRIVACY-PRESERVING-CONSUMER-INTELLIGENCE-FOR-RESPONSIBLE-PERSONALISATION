# ÆGIS Retail | Privacy-Preserving Consumer Intelligence Platform
> **Track 2.03**: A privacy-first consumer intelligence & e-commerce platform combining ethical personalisation, zero-party data declarations, and differential privacy analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Differential Privacy](https://img.shields.io/badge/PET-Differential_Privacy-10B981?style=flat)](https://en.wikipedia.org/wiki/Differential_privacy)
[![Compliance](https://img.shields.io/badge/Compliance-GDPR_Art._25_&_CCPA-F59E0B?style=flat)](https://ec.europa.eu/)

---

## 🌟 Overview

Conventional e-commerce relies on invasive surveillance: third-party tracking pixels, device fingerprinting, and selling consumer profiles to data brokers.

**ÆGIS Retail** demonstrates that e-commerce personalisation can be completely decoupled from surveillance. Built with a clean, minimal, realistic aesthetic and dedicated panels for **Shoppers (Customer Store)** and **Merchants (Shop Owner Portal)**:

1. **Customer Store**: Shoppers browse real products and get personalized recommendations powered by their voluntary **Zero-Party Intent declarations** and on-device matching. They control their privacy dial ($\epsilon$) and check out with an anonymized cryptographic receipt.
2. **Shop Owner Portal**: Retail merchants discover consumer cohort trends, evaluate demand, and restock inventory using **Differential Privacy queries** (Laplace noise injection) that protect individual customer identities by mathematical proof.

---

## 🎨 Minimal & Decent Design System

Built strictly using the required custom CSS palette with zero generic AI neon/sci-fi tropes:

```css
:root {
  --color-navy: #0B192C;
  --color-navy-dark: #071324;
  --color-royal-blue: #1D4ED8;
  --color-blue-bright: #2563EB;
  --color-sky-light: #F0F4FA;
  --color-sky-subtle: #E6EEF8;
  --color-gold: #F59E0B;
  --color-gold-bright: #FACC15;

  --color-forest-dark: #162E28;
  --color-forest-sec: #2B3E35;
  --color-gold-antique: #A77A1C;
  --color-gold-bright-ed: #E5BE61;
  --color-cream-warm: #F9F4EA;
  --color-beige-soft: #F3EDE0;
  --color-card-ivory: #E9E1D2;
  --color-dark-text: #050C0C;
  --color-muted-text: #7B8379;
  --color-border-subtle: #D2CAB6;
}
```

- **Light Mode (Default)**: Editorial warm cream, soft beige, card ivory, and dark charcoal text with royal blue and antique gold accents.
- **Dark Mode**: Deep midnight navy, subtle border framing, and bright blue/gold highlights.
- **Mobile Responsive**: Custom media queries, collapsible navigation drawer, responsive grids, and touch-friendly controls.

---

## 📱 Two Real Panels

### 1. 🛍️ Customer Store
- **Private Shopping Feed**: Real product catalog (Apparel, Audio & Tech, Wellness, Home Decor, Specialty Coffee).
- **Zero-Party Intent Vault**: Customers voluntarily toggle criteria ("Sustainable & Organic Materials", "Clean Skincare", "Hardware Privacy", "Budget $50-$150").
- **Privacy Loss Budget Slider ($\epsilon$)**: Adjusts noise tolerance between Maximum Anonymity ($\epsilon=0.2$) and High Match ($\epsilon=1.5$).
- **Transparency Card**: Explains why each product was recommended without referencing tracking cookies.
- **Cart & Anonymous Checkout**: Generates an anonymized receipt token (`0x8f4d...3e1a`) with zero PII transmitted to third-party ad networks.

### 2. 🏪 Shop Owner Portal
- **Store KPIs**: Total revenue ($54,820), privacy-compliant orders (642), shopper privacy adoption rate (88%), and average order value ($85.39).
- **Differential Privacy Query Tool**: Queries customer segments by injecting Laplace noise ($b = 1.0 / \epsilon$), showing protected ground truth vs. perturbed public estimate with 95% confidence bounds ($k \ge 50$ anonymity gate enforced).
- **Aggregated Segments & Inventory Restock**: Shows real-time segment demand trends and suggests restock allocations without inspecting individual user histories.
- **Data Retention & Auto-Purge**: Configurable log shredding schedule (14 to 90 days).
- **Data Export**: Generates exportable JSON store intelligence reports.

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build for production
npm run build
```

---

## 🏛️ Codebase Structure

```
src/
├── components/
│   ├── Navbar.tsx           # Responsive header, panel switcher, cart count, theme toggle, mobile drawer
│   ├── CustomerPanel.tsx    # E-commerce store, zero-party intent controls, cart & private checkout
│   └── ShopOwnerPanel.tsx   # Merchant KPIs, differential privacy query engine, cohort table & data retention
├── data/
│   └── storeData.ts         # Tangible product items, store cohorts, customer preferences & KPIs
├── types/
│   └── index.ts             # Clean TypeScript definitions for retail and privacy intelligence
├── App.tsx                  # Root state orchestration (panel switching, cart, toast notifications)
├── index.css                # Pure Vanilla CSS design system matching user color palette (Light + Dark)
└── main.tsx                 # React entry point
```
