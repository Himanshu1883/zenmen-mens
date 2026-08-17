/**
 * One-off: copy Indo-Western products (and category if missing)
 * from Atlas (MONGODB_URI) to Railway (RAILWAY_MONGODB_URI).
 * Never prints URIs or credentials.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });

const PREFERRED_SLUGS = [
  "mens-wear-indowestern-in-black-color",
  "black-thread-work-indo-western-for-men",
];

function mongoHost(uri) {
  if (!uri) return "";
  const at = uri.lastIndexOf("@");
  if (at === -1) return "";
  const rest = uri.slice(at + 1);
  const hostPort = rest.split("/")[0].split("?")[0].split(",")[0];
  return hostPort.split(":")[0].toLowerCase();
}

function sanitizeError(err) {
  const raw = err?.message || String(err);
  return raw
    .replace(/mongodb(\+srv)?:\/\/[^\s"'`]+/gi, "[redacted]")
    .replace(/[A-Za-z0-9+/_-]{20,}/g, "[redacted]");
}

function stripMeta(doc) {
  const { _id, __v, ...rest } = doc;
  return rest;
}

function indoWesternQuery() {
  return {
    $or: [
      { slug: /indo-?western/i },
      { name: /indo-?western/i },
      { title: /indo-?western/i },
      { category: /indo-?western/i },
      { filterValue: /indo-?western/i },
    ],
  };
}

async function upsertBySlug(collection, doc) {
  const payload = stripMeta(doc);
  const existing = await collection.findOne({ slug: payload.slug });
  if (existing) {
    await collection.updateOne(
      { slug: payload.slug },
      { $set: payload },
    );
    return "updated";
  }
  await collection.insertOne(payload);
  return "inserted";
}

async function insertCategoryIfMissing(railwayCats, cat, parentObjectId) {
  const existing = await railwayCats.findOne({ slug: cat.slug });
  if (existing) {
    return { result: "skipped", id: existing._id, existed: true };
  }
  const payload = stripMeta(cat);
  payload.parentId = parentObjectId ?? null;
  const inserted = await railwayCats.insertOne(payload);
  return { result: "inserted", id: inserted.insertedId, existed: false };
}

async function main() {
  const atlasUri = process.env.MONGODB_URI;
  const railwayUri = process.env.RAILWAY_MONGODB_URI;

  if (!atlasUri) {
    console.error("FAIL: MONGODB_URI is missing from .env.local");
    process.exit(1);
  }
  if (!railwayUri) {
    console.error("FAIL: RAILWAY_MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  const atlasHost = mongoHost(atlasUri);
  const railwayHost = mongoHost(railwayUri);

  if (!atlasHost || !railwayHost) {
    console.error("FAIL: could not parse host from one of the Mongo URIs");
    process.exit(1);
  }
  if (atlasHost === railwayHost) {
    console.error("STOP: source and destination hosts are the same. Refusing Atlas→Atlas copy.");
    process.exit(1);
  }
  if (railwayHost.endsWith(".railway.internal")) {
    console.error(
      "FAIL: RAILWAY_MONGODB_URI uses Railway private DNS, which is not reachable from this computer.",
    );
    console.error(
      "In Railway → MongoDB service → Variables / Networking, copy the public TCP-proxy connection string (not the *.railway.internal one) into RAILWAY_MONGODB_URI, then re-run.",
    );
    process.exit(1);
  }

  console.log("Hosts differ. Connecting…");

  let atlas;
  let railway;
  try {
    atlas = await mongoose.createConnection(atlasUri).asPromise();
    railway = await mongoose.createConnection(railwayUri).asPromise();
  } catch (err) {
    console.error("FAIL: connection error:", sanitizeError(err));
    process.exit(1);
  }

  try {
    const atlasProducts = atlas.collection("products");
    const railwayProducts = railway.collection("products");
    const atlasCats = atlas.collection("categories");
    const railwayCats = railway.collection("categories");

    const preferred = await atlasProducts
      .find({ slug: { $in: PREFERRED_SLUGS } })
      .toArray();

    const foundSlugs = new Set(preferred.map((p) => p.slug));
    const missingPreferred = PREFERRED_SLUGS.filter((s) => !foundSlugs.has(s));

    let extras = [];
    if (missingPreferred.length > 0) {
      extras = await atlasProducts
        .find({
          ...indoWesternQuery(),
          slug: { $nin: [...foundSlugs] },
        })
        .toArray();
    }

    const toCopy = [...preferred];
    for (const extra of extras) {
      if (!foundSlugs.has(extra.slug)) {
        toCopy.push(extra);
        foundSlugs.add(extra.slug);
      }
    }

    if (toCopy.length === 0) {
      console.error("FAIL: no matching Indo-Western products found on Atlas");
      process.exit(1);
    }

    let inserted = 0;
    let updated = 0;
    const copied = [];

    for (const product of toCopy) {
      const result = await upsertBySlug(railwayProducts, product);
      if (result === "inserted") inserted += 1;
      else updated += 1;
      copied.push({
        title: product.title,
        slug: product.slug,
        result,
        images: Array.isArray(product.images) ? product.images.length : 0,
      });
    }

    const atlasIndoCats = await atlasCats.find(indoWesternQuery()).toArray();
    let categoryCopied = false;
    let categoryResults = [];

    for (const cat of atlasIndoCats) {
      let railwayParentId = null;
      if (cat.parentId) {
        const parent = await atlasCats.findOne({ _id: cat.parentId });
        if (parent) {
          const parentInsert = await insertCategoryIfMissing(
            railwayCats,
            parent,
            null,
          );
          railwayParentId = parentInsert.id;
          if (!parentInsert.existed) categoryCopied = true;
          categoryResults.push({
            title: `(parent) ${parent.name}`,
            slug: parent.slug,
            result: parentInsert.result,
          });
        }
      }
      const catInsert = await insertCategoryIfMissing(
        railwayCats,
        cat,
        railwayParentId,
      );
      if (!catInsert.existed) categoryCopied = true;
      categoryResults.push({
        title: cat.name,
        slug: cat.slug,
        result: catInsert.result,
      });
    }

    const confirmSlugs = copied.map((p) => p.slug);
    const confirmed = await railwayProducts
      .find({ slug: { $in: confirmSlugs } })
      .project({ title: 1, slug: 1, _id: 0 })
      .toArray();

    console.log("--- Products copied ---");
    for (const row of copied) {
      console.log(
        `${row.result}: ${row.title} | slug: ${row.slug} | images: ${row.images}`,
      );
    }
    console.log(`inserted: ${inserted}`);
    console.log(`updated: ${updated}`);

    if (missingPreferred.length > 0) {
      console.log(
        `note: preferred slugs not on Atlas: ${missingPreferred.join(", ")}`,
      );
    }

    console.log("--- Category ---");
    if (atlasIndoCats.length === 0) {
      console.log("no Indo-Western category found on Atlas; skipped");
    } else {
      for (const row of categoryResults) {
        console.log(`${row.result}: ${row.title} | slug: ${row.slug}`);
      }
      console.log(
        categoryCopied
          ? "category was copied (inserted at least one)"
          : "category already present; upserted in place",
      );
    }

    console.log("--- Railway confirmation ---");
    for (const row of confirmed) {
      console.log(`exists: ${row.title} | slug: ${row.slug}`);
    }
    if (confirmed.length !== copied.length) {
      console.error(
        `FAIL: expected ${copied.length} products on Railway, found ${confirmed.length}`,
      );
      process.exit(1);
    }

    console.log("SUCCESS");
  } catch (err) {
    console.error("FAIL:", sanitizeError(err));
    process.exit(1);
  } finally {
    await Promise.allSettled([atlas?.close(), railway?.close()]);
  }
}

main();
