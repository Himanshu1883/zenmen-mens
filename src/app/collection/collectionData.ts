import type { StaticImageData } from "next/image";
import blackJodhpur from "../../../assests/allCollections/Black_jodhpur.jpeg";
import blackJodhpur2 from "../../../assests/allCollections/Black_jodhpur2.jpeg";
import offWhiteShacket from "../../../assests/allCollections/Buckle Motif Royal Shacket In Off White.jpeg";
import blackShacket from "../../../assests/allCollections/Buckle Motif Royal Shacket In Black.jpeg";
import blackWhiteMen from "../../../assests/allCollections/black_white_men.jpeg";
import blackTuxedo from "../../../assests/allCollections/black_tuxedo.jpeg";
import blackKurta from "../../../assests/allCollections/black_kurta.jpeg";
import jodhpuriSuit from "../../../assests/allCollections/jodhpuri_suit.jpeg";
import hunterJacket from "../../../assests/allCollections/Hunter_jacket.jpeg";
import doubleBreasted from "../../../assests/allCollections/double_breasted.jpeg";
import redShirt from "../../../assests/allCollections/red_shirt.jpeg";
import pinkKurta from "../../../assests/allCollections/pink_kurta.jpeg";
import threadedZipShirt from "../../../assests/allCollections/threaded_zip_shirt.jpeg";
import velvetKurta from "../../../assests/allCollections/velvet_kurta.jpeg";
import velvetSuite from "../../../assests/allCollections/velvet_suite.jpeg";
import zenmenGreenKurta from "../../../assests/allCollections/zenmen_green_kurta.jpeg";
import zenmenBandhgala from "../../../assests/allCollections/zenmen_bandhgala.jpeg";
import whiteTuxedo from "../../../assests/allCollections/white_tuxedo.jpeg";
import whiteSuiteMen from "../../../assests/allCollections/white_suite_men.jpeg";
import whiteKurta from "../../../assests/allCollections/white_kurta.jpeg";

type CollectionImage = { fileName: string; image: StaticImageData };

export type CollectionProduct = {
  id: number;
  title: string;
  tagline: string;
  category: string;
  color: string;
  price: string;
  images: StaticImageData[];
  badge?: string;
  description: string;
  details: string[];
  sizes: string[];
};

const imageEntries: CollectionImage[] = [
  { fileName: "Black_jodhpur.jpeg", image: blackJodhpur },
  { fileName: "Black_jodhpur2.jpeg", image: blackJodhpur2 },
  { fileName: "Buckle Motif Royal Shacket In Off White.jpeg", image: offWhiteShacket },
  { fileName: "Buckle Motif Royal Shacket In Black.jpeg", image: blackShacket },
  { fileName: "black_white_men.jpeg", image: blackWhiteMen },
  { fileName: "black_tuxedo.jpeg", image: blackTuxedo },
  { fileName: "black_kurta.jpeg", image: blackKurta },
  { fileName: "jodhpuri_suit.jpeg", image: jodhpuriSuit },
  { fileName: "Hunter_jacket.jpeg", image: hunterJacket },
  { fileName: "double_breasted.jpeg", image: doubleBreasted },
  { fileName: "red_shirt.jpeg", image: redShirt },
  { fileName: "pink_kurta.jpeg", image: pinkKurta },
  { fileName: "threaded_zip_shirt.jpeg", image: threadedZipShirt },
  { fileName: "velvet_kurta.jpeg", image: velvetKurta },
  { fileName: "velvet_suite.jpeg", image: velvetSuite },
  { fileName: "zenmen_green_kurta.jpeg", image: zenmenGreenKurta },
  { fileName: "zenmen_bandhgala.jpeg", image: zenmenBandhgala },
  { fileName: "white_tuxedo.jpeg", image: whiteTuxedo },
  { fileName: "white_suite_men.jpeg", image: whiteSuiteMen },
  { fileName: "white_kurta.jpeg", image: whiteKurta },
];

const formatTitle = (fileName: string) =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bzenmen\b/gi, "")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveCategory = (rawName: string) => {
  const name = rawName.toLowerCase();
  if (name.includes("kurta")) return "Kurta";
  if (name.includes("tuxedo")) return "Tuxedo";
  if (name.includes("shacket")) return "Shacket";
  if (name.includes("shirt")) return "Shirt";
  if (name.includes("jacket")) return "Jacket";
  if (name.includes("bandhgala")) return "Bandhgala";
  if (name.includes("jodhpur") || name.includes("jodhpuri")) return "Jodhpur";
  if (name.includes("suit") || name.includes("suite")) return "Suit";
  return "Collection";
};

const resolveColor = (rawName: string) => {
  const name = rawName.toLowerCase();
  if (name.includes("black") && name.includes("white")) return "Black & White";
  if (name.includes("off white")) return "Off White";
  if (name.includes("white")) return "White";
  if (name.includes("black")) return "Black";
  if (name.includes("green")) return "Green";
  if (name.includes("red")) return "Red";
  if (name.includes("pink")) return "Pink";
  if (name.includes("velvet")) return "Velvet";
  if (name.includes("hunter")) return "Hunter";
  return "Signature";
};

const resolveTagline = (title: string, category: string) =>
  `${title} crafted for elevated ${category.toLowerCase()} dressing`;

const resolveSizes = (category: string) => {
  if (category === "Kurta" || category === "Shirt") return ["S", "M", "L", "XL", "XXL"];
  if (category === "Shacket" || category === "Jacket") return ["M", "L", "XL", "XXL"];
  return ["38", "40", "42", "44", "46"];
};

const createGallery = (currentIndex: number) => {
  const maxThumbs = 4;
  const result: StaticImageData[] = [];
  for (let i = 0; i < maxThumbs; i += 1) {
    const idx = (currentIndex + i) % imageEntries.length;
    result.push(imageEntries[idx].image);
  }
  return result;
};

export const collectionProducts: CollectionProduct[] = imageEntries.map((entry, index) => {
  const title = formatTitle(entry.fileName);
  const category = resolveCategory(entry.fileName);
  const color = resolveColor(entry.fileName);

  return {
    id: index + 1,
    title,
    tagline: resolveTagline(title, category),
    category,
    color,
    price: `Rs. ${(7290 + ((index + 1) * 690 + title.length * 23)).toLocaleString("en-IN")}`,
    images: createGallery(index),
    badge: index % 7 === 0 ? "New" : index % 9 === 0 ? "Best Seller" : undefined,
    description:
      "A refined silhouette with premium finishing, built for statement occasions and confident daily wear. Balanced structure, comfort lining, and polished detailing complete the look.",
    details: [
      "Premium tailoring construction with clean structure",
      "Soft inner lining for day-long comfort",
      "Hand-finished details and precise stitch work",
      "Designed for festive, formal, and evening styling",
    ],
    sizes: resolveSizes(category),
  };
});

export const categoryFilters = ["All", ...new Set(collectionProducts.map((item) => item.category))];
export const colorFilters = ["All", ...new Set(collectionProducts.map((item) => item.color))];
