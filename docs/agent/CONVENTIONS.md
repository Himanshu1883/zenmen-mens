# CONVENTIONS

Project-specific. Not generic style advice.

---

## Next 16

- Read `node_modules/next/dist/docs/` before using App Router APIs that differ from Next 13/14 training data.
- Route `params` and some `searchParams` are **Promises** — `const { id } = await context.params` (see existing `api/admin/categories/[id]/route.ts`).
- `AGENTS.md` / `CLAUDE.md` exist only to force that docs read.

## Files / imports

- Alias `@/` = `src/`.
- App pages under `src/app/` (not repo-root `app/`).
- Admin **pages** are thin: `src/app/admin/<area>/page.tsx` imports `adminComponents/pages/…`.
- Canonical Redux: `src/store/`. Ignore `src/app/store/` unless deleting the leftover.

## Auth helpers

- Admin API: `requireAdmin()` from `@/lib/admin-auth`.
- Customer API: `requireAuthUser()` from `@/lib/api-auth`.
- Do not re-implement session checks ad hoc.

## Mongo

- Call `connectDB()` at the start of handlers that touch models.
- Export models as `mongoose.models.X || mongoose.model("X", schema)`.
- `Product.category` is the **collection** (parent name, e.g. Shirt). `Product.subCategory` is the **category** (child name, e.g. Designer Shirt). Category documents remain a separate nav graph (`parentId`). Do not assume ObjectId FKs between them.

## Categories

- One level of nesting only (API enforces parent has no `parentId`).
- `filterType: "search"` → `/collection?q=`; `"category"` → `/collection?category=`.
- After changing default names/slugs, update `DEFAULT_NAV_CATEGORIES` **and** rely on `ensureCategoryHierarchyComplete` (it upserts + relinks).
- Admin table: nest children under parents; sequential `#`; keep edit/delete/view actions.

## Images

- Use `normalizePrimaryFlags` on write and `getPrimaryImage` / `getPrimaryImageIndex` on read (`src/lib/product-images.ts`).

## Money

- Persist INR. Convert only in the UI via `src/lib/currency.ts`.
- Checkout amounts: `resolveCartItems` + `calcOrderTotals`; never trust client `price` for the order total.

## Orders

- Insert COD/online as `pending` first; confirm only inside `finalizeCodOrder` / `finalizePaidOrder`.
- Stock is decremented once (`stockDecremented`). Treat those services as the single writers.
- Dual fields exist (`status` and `orderStatus`, `paymentMethod` and `payment.method`) — when updating, set the same pair the finalize functions already set.

## Auth contact

- Mobile-only accounts use `${phone}@mobile.zenmen.local`. Hide that domain with `getPublicEmail` / `resolveAccountContact`.
- Display phones with `formatPhoneDisplay`.

## Validation

- Zod schemas live in `src/lib/validations/*`. Checkout, auth, chat, contact, profile each have one.
- HTTP JSON: some routes use `{ success, message }`, others `{ error }`. Match the file you are editing (`ok`/`fail` in `src/lib/http-responses.ts` is used by admin stats, not universally).

## UI

- Storefront: Inter, dark gold/cream accents (`#c8a96e` toasts, `#7da8c7` admin).
- Admin: `GlassCard`, slate text `#0f172a` / `#64748b`, accent `#7da8c7`.
- Toasts: `sonner`.
- Client components that fetch: `"use client"` at top (Categories, Products, AdminOrdersPanel, collection page).

## Do not

- Invent `middleware.ts` — it is not in this repo.
- Use Next 12 `pages/` APIs.
- Pass mongoose deprecated connect flags (`useNewUrlParser`, etc.) — Mongoose 9 + current `db.ts` do not.
