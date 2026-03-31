# MANOR — Premium Tea (E‑Commerce Rebuild)

Production-grade rebuild of the MANOR tea website as a premium e‑commerce SPA with a clean architecture, reusable UI system, and fully working cart/checkout/order flows (mock payment + tracking).

## Tech

- Vite + React + React Router
- Zustand (lightweight state + persistence)
- Framer Motion (subtle page transitions)

## Quick start

1. Install dependencies: `npm install`
2. Run locally: `npm run dev`
3. Production build: `npm run build`
4. Preview build: `npm run preview`

## Folder structure (src/)

- `src/components/ui/` – reusable design-system primitives (Button, Input, Card, Toast…)
- `src/components/commerce/` – commerce components (ProductCard, CartItem, OrderSummary…)
- `src/components/layout/` – layout helpers (Header, Footer, PageShell…)
- `src/layouts/` – app layouts (RootLayout)
- `src/pages/` – all mandatory pages (Home, Products, Checkout, Track Order, etc.)
- `src/hooks/` – Zustand stores + small hooks (cart, wishlist, orders, toasts, title)
- `src/assets/data/` – catalog + offers + leadership data (mock backend)
- `src/styles/` – tokens + global styles + motion

## Mock backend behavior

- Product catalog is defined in `src/assets/data/products.js`.
- Offers are defined in `src/assets/data/offers.js`.
- Orders are created client-side and persisted in localStorage (device-specific).
- Order tracking is simulated and updates quickly for demo.
- Payment is a **mock UI**. For production, you must add a backend and verify payments server-side.

## Netlify

`netlify.toml` is configured to build with `npm run build` and publish `dist/`.
