import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return Response.json(products);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
