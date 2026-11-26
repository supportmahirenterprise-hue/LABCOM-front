export const metadata = {
  title: "Terms of Service & Seller Agreement",
  description:
    "Read the terms and conditions governing access and usage of LabelPro's free e-commerce shipping label studio, duplicate remover, and analytics suite.",
  keywords: [
    "labelpro terms of service",
    "terms and conditions",
    "shipping label software terms",
  ],
  openGraph: {
    title: "Terms of Service & Seller Agreement",
    description:
      "Read the terms and conditions governing access and usage of LabelPro's free e-commerce shipping label studio, duplicate remover, and analytics suite.",
    url: "https://labelpro.in/terms",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Terms of Service - LabelPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service & Seller Agreement | LabelPro.in",
    description:
      "Terms and conditions for LabelPro e-commerce shipping label studio.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/terms",
  },
};

const termsSchema = {
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
          "name": "Terms of Service",
          "item": "https://labelpro.in/terms",
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://labelpro.in/terms#webpage",
      "url": "https://labelpro.in/terms",
      "name": "Terms of Service & Seller Agreement - LabelPro",
      "description":
        "Terms and conditions governing access and usage of LabelPro's free e-commerce shipping label studio, duplicate remover, and analytics suite.",
      "publisher": {
        "@type": "Organization",
        "name": "Mahir Enterprise",
        "url": "https://labelpro.in"
      }
    }
  ]
};

export default function TermsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />
      {children}
    </>
  );
}
