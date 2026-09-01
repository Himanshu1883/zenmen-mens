/**
 * Replace black + bottle-green embroidered shirt photos in GridFS.
 * One-off; run from repo root.
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

const BLACK_FILES = [
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_4-29b010c4-5514-4a4e-b6a6-b8806f7b94bb.jpg",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_2-808f9f13-7175-4b8a-9b78-d6fa1006b166.jpg",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green-a15101a0-5727-44e7-b32b-02b4bb8d25aa.jpg",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_3-bfe7b878-a0a3-4f43-a268-16c8f729b0be.jpg",
];

const GREEN_FILES = [
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_6-adb51f5f-17d5-4ecf-b834-cfec81218adf.jpg",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_8-181f2f66-3820-46f4-8472-6eef80bec062.jpg",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_7-f97d7389-af01-4bc7-abaa-696f3928ab45.jpg",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_owl_hand_emb_design_bottle_green_9-75e5680e-cedf-4e52-b342-3ab4db11b3f2.jpg",
];

function isObjectId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}

async function uploadFile(bucket, filePath, filename, metadata) {
  const buffer = fs.readFileSync(filePath);
  const id = await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      contentType: "image/jpeg",
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
    if (!fs.existsSync(full)) {
      throw new Error(`Missing file: ${full}`);
    }
    const id = await uploadFile(bucket, full, `${label}-${index + 1}.jpg`, {
      kind: "product",
      slug: String(product.slug || ""),
      source: "user-replace-shirts",
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
  const black = products.find(
    (p) =>
      /black/i.test(p.title || "") &&
      /embroidered designer shirt/i.test(String(p.title || "").replace(/\n/g, " ")),
  );
  const green = products.find(
    (p) =>
      /bottle green/i.test(p.title || "") ||
      /OWL/i.test(p.title || ""),
  );

  if (!black) throw new Error("Black embroidered shirt product not found");
  if (!green) throw new Error("Bottle green OWL shirt product not found");

  console.log("BLACK", JSON.stringify(black.title), black.slug);
  console.log("GREEN", JSON.stringify(green.title), green.slug);

  const blackImgs = await replaceProductImages(
    db,
    bucket,
    black,
    BLACK_FILES,
    "black-embroidered-shirt",
  );
  const greenImgs = await replaceProductImages(
    db,
    bucket,
    green,
    GREEN_FILES,
    "owl-bottle-green-shirt",
  );

  console.log("black images", blackImgs.length, blackImgs.map((i) => i.url).join(", "));
  console.log("green images", greenImgs.length, greenImgs.map((i) => i.url).join(", "));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
