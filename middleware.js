import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Allow search engine crawlers and AI bots through so SEO, Sitelinks, and LLM indexing work 100%
  const userAgent = req.headers.get("user-agent") || "";
  const isSearchBot =
    /googlebot|bingbot|baiduspider|yandexbot|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|whatsapp|gptbot|chatgpt-user|claudebot|perplexitybot|applebot|bytespider|ccbot|anthropic-ai|cohere-ai|oai-searchbot|ahrefsbot|semrushbot|dotbot|rogerbot|screaming frog|chrome-lighthouse|lighthouse|pagespeed|google-inspectiontool|gtmetrix/i.test(
      userAgent
    );
  if (isSearchBot) {
    return NextResponse.next();
  }

  // 2. Check JWT session token via NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "veloura-dev-secret-key-987654321",
  });

  // Allow local development testing if SuperAdmin email query param is provided
  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  const queryEmail = req.nextUrl.searchParams.get("email");
  if (!token && isLocalhost && queryEmail && queryEmail.toLowerCase().includes("vishal")) {
    return NextResponse.next();
  }

  // 3. If unauthenticated, redirect immediately to /login before any page content is rendered
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
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
