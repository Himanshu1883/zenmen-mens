/**
 * Replace Indo-Western product photos in GridFS.
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

/** Black + white jaal / paisley — Black Thread Work */
const THREAD_WORK_FILES = [
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_2_7909130b-8d1a-4375-9338-4ceb9682d8f2-06c1c003-f701-49b8-bd8e-4c842b83f941.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_5_e5f06b98-04e8-4af7-bcf2-33e27a28a3b8-d2d3417c-7518-49fc-8892-6b4c90ead985.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_4_0df5a84f-5a3a-442d-8fce-bf5f033f672d-d0c41087-c98b-4db1-a93d-366baa793e4c.webp",
];

/** Solid black beaded lattice — Mens Wear Indowestern in Black Color */
const BLACK_BEADED_FILES = [
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_2_44f642a7-09df-427b-8529-f27681d33609-1d3b8fd5-976e-4436-b827-e9b863759812.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_3_39a5e5e3-46ff-4407-b4f0-f7e466078248-5628f2d3-4a7f-4717-a6fb-1fb4f20268bb.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_5_8ae84157-9157-438d-96fe-9311c53a38dc-c6f1a285-feee-4c67-b4bb-36bb44aaf2a4.webp",
  "c__Users_Gulab_AppData_Roaming_Cursor_User_workspaceStorage_38e9e6da10086049720470520bad19b3_images_4_a7662f1b-54f5-41c6-a3db-94df6b8d0f2e-d1fc1283-a2ca-47e0-9f8e-63a171f57962.webp",
];

function isObjectId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}

async function uploadFile(bucket, filePath, filename, metadata) {
  const buffer = fs.readFileSync(filePath);
  const id = await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      metadata: { contentType: "image/webp", ...metadata },
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
    const id = await uploadFile(bucket, full, `${label}-${index + 1}.webp`, {
      kind: "product",
      slug: String(product.slug || ""),
      source: "user-indo-western",
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

function findProduct(products, slug) {
  return products.find((p) => p.slug === slug);
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

  const threadWork = findProduct(
    products,
    "black-thread-work-indo-western-for-men",
  );
  const blackBeaded = findProduct(
    products,
    "mens-wear-indowestern-in-black-color",
  );

  if (!threadWork) throw new Error("Missing Black Thread Work Indo Western");
  if (!blackBeaded) throw new Error("Missing Mens Wear Indowestern in Black");

  console.log("THREAD", threadWork.title, threadWork.slug);
  console.log("BEADED", blackBeaded.title, blackBeaded.slug);

  const a = await replaceProductImages(
    db,
    bucket,
    threadWork,
    THREAD_WORK_FILES,
    "indo-western-thread-work",
  );
  const b = await replaceProductImages(
    db,
    bucket,
    blackBeaded,
    BLACK_BEADED_FILES,
    "indo-western-black-beaded",
  );

  console.log("thread-work", a.length, a.map((i) => i.url).join(", "));
  console.log("black-beaded", b.length, b.map((i) => i.url).join(", "));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
