export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labelpro.in";

  return {
    rules: [
      // 1. Legitimate Search Engines & Social Indexers (Full SEO Access to All Public Pages)
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
          "Applebot",
          "facebookexternalhit",
          "Twitterbot",
          "LinkedInBot",
          "WhatsApp",
          "Mediapartners-Google",
        ],
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/settings",
          "/history",
          "/login",
          "/_next/",
          "/*.json$",
        ],
      },
      // 2. AI Scrapers, Automated Web Harvesters & Model Training Bots (Blocked from entire site)
      {
        userAgent: [
          "CCBot",
          "Bytespider",
          "Diffbot",
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "FacebookBot",
          "Amazonbot",
          "cohere-ai",
          "Scrapy",
        ],
        disallow: ["/"],
      },
      // 3. Fallback for general crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/settings",
          "/history",
          "/login",
          "/_next/",
          "/*.json$",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
