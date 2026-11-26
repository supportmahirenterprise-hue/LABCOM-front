export const metadata = {
  title: "QR Scan Analytics & Conversion Tracking",
  description:
    "Real-time QR scan tracking, daily dispatch timelines, top scanned SKUs, and target destination performance metrics.",
  keywords: [
    "qr scan analytics",
    "labelpro analytics",
    "dispatch performance",
    "top sku scans",
  ],
  openGraph: {
    title: "QR Scan Analytics & Conversion Tracking",
    description:
      "Real-time QR scan tracking, daily dispatch timelines, and top scanned SKUs.",
    url: "https://labelpro.in/analytics",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "QR Scan Analytics - LabelPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Scan Analytics & Conversion Tracking | LabelPro.in",
    description:
      "Real-time QR scan tracking and package conversion metrics.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/analytics",
  },
};

const analyticsSchema = {
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
          "name": "QR Scan Analytics",
          "item": "https://labelpro.in/analytics",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "name": "QR Scan Analytics & Conversion Tracking - LabelPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web-based",
      "description":
        "Real-time QR scan conversion tracking, daily dispatch timelines, top-scanned SKUs, and target destination performance metrics for marketplace sellers.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
    },
  ],
};

export default function AnalyticsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(analyticsSchema) }}
      />
      {children}
    </>
  );
}
