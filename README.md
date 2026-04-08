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

## Backend (Node.js + MongoDB)

This repo includes an API server in `server/` (Express + MongoDB) used by the admin panel and storefront.

1. Copy env: `copy server\\.env.example server\\.env` (Windows) or `cp server/.env.example server/.env`
2. Set `MONGODB_URI` + `JWT_SECRET` in `server/.env`
3. Install + run:
   - `cd server`
   - `npm install`
   - `npm run seed` (creates admin + seeds demo products/offers)
   - `npm run dev` (starts API on `http://localhost:8080` by default)
4. Frontend API URL:
   - Copy `.env.example` → `.env` and set `VITE_API_URL=http://localhost:8080`
   - If `VITE_API_URL` is not set, Vite proxies `/api` to `http://localhost:8080` in dev.

## Analytics (Google Analytics)

- Set `VITE_GA_ID=G-XXXXXXX` in your frontend `.env` to enable GA.
- Events tracked: `add_to_cart`, `begin_checkout`, `purchase`.

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
- Order tracking reflects the order `status` (demo). Update it in the Admin panel to see changes.
- Payment is a **mock UI**. For production, you must add a backend and verify payments server-side.

## Admin panel (demo)

- URL: `/admin/login`
- Credentials come from your API seed (`server/.env`): `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- What it can do (demo):
  - Manage products + offers (MongoDB-backed)
  - Review orders + update order status (MongoDB-backed)
  - Toggle checkout payment methods (client-side UI setting)

## Netlify

`netlify.toml` is configured to build with `npm run build` and publish `dist/`.

## Deployment (production)

### Environment variables

- Frontend: copy `.env.production.example` → `.env.production` and set `VITE_API_URL`.
- Backend: copy `server/.env.production.example` → `server/.env` and set `MONGODB_URI` + `JWT_SECRET`.

### Docker (optional)

Build and run the full stack with Docker:

1. Ensure `server/.env` is set (Atlas connection).
2. Run:
   - `docker compose up --build`
3. Access:
   - Storefront: `http://localhost:8088`
   - API: `http://localhost:8080/api/health`

## SEO (sitemap + robots)

- `npm run build` runs `scripts/generate-seo.mjs` to generate `public/sitemap.xml` and `public/robots.txt`.
- Set `SITE_URL=https://your-domain.com` when building for a custom domain so sitemap links are correct.

## Security (static hosting)

- `netlify.toml` adds common security headers (HSTS, frame denial, etc.).
- `public/security.txt` provides a security contact for vulnerability reports.
- For production, add a real auth system for storefront users + role-based admin access, and keep JWT secrets out of the client.
