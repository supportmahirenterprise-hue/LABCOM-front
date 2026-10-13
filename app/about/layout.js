export const metadata = {
  title: "About LabelPro | India's First E-Commerce Label Studio",
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
    title: "About LabelPro | India's First E-Commerce Label Studio",
    description:
      "Learn about LabelPro: India's first intelligent e-commerce shipping label studio. Built for Meesho, Flipkart & Amazon sellers.",
    url: "https://labelpro.in/about",
    siteName: "LabelPro",
    type: "website",
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
