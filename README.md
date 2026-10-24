# RNS E-commerce (greenfield demo)

Standard e-commerce demo with storefront + admin panel: product variants, multi-image gallery, coupons, guest checkout, saved addresses, CMS banners, and admin CRUD.

**Location:** `e:\rns-ecommerce` (separate from the original `e:\rns` project).

## Stack

- Next.js 16 (App Router), React 19, Tailwind CSS 4
- Prisma 8 contract ORM + PostgreSQL
- Session cookies + `ADMIN_EMAIL` admin gate

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL`, `SESSION_SECRET`, and `ADMIN_EMAIL` in `.env`.

3. Install and generate contract:

```bash
npm install
npm run contract:emit
```

4. Apply database migration (Prisma 8):

```bash
npx prisma migration plan --name init   # if not already planned
npx prisma db migrate --advance-ref db
```

5. Generate local demo images and seed data:

```bash
npm run seed:images
npm run db:seed
```

6. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | value of `ADMIN_EMAIL` (default `admin@rns.local`) | `admin1234` |
| Customer | `demo@rns.local` | `demo1234` |

Coupons: `WELCOME10`, `FLAT200` (use `EXPIRED50` to test rejection).

## Feature tour

### Storefront

- `/` — banners, categories, featured products
- `/products` — search, filters, sort
- `/products/[id]` — gallery, size/color variants, wishlist
- `/cart`, `/checkout` — guest or logged-in COD, coupons
- `/orders`, `/order-lookup` — account orders vs guest tracking
- `/account`, `/account/addresses` — profile and saved addresses
- `/wishlist`

### Admin (`/admin`)

- Dashboard KPIs and recent orders
- Categories, products (images + variants), coupons, banners
- Orders (status workflow), customers (detail + history)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run contract:emit` | Regenerate `contract.json` after schema changes |
| `npm run seed:images` | Create SVG assets under `public/seed/` |
| `npm run db:seed` | Idempotent demo data |
