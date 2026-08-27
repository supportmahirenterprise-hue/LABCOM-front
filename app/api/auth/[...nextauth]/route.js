import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

async function auth(req, ctx) {
  // Read request headers to dynamically determine host and protocol in production
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host && !host.includes("localhost") ? "https" : "http");
  const dynamicUrl = host ? `${proto}://${host}` : undefined;

  return NextAuth(req, ctx, {
    ...authOptions,
    trustHost: true,
    ...(dynamicUrl ? { url: dynamicUrl } : {}),
  });
}

export { auth as GET, auth as POST };
