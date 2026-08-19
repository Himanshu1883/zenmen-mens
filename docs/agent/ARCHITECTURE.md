# ARCHITECTURE

Request flow is App Router → route handler or RSC → Mongoose. Client islands use Redux + `fetch`.

---

## Runtime constraints

- **Next.js 16** — APIs differ from older Next. Before changing App Router / `params` / config, read `node_modules/next/dist/docs/`. Heed deprecations. See root `AGENTS.md`.
- Dynamic route `params` in this repo are **`Promise<{ … }>`** (await in handlers).
- `next.config.ts` marks `pdfkit` / `fontkit` as `serverExternalPackages` so invoice AFM fonts resolve from `node_modules`.
- Path alias: `@/*` → `src/*` (`tsconfig.json`).

---

## Auth

```
Browser  →  NextAuth SessionProvider (`src/app/providers.tsx`)
         →  GET/POST `/api/auth/[...nextauth]`
         →  `authOptions` in `src/lib/auth.ts` (JWT sessions)
```

**Providers:** Google OAuth + Credentials (email **or** 10-digit Indian mobile).

**Role:** stored on `User.role`, copied onto JWT in `jwt` callback, exposed on `session.user.role`.

**Gates:**
- Admin pages: `src/proxy.ts` (JWT `role === "admin"`) + `src/app/admin/layout.tsx` + client `AdminAuthGuard`.
- Admin APIs: `requireAdmin()` → 401 `{ error: "Admin access required" }`.
- Checkout / customer order APIs: `requireAuthUser()` (session email → Mongo `_id` via `resolveMongoUserId`).
- `/admin` and `/checkout` send `Cache-Control: no-store` so Back cannot restore stale HTML.

Google first login creates a User with `password: ""`.

---

## Data

`connectDB()` in `src/lib/db.ts` caches the connection on `global._mongoose`. Models use `mongoose.models.X || mongoose.model(...)`.

**Category vs Product.category:** the Category collection drives the **megamenu**. Products keep a free-text `category` string. Admin can PATCH that string (`/api/admin/products/[slug]/category`) or assign products from the category modal (`/api/admin/categories/[id]/products`). Collection `?category=` matches `Product.category` **exactly**; `?q=` is client-side text search.

---

## Storefront state

Canonical store: `src/store/store.ts`

| Slice | Persistence |
|---|---|
| `products` | Fetched from `GET /api/products` (available products; `revalidate: 60` on that route) |
| `cart` | `localStorage` key `zenmen_cart_v1` via `CartHydrate` + `src/lib/cart-storage.ts` |
| `currency` | `localStorage` key `zenmen-currency`; conversion is **display-only** (static INR rates in `src/lib/currency.ts`) |

Checkout re-resolves line items from Mongo (`resolveCartItems`) — client prices are not trusted.

---

## Images

Uploads go through Cloudinary (`src/lib/cloudinary.ts`). Product images are `{ url, alt, isPrimary, order, public_id }`. Always use `getPrimaryImage` / `normalizePrimaryFlags` from `src/lib/product-images.ts` — do not assume `images[0]` is primary except as fallback.

`next.config.ts` allows `res.cloudinary.com` and `images.unsplash.com`.

---

## Payments

```
COD:     POST /api/orders/cod
           → insert Order status=pending
           → finalizeCodOrder (stock then confirmed)
           → confirmation email (async)

Online:  POST /api/orders/razorpay/create  (pending Order + Razorpay order)
         → client Checkout.js
         → POST /api/orders/razorpay/verify  and/or POST /api/webhook/razorpay
           → finalizePaidOrder (idempotent on stockDecremented)
```

Older aliases exist: `/api/payment/create-order`, `/api/payment/verify`. Prefer the `/api/orders/razorpay/*` pair when touching checkout.

COD fee: `COD_FEE_INR = 200` in `src/lib/validations/checkout.schema.ts`.

---

## Nav / megamenu

```
GET /api/categories?nav=1
  → ensureCategoryHierarchyComplete()   (upsert defaults + parentId links)
  → buildNavMenuGroups()
  → { groups: NavMenuGroup[] }

useNavCategories() → MegaMenu, MobileMenu, HomeCategoryStrip, collection filters
```

Defaults live in `DEFAULT_NAV_CATEGORIES` (`src/lib/categories.ts`). Shirt / Suit are parents; their styles are children (`parentSlug`). Other items (Kurta-Pajama, Pants, etc.) are standalone parents.

Nesting is **one level**. API rejects a parent that itself has a `parentId`.

---

## Email / notifications

- Transactional: Resend via `src/config/emailConfig.ts` + `src/services/orderEmailService.ts`.
- In-app: `UserNotification` + `/api/profile/notifications*`.
- Invoice PDF: `src/utils/generateInvoiceBuffer.ts` + `GET /api/orders/[id]/invoice`.

---

## Other backends

- **Chat:** `/api/chat` — Gemini (env) with OpenAI fallback; widget `AiChatWidget`.
- **Instagram reels:** `src/lib/instagram/*`, admin config model, `instrumentation.ts` refresh on Node boot, `/api/cron/instagram` (`CRON_SECRET`).
- **WhatsApp:** hardcoded number `919650753273` in root layout FAB and `src/lib/whatsapp-product-order.ts` (not Razorpay checkout).
