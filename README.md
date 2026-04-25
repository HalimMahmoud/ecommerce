# 🛍️ Halim Store - Elite E-commerce Ecosystem

A premium, high-conversion e-commerce platform built with **Next.js 16 (App Router)** and **Strapi v5**. This project represents a state-of-the-art implementation of modern web standards, focusing on sub-second performance, visual excellence, and robust state management.

---

## 🚀 Core Features Matrix

### 1. Immersive UI/UX Engine
- **Premium Product Page**: Featuring sticky purchase details, mobile quick-action bars, glassmorphism aesthetics, and tabbed specifications.
- **Flicker-Free Dark Mode**: Custom high-performance implementation using blocking inline scripts to eliminate the "white flash" (FOUC) entirely.
- **Dynamic Bento Grid**: Responsive product catalog with micro-interactions and hover-state transformations.
- **Sophisticated Badges**: High-end notification logic using `99+` thresholds to encourage cart filling.

### 2. Intelligent Cart & Inventory Control
- **Batch Aggregation**: Optimized cart updates that perform calculations in one cycle rather than multiple state re-renders.
- **Stock-Limit Guard**: Real-time validation that prevents users from adding more than the available inventory, providing descriptive "Limit Reached" feedback.
- **Zero-Flicker Persistence**: Full `localStorage` synchronization for Cart, Wishlist, and Ratings, handled via hydration-safe effects.

### 3. Global-Ready Architecture (i18n)
- **Bi-directional Support**: Fully localized in **English (LTR)** and **Arabic (RTL)**.
- **Auto-Direction Detection**: The UI automatically switches layout directions and typography based on the selected locale.
- **Localized URL Management**: SEO-friendly slug-based routing (`/product/cool-item`) with full translation support.

### 4. Advanced Data Layer
- **Strapi v5 Integration**: Powered by a headless CMS for centralized content control.
- **Type-Safe Search & Filters**: URL-synced filtering via `nuqs` covers Search, Category, Price Ranges, and Ratings.
- **Authentication**: JWT-based secure auth flow with persistent sessions and login/register logic.

---

## 🗺️ The Production Roadmap

### Phase 1: Conversion (Immediate)
- [ ] **Stripe/Checkout Integration**: Moving from a local cart to a real payment gateway.
- [ ] **Order Management**: Implementing the "Orders" collection in Strapi to track start/success/fail states.
- [ ] **Email Engine**: Automated transactional emails (Receipts, Tracking) via Resend.

### Phase 2: Scalability & Performance
- [ ] **Search Excellence**: Migrating current filters to **Algolia** for instant fuzzy search.
- [ ] **Cloud Cart Sync**: Moving `localStorage` carts to the Strapi database so users can shop across devices.
- [ ] **Image Optimization**: Automated OG-image generation for premium social media sharing.

### Phase 3: Observability & Growth
- [ ] **Sentinel Monitoring**: Integrating **Sentry** for real-time error tracking in production.
- [ ] **Product Analytics**: **PostHog** integration to analyze the checkout funnel and identify drop-off points.
- [ ] **Reviews & Social Proof**: Completing the Rating system logic to save real user reviews to Strapi.

---

## 🛠️ Tech Stack Details

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (Turbopack) |
| **CMS** | Strapi v5 (Headless) |
| **Styling** | Vanilla CSS + Tailwind + Lucide Icons |
| **State** | React Context + LocalStorage Persistence |
| **Localization** | next-intl |
| **Testing** | Playwright (E2E) |
| **Validation** | Zod + nuqs |

---

## 📂 Project Structure Guide

- `/app`: Global layout, routing, and server-side page data fetching.
- `/components/features`: High-level domain components (Products, Auth, Cart).
- `/lib/contexts`: Global state providers (Cart, Wishlist, UI, Auth).
- `/lib/translations`: Centralized JSON files for bi-directional localization.
- `/tests`: Playwright E2E shopping flow specifications.

---

*Built with passion for high-end shopping experiences.*
