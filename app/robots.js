export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labelpro.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/settings", "/login"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "anthropic-ai",
          "FacebookBot",
          "Amazonbot",
          "Bytespider",
          "CCBot",
          "cohere-ai",
          "OAI-SearchBot",
        ],
        allow: "/",
        disallow: ["/api/", "/_next/", "/settings", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
