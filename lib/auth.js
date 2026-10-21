import GoogleProvider from "next-auth/providers/google";
import { getDb } from "./mongodb";
import { isSuperAdmin } from "./admin";
import { isUserBlockedSync } from "./blockGuard";

// Enforce canonical production URL if missing or defaulting to localhost/lextrack
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.NEXTAUTH_URL ||
    process.env.NEXTAUTH_URL.includes("localhost") ||
    process.env.NEXTAUTH_URL.includes("lextrack"))
) {
  process.env.NEXTAUTH_URL = "https://labelpro.in";
}

const googleClientId =
  process.env.GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "";

const googleClientSecret =
  process.env.GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  "";

export const authOptions = {
  providers: [
    ...(googleClientId
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return true;
      try {
        const cleanEmail = user.email.toLowerCase().trim();
        const db = await getDb();
        const existing = await db.collection("users").findOne({ email: cleanEmail });

        // If user is suspended / blocked by SuperAdmin, reject login immediately
        if (existing && existing.isBlocked === true) {
          console.warn(`[NextAuth] Blocked user sign-in rejected: ${cleanEmail}`);
          return false;
        }

        const superAdminFlag = isSuperAdmin(cleanEmail);

        // Upsert user into users collection
        await db.collection("users").updateOne(
          { email: cleanEmail },
          {
            $set: {
              name: user.name || cleanEmail.split("@")[0],
              email: cleanEmail,
              image: user.image || "",
              lastLoginAt: new Date(),
              role: superAdminFlag ? "superadmin" : (existing?.role || "user"),
            },
            $setOnInsert: {
              createdAt: new Date(),
              isBlocked: false,
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("[NextAuth] Error saving user record:", err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token?.email) {
        const cleanEmail = token.email.toLowerCase().trim();
        token.isSuperAdmin = isSuperAdmin(cleanEmail);
        token.role = token.isSuperAdmin ? "superadmin" : "user";
        if (isUserBlockedSync(cleanEmail)) {
          token.isBlocked = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id;
        const cleanEmail = (session.user.email || token.email || "").toLowerCase().trim();
        session.user.isSuperAdmin = isSuperAdmin(cleanEmail);
        session.user.role = session.user.isSuperAdmin ? "superadmin" : (token.role || "user");

        // O(1) in-memory check to immediately invalidate session for blocked users
        if (isUserBlockedSync(cleanEmail)) {
          session.user.isBlocked = true;
          session.error = "ACCOUNT_SUSPENDED";
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (e) {}
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "veloura-dev-secret-key-987654321",
};

