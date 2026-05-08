import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    // 🔐 Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔐 Credentials Login
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(
          credentials!.password,
          user.password,
        );

        if (!isMatch) throw new Error("Wrong password");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // 🔥 Save Google user in DB
      if (account?.provider === "google") {
        await connectDB();

        const existing = await User.findOne({ email: user.email });

        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "", // no password for Google users
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }

      if (!token.role && token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        token.role = dbUser?.role || "user";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (
          session.user as typeof session.user & {
            role?: string;
          }
        ).role = (token.role as string) || "user";
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
