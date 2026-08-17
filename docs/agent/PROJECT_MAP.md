# PROJECT_MAP

ZENmen is a Next.js App Router storefront + admin dashboard for a New Delhi bespoke menswear shop (suits, shirts, kurtas, accessories).

**Stack (from `package.json`):** Next.js `16.2.4`, React `19.2.4`, MongoDB via Mongoose `9.6.2`, NextAuth `4.24`, Redux Toolkit, Cloudinary, Razorpay, Resend, Tailwind 4, Zod 4.

**Start here:** `CHANGE_MAP.md` for “where to edit”, `ARCHITECTURE.md` for how layers connect, `DECISIONS.md` for verified product choices.

---

## Two surfaces

| Surface | Routes | Shell |
|---|---|---|
| Storefront | `/`, `/collection`, `/collection/[slug]`, `/checkout`, `/profile`, `/about`, `/contact`, `/appointment`, `/services`, `/stories` | Root `layout.tsx` → Navbar + Providers; `RootLayoutClient` adds Footer, chat, WhatsApp FAB. Hidden on `/admin`. |
| Admin | `/admin/*` | `src/app/admin/layout.tsx` — session must exist and `role === "admin"`, else redirect `/`. Wrapped in `DashboardLayout` (sidebar + glass UI). |

There is **no `middleware.ts`**. Admin UI is gated by the layout; admin APIs call `requireAdmin()`.

---

## Directory map

```
src/app/                 App Router pages + API routes
  page.tsx               Home
  collection/            Catalog + PDP (`[slug]`)
  checkout/              Checkout + `/success`
  admin/                 Admin pages (thin wrappers around components)
  api/                   Route handlers
  components/            Storefront layout/sections + `adminComponents/`
src/models/              Mongoose: User, Product, Category, Order, UserNotification, AdminInstagramReelsConfig
src/lib/                 DB, auth, categories, orders, images, payments, chat, Instagram
src/store/               Canonical Redux store (products, cart, currency)
src/services/            Order finalize, stock, email, cancel, COD cleanup
src/hooks/               `useNavCategories`
src/types/               Shared TS types (category, product, next-auth)
src/config/              Email, invoice, cancellation, order-status constants
src/utils/               Invoice PDF buffer
```

**Leftover:** `src/app/store/` (older product-only Redux). Live app uses `@/store/store` via `src/app/providers.tsx`.

---

## Storefront pages

| Path | Role |
|---|---|
| `/` | Home sections (hero, category strip, products, reels, etc.) |
| `/collection` | Client catalog. Query `?q=` (text search) or `?category=` (exact `Product.category`) |
| `/collection/[slug]` | Product detail |
| `/checkout` | COD + Razorpay; requires signed-in user at API layer |
| `/checkout/success` | Post-order |
| `/profile` | Account, orders, notifications, recently viewed |
| `/appointment`, `/contact`, `/about`, `/services`, `/stories` | Marketing / booking |

## Admin pages (`src/app/admin/*/page.tsx` → `adminComponents/pages/`)

| Path | Component |
|---|---|
| `/admin` | DashboardOverview |
| `/admin/products` | Products |
| `/admin/categories` | Categories (nested parent/child table) |
| `/admin/orders` | Orders / AdminOrdersPanel |
| `/admin/users` | Users |
| `/admin/analytics` | Analytics |
| `/admin/settings` | Settings (includes Instagram reels UI) |
| `/admin/images` | ImageManagement — **not in sidebar** |
| `/admin/sections` | WebsiteSections — **not in sidebar** |

Sidebar: `src/app/components/adminComponents/dashboard/Sidebar.tsx`.

---

## API groups (`src/app/api/`)

- **Auth:** `auth/[...nextauth]`, `auth/register`
- **Catalog:** `products`, `products/[slug]`, `categories`. List GET: `category` (exact, storefront), `categories` (comma list, admin), `q`, `stock`, `featured`, `available`, `admin=1`
- **Admin catalog:** `admin/categories`, `admin/categories/[id]`, `admin/categories/[id]/products`, `admin/products/[slug]/category`
- **Checkout:** `orders/cod`, `orders/razorpay/create`, `orders/razorpay/verify`, `payment/create-order`, `payment/verify`, `webhook/razorpay`, `checkout/defaults`, `order`
- **Orders / profile:** `orders/[id]/*` (cancel, invoice, eligibility), `profile`, `profile/notifications*`
- **Admin ops:** `admin/orders*`, `admin/stats`, `admin/instagram-reels*`
- **Other:** `contact`, `chat`, `instagram/*`, `cron/instagram`

---

## Models → collections

| Model | File | Notes |
|---|---|---|
| User | `src/models/User.ts` | `role`: `user` \| `admin`; unique email; sparse unique phone |
| Product | `src/models/Product.ts` | `category` / `subCategory` are **strings**, not Category ObjectIds |
| Category | `src/models/Category.ts` | Nav/megamenu rows; optional `parentId` (one level) |
| Order | `src/models/Order.ts` | COD / online; dual status fields; Razorpay ids; cancellation; emailLog |
| UserNotification | `src/models/UserNotification.ts` | In-app order events |
| AdminInstagramReelsConfig | `src/models/AdminInstagramReelsConfig.ts` | Admin-managed reel list |

---

## Key libs (not exhaustive)

| File | Job |
|---|---|
| `src/lib/db.ts` | Cached Mongoose connect (`MONGODB_URI`) |
| `src/lib/auth.ts` | NextAuth options (Google + credentials) |
| `src/lib/admin-auth.ts` | `requireAdmin()` |
| `src/lib/api-auth.ts` | `requireAuthUser()` for checkout/profile |
| `src/lib/auth-contact.ts` | Email vs mobile; synthetic `@mobile.zenmen.local` |
| `src/lib/categories.ts` | Default hierarchy, `buildNavMenuGroups`, collection hrefs |
| `src/lib/category-seed.ts` | Idempotent upsert + parent linking |
| `src/lib/product-images.ts` | Primary-image helpers |
| `src/lib/orders.ts` | Resolve cart from DB, totals, order numbers |
| `src/lib/razorpay.ts` / `cloudinary.ts` | Payment / image SDKs |
| `src/lib/currency.ts` | Display FX (prices stored INR) |
