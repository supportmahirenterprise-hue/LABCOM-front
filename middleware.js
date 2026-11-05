import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isSuperAdmin } from "./lib/admin";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Check JWT session token via NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "veloura-dev-secret-key-987654321",
  });

  // Allow local development testing only in non-production on localhost with explicit dev query param
  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  const isDev = process.env.NODE_ENV !== "production" && isLocalhost;
  const queryEmail = req.nextUrl.searchParams.get("email");
  if (isDev && !token && queryEmail && isSuperAdmin(queryEmail)) {
    return NextResponse.next();
  }

  // 2. If unauthenticated, redirect immediately to /login before any protected content is rendered
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. If token is marked blocked by an administrator, immediately evict and redirect to login
  if (token.isBlocked) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "account_blocked");
    return NextResponse.redirect(loginUrl);
  }

  // 4. Strict SuperAdmin route authorization: prevent non-admins and bots from viewing admin panel
  if (pathname.startsWith("/admin")) {
    if (!token.email || !isSuperAdmin(token.email)) {
      const homeUrl = new URL("/login", req.url);
      homeUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer-analysis/:path*",
    "/returns/:path*",
    "/analytics/:path*",
    "/templates/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
