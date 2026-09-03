import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
          }),
        ]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "Quick Demo Access",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seller@example.com" },
      },
      async authorize(credentials) {
        return {
          id: "dev-user-1",
          name: credentials?.email ? credentials.email.split("@")[0] : "Demo Seller",
          email: credentials?.email || "seller@labelpro.in",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Seller",
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
