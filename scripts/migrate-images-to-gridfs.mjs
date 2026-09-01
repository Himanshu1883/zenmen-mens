/**
 * Upload local product photos from assests/current + assests/allCollections
 * into Mongo GridFS and point existing Product.images at /api/media/:id.
 *
 * Does not change title, price, stock, or other product fields.
 *
 *   node scripts/migrate-images-to-gridfs.mjs
 *   node scripts/migrate-images-to-gridfs.mjs --dry-run
 *   node scripts/migrate-images-to-gridfs.mjs --force
 */
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { GridFSBucket } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });

const BUCKET = "productImages";
const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

const FOLDERS = [
  path.join(root, "assests", "current"),
  path.join(root, "assests", "allCollections"),
];

/** Filename group (stem without _1/_2) → product slug */
const GROUP_TO_SLUG = {
  baby_pink_bandhgala_blazzer: "baby-pink-bandhgala-blazer",
  black_tuxedo2: "classic-black-tuxedo-ii",
  blue_suite: "royal-blue-three-piece-suit",
  charcoal_3piece_suit_teal_tie: "charcoal-three-piece-teal-tie",
  cotton_jodhpuri: "cotton-jodhpuri-suit",
  cream_tuxedo: "cream-tuxedo",
  green_sherwani: "forest-green-silk-sherwani",
  grey_2piece_suit_black_tie: "grey-two-piece-suit-black-tie",
  houndstooth_blazer: "classic-houndstooth-blazer",
  light_green_jodhpuri: "light-green-jodhpuri-suit",
  mint_green_bandhgala_blazzer: "mint-green-bandhgala-blazer",
  navy_3piece_suit_blue_tie: "navy-three-piece-suit-blue-tie",
  offwhite_trouser: "offwhite-formal-trousers",
  pinstripe_doublebreasted_suit_red_tie: "pinstripe-doublebreasted-suit-red-tie",
  rayon_suite: "rayon-blend-formal-suit",
  white_bandhgala_blazzer: "white-bandhgala-blazer",
  white_suite: "crisp-white-formal-suit",
  white_trouser: "white-formal-trousers",
  black_bandhgala: "midnight-black-bandh-gala",
  black_kurta: "classic-black-cotton-kurta",
  black_white_men: "contrast-black-ivory-bandhgala",
  blue_shirt: "handloom-blue-linen-shirt",
  "buckle motif royal shacket in black": "buckle-motif-royal-shacket-black",
  "buckle motif royal shacket in off white":
    "buckle-motif-royal-shacket-offwhite",
  cream_shirt: "summer-haze-cream-linen-shirt",
  khaki_shirt: "field-khaki-utility-shirt",
  hunter_jacket: "field-khaki-utility-shirt",
  pink_kurta: "blush-pink-kurta-for-men",
  pink_shirt: "dusty-pink-cotton-shirt",
  threaded_zip_shirt: "threaded-zip-shirt",
  white_kurta: "crisp-white-cotton-kurta",
  white_tuxedo: "white-tuxedo-dinner-jacket",
  white_suite_men: "crisp-white-formal-suit",
  white_suit: "pristine-white-wedding-suit",
  founder_model: null,
};

/** One-off filenames whose group would be wrong */
const EXACT_FILE_TO_SLUG = {
  "founder_model_1.png": "zenmen-founder-edition-ivory-suit",
  "founder_model_2.png": "zenmen-founder-edition-ivory-suit",
  "founder_model_3.png": "relaxed-linen-founders-shirt",
  "founder_model_3_2.png": "relaxed-linen-founders-shirt",
  "founder_model_4.png":
    "OWL- HAND EMBROIDERED DESIGNER SHIRT- BOTTLE GREEN",
  "founder_model_4_1.png":
    "OWL- HAND EMBROIDERED DESIGNER SHIRT- BOTTLE GREEN",
  "model_dressed_with_product_202605011642.jpeg":
    "OWL- HAND EMBROIDERED DESIGNER SHIRT- BOTTLE GREEN",
};

function mimeFromName(name) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

function walkImages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkImages(full, acc);
    else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

function groupKey(filename) {
  const stem = path.parse(filename).name.toLowerCase().replace(/\s+/g, " ").trim();
  return stem.replace(/_\d+(?:_\d+)?$/i, "").trim();
}

function seqHint(filename) {
  const stem = path.parse(filename).name;
  const m = stem.match(/_(\d+)(?:_(\d+))?$/);
  if (!m) return 0;
  return Number(m[1]) * 100 + Number(m[2] || 0);
}

function cloudinaryKey(url) {
  return String(url || "")
    .split("?")[0]
    .trim();
}

function publicIdLast(url) {
  const key = cloudinaryKey(url);
  const match = key.match(/\/upload\/(?:v\d+\/)?(.+?)$/i);
  if (!match) return "";
  const noExt = match[1].replace(/\.[a-z0-9]+$/i, "");
  const parts = noExt.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function isGridFsUrl(url) {
  return typeof url === "string" && /\/api\/media\/[a-f0-9]{24}$/i.test(url);
}

function isObjectId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}

function loadUploadedMap() {
  const p = path.join(root, "uploaded.json");
  const map = new Map();
  if (!fs.existsSync(p)) return map;
  const rows = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const row of rows) {
    if (row?.url && row?.name) map.set(cloudinaryKey(row.url), String(row.name));
  }
  return map;
}

function findFileByName(name, filesByBase) {
  const lower = name.toLowerCase();
  return filesByBase.get(lower) || filesByBase.get(path.parse(lower).name) || null;
}

async function uploadFile(bucket, filePath, metadata) {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const id = await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      contentType: mimeFromName(filename),
      metadata,
    });
    stream.once("error", reject);
    stream.once("finish", () => resolve(stream.id));
    stream.end(buffer);
  });
  return String(id);
}

function pushUnique(list, item) {
  if (list.some((x) => x.path === item.path)) return;
  list.push(item);
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("FAIL: MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  const files = FOLDERS.flatMap((dir) => walkImages(dir));
  const filesByBase = new Map();
  for (const full of files) {
    const base = path.basename(full);
    filesByBase.set(base.toLowerCase(), full);
    filesByBase.set(path.parse(base).name.toLowerCase(), full);
  }

  const uploadedMap = loadUploadedMap();

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database");
  const bucket = new GridFSBucket(db, { bucketName: BUCKET });
  const products = await db.collection("products").find({}).toArray();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  /** @type {Map<string, { path: string, order: number, source: string }[]>} */
  const planned = new Map();
  const unmatched = [];

  for (const product of products) {
    planned.set(product.slug, []);
    const images = Array.isArray(product.images) ? product.images : [];
    for (const [index, img] of images.entries()) {
      const url = img?.url || "";
      const mappedName = uploadedMap.get(cloudinaryKey(url));
      let filePath = mappedName ? findFileByName(mappedName, filesByBase) : null;
      if (!filePath) {
        const last = publicIdLast(url);
        if (last) filePath = findFileByName(last, filesByBase);
      }
      if (filePath) {
        pushUnique(planned.get(product.slug), {
          path: filePath,
          order: typeof img.order === "number" ? img.order : index,
          source: "url-map",
        });
      }
    }
  }

  for (const full of files) {
    const base = path.basename(full);
    const exactSlug = EXACT_FILE_TO_SLUG[base] || EXACT_FILE_TO_SLUG[base.toLowerCase()];
    const group = groupKey(base);
    const groupSlug = exactSlug || GROUP_TO_SLUG[group];
    if (!groupSlug) {
      if (!exactSlug && GROUP_TO_SLUG[group] === null) unmatched.push(base);
      else if (!GROUP_TO_SLUG[group] && !exactSlug) unmatched.push(base);
      continue;
    }
    if (!bySlug.has(groupSlug)) {
      unmatched.push(`${base} → missing slug ${groupSlug}`);
      continue;
    }
    pushUnique(planned.get(groupSlug), {
      path: full,
      order: 1000 + seqHint(base),
      source: "folder-map",
    });
  }

  const report = {
    updated: 0,
    skipped: 0,
    missingProducts: [],
    unusedFiles: [...new Set(unmatched)],
  };

  for (const product of products) {
    const items = (planned.get(product.slug) || []).slice().sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return path.basename(a.path).localeCompare(path.basename(b.path));
    });

    if (!items.length) {
      const stillRemote = (product.images || []).some(
        (img) => img?.url && !isGridFsUrl(img.url),
      );
      if (stillRemote) report.missingProducts.push(product.slug || product.title);
      report.skipped += 1;
      continue;
    }

    const alreadyGrid =
      !force &&
      (product.images || []).length > 0 &&
      (product.images || []).every((img) => isGridFsUrl(img.url));
    if (alreadyGrid) {
      report.skipped += 1;
      continue;
    }

    console.log(
      `${dry ? "[dry] " : ""}${product.slug}: ${items.length} file(s) ← ${items
        .map((i) => path.basename(i.path))
        .join(", ")}`,
    );

    if (dry) {
      report.updated += 1;
      continue;
    }

    const nextImages = [];
    for (const [index, item] of items.entries()) {
      const id = await uploadFile(bucket, item.path, {
        kind: "product",
        slug: String(product.slug || ""),
        source: item.source,
      });
      const prev = (product.images || [])[index] || {};
      nextImages.push({
        url: `/api/media/${id}`,
        public_id: id,
        alt: prev.alt || product.title || "",
        isPrimary: index === 0,
        order: index,
      });
    }

    for (const img of product.images || []) {
      if (isObjectId(img.public_id)) {
        try {
          await bucket.delete(new mongoose.Types.ObjectId(img.public_id));
        } catch {
          /* already gone */
        }
      }
    }

    await db.collection("products").updateOne(
      { _id: product._id },
      { $set: { images: nextImages } },
    );
    report.updated += 1;
  }

  await mongoose.disconnect();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
