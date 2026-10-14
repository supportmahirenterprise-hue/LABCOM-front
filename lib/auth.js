import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

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
    CredentialsProvider({
      name: "Demo / Seller Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seller@labelpro.in" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email || "seller@labelpro.in";
        const namePart = email.split("@")[0] || "Seller";
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return {
          id: "seller-" + Date.now(),
          name: displayName,
          email: email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id;
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
