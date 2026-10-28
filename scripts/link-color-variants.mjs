/**
 * Link same-design colourways and give them consistent names.
 *
 *   node scripts/link-color-variants.mjs --dry-run
 *   node scripts/link-color-variants.mjs
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local"), quiet: true });

const GROUPS = [
  {
    styleGroup: "embroidered-kurta-pajama-set",
    items: [
      {
        slug: "classic-black-cotton-kurta",
        title: "Embroidered Kurta-Pajama Set — Black",
        color: "Black",
        tagline: "Black kurta set with floral yoke and matching stole.",
        description:
          "A black kurta-pajama set with a floral embroidered yoke, tree-and-deer stole, and matching trousers. The same silhouette as our Blush and Ivory colourways. Cut for festive gatherings from the Lajpat Nagar atelier.",
        category: "Kurta-Pajama",
        subCategory: "",
      },
      {
        slug: "blush-pink-kurta-for-men",
        title: "Embroidered Kurta-Pajama Set — Blush",
        color: "Blush",
        tagline: "Blush kurta set with floral yoke and matching stole.",
        description:
          "A blush kurta-pajama set with a floral embroidered yoke, bordered stole, and matching trousers. The same silhouette as our Black and Ivory colourways. Cut for daytime ceremonies from the Lajpat Nagar atelier.",
        category: "Kurta-Pajama",
        subCategory: "",
      },
      {
        slug: "crisp-white-pure-cotton-kurta",
        title: "Embroidered Kurta-Pajama Set — Ivory",
        color: "Ivory",
        tagline: "Ivory kurta set with floral yoke and matching stole.",
        description:
          "An ivory kurta-pajama set with a floral embroidered yoke, tree-and-deer stole, and matching trousers. The same silhouette as our Black and Blush colourways. Cut for festive mornings from the Lajpat Nagar atelier.",
        category: "Kurta-Pajama",
        subCategory: "",
      },
    ],
  },
  {
    styleGroup: "high-waist-gurkha-trousers",
    items: [
      {
        slug: "ivory-high-waist-gurkha-trousers",
        title: "High-Waist Gurkha Trousers — Ivory",
        color: "Ivory",
      },
      {
        slug: "sage-high-waist-gurkha-trousers",
        title: "High-Waist Gurkha Trousers — Sage",
        color: "Sage",
      },
      {
        slug: "sand-high-waist-gurkha-trousers",
        title: "High-Waist Gurkha Trousers — Sand",
        color: "Sand",
      },
    ],
  },
  {
    styleGroup: "buckle-motif-royal-shacket",
    items: [
      {
        slug: "buckle-motif-royal-shacket-black",
        title: "Buckle Motif Royal Shacket — Black",
        color: "Black",
      },
      {
        slug: "buckle-motif-royal-shacket-offwhite",
        title: "Buckle Motif Royal Shacket — Off White",
        color: "Off White",
      },
    ],
  },
  {
    styleGroup: "owl-embroidered-shirt",
    items: [
      {
        slug: "hand-embroidered-designer-shirt-black",
        title: "Owl Embroidered Shirt — Black",
        color: "Black",
      },
      {
        slug: "owl-hand-embroidered-designer-shirt-bottle-green",
        title: "Owl Embroidered Shirt — Bottle Green",
        color: "Bottle Green",
      },
    ],
  },
  {
    styleGroup: "formal-trousers",
    items: [
      {
        slug: "white-formal-trousers",
        title: "Formal Trousers — White",
        color: "White",
      },
      {
        slug: "offwhite-formal-trousers",
        title: "Formal Trousers — Off White",
        color: "Off White",
      },
    ],
  },
  {
    styleGroup: "peak-lapel-tuxedo",
    items: [
      {
        slug: "classic-black-peak-lapel-tuxedo",
        title: "Peak Lapel Tuxedo — Black",
        color: "Black",
      },
      {
        slug: "navy-blue-peak-lapel-tuxedo",
        title: "Peak Lapel Tuxedo — Navy",
        color: "Navy",
      },
    ],
  },
];

/** Same photos as the high-waist gurkha colourways — hide so the picker is not duplicated. */
const HIDE_DUPLICATES = [
  "forest-japanese-bootcut-fit-gurkha-pants",
  "rust-japanese-bootcut-fit-gurkha-pants",
  "off-white-bootcut-fit-gurkha-pants",
];

const STANDALONE = [
  {
    slug: "kurta-navy",
    title: "Navy Velvet Embroidered Kurta",
    color: "Navy",
    tagline: "Navy velvet kurta with white thread embroidery at the neck.",
    description:
      "A navy velvet kurta with white thread embroidery on the V-neckline, collar, and cuffs. Straight festive cut, worn over white trousers. Made for evening gatherings from the Lajpat Nagar atelier.",
    category: "Kurta-Pajama",
    subCategory: "",
  },
];

async function main() {
  const dry = process.argv.includes("--dry-run");
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("FAIL: MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const col = mongoose.connection.db.collection("products");

  for (const group of GROUPS) {
    console.log(`\n▸ ${group.styleGroup}`);
    for (const item of group.items) {
      const existing = await col.findOne({ slug: item.slug });
      if (!existing) {
        console.warn(`  miss: ${item.slug}`);
        continue;
      }
      const $set = {
        title: item.title,
        colors: [item.color],
        styleGroup: group.styleGroup,
        updatedAt: new Date(),
      };
      if (item.tagline) $set.tagline = item.tagline;
      if (item.description) $set.description = item.description;
      if (item.category) $set.category = item.category;
      if (item.subCategory !== undefined) $set.subCategory = item.subCategory;
      $set.seoTitle = `${item.title} | ZENmen New Delhi`;
      console.log(`  ${item.slug} → ${item.title} (${item.color})`);
      if (!dry) await col.updateOne({ _id: existing._id }, { $set });
    }
  }

  for (const item of STANDALONE) {
    const existing = await col.findOne({ slug: item.slug });
    if (!existing) {
      console.warn(`miss standalone: ${item.slug}`);
      continue;
    }
    const $set = {
      title: item.title,
      colors: [item.color],
      styleGroup: "",
      tagline: item.tagline,
      description: item.description,
      category: item.category,
      subCategory: item.subCategory,
      seoTitle: `${item.title} | ZENmen New Delhi`,
      updatedAt: new Date(),
    };
    console.log(`\n▸ standalone ${item.slug} → ${item.title}`);
    if (!dry) await col.updateOne({ _id: existing._id }, { $set });
  }

  console.log("\n▸ hide duplicate gurkha photos");
  for (const slug of HIDE_DUPLICATES) {
    const existing = await col.findOne({ slug });
    if (!existing) {
      console.warn(`  miss: ${slug}`);
      continue;
    }
    console.log(`  hide ${slug}`);
    if (!dry) {
      await col.updateOne(
        { _id: existing._id },
        { $set: { isAvailable: false, updatedAt: new Date() } },
      );
    }
  }

  if (dry) console.log("\n[dry-run] no writes");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
