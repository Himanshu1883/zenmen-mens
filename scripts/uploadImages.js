import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

// CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// IMAGE FOLDER
const IMAGE_FOLDER = "./assests/current";

// ✅ ADD THIS (store uploaded data)
const uploaded = [];

async function uploadImages() {
  const files = fs.readdirSync(IMAGE_FOLDER);

  for (const file of files) {
    const filePath = path.join(IMAGE_FOLDER, file);

    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: "zenmen-products",
      });

      console.log(`Uploaded: ${file}`);
      console.log(`URL: ${res.secure_url}\n`);

      // ✅ ADD THIS PART (inside loop)
      uploaded.push({
        name: file,
        url: res.secure_url,
      });
    } catch (err) {
      console.error(`Failed: ${file}`, err);
    }
  }

  // ✅ ADD THIS (after loop finishes)
  fs.writeFileSync("uploaded.json", JSON.stringify(uploaded, null, 2));

  console.log("✅ All URLs saved in uploaded.json");
}

uploadImages();
