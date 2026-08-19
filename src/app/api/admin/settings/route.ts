import { requireAdmin } from "@/lib/admin-auth";
import { emailConfig, isEmailConfigured } from "@/config/emailConfig";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import AdminInstagramReelsConfig from "@/models/AdminInstagramReelsConfig";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  await connectDB();

  const [products, users, categories, orders, reelDoc] = await Promise.all([
    Product.countDocuments({}),
    User.countDocuments({}),
    Category.countDocuments({}),
    Order.countDocuments({}),
    AdminInstagramReelsConfig.findOne({}).select("reels").lean(),
  ]);

  const reels = Array.isArray(reelDoc?.reels) ? reelDoc.reels.length : 0;

  return ok({
    email: {
      adminOrderEmail: emailConfig.adminOrderEmail,
      mailReplyTo: emailConfig.mailReplyTo,
      mailFrom: emailConfig.mailFrom,
      configured: isEmailConfigured(),
    },
    counts: {
      products,
      users,
      categories,
      orders,
      reels,
    },
  });
}
