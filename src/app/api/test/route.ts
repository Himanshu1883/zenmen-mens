import { connectDB } from "@/app/lib/db";

export async function GET() {
  await connectDB();
  return Response.json({ message: "DB Connected ✅" });
}
