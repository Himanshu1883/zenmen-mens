# KNOWN_ISSUES

Limitations visible in the current tree. Not a wishlist.

---

## Next.js 16 docs requirement

This is not the Next.js 13/14 App Router from training data. Root `AGENTS.md` / `CLAUDE.md` require reading `node_modules/next/dist/docs/` before changing Next APIs. Dynamic `params` are already `Promise<>` throughout `src/app/api`.

## Category hierarchy writes on GET

`ensureCategoryHierarchyComplete()` upserts all default categories and relinks `parentId` on every `GET /api/categories?nav=1` and admin category list. Safe/idempotent, but noisy (write amplification, can reset `parentId: null` on known parent slugs then re-link). Custom edits to default slugs/orders can be overwritten by the seed loop.

## Product.category is a string

There is no Mongoose ref from Product → Category. Renaming a Category does not automatically rewrite products unless the assign-products API is used. Collection `?category=` is exact string match; `?q=` is substring search — they are not the same.

## Admin Categories used to look flat

Children were grouped but **collapsed by default** (`expandedParents` started empty), so the table showed only parents. The table now always nests children under group headers with a sequential `#` column. DB `order` still restarts per sibling group (seed uses `getChildOrderUnderParent`); the UI no longer displays that as the row number.

## Duplicate Redux store

Live store: `src/store/` (wired in `providers.tsx`). Leftover: `src/app/store/store.ts` + `productSlice.ts` (older, `any[]`, unused). Do not import from `@/app/store`.

## Mock / incomplete admin screens

- `/admin/analytics` — hardcoded Recharts data.
- `/admin/images`, `/admin/sections` — local/mock UI; **not linked in the sidebar**.
- `/admin/settings` profile fields are placeholders (`Sarah Anderson`, etc.). Instagram reels block on that page is real.
- Admin Users `orders` count is hardcoded `0` in `admin/users/page.tsx`.
- Sidebar badges `"156"` / `"24"` are static.

## Contact API does not send mail

`src/app/api/contact/route.ts` logs the enquiry. Resend is commented.

## Static FX rates

`INR_PER_UNIT` in `src/lib/currency.ts` is a hard-coded table, not a live feed.

## Dual order status fields

Orders carry both `status` and `orderStatus`, plus `paymentMethod` vs `payment.method`. Finalize services set both; ad-hoc patches that set only one will desync admin/customer UIs.

## No route middleware

Admin URLs are protected only after the layout runs. Direct API access is protected per-handler. There is no matcher-based middleware.

## Mongoose connect flags

`src/lib/db.ts` uses Mongoose 9 `mongoose.connect(uri, { bufferCommands: false })` only. Do not add `useNewUrlParser` / `useUnifiedTopology` (removed/unnecessary).

## Git remote

`origin` is `https://github.com/suBmit52/ZENmen.git` and `main` tracks `origin/main`. No broken-remote state in the current checkout.

## NextAuth secret

App source never reads `NEXTAUTH_SECRET`; NextAuth still requires it at runtime. Missing secret will fail sessions in production even though types compile.
