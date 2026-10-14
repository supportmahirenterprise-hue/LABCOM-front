export const metadata = {
  title: "Duplicate Label Remover for Meesho, Flipkart & Amazon",
  description:
    "India's first duplicate shipping label remover for Meesho, Flipkart & Amazon. Cross-compare two shipping label PDF batches, eliminate duplicate order numbers in browser memory, and prevent double-shipping losses.",
  keywords: [
    "duplicate label remover",
    "meesho duplicate label remover",
    "flipkart double order print prevention",
    "remove duplicate shipping labels",
    "pdf label duplicate filter",
    "e-commerce label studio",
    "clean duplicate labels online",
    "shipping label sorter",
    "thermal shipping label cropper",
  ],
  openGraph: {
    title: "Duplicate Label Remover for Meesho, Flipkart & Amazon",
    description:
      "Cross-compare two shipping label PDF batches, eliminate duplicate order numbers in browser memory, and download clean unique label PDFs.",
    url: "https://labelpro.in/remove-duplicate",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Duplicate Label Remover - LabelPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duplicate Label Remover for Meesho, Flipkart & Amazon | LabelPro.in",
    description:
      "Cross-compare two shipping label PDF batches and eliminate duplicate orders in browser memory.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/remove-duplicate",
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
          "name": "Duplicate Label Remover",
          "item": "https://labelpro.in/remove-duplicate",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "name": "Duplicate Shipping Label Remover - LabelPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web-based",
      "description":
        "Cross-batch shipping label PDF duplicate remover for Meesho, Flipkart & Amazon. Eliminates double shipping losses in browser memory.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
    },
  ],
};

export default function RemoveDuplicateLayout({ children }) {
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
