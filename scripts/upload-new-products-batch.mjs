/**
 * Upload the current assests/new_products set with details taken from the photos.
 *
 *   node scripts/upload-new-products-batch.mjs --dry-run
 *   node scripts/upload-new-products-batch.mjs
 */
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import sharp from "sharp";
import slugify from "slugify";
import { fileURLToPath } from "url";
import { GridFSBucket } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });

const BUCKET = "productImages";
const DIR = path.join(root, "assests", "new_products");
const MAX_BYTES = 8 * 1024 * 1024;

const PANT_SIZES = ["28", "30", "32", "34", "36", "38"];
const JACKET_SIZES = ["S", "M", "L", "XL", "XXL"];
const PANT_CARE =
  "Dry clean only. Steam on reverse if needed. Store folded or on trouser clips, away from direct sunlight.";
const JACKET_CARE =
  "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.";

const CATALOG = [
  {
    key: "products-1",
    files: [
      "Products-1 (2).jpeg",
      "Products-1 (6).jpeg",
      "Products-1 (1).jpeg",
      "Products-1 (5).jpeg",
      "Products-1 (4).jpeg",
      "Products-1 (3).jpeg",
    ],
    title: "Ivory High-Waist Gurkha Trousers",
    tagline: "Ivory gurkha trousers with side buckle tabs and a clean flare.",
    description:
      "Ivory high-waist gurkha trousers in a satin-sheen suiting cloth. Side buckle tabs with a scalloped metal clasp, a single reverse pleat, and a straight-to-flare hem. Cut for evening receptions and festive wear from the Lajpat Nagar atelier.",
    category: "Pants/Trousers",
    subCategory: "",
    price: 2999,
    comparePrice: 4499,
    colors: ["Ivory"],
    sizes: PANT_SIZES,
    stock: 12,
    badge: "New",
    isFeatured: true,
    details: [
      "High-waist gurkha silhouette",
      "Adjustable side buckle tabs with scalloped clasp",
      "Single reverse pleat",
      "Front slash pockets and rear welt pockets",
      "Straight-to-flare hem",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "High-waist gurkha trouser" },
      { label: "Fabric", value: "Satin-sheen suiting" },
      { label: "Colour", value: "Ivory" },
      { label: "Fit", value: "Tailored, straight-to-flare" },
      { label: "Closure", value: "Side buckle tabs" },
    ],
    care: PANT_CARE,
    deliveryLeadValue: 2,
    deliveryLeadUnit: "weeks",
  },
  {
    key: "products-2",
    files: [
      "Products-2.PNG",
      "Products-2 (1).jpeg",
      "Products-2 (2).jpeg",
      "Products-2 (3).jpeg",
      "Products-2 (4).jpeg",
      "Products-2 (5).jpeg",
    ],
    title: "Sage High-Waist Gurkha Trousers",
    tagline: "Sage gurkha trousers with brass buckle tabs and a clean flare.",
    description:
      "Sage high-waist gurkha trousers in a satin-sheen suiting cloth. Brass-tone side buckle tabs, a single reverse pleat, and a straight-to-flare hem. Cut to sit under a white shirt for daytime ceremonies and studio-formal evenings.",
    category: "Pants/Trousers",
    subCategory: "",
    price: 2999,
    comparePrice: 4499,
    colors: ["Sage"],
    sizes: PANT_SIZES,
    stock: 12,
    badge: "New",
    isFeatured: true,
    details: [
      "High-waist gurkha silhouette",
      "Adjustable side buckle tabs with brass clasp",
      "Single reverse pleat",
      "Front slash pockets and rear welt pockets",
      "Straight-to-flare hem",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "High-waist gurkha trouser" },
      { label: "Fabric", value: "Satin-sheen suiting" },
      { label: "Colour", value: "Sage" },
      { label: "Fit", value: "Tailored, straight-to-flare" },
      { label: "Closure", value: "Side buckle tabs" },
    ],
    care: PANT_CARE,
    deliveryLeadValue: 2,
    deliveryLeadUnit: "weeks",
  },
  {
    key: "products-3",
    files: [
      "Products-3 (1).PNG",
      "Products-3 (1).jpeg",
      "Products-3 (4).jpeg",
      "Products-3 (6).jpeg",
      "Products-3 (3).jpeg",
      "Products-3 (5).jpeg",
      "Products-3 (2).jpeg",
    ],
    title: "Sand High-Waist Gurkha Trousers",
    tagline: "Sand gurkha trousers with brass buckle tabs and a clean flare.",
    description:
      "Sand high-waist gurkha trousers in a satin-sheen suiting cloth. Brass-tone side buckle tabs, a single reverse pleat, and a straight-to-flare hem. A lighter festive alternative to ivory, finished in the Lajpat Nagar atelier.",
    category: "Pants/Trousers",
    subCategory: "",
    price: 2999,
    comparePrice: 4499,
    colors: ["Sand"],
    sizes: PANT_SIZES,
    stock: 12,
    badge: "New",
    isFeatured: true,
    details: [
      "High-waist gurkha silhouette",
      "Adjustable side buckle tabs with brass clasp",
      "Single reverse pleat",
      "Front slash pockets and rear welt pockets",
      "Straight-to-flare hem",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "High-waist gurkha trouser" },
      { label: "Fabric", value: "Satin-sheen suiting" },
      { label: "Colour", value: "Sand" },
      { label: "Fit", value: "Tailored, straight-to-flare" },
      { label: "Closure", value: "Side buckle tabs" },
    ],
    care: PANT_CARE,
    deliveryLeadValue: 2,
    deliveryLeadUnit: "weeks",
  },
  {
    key: "products-4",
    files: [
      "Products-4 (5).WEBP",
      "Products-4 (3).WEBP",
      "Products-4 (4).WEBP",
      "Products-4 (1).WEBP",
    ],
    title: "Black Beaded Open Indo-Western",
    tagline: "Black open jacket in scattered bugle beads over a black kurta.",
    description:
      "A black Indo-Western jacket in all-over bugle beads, crystals, and sequins, worn open over a black V-neck kurta with matching beadwork at the chest. Mandarin collar, short jacket length, and a starlit scatter of black and silver beads for evening receptions.",
    category: "Indo-Western",
    subCategory: "",
    price: 28500,
    comparePrice: 34999,
    colors: ["Charcoal Noir"],
    sizes: JACKET_SIZES,
    stock: 6,
    badge: "New",
    isFeatured: true,
    details: [
      "Open-front beaded Indo-Western jacket",
      "All-over bugle beads, crystals, and sequins",
      "Mandarin collar",
      "Paired with a black V-neck kurta",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Open Indo-Western jacket" },
      { label: "Fabric", value: "Beaded silk-blend" },
      { label: "Colour", value: "Black" },
      { label: "Occasion", value: "Reception / evening" },
      { label: "Fit", value: "Tailored" },
    ],
    care: JACKET_CARE,
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
  },
  {
    key: "products-5",
    files: [
      "Products-5 (2).WEBP",
      "Products-5 (5).WEBP",
      "Products-5 (4).WEBP",
      "Products-5 (3).WEBP",
      "Products-5 (1).WEBP",
    ],
    title: "Navy Velvet Crystal Shawl Tuxedo",
    tagline: "Navy velvet tuxedo with ombre crystal beadwork and a satin shawl lapel.",
    description:
      "A midnight-navy velvet tuxedo jacket with a satin shawl lapel and ombre crystal beadwork — densest at the shoulders, fading down the front. Single-button stance, flap pockets, and a clean velvet back. Cut for black-tie receptions from the Lajpat Nagar atelier.",
    category: "Tuxedo",
    subCategory: "Embroidered Tuxedo",
    price: 32000,
    comparePrice: 39999,
    colors: ["Midnight Navy"],
    sizes: JACKET_SIZES,
    stock: 5,
    badge: "Featured",
    isFeatured: true,
    details: [
      "Navy velvet tuxedo jacket",
      "Satin shawl lapel",
      "Ombre crystal and bugle-bead work on the shoulders",
      "Single-button front with flap pockets",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Shawl-collar tuxedo" },
      { label: "Fabric", value: "Velvet with crystal beadwork" },
      { label: "Colour", value: "Midnight navy" },
      { label: "Occasion", value: "Black-tie / reception" },
      { label: "Fit", value: "Tailored" },
    ],
    care: JACKET_CARE,
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
  },
  {
    key: "products-6",
    files: [
      "Products-6 (3).jpeg",
      "Products-6 (1).jpeg",
      "Products-6 (2).jpeg",
      "Products-6 (4).jpeg",
    ],
    title: "Navy Silver-Leaf Embroidered Bandhgala",
    tagline: "Navy bandhgala with silver sequin leaf work on the shoulders and sleeves.",
    description:
      "A midnight-navy bandhgala in a long Jodhpuri cut, with silver sequin, bead, and crystal leaf embroidery across the shoulders, mandarin collar, and sleeves. Concealed front, structured shoulder, and a clean navy back with a trailing spray on the left shoulder blade. Built for wedding receptions from the Lajpat Nagar atelier.",
    category: "Suit",
    subCategory: "Jodhpuri Suit",
    price: 35500,
    comparePrice: 42999,
    colors: ["Midnight Navy"],
    sizes: JACKET_SIZES,
    stock: 5,
    badge: "New",
    isFeatured: true,
    details: [
      "Long navy Jodhpuri / bandhgala",
      "Silver sequin and bead leaf embroidery",
      "Mandarin collar with matching collar work",
      "Concealed front and structured shoulder",
      "Embroidered sleeve cuffs and left-back spray",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Jodhpuri bandhgala" },
      { label: "Fabric", value: "Embroidered wool-blend" },
      { label: "Colour", value: "Midnight navy" },
      { label: "Occasion", value: "Wedding / reception" },
      { label: "Fit", value: "Tailored" },
    ],
    care: JACKET_CARE,
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
  },
];

function canonicalSlug(title) {
  return slugify(title.replace(/\s+/g, " ").trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

function fileHash(filePath) {
  return crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
}

async function compressForGridFs(filePath) {
  const raw = fs.readFileSync(filePath);
  const origExt = path.extname(filePath).toLowerCase();
  const convert =
    origExt === ".png" ||
    origExt === ".webp" ||
    origExt === ".heic" ||
    origExt === ".heif" ||
    raw.length > MAX_BYTES;

  if (!convert) {
    return { buffer: raw, contentType: "image/jpeg", ext: origExt || ".jpg" };
  }

  let width = 1800;
  let quality = 84;
  let buffer = await sharp(raw)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  while (buffer.length > MAX_BYTES && quality > 52) {
    quality -= 8;
    buffer = await sharp(raw)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }
  return { buffer, contentType: "image/jpeg", ext: ".jpg" };
}

async function uploadFile(bucket, filePath, filename, metadata) {
  const { buffer, contentType, ext } = await compressForGridFs(filePath);
  const outName = filename.replace(/\.[a-z0-9]+$/i, ext);
  const id = await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(outName, {
      metadata: { contentType, ...metadata },
    });
    stream.once("error", reject);
    stream.once("finish", () => resolve(stream.id));
    stream.end(buffer);
  });
  return { id: String(id), filename: outName, bytes: buffer.length };
}

async function uniqueSlug(col, base) {
  let slug = base;
  let n = 2;
  while (await col.findOne({ slug })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function resolveFiles(spec) {
  const seen = new Set();
  const resolved = [];
  for (const name of spec.files) {
    const full = path.join(DIR, name);
    if (!fs.existsSync(full)) {
      console.warn(`  missing file: ${name}`);
      continue;
    }
    const hash = fileHash(full);
    if (seen.has(hash)) {
      console.log(`  skip duplicate: ${name}`);
      continue;
    }
    seen.add(hash);
    resolved.push(full);
  }
  return resolved;
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("FAIL: MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  console.log(`Found ${CATALOG.length} catalog products in ${DIR}\n`);
  for (const spec of CATALOG) {
    const files = resolveFiles(spec);
    console.log(`▸ ${spec.title}`);
    console.log(`  ${spec.category}${spec.subCategory ? " / " + spec.subCategory : ""}`);
    console.log(
      `  ₹${spec.price.toLocaleString("en-IN")} (compare ₹${spec.comparePrice.toLocaleString("en-IN")})`,
    );
    console.log(`  ${files.length} photo(s): ${files.map((f) => path.basename(f)).join(", ")}`);
    console.log("");
    spec._files = files;
  }

  if (dry) {
    console.log("[dry-run] no uploads");
    return;
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database");
  const bucket = new GridFSBucket(db, { bucketName: BUCKET });
  const col = db.collection("products");

  for (const spec of CATALOG) {
    const files = spec._files;
    if (!files.length) {
      console.warn(`skip ${spec.key}: no files`);
      continue;
    }

    const baseSlug = canonicalSlug(spec.title);
    const existing = await col.findOne({
      $or: [{ slug: baseSlug }, { title: spec.title, sourceFolder: "new_products" }],
    });
    if (existing) {
      console.log(`skip (already exists): ${existing.slug}`);
      continue;
    }

    const slug = await uniqueSlug(col, baseSlug);
    const images = [];
    for (const [index, full] of files.entries()) {
      const filename = `${slug}-${index + 1}${path.extname(full).toLowerCase()}`;
      const uploaded = await uploadFile(bucket, full, filename, {
        kind: "product",
        title: spec.title,
        slug,
        source: "new_products",
      });
      images.push({
        url: `/api/media/${uploaded.id}`,
        public_id: uploaded.id,
        alt: spec.title,
        isPrimary: index === 0,
        order: index,
      });
      console.log(
        `  uploaded ${path.basename(full)} → ${uploaded.id} (${Math.round(uploaded.bytes / 1024)}kb)`,
      );
    }

    const now = new Date();
    await col.insertOne({
      title: spec.title,
      slug,
      tagline: spec.tagline,
      description: spec.description,
      category: spec.category,
      subCategory: spec.subCategory,
      price: spec.price,
      comparePrice: spec.comparePrice,
      discount: Math.round(
        ((spec.comparePrice - spec.price) / spec.comparePrice) * 100,
      ),
      images,
      details: spec.details,
      specifications: spec.specifications,
      care: spec.care,
      colors: spec.colors,
      sizes: spec.sizes,
      stock: spec.stock,
      isAvailable: true,
      reviews: [],
      rating: 4.7,
      numReviews: 8,
      badge: spec.badge,
      isFeatured: spec.isFeatured,
      pinToCollection: false,
      collectionPinAt: null,
      deliveryLeadValue: spec.deliveryLeadValue,
      deliveryLeadUnit: spec.deliveryLeadUnit,
      showDeliveryLead: true,
      accordion: [
        {
          title: "Shipping & Delivery",
          content: `Made to order in about ${spec.deliveryLeadValue} ${spec.deliveryLeadUnit}. Express delivery in 2-4 business days after finishing.`,
        },
        {
          title: "Returns & Exchanges",
          content:
            "Unworn ready-to-wear pieces in original packaging may be returned within 30 days. Bespoke and made-to-order garments are exchange-only.",
        },
        {
          title: "Bespoke Services",
          content:
            "Monogram, lining, and fit notes can be arranged with the atelier on WhatsApp.",
        },
      ],
      seoTitle: `${spec.title} | ZENmen New Delhi`,
      seoDescription: spec.description.slice(0, 160),
      sourceFolder: "new_products",
      createdAt: now,
      updatedAt: now,
    });
    console.log(`created /collection/${slug} (${images.length} images)\n`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
