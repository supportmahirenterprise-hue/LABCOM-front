export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labelpro.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/settings", "/login", "/admin"],
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
        disallow: ["/api/", "/settings", "/login", "/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
