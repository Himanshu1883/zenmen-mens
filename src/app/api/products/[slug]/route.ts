import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();

    // ✅ unwrap params
    const { slug } = await context.params;

    const product = await Product.findOne({
      slug: { $regex: `^${slug}$`, $options: "i" },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
