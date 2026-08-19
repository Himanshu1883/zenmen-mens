# DECISIONS

Only choices verified in current code.

---

## NextAuth JWT + dual login

`src/lib/auth.ts`: Credentials (email or Indian mobile) and Google. `session.strategy: "jwt"`. Role/id/phone are copied in `jwt` → `session` callbacks. Google users are created with empty `password`.

## Synthetic mobile emails

`src/lib/auth-contact.ts`: `INTERNAL_MOBILE_EMAIL_DOMAIN = "mobile.zenmen.local"`. Mobile signup stores a unique email so NextAuth and the User email index work. UI must not show that address (`getPublicEmail`).

## Admin is proxy + layout + requireAdmin

Next.js 16 renamed Middleware to Proxy (`src/proxy.ts`). Admin HTML is blocked unless the NextAuth JWT has `role === "admin"`. `src/app/admin/layout.tsx` re-checks `getServerSession`. Client `AdminAuthGuard` redirects on unauthenticated / non-admin (covers bfcache Back). APIs use `requireAdmin()`. Cache-Control `no-store` is set on `/admin` and `/checkout`.

## Category documents ≠ product.category

Nav/megamenu is the Category collection (`parentId`, `showInNav`, `filterType`/`filterValue`). Products store a string `category`. Linking is by name/filterValue (`admin/categories/[id]/products`) or PATCH of that string.

## One-level parentId hierarchy

Shirt / Suit groups are encoded as `parentSlug` in `DEFAULT_NAV_CATEGORIES` and persisted as `parentId`. API rejects grandparents. `buildNavMenuGroups` also fills missing `parentId` from `DEFAULT_CHILD_PARENT_SLUGS` so legacy rows still nest.

## Hierarchy repair on read

`GET /api/categories?nav=1` and `GET /api/admin/categories` call `ensureCategoryHierarchyComplete()`, which upserts every default row and relinks children. Idempotent, but it **writes on GET**.

## Primary image flag

Images are an array with `isPrimary`. Helpers in `src/lib/product-images.ts` guarantee exactly one primary (else index 0). Checkout `resolveCartItems` uses the same rule.

## COD: pending, then confirm

`POST /api/orders/cod` inserts `status/orderStatus: pending`, `paymentStatus: pending`, then `finalizeCodOrder`: decrement stock, then set confirmed + `payment.status: "cod"` while **paymentStatus stays pending** (COD is unpaid). Failure → `markOrderFailed`, not a confirmed ghost.

## Razorpay: create pending, finalize once

Online orders stay pending until `finalizePaidOrder` (verify or webhook). Guard is `stockDecremented: { $ne: true }`. Stock failure after mark-paid rolls order to `failed`.

## Cart is client-only until checkout

Redux + `localStorage` (`zenmen_cart_v1`). Server rebuilds lines from Product docs.

## Display currency, INR ledger

DB prices are INR. `currencySlice` + static `INR_PER_UNIT` convert for display only.

## pdfkit unbundled

`serverExternalPackages: ["pdfkit", "fontkit"]` so invoice fonts are not traced to a fake `C:\\ROOT\\node_modules\\pdfkit`.

## Contact form logs only

`POST /api/contact` validates then `console.log`; Resend send is commented out. Order email uses Resend separately when `RESEND_API_KEY` is set.

## Storefront vs admin chrome

`RootLayoutClient` returns null on `/admin` so Footer / chat / WhatsApp FAB do not wrap the dashboard.
