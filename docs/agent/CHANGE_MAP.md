# CHANGE_MAP

If you need to change **X**, start at these files. Do not hunt the whole repo.

---

## Storefront chrome

| Change | Start |
|---|---|
| Navbar / megamenu UI | `src/app/components/layout/Navbar.tsx`, `MegaMenu.tsx`, `MobileMenu.tsx` |
| Nav data / grouping | `src/lib/categories.ts` → `useNavCategories.ts` → `GET /api/categories` |
| Default Shirt/Suit children | `DEFAULT_NAV_CATEGORIES` in `src/lib/categories.ts` **and** `src/lib/category-seed.ts` |
| Footer, WhatsApp FAB, chat on storefront | `src/app/RootLayoutClient.tsx`, `src/app/layout.tsx` |
| Global providers (session, Redux, toasts, cart hydrate) | `src/app/providers.tsx` |
| Mobile bottom nav | `src/app/components/layout/MobileBottomNav.tsx` |

## Home

| Change | Start |
|---|---|
| Section order | `src/app/components/sections/HomeSections.tsx`, `src/app/page.tsx` |
| Hero | `sections/Hero.tsx` |
| Category strip | `HomeCategoryStrip.tsx` + nav hook |
| Product rail | `Products.tsx` / `ProductSlider.tsx` + Redux `fetchProducts` |
| Reels | `Reels.tsx` + `/api/instagram/reels` |

## Catalog / PDP

| Change | Start |
|---|---|
| Collection grid / filters | `src/app/collection/page.tsx`, `CollectionSidebarFilters`, `MobileFilterBar`. All-collections (`/collection`) lists every nav **Collection**; a specific collection (`?q=` / `?category=`) lists that parent’s **Category** children from the nav tree (not only ones with products). Helpers: `resolveCollectionPageContext`, `productInCollectionGroup` in `src/lib/categories.ts` |
| Collection URL contract | `categoryCollectionHref` in `src/lib/categories.ts`. Collection grid matches parent/child tags **and** title; a product whose `category` is another collection parent stays only on that collection. Empty `subCategory` is persisted on product PUT. |
| Admin product list filters | `adminComponents/pages/Products.tsx` — collections from `GET /api/admin/categories`; list query `GET /api/products?admin=1` with `categories=`, `q`, `stock`, `featured`, `available` |
| Product card | `src/app/components/ui/ProductCard.tsx`, `collection/CollectionProductCard.tsx` |
| PDP | `src/app/collection/[slug]/ProductDetailClient.tsx` + `GET /api/products/[slug]` |
| Primary image | `src/lib/product-images.ts` |
| Product model / slug | `src/models/Product.ts`, `src/lib/product-slug.ts` |
| Admin inline create on collection | `ProductFormModal` (same as admin products) |

## Cart / checkout / orders

| Change | Start |
|---|---|
| Cart UI | `CartDrawer.tsx`, `cartSlice.ts`, `cart-storage.ts` |
| Checkout page | `src/app/checkout/page.tsx` |
| Validation / COD fee | `src/lib/validations/checkout.schema.ts` |
| Server totals / line resolve | `src/lib/orders.ts` |
| COD place | `POST /api/orders/cod` → `finalizeCodOrder` |
| Razorpay place / verify | `api/orders/razorpay/create`, `…/verify`, `api/webhook/razorpay` |
| Finalize + stock + email | `src/services/orderFinalizeService.ts`, `stockService.ts`, `orderEmailService.ts` |
| Cancel rules | `src/config/cancellationConfig.ts`, `orderCancellationService.ts` |
| Invoice PDF | `src/utils/generateInvoiceBuffer.ts`, `GET /api/orders/[id]/invoice` |
| Success UI | `src/app/checkout/success/` |
| WhatsApp product intent (not checkout) | `src/lib/whatsapp-product-order.ts` |

## Auth / users

| Change | Start |
|---|---|
| NextAuth config | `src/lib/auth.ts`, `api/auth/[...nextauth]/route.ts` |
| Register | `api/auth/register`, `validations/auth.schema.ts` |
| Email vs mobile | `src/lib/auth-contact.ts` |
| Session types | `src/types/next-auth.d.ts` |
| Auth UI | `UserAuthPanel.tsx` |
| Profile | `src/app/profile/*`, `api/profile/*` |
| Admin user list | **RSC** `src/app/admin/users/page.tsx` (queries User directly) → `pages/Users.tsx`. Filters via searchParams `q`, `role`, `from`, `to`. `orders` on each row is currently hardcoded `0`. |

## Admin dashboard

| Change | Start |
|---|---|
| Admin gate | `src/app/admin/layout.tsx`, `src/lib/admin-auth.ts` |
| Shell / sidebar | `adminComponents/dashboard/Layout.tsx`, `Sidebar.tsx`, `admin-theme.ts` |
| Dashboard stats | `DashboardOverview.tsx` + `GET /api/admin/stats` |
| Products CRUD UI | `adminComponents/pages/Products.tsx`, `ProductFormModal.tsx`, `api/products*` — form Collection = parent, Category = child; stored as `product.category` / `product.subCategory`. Add/edit modal: required-field errors, hints, and templates in `src/lib/product-form-presets.ts` |
| **Categories nested table** | `adminComponents/pages/Categories.tsx` |
| Category form / product assign | `CategoryFormModal.tsx`, `api/admin/categories*` |
| Orders UI | `pages/Orders.tsx` → `AdminOrdersPanel.tsx` + `api/admin/orders*` (`status`, `paymentMethod`, `q`, `from`, `to`, `page`) |
| Analytics / images / sections | Those page components — **mostly mock/static**, not Mongo |
| Settings chrome | `pages/Settings.tsx` (placeholder profile fields) |
| Instagram reels admin | `AdminInstagramReelsSettings.tsx` + `api/admin/instagram-reels*` |

## Categories / megamenu data

| Change | Start |
|---|---|
| Schema (`parentId`, flags) | `src/models/Category.ts`, `src/types/category.ts` |
| Seed / repair hierarchy | `src/lib/category-seed.ts` (`ensureCategoryHierarchyComplete`) |
| Public groups API | `src/app/api/categories/route.ts` |
| Admin CRUD API | `src/app/api/admin/categories/route.ts`, `[id]/route.ts` |
| Attach products to a nav category | `[id]/products/route.ts` (matches `Product.category` string to category name / filterValue) |
| Patch one product’s category string | `api/admin/products/[slug]/category/route.ts` |

Admin Categories UI groups by `parentId`, then `DEFAULT_CHILD_PARENT_SLUGS` / `DEFAULT_CHILD_PARENT_BY_NAME`. Parents with children render as group headers; children stay indented underneath. The `#` column is a sequential display index (not per-group `order`).

## Infra / env

| Change | Start |
|---|---|
| Mongo connect | `src/lib/db.ts` — read `MONGODB_URI` inside `connectDB()` (do not throw at import, so `next build` can collect page data without Mongo). Sitemap falls back to static URLs if DB is unavailable. |
| Cloudinary | `src/lib/cloudinary.ts` |
| Razorpay keys / webhook | `src/lib/razorpay.ts` |
| Email from/to | `src/config/emailConfig.ts` |
| Invoice legal copy | `src/config/invoiceConfig.ts` |
| Next images / pdfkit | `next.config.ts` |
| Instagram boot refresh | `src/instrumentation.ts` |
| Chat models | `src/lib/chat/gemini.ts`, `api/chat/route.ts` |

Env vars actually read in code: `MONGODB_URI`, `GOOGLE_CLIENT_ID/SECRET`, `NEXTAUTH_URL`, `CLOUDINARY_*`, `RAZORPAY_KEY_ID/SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO`, `ADMIN_ORDER_EMAIL`, `EMAIL_LOGO_URL`, `GEMINI_*` / `GOOGLE_GENERATIVE_AI_API_KEY` / `OPENAI_API_KEY`, `INSTAGRAM_ACCESS_TOKEN`, `CRON_SECRET`, `CANCEL_USER_WINDOW_MINUTES`, `INVOICE_*`. NextAuth also expects `NEXTAUTH_SECRET` in the environment (not referenced in app source).
