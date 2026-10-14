export const metadata = {
  title: "About LabelPro — Warehouse Automation for Indian Sellers",
  description:
    "Learn about LabelPro: India's first intelligent e-commerce shipping label studio. Built for Meesho, Flipkart & Amazon sellers with 0ms client-side processing, duplicate removal, and customer intelligence.",
  keywords: [
    "about labelpro",
    "e-commerce label studio",
    "meesho shipping tools",
    "flipkart seller software",
    "thermal label cropping platform",
  ],
  openGraph: {
    title: "About LabelPro — Warehouse Automation for Indian Sellers",
    description:
      "Learn about LabelPro: India's first intelligent e-commerce shipping label studio. Built for Meesho, Flipkart & Amazon sellers.",
    url: "https://labelpro.in/about",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "About LabelPro - E-Commerce Label Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About LabelPro — Warehouse Automation for Indian Sellers | LabelPro.in",
    description:
      "India's first intelligent e-commerce shipping label studio built for marketplace sellers.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/about",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
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
      "name": "About LabelPro",
      "item": "https://labelpro.in/about",
    },
  ],
};

export default function AboutLayout({ children }) {
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
