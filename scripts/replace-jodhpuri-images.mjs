/**
 * Replace Jodhpuri product photos in GridFS.
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

const ASSETS =
  "C:\\Users\\Gulab\\.cursor\\projects\\c-Users-Gulab-Desktop-ZENmen\\assets";

/** Dusty mauve / lavender 4-pocket Bandhgala */
const PURPLE_FILES = [
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_2_0d864b35-0c0a-466e-8db2-2c128e89f35b-12530bfe-1952-4a0f-87a2-c9cc6c23cc4b.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_4_62c6c943-0bb9-45be-99b7-c5411f9b632a-feecadf8-d7e5-4472-8b67-5696c800bddb.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_3_504cd2d3-e1c4-4b61-9dbb-adc5db76e527-699941ef-e129-45aa-be56-6f9e19ebe0e3.webp",
];

/** Black + silver stripe jacket with velvet vest */
const BLACK_FILES = [
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_1_261687ea-7df5-41dd-97d4-d52957189709-8a4f413a-2d62-434b-bb60-e60dafca8560.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_4_3eb22cf1-fbfd-4b18-92d5-87000130052a-93bcd2fa-91e6-43fd-a663-cf01df67739f.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_2_79e6a081-ad89-4103-9021-72f7644fb952-c50639b2-aa82-4f23-a5a2-64c3b3a43226.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_3_2072ea03-ca81-4ac2-b3ee-a910567c32a7-8c9905b8-7aeb-4de2-b8c5-d02b39dec407.webp",
];

function isObjectId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}

async function uploadFile(bucket, filePath, filename, metadata) {
  const buffer = fs.readFileSync(filePath);
  const id = await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      contentType: "image/webp",
      metadata,
    });
    stream.once("error", reject);
    stream.once("finish", () => resolve(stream.id));
    stream.end(buffer);
  });
  return String(id);
}

async function replaceProductImages(db, bucket, product, files, label) {
  const next = [];
  for (const [index, name] of files.entries()) {
    const full = path.join(ASSETS, name);
    if (!fs.existsSync(full)) throw new Error(`Missing file: ${full}`);
    const id = await uploadFile(bucket, full, `${label}-${index + 1}.webp`, {
      kind: "product",
      slug: String(product.slug || ""),
      source: "user-jodhpuri",
    });
    next.push({
      url: `/api/media/${id}`,
      public_id: id,
      alt: product.title || label,
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
    { $set: { images: next } },
  );
  return next;
}

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("FAIL: MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: "productImages" });
  const products = await db.collection("products").find({}).toArray();

  const purple = products.find((p) => p.slug === "royal-purple-jodhpuri-suit");
  const black = products.find(
    (p) => p.slug === "black-multicolor-embroidered-jodhpuri",
  );
  if (!purple) throw new Error("Missing Royal Purple Jodhpuri Suit");
  if (!black) throw new Error("Missing Black Multicolor Embroidered Jodhpuri");

  console.log("PURPLE", purple.title);
  console.log("BLACK", black.title);

  const a = await replaceProductImages(
    db,
    bucket,
    purple,
    PURPLE_FILES,
    "jodhpuri-mauve",
  );
  const b = await replaceProductImages(
    db,
    bucket,
    black,
    BLACK_FILES,
    "jodhpuri-black-stripe",
  );

  console.log("purple", a.length, a.map((i) => i.url).join(", "));
  console.log("black", b.length, b.map((i) => i.url).join(", "));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
