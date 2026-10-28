/**
 * Upload all images from assests/new_products as new products with RANDOM data.
 * Groups photos by filename prefix (product_1, product_2, etc.)
 * and uploads each group to GridFS as one product with generated fields.
 *
 *   node scripts/upload-random-products.mjs --dry-run
 *   node scripts/upload-random-products.mjs
 */
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
const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
  ".heif",
]);
const MAX_BYTES = 8 * 1024 * 1024;

const CATEGORY = "Pants/Trousers";
const SUB_CATEGORY = "Gurkha Pants";

const PANT_COLOR_VARIANTS = [
  { name: "Charcoal Noir", adj: "Charcoal", tone: "deep charcoal grey" },
  { name: "Midnight Navy", adj: "Midnight", tone: "rich navy blue" },
  { name: "Olive Drab", adj: "Olive", tone: "military olive green" },
  { name: "Camel Tan", adj: "Camel", tone: "warm camel tan" },
  { name: "Black", adj: "Jet Black", tone: "pure jet black" },
  { name: "Khaki Sand", adj: "Khaki", tone: "light sand khaki" },
  { name: "Wine Burgundy", adj: "Burgundy", tone: "deep wine burgundy" },
  { name: "Forest Green", adj: "Forest", tone: "dark forest green" },
  { name: "Stone Beige", adj: "Stone", tone: "neutral stone beige" },
  { name: "Rust Brown", adj: "Rust", tone: "warm rust brown" },
];

const PANT_FABRICS = [
  "Japanese Selvedge Cotton",
  "Japanese Cotton Twill",
  "Heavyweight Japanese Drill",
  "Japanese Brushed Cotton",
  "Japanese Cotton Canvas",
  "Japanese Herringbone Twill",
];

const PANT_WAIST_SIZES = ["28", "30", "32", "34", "36", "38", "40"];
const PANT_LENGTHS = ["Regular", "Long", "Short"];

const BADGES = ["New", "Featured", "Bestseller", "Limited", "Exclusive", ""];

const PANT_TAGLINES = [
  "Authentic Japanese construction with a signature bootcut flare.",
  "Heritage gurkha silhouette engineered for the modern gentleman.",
  "Self-adjusting waist tab, reinforced seams, and a clean bootcut leg.",
  "Selvedge Japanese fabrics cut to our signature bootcut gurkha profile.",
  "Military-inspired gurkha pleats meet contemporary bootcut drape.",
  "From Tokyo mills to our Lajpat Nagar atelier — built to drape clean.",
];

const PANT_DETAILS_COMMON = [
  "Signature gurkha front pleats",
  "Self-adjusting side waist tabs",
  "Extended belt closure with hook-and-bar",
  "Clean bootcut leg opening",
  "Two deep front slash pockets",
  "Two rear welt pockets",
  "Reinforced seams at stress points",
  "French seams throughout",
  "Horn-effect trouser buttons",
  "YKK zip fly",
  "Coin pocket at the right waistband",
  "Finished hems ready for wear",
  "Made to order from the Lajpat Nagar atelier",
  "Optional custom length / tapering on request",
];

const CARE_TEXT = "Dry clean or gentle cold wash only. Line dry in shade. Warm iron on reverse. Store folded or on trouser clips.";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function makePantSizes() {
  const sizeCount = rand(5, 7);
  return pickN(PANT_WAIST_SIZES, sizeCount).sort((a, b) => Number(a) - Number(b));
}

function generateProductSpec(groupKey, imageCount, groupIndex) {
  const variant = pickN(PANT_COLOR_VARIANTS, 1)[0];
  const fabric = pick(PANT_FABRICS);
  const tagline = pick(PANT_TAGLINES);
  const badge = pick(BADGES);
  const isFeatured = Math.random() < 0.4;

  const basePrice = rand(7500, 14500);
  const price = Math.round(basePrice / 500) * 500;
  const comparePrice = Math.round((price * (1.18 + Math.random() * 0.22)) / 500) * 500;
  const discount = Math.round(((comparePrice - price) / comparePrice) * 100);

  const title = `${variant.adj} Japanese Bootcut Fit Gurkha Pants`;

  const description = `A pair of ${variant.tone} Japanese bootcut-fit gurkha trousers woven from ${fabric.toLowerCase()}. Featuring the signature gurkha front pleats, self-adjusting side waist tabs, and a clean bootcut leg opening that drapes perfectly over dress shoes and boots. Built for daily wear and elevated occasions alike — finished in our Lajpat Nagar atelier.`;

  const details = pickN(PANT_DETAILS_COMMON, 6);

  const specifications = [
    { label: "Silhouette", value: "Bootcut Gurkha Pant" },
    { label: "Fabric", value: fabric },
    { label: "Colour", value: variant.name },
    { label: "Fit", value: "Bootcut Regular Rise" },
    { label: "Origin", value: "Japanese fabric · Made in India" },
    { label: "Closure", value: "Gurkha waist tab + hook-and-bar" },
  ];

  const colorSet = [variant.name];
  const altColors = pickN(
    PANT_COLOR_VARIANTS.filter(c => c.name !== variant.name).map(c => c.name),
    rand(1, 2),
  );
  colorSet.push(...altColors);

  const sizes = makePantSizes();
  const stock = rand(8, 25);

  const deliveryLeadValue = rand(7, 21);
  const deliveryLeadUnit = deliveryLeadValue <= 14 ? "days" : "days";
  const showDeliveryLead = true;

  return {
    title,
    tagline,
    description,
    category: CATEGORY,
    subCategory: SUB_CATEGORY,
    price,
    comparePrice,
    discount,
    colors: colorSet,
    sizes,
    stock,
    badge,
    isFeatured,
    details,
    specifications,
    care: CARE_TEXT,
    deliveryLeadValue,
    deliveryLeadUnit,
    showDeliveryLead,
  };
}

function mimeFromName(name) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

function canonicalSlug(title) {
  return slugify(title.replace(/\s+/g, " ").trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

function groupKey(filename) {
  const stem = path.parse(filename).name;
  if (/^img_2285/i.test(stem)) return "img_2285";
  if (/^model_img\d*$/i.test(stem)) return "camel_double_breasted_blazer";
  const productN = stem.match(/^product_\s*\((\d+)\)/i);
  if (productN) return `product_${productN[1]}`;
  const numbered = stem.match(/^(\d+)_product_image/i);
  if (numbered) return numbered[1];
  const namedParen = stem.match(/^(.+?)\s*\(\d+\)$/i);
  if (namedParen) {
    return namedParen[1].trim().toLowerCase().replace(/\s+/g, "_");
  }
  const model = stem.match(/^(model_img\d+)/i);
  if (model) return model[1].toLowerCase();
  const stripped = stem.replace(/[_\s-]+\d+$/i, "").trim().toLowerCase();
  return stripped || null;
}

function seqHint(filename) {
  const stem = path.parse(filename).name;
  const paren = stem.match(/\((\d+)\)/);
  if (paren) return Number(paren[1]);
  const tail = stem.match(/_(\d+)$/);
  if (tail) return Number(tail[1]);
  return 0;
}

function sortGroup(key, list) {
  list.sort(
    (a, b) => seqHint(path.basename(a)) - seqHint(path.basename(b)),
  );
}

function walkImages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith("_") || ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkImages(full, acc);
    else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

async function compressForGridFs(filePath) {
  const raw = fs.readFileSync(filePath);
  const origExt = path.extname(filePath).toLowerCase();
  const origMime = mimeFromName(path.basename(filePath));
  const heic = origExt === ".heic" || origExt === ".heif";
  if (!heic && raw.length <= MAX_BYTES) {
    return {
      buffer: raw,
      contentType: origMime,
      ext: origExt || ".jpg",
    };
  }

  let width = 1800;
  let quality = 82;
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
  while (buffer.length > MAX_BYTES && width > 1100) {
    width -= 200;
    buffer = await sharp(raw)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 76, mozjpeg: true })
      .toBuffer();
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error(
      `Could not compress under 8MB: ${path.basename(filePath)} (${buffer.length} bytes)`,
    );
  }
  return { buffer, contentType: "image/jpeg", ext: ".jpg" };
}

async function uploadFile(bucket, filePath, filename, metadata) {
  const { buffer, contentType, ext } = await compressForGridFs(filePath);
  const outName = filename.replace(/\.[a-z0-9]+$/i, ext);
  const id = await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(outName, {
      metadata: {
        contentType,
        ...metadata,
      },
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

async function main() {
  const dry = process.argv.includes("--dry-run");
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("FAIL: MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  const files = walkImages(DIR);
  if (!files.length) {
    console.error(`FAIL: no images in ${DIR}`);
    process.exit(1);
  }

  /** @type {Map<string, string[]>} */
  const groups = new Map();
  for (const full of files) {
    const key = groupKey(path.basename(full));
    if (!key) {
      console.warn("skip (no product group):", path.basename(full));
      continue;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(full);
  }
  for (const [key, list] of groups) {
    sortGroup(key, list);
  }

  console.log(
    `\nFound ${files.length} images in ${groups.size} product group(s)\n`,
  );

  const groupEntries = [...groups.entries()];
  const generatedSpecs = new Map();
  for (let i = 0; i < groupEntries.length; i++) {
    const [key, list] = groupEntries[i];
    const spec = generateProductSpec(key, list.length, i);
    generatedSpecs.set(key, spec);
    console.log(
      `  ▸ Group "${key}" → ${list.length} photo(s)`,
    );
    console.log(`    Title:       ${spec.title}`);
    console.log(`    Category:    ${spec.category}${spec.subCategory ? " → " + spec.subCategory : ""}`);
    console.log(`    Price:       ₹${spec.price.toLocaleString("en-IN")}${spec.comparePrice ? " (MRP ₹" + spec.comparePrice.toLocaleString("en-IN") + " · " + spec.discount + "% off)" : ""}`);
    console.log(`    Colors:      ${spec.colors.join(", ")}`);
    console.log(`    Sizes:       ${spec.sizes.join(", ")}`);
    console.log(`    Stock:       ${spec.stock}`);
    console.log(`    Featured:    ${spec.isFeatured ? "YES" : "no"}${spec.badge ? " · Badge: " + spec.badge : ""}`);
    console.log(`    Delivery:    ~${spec.deliveryLeadValue} ${spec.deliveryLeadUnit}`);
    console.log();
  }

  if (dry) {
    console.log("\n[dry-run] No uploads performed. Review above and run without --dry-run when ready.");
    console.log("When you're ready, reply with 'upload these' and I'll run the actual upload.\n");
    return;
  }

  console.log("\nConnecting to MongoDB...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database");
  const bucket = new GridFSBucket(db, { bucketName: BUCKET });
  const col = db.collection("products");
  console.log("Connected. Starting uploads...\n");

  for (const [key, list] of groupEntries) {
    const spec = generatedSpecs.get(key);

    const existing = await col.findOne({
      slug: canonicalSlug(spec.title),
    });
    if (existing) {
      console.log(`skip (slug already exists): ${existing.slug} — regenerating with unique title`);
      spec.title = `${spec.title} #${rand(100, 999)}`;
    }

    const slug = await uniqueSlug(col, canonicalSlug(spec.title));
    const images = [];
    for (const [index, full] of list.entries()) {
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
        `  ✓ uploaded ${path.basename(full)} → ${uploaded.id} (${Math.round(uploaded.bytes / 1024)}kb)`,
      );
    }

    const now = new Date();
    const doc = {
      title: spec.title,
      slug,
      tagline: spec.tagline,
      description: spec.description,
      category: spec.category,
      subCategory: spec.subCategory,
      price: spec.price,
      comparePrice: spec.comparePrice,
      discount: spec.discount,
      images,
      details: spec.details,
      specifications: spec.specifications,
      care: spec.care,
      colors: spec.colors,
      sizes: spec.sizes,
      stock: spec.stock,
      isAvailable: true,
      reviews: [],
      rating: 4 + Math.random(),
      numReviews: rand(5, 40),
      badge: spec.badge,
      isFeatured: spec.isFeatured,
      pinToCollection: false,
      collectionPinAt: null,
      deliveryLeadValue: spec.deliveryLeadValue,
      deliveryLeadUnit: spec.deliveryLeadUnit,
      showDeliveryLead: spec.showDeliveryLead,
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
    };

    await col.insertOne(doc);
    console.log(`\n✅ Created /collection/${slug} (${images.length} images)\n`);
  }

  await mongoose.disconnect();
  console.log("All products uploaded successfully. Disconnected from DB.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
