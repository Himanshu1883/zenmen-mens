/**
 * Rewrite product slugs that contain newlines, spaces, or other unsafe chars
 * into hyphenated canonical form (fixes /collection/hand%0A... URLs).
 *
 *   node scripts/sanitize-product-slugs.mjs
 *   node scripts/sanitize-product-slugs.mjs --dry-run
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import slugify from "slugify";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });

function canonicalSlug(raw) {
  const decoded = String(raw ?? "")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!decoded) return "";
  return slugify(decoded, { lower: true, strict: true, trim: true });
}

const dryRun = process.argv.includes("--dry-run");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

await mongoose.connect(uri);
const col = mongoose.connection.collection("products");
const products = await col.find({}, { projection: { slug: 1, title: 1 } }).toArray();

const used = new Set(
  products
    .map((p) => String(p.slug ?? ""))
    .filter((s) => s && s === canonicalSlug(s)),
);

let changed = 0;
for (const p of products) {
  const current = String(p.slug ?? "");
  let next = canonicalSlug(current);
  if (!next) continue;
  if (next === current) continue;

  if (used.has(next) && next !== current) {
    const suffix = String(p._id).slice(-6);
    next = `${next}-${suffix}`;
  }
  used.add(next);

  const title = String(p.title ?? "").replace(/\s+/g, " ").trim();
  console.log(`${dryRun ? "[dry] " : ""}${JSON.stringify(current)} → ${next}`);
  if (!dryRun) {
    await col.updateOne(
      { _id: p._id },
      { $set: { slug: next, ...(title && title !== p.title ? { title } : {}) } },
    );
  }
  changed += 1;
}

console.log(`${dryRun ? "Would update" : "Updated"} ${changed} of ${products.length} products`);
await mongoose.disconnect();
