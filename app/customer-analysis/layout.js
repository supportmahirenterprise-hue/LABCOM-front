export const metadata = {
  title: "Customer Intelligence & District Demand Analysis | LabelPro.in",
  description:
    "Identify high-volume order hubs vs low-demand districts, track repeat buyer retention rates, and analyze jila-wise e-commerce demand.",
  keywords: [
    "district demand analysis",
    "jila demand tracking",
    "meesho customer analytics",
    "repeat buyer rate",
    "e-commerce location intelligence",
  ],
  openGraph: {
    title: "Customer Intelligence & District Demand Analysis | LabelPro.in",
    description:
      "Identify high-volume order hubs vs low-demand districts and track repeat buyer retention rates.",
    url: "https://labelpro.in/customer-analysis",
    siteName: "LabelPro.in",
    type: "website",
  },
  alternates: {
    canonical: "https://labelpro.in/customer-analysis",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://labelpro.in",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Customer Intelligence & District Demand",
          "item": "https://labelpro.in/customer-analysis",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "name": "Customer Intelligence & District Demand Analyser - LabelPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web-based",
      "description":
        "Analyze high-demand order hubs, district-level customer retention, and SKU performance for marketplace sellers.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
    },
  ],
};

export default function CustomerAnalysisLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
