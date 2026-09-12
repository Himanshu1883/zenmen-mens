/**
 * Create catalog products from assests/new_products.
 * Groups photos by filename prefix (5_product_image*, 6_product_image*)
 * and uploads each group to GridFS as one product.
 *
 *   node scripts/seed-new-products.mjs
 *   node scripts/seed-new-products.mjs --dry-run
 *   node scripts/seed-new-products.mjs --retag-only
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

const CATALOG = {
  "5": {
    title: "Ivory Floral Embroidered Indo-Western",
    tagline: "Open-front jaal embroidery over a crisp ivory kurta.",
    description:
      "An ivory Indo-Western jacket in tonal floral jaal, worn open over a mandarin-collar kurta and straight trousers. Pearl buttons, a brooch chain, and a light hand-feel make it suited to daytime weddings and festive gatherings in New Delhi.",
    category: "Indo-Western",
    subCategory: "",
    price: 24500,
    comparePrice: 29999,
    colors: ["Ivory"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 8,
    badge: "New",
    isFeatured: true,
    details: [
      "Open-front embroidered Indo-Western jacket",
      "Tonal ivory floral jaal throughout",
      "Paired with mandarin-collar kurta and trousers",
      "Brooch and chain detailing at the chest",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Indo-Western jacket" },
      { label: "Fabric", value: "Embroidered silk blend" },
      { label: "Colour", value: "Ivory" },
      { label: "Occasion", value: "Wedding / festive" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
  "6": {
    title: "Midnight Black Embroidered Indo-Western",
    tagline: "Black lattice work with gold brooch and chain.",
    description:
      "A midnight black Indo-Western with a close mandarin collar, tonal lattice embroidery, and a gold brooch chain at the pocket. Cut for evening ceremonies and receptions, with a structured shoulder and a clean buttoned front.",
    category: "Indo-Western",
    subCategory: "",
    price: 28500,
    comparePrice: 34999,
    colors: ["Charcoal Noir"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 6,
    badge: "Featured",
    isFeatured: true,
    details: [
      "Closed-front embroidered Indo-Western",
      "Tonal black lattice with sequin accents",
      "Gold brooch and draped chain",
      "Mandarin collar and covered placket",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Indo-Western jacket" },
      { label: "Fabric", value: "Embroidered viscose blend" },
      { label: "Colour", value: "Midnight black" },
      { label: "Occasion", value: "Reception / evening" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
  model_img2: {
    title: "Navy Bandhgala Jodhpuri Suit",
    tagline: "Midnight navy bandhgala with silver frog closures.",
    description:
      "A midnight-navy Jodhpuri bandhgala with a high mandarin collar, silver frog buttons, and a clean two-piece cut. Worn with a cream shirt and pocket square, it is built for evening receptions and studio-formal occasions from our Lajpat Nagar atelier.",
    category: "Suit",
    subCategory: "Jodhpuri Suit",
    price: 32500,
    comparePrice: 39999,
    colors: ["Midnight Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 7,
    badge: "New",
    isFeatured: true,
    details: [
      "Two-piece navy Jodhpuri / bandhgala",
      "Silver frog-button closures",
      "Mandarin collar and welt pocket",
      "Matching tailored trousers",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Jodhpuri bandhgala" },
      { label: "Fabric", value: "Wool-blend suiting" },
      { label: "Colour", value: "Midnight navy" },
      { label: "Occasion", value: "Reception / evening" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
  camel_double_breasted_blazer: {
    title: "Camel Double-Breasted Blazer",
    tagline: "Cognac wool-blend DB jacket with brass buttons.",
    description:
      "A camel double-breasted blazer in a wool-blend cloth, cut with a peaked lapel, brass buttons, and a clean two-button stance. Worn with black trousers, it is built for studio-formal evenings and cocktail hours from our Lajpat Nagar atelier.",
    category: "Suit",
    subCategory: "Double Breasted Suit",
    price: 24500,
    comparePrice: 29999,
    colors: ["Camel"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 8,
    badge: "New",
    isFeatured: true,
    details: [
      "Double-breasted peaked-lapel blazer",
      "Brass six-button front",
      "Flap pockets and ticket pocket",
      "Satin lining",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Double-breasted blazer" },
      { label: "Fabric", value: "Wool-blend suiting" },
      { label: "Colour", value: "Camel" },
      { label: "Occasion", value: "Cocktail / evening" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
  product_kurta: {
    title: "Olive Mirror-Work Kurta",
    tagline: "Olive green kurta with silver mirror clusters.",
    description:
      "An olive kurta with a band collar, silver mirror work at the placket, and scattered floral mirrors down the front. Cut straight and easy over black trousers, it is suited to daytime festive gatherings and mehendi from our Lajpat Nagar atelier.",
    category: "Kurta-Pajama",
    subCategory: "",
    price: 14500,
    comparePrice: 18999,
    colors: ["Olive"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 10,
    badge: "New",
    isFeatured: true,
    details: [
      "Straight festive kurta",
      "Band collar with mirror-work placket",
      "Scattered silver mirror motifs",
      "Paired with black trousers",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Straight kurta" },
      { label: "Fabric", value: "Viscose blend with mirror embroidery" },
      { label: "Colour", value: "Olive" },
      { label: "Occasion", value: "Festive / mehendi" },
      { label: "Fit", value: "Regular" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
  zenmen_owner: {
    title: "Cognac Four-Pocket Safari Jacket",
    tagline: "Pointed-collar safari jacket with epaulettes.",
    description:
      "A cognac safari jacket with a pointed collar, epaulettes, four flap pockets, and dark horn buttons. Cut slightly cropped over black trousers, it is a day-to-evening piece from our Lajpat Nagar atelier.",
    category: "Shirt",
    subCategory: "Safari Shirt",
    price: 18500,
    comparePrice: 22999,
    colors: ["Cognac"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 7,
    badge: "New",
    isFeatured: true,
    details: [
      "Four-pocket safari jacket",
      "Epaulettes and pointed collar",
      "Dark horn buttons",
      "Flap hip and chest pockets",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Safari jacket" },
      { label: "Fabric", value: "Wool-blend twill" },
      { label: "Colour", value: "Cognac" },
      { label: "Occasion", value: "Day / cocktail" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
  zenmen_owner_2: {
    title: "Black Sequin Indo-Western",
    tagline: "Midnight sequin jacket with gold frog closures.",
    description:
      "A black Indo-Western with a mandarin collar, gold frog buttons, and a spray of sequins over tonal geometric weave. Worn over a matching band-collar kurta, it is cut for evening ceremonies and receptions from our Lajpat Nagar atelier.",
    category: "Indo-Western",
    subCategory: "",
    price: 28500,
    comparePrice: 34999,
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 6,
    badge: "New",
    isFeatured: true,
    details: [
      "Short embroidered Indo-Western jacket",
      "Mandarin collar and gold frog closures",
      "Sequin spray over geometric weave",
      "Paired with band-collar kurta and trousers",
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Indo-Western jacket" },
      { label: "Fabric", value: "Embroidered viscose blend" },
      { label: "Colour", value: "Black" },
      { label: "Occasion", value: "Reception / evening" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 3,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  },
};

const TUXEDO_SINGLES = [
  { id: 1, title: "Navy Streaming Beadwork Tuxedo", tagline: "Dual-front crystal trails on a navy three-piece.", color: "Midnight Navy", colorLabel: "Navy", motif: "streaming bead trails across both fronts" },
  { id: 2, title: "Navy Cascade Crystal Tuxedo", tagline: "Weeping crystal strands down the right shoulder.", color: "Midnight Navy", colorLabel: "Navy", motif: "cascade beadwork on the right shoulder and lapel" },
  { id: 3, title: "Navy Asymmetric Feather Tuxedo", tagline: "Feathered bead spray on a navy shawl tuxedo.", color: "Midnight Navy", colorLabel: "Navy", motif: "asymmetric feather beadwork on the left shoulder" },
  { id: 4, title: "Black Dual-Panel Beadwork Tuxedo", tagline: "Black crystal panels on a classic shawl tuxedo.", color: "Charcoal Noir", colorLabel: "Black", motif: "beaded panels on both fronts" },
  { id: 5, title: "Black Shoulder Vine Tuxedo", tagline: "Crystal vine work along the shoulders and lapels.", color: "Charcoal Noir", colorLabel: "Black", motif: "vine crystal embroidery on both shoulders" },
  { id: 6, title: "Navy Fan-Bead Shoulder Tuxedo", tagline: "Fan crystal work on the right shoulder, chain at the pocket.", color: "Midnight Navy", colorLabel: "Navy", motif: "fan beadwork on the right shoulder and a pocket chain" },
  { id: 7, title: "Navy Scallop Crystal Tuxedo", tagline: "Scalloped crystals on the sleeve with a chain brooch.", color: "Midnight Navy", colorLabel: "Navy", motif: "scallop crystal work on the right sleeve" },
  { id: 8, title: "Royal Navy Dotted Lattice Tuxedo", tagline: "All-over dotted lattice with a draped pocket chain.", color: "Midnight Navy", colorLabel: "Royal navy", motif: "dotted lattice beadwork across the jacket" },
  { id: 9, title: "Black Floral Shoulder Tuxedo", tagline: "Tonal black florals on the shoulders of a shawl tuxedo.", color: "Charcoal Noir", colorLabel: "Black", motif: "tonal floral beadwork on both shoulders" },
  { id: 10, title: "Black Vertical Bead-Stripe Tuxedo", tagline: "Vertical crystal stripes down both sleeves.", color: "Charcoal Noir", colorLabel: "Black", motif: "vertical bead stripes from shoulder to cuff" },
  { id: 11, title: "Emerald Starburst Tuxedo", tagline: "Forest-green tuxedo with radiating crystal bursts.", color: "Deep Wine", colorLabel: "Emerald", motif: "starburst beadwork on both fronts" },
  { id: 12, title: "Royal Blue Feather Bead Tuxedo", tagline: "Bright royal blue with a silver feather spray.", color: "Midnight Navy", colorLabel: "Royal blue", motif: "silver feather beadwork on the left shoulder" },
  { id: 13, title: "Black Branch Crystal Tuxedo", tagline: "Branch crystals on the left shoulder and cuff.", color: "Charcoal Noir", colorLabel: "Black", motif: "branch crystal work on the left shoulder and cuff" },
  { id: 14, title: "Black Fan Embroidery Tuxedo", tagline: "Heavy fan embroidery across both shoulders.", color: "Charcoal Noir", colorLabel: "Black", motif: "fan embroidery across both shoulders" },
  { id: 15, title: "Navy Feather Spray Tuxedo", tagline: "Twin feather sprays on a navy three-piece tuxedo.", color: "Midnight Navy", colorLabel: "Navy", motif: "feather spray beadwork on both fronts" },
];

function tuxedoSpec(row) {
  const price = 36000 + (row.id % 7) * 1500;
  const comparePrice = price + 7000;
  const motifCap = row.motif.charAt(0).toUpperCase() + row.motif.slice(1);
  return {
    title: row.title,
    tagline: row.tagline,
    description: `A three-piece embroidered tuxedo in ${row.colorLabel.toLowerCase()}, with ${row.motif}. Shawl lapel, matching waistcoat, and bow tie — cut for wedding receptions from our Lajpat Nagar atelier.`,
    category: "Tuxedo",
    subCategory: "Embroidered Tuxedo",
    price,
    comparePrice,
    colors: [row.colorLabel],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 4 + (row.id % 5),
    badge: "New",
    isFeatured: row.id <= 4,
    details: [
      "Three-piece embroidered tuxedo",
      "Satin shawl lapel",
      "Matching waistcoat and bow tie",
      motifCap,
      "Made to order from the Lajpat Nagar atelier",
    ],
    specifications: [
      { label: "Silhouette", value: "Three-piece tuxedo" },
      { label: "Fabric", value: "Wool-blend with crystal beadwork" },
      { label: "Colour", value: row.colorLabel },
      { label: "Occasion", value: "Wedding / reception" },
      { label: "Fit", value: "Tailored" },
    ],
    care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
    deliveryLeadValue: 4,
    deliveryLeadUnit: "weeks",
    showDeliveryLead: true,
  };
}

for (const row of TUXEDO_SINGLES) {
  CATALOG[`product_${row.id}`] = tuxedoSpec(row);
}

CATALOG.product_1 = {
  title: "Navy Diamond-Lattice Indo-Western",
  tagline: "Open navy jacket over a white mirror-work kurta.",
  description:
    "A navy Indo-Western jacket in diamond lattice embroidery, worn open over a white kurta with a heavy silver mirror placket and hem. Pocket chain and brooch at the chest. Cut for sangeet and evening ceremonies from our Lajpat Nagar atelier.",
  category: "Indo-Western",
  subCategory: "",
  price: 26500,
  comparePrice: 32999,
  colors: ["Navy"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 6,
  badge: "New",
  isFeatured: true,
  details: [
    "Open-front navy embroidered Indo-Western",
    "Diamond lattice with sequin accents",
    "White kurta with silver mirror placket and hem",
    "Pocket chain and brooch",
    "Made to order from the Lajpat Nagar atelier",
  ],
  specifications: [
    { label: "Silhouette", value: "Indo-Western jacket" },
    { label: "Fabric", value: "Embroidered viscose blend" },
    { label: "Colour", value: "Navy" },
    { label: "Occasion", value: "Sangeet / evening" },
    { label: "Fit", value: "Tailored" },
  ],
  care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
  deliveryLeadValue: 3,
  deliveryLeadUnit: "weeks",
  showDeliveryLead: true,
};

CATALOG.product_2 = {
  title: "Navy Leaf-Bead Shawl Tuxedo",
  tagline: "Shawl tuxedo with cascading leaf crystals on the right shoulder.",
  description:
    "A navy three-piece tuxedo with a satin shawl lapel, matching waistcoat, and bow tie. Leaf crystal beadwork cascades from the right shoulder down the sleeve. Cut for wedding receptions from our Lajpat Nagar atelier.",
  category: "Tuxedo",
  subCategory: "Embroidered Tuxedo",
  price: 39500,
  comparePrice: 46500,
  colors: ["Navy"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 5,
  badge: "New",
  isFeatured: true,
  details: [
    "Three-piece embroidered tuxedo",
    "Satin shawl lapel",
    "Matching waistcoat and bow tie",
    "Leaf crystal beadwork on the right shoulder",
    "Made to order from the Lajpat Nagar atelier",
  ],
  specifications: [
    { label: "Silhouette", value: "Three-piece tuxedo" },
    { label: "Fabric", value: "Wool-blend with crystal beadwork" },
    { label: "Colour", value: "Navy" },
    { label: "Occasion", value: "Wedding / reception" },
    { label: "Fit", value: "Tailored" },
  ],
  care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
  deliveryLeadValue: 4,
  deliveryLeadUnit: "weeks",
  showDeliveryLead: true,
};

CATALOG.product_3 = {
  title: "Royal Blue Floral Bandhgala",
  tagline: "Closed bandhgala with gold, ivory, and navy florals.",
  description:
    "A royal-blue Jodhpuri bandhgala with a high mandarin collar and floral embroidery in gold, ivory, and navy on the left shoulder, collar, and cuff. Closed front with a clean two-button stance. Cut for evening receptions from our Lajpat Nagar atelier.",
  category: "Suit",
  subCategory: "Jodhpuri Suit",
  price: 32500,
  comparePrice: 39999,
  colors: ["Royal Blue"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 6,
  badge: "New",
  isFeatured: true,
  details: [
    "Closed-front Jodhpuri / bandhgala",
    "Mandarin collar with floral embroidery",
    "Gold, ivory, and navy florals on the shoulder and cuff",
    "Flap pockets",
    "Made to order from the Lajpat Nagar atelier",
  ],
  specifications: [
    { label: "Silhouette", value: "Jodhpuri bandhgala" },
    { label: "Fabric", value: "Wool-blend with thread embroidery" },
    { label: "Colour", value: "Royal blue" },
    { label: "Occasion", value: "Reception / evening" },
    { label: "Fit", value: "Tailored" },
  ],
  care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
  deliveryLeadValue: 3,
  deliveryLeadUnit: "weeks",
  showDeliveryLead: true,
};

CATALOG.horse_design = {
  title: "Black Horse-Bead Zip Jacket",
  tagline: "Zip-front black jacket with crystal horse embroidery.",
  description:
    "A black zip-front jacket with a pointed collar and a crystal-beaded horse across the left front. Silver zipper and satin lining. Cut as a statement evening piece from our Lajpat Nagar atelier.",
  category: "Shirt",
  subCategory: "Designer Shirt",
  price: 22500,
  comparePrice: 27999,
  colors: ["Black"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 6,
  badge: "New",
  isFeatured: true,
  details: [
    "Zip-front designer jacket",
    "Pointed collar",
    "Crystal-beaded horse motif on the left front",
    "Satin lining",
    "Made to order from the Lajpat Nagar atelier",
  ],
  specifications: [
    { label: "Silhouette", value: "Zip jacket" },
    { label: "Fabric", value: "Wool-blend with crystal beadwork" },
    { label: "Colour", value: "Black" },
    { label: "Occasion", value: "Evening / cocktail" },
    { label: "Fit", value: "Tailored" },
  ],
  care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
  deliveryLeadValue: 3,
  deliveryLeadUnit: "weeks",
  showDeliveryLead: true,
};

CATALOG.img_2285 = {
  title: "Black Leaf-Trail Shawl Tuxedo",
  tagline: "Black shawl tuxedo with cascading leaf beadwork.",
  description:
    "A black shawl-lapel tuxedo with tonal leaf beadwork cascading from the right shoulder along the lapel. Satin shawl and a single-button stance. Cut for wedding receptions from our Lajpat Nagar atelier.",
  category: "Tuxedo",
  subCategory: "Embroidered Tuxedo",
  price: 39500,
  comparePrice: 46500,
  colors: ["Black"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 5,
  badge: "New",
  isFeatured: true,
  details: [
    "Shawl-lapel embroidered tuxedo",
    "Tonal leaf crystal beadwork on the right shoulder",
    "Satin shawl lapel",
    "Single-button stance",
    "Made to order from the Lajpat Nagar atelier",
  ],
  specifications: [
    { label: "Silhouette", value: "Shawl tuxedo" },
    { label: "Fabric", value: "Wool-blend with crystal beadwork" },
    { label: "Colour", value: "Black" },
    { label: "Occasion", value: "Wedding / reception" },
    { label: "Fit", value: "Tailored" },
  ],
  care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
  deliveryLeadValue: 4,
  deliveryLeadUnit: "weeks",
  showDeliveryLead: true,
};

CATALOG.product = {
  title: "Black Double-Breasted Pleated-Sash Blazer",
  tagline: "Black DB blazer with a pleated sash and gold buckle.",
  description:
    "A black double-breasted blazer with peaked lapels, a draped pleated sash, and a gold buckle at the waist. Cut for cocktail hours and evening ceremonies from our Lajpat Nagar atelier.",
  category: "Suit",
  subCategory: "Double Breasted Suit",
  price: 26500,
  comparePrice: 32999,
  colors: ["Black"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 6,
  badge: "New",
  isFeatured: true,
  details: [
    "Double-breasted peaked-lapel blazer",
    "Pleated sash with gold buckle",
    "Four-button stance",
    "Flap pockets",
    "Made to order from the Lajpat Nagar atelier",
  ],
  specifications: [
    { label: "Silhouette", value: "Double-breasted blazer" },
    { label: "Fabric", value: "Wool-blend suiting" },
    { label: "Colour", value: "Black" },
    { label: "Occasion", value: "Cocktail / evening" },
    { label: "Fit", value: "Tailored" },
  ],
  care: "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.",
  deliveryLeadValue: 3,
  deliveryLeadUnit: "weeks",
  showDeliveryLead: true,
};

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

const HERO_ORDER = {
  camel_double_breasted_blazer: [
    "model_img5.png",
    "model_img2.png",
    "model_img3.png",
    "model_img4.png",
    "model_img6.png",
    "model_img1.jpeg",
    "model_img.png",
    "model_img7.png",
    "model_img8.png",
    "model_img9.png",
  ],
  product_kurta: ["product_kurta (2).jpeg", "product_kurta (1).jpeg"],
  zenmen_owner: ["zenmen_owner (1).jpeg", "zenmen_owner (2).jpeg"],
  zenmen_owner_2: [
    "zenmen_owner_2 (4).jpeg",
    "zenmen_owner_2 (1).jpeg",
    "zenmen_owner_2 (3).jpeg",
  ],
  product_1: [
    "product_1 (2).jpg",
    "product_1 (1).jpg",
    "product_1 (4).jpg",
    "product_1 (3).jpg",
  ],
  product_2: [
    "product_2 (1).jpg",
    "product_2 (2).jpg",
    "product_2 (3).jpg",
  ],
  product_3: [
    "product_3 (3).jpg",
    "product_3 (1).jpg",
    "product_3 (4).jpg",
    "product_3 (2).jpg",
  ],
  horse_design: ["horse_design (2).jpeg", "horse_design (1).jpeg"],
  img_2285: ["IMG_2285.JPG.jpeg"],
  product: ["product (1).HEIC", "product (3).HEIC", "product (2).HEIC"],
};

function groupKey(filename) {
  const stem = path.parse(filename).name;
  if (/^img_2285/i.test(stem)) return "img_2285";
  // Studio set: model_img.png, model_img1.jpeg … model_img9.png (not model_img2_1)
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

function sortGroup(key, list) {
  const preferred = HERO_ORDER[key];
  if (preferred) {
    const rank = (full) => {
      const name = path.basename(full).toLowerCase();
      const i = preferred.findIndex((n) => n.toLowerCase() === name);
      return i === -1 ? 1000 : i;
    };
    list.sort(
      (a, b) =>
        rank(a) - rank(b) ||
        seqHint(path.basename(a)) - seqHint(path.basename(b)),
    );
    return;
  }
  list.sort(
    (a, b) => seqHint(path.basename(a)) - seqHint(path.basename(b)),
  );
}

function seqHint(filename) {
  const stem = path.parse(filename).name;
  const paren = stem.match(/\((\d+)\)/);
  if (paren) return Number(paren[1]);
  const tail = stem.match(/_(\d+)$/);
  if (tail) return Number(tail[1]);
  return 0;
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

async function retagTuxedos(col) {
  let matched = 0;
  let modified = 0;
  for (const row of TUXEDO_SINGLES) {
    const spec = tuxedoSpec(row);
    const slug = canonicalSlug(row.title);
    const result = await col.updateOne(
      { slug },
      {
        $set: {
          category: spec.category,
          subCategory: spec.subCategory,
          colors: spec.colors,
        },
      },
    );
    matched += result.matchedCount;
    modified += result.modifiedCount;
    if (result.matchedCount) {
      console.log(
        `retag ${slug} → ${spec.category} / ${spec.subCategory} (${spec.colors[0]})`,
      );
    } else {
      console.warn(`retag miss (no product): ${slug}`);
    }
  }
  console.log(`retagged tuxedos: matched ${matched}, updated ${modified}`);
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const retagOnly = process.argv.includes("--retag-only");
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("FAIL: MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  if (retagOnly) {
    if (dry) {
      console.log("[dry-run] would retag 15 tuxedo products");
      return;
    }
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    if (!db) throw new Error("No database");
    await retagTuxedos(db.collection("products"));
    await mongoose.disconnect();
    return;
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
    `Found ${files.length} images in ${groups.size} product group(s)`,
  );
  for (const [key, list] of groups) {
    const spec = CATALOG[key];
    console.log(
      `  group ${key}: ${list.length} photo(s) → ${spec?.title ?? "(no catalog spec)"}`,
    );
    for (const p of list) console.log(`    ${path.basename(p)}`);
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

  await retagTuxedos(col);

  for (const [key, list] of groups) {
    const spec = CATALOG[key];
    if (!spec) {
      console.warn(`skip group ${key}: add a CATALOG entry`);
      continue;
    }

    const existing = await col.findOne({
      $or: [
        { slug: canonicalSlug(spec.title) },
        { "images.alt": spec.title, sourceFolder: "new_products" },
      ],
    });
    if (existing) {
      console.log(`skip (already exists): ${existing.slug}`);
      continue;
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
        `  uploaded ${path.basename(full)} → ${uploaded.id} (${Math.round(uploaded.bytes / 1024)}kb)`,
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
      numReviews: 14,
      badge: spec.badge,
      isFeatured: spec.isFeatured,
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
    console.log(`created /collection/${slug} (${images.length} images)`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
