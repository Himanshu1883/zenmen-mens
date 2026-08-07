import { connectDB } from "@/lib/db";
import { parseContact, phoneFromInternalEmail } from "@/lib/auth-contact";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email/mobile and password are required");
        }

        const contact = parseContact(credentials.email);
        if (!contact) {
          throw new Error("Enter a valid email or mobile number");
        }

        await connectDB();

        const user =
          contact.kind === "email"
            ? await User.findOne({ email: contact.email })
            : await User.findOne({
                $or: [{ phone: contact.phone }, { email: contact.email }],
              });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone ?? null,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      await connectDB();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          password: "",
          role: "user",
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email) as string | undefined;

      if (email) {
        await connectDB();
        const dbUser = await User.findOne({
          email: email.trim().toLowerCase(),
        })
          .select("_id role phone email")
          .lean();

        if (dbUser) {
          const rawPhone = (dbUser as { phone?: string }).phone;
          token.id = String(dbUser._id);
          token.role = (dbUser as { role?: string }).role ?? "user";
          token.phone =
            rawPhone ??
            phoneFromInternalEmail((dbUser as { email?: string }).email) ??
            null;
          return token;
        }
      }

      if (user) {
        token.role = (user as typeof user & { role?: string }).role;
        token.id = (user as { id?: string }).id;
        token.phone = (user as { phone?: string | null }).phone ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.role = (token.role as string) ?? "user";
        session.user.phone = (token.phone as string | null | undefined) ?? null;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
