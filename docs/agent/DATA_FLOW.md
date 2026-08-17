# DATA_FLOW

Verified paths only. Arrows are the live call chain.

---

## Catalog (storefront)

```
Providers → fetchProducts thunk
  → GET /api/products          (isAvailable: true unless ?admin=1)
  → Redux products slice
  → Home ProductSlider / collection page / PDP

PDP: GET /api/products/[slug]
Collection URL:
  filterType=search   → /collection?q=<filterValue>     (substring on title/category/…)
  filterType=category → /collection?category=<value>    (p.category === value)

GET /api/products query (storefront unchanged):
  category=            exact Product.category
  featured=true
  page, limit
Admin-only extras (with admin=1):
  categories=          comma list; case-insensitive match on category OR subCategory
  q=                   title / slug substring
  stock=in|low|out
  featured=true|false
  available=true|false
  stats                catalog-wide stock counts (unfiltered)
```

Admin creating products: `POST /api/products` (requireAdmin) uploads images to Cloudinary, `normalizePrimaryFlags`, slugify title.

---

## Megamenu

```
Navbar / MegaMenu / MobileMenu
  → useNavCategories()
  → GET /api/categories?nav=1
  → ensureCategoryHierarchyComplete()   // writes defaults if needed
  → Category.find({ isActive, showInNav })
  → buildNavMenuGroups()
     parentId from DB, else DEFAULT_CHILD_PARENT_SLUGS[slug]
```

Admin list:

```
Categories.tsx
  → GET /api/admin/categories   (seed + hierarchy + parentName)
  → nested table (parents as headers, children indented)
CRUD: POST /api/admin/categories
      PATCH/DELETE /api/admin/categories/[id]
Assign products: GET/PATCH /api/admin/categories/[id]/products
```

---

## Auth / account

```
Register: POST /api/auth/register
  parseContact → bcrypt hash → User.create
  phone users also get email `${phone}@mobile.zenmen.local`

Sign-in: NextAuth credentials
  parseContact → find by email or phone/internal email → bcrypt.compare
  JWT: id, role, phone (or phoneFromInternalEmail)

Google: signIn callback upserts User by email
```

Never show `@mobile.zenmen.local` in UI — use `getPublicEmail` / `resolveAccountContact`.

---

## Cart → order

```
UI add-to-cart → cartSlice → localStorage zenmen_cart_v1

Checkout (must be signed in at API):
  1. resolveCartItems(ids)     // live Product docs, primary image, qty 1–10
  2. calcOrderTotals           // + ₹200 if COD
  3a. COD:    create pending Order → finalizeCodOrder
  3b. Online: create pending Order + Razorpay order → client pay
              → verify or webhook → finalizePaidOrder
  4. decrementStockForOrder (once; stockDecremented flag)
  5. sendOrderConfirmationEmail (fire-and-forget)
  6. success page / profile orders
```

If COD/stock finalize fails: `markOrderFailed`; order is not left `confirmed`.

Cancel: user window from `src/config/cancellationConfig.ts`; admin approve/reject under `/api/admin/orders/[id]/cancel/*`.

---

## Admin orders / users

```
GET /api/admin/orders          list (`status`, `paymentMethod=cod|online`, `q`, `from`, `to`, `page`, `limit`)
PATCH /api/admin/orders/[id]/status
POST  .../resend-confirmation
POST  .../cancel | approve | reject
GET /api/admin/stats           dashboard
```

Users: `src/app/admin/users/page.tsx` is a server component that queries `User` directly (no `/api/admin/users`). SearchParams: `q` (name/email/phone), `role=user|admin`, `from`/`to` (joined date), `page`. Role is `user` | `admin` on the document. Each row’s `orders` count is currently hardcoded `0`.

---

## Images

```
Admin product form → POST /api/products (base64/file in body)
  → cloudinary.uploader
  → Product.images[] with isPrimary
Storefront cards: getPrimaryImage(product.images)
```

---

## Reels / chat / contact

```
Home Reels → GET /api/instagram/reels  (cache + optional INSTAGRAM_ACCESS_TOKEN)
Admin reels → /api/admin/instagram-reels[+ /refresh]
Cron → /api/cron/instagram?  CRON_SECRET

Chat widget → POST /api/chat → Gemini or OpenAI
Contact page → POST /api/contact  (Resend send is commented in the handler)
```
