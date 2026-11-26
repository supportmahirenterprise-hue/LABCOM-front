export const metadata = {
  title: "Custom Label Presets & QR Code Templates",
  description:
    "Create and manage custom QR code positions, Instagram follower boosters, Meesho store links, and dynamic print templates.",
  keywords: [
    "shipping label templates",
    "qr code stamper presets",
    "meesho follower booster",
    "instagram qr stamp",
  ],
  openGraph: {
    title: "Custom Label Presets & QR Code Templates",
    description:
      "Create custom QR code positions, store link stamps, and dynamic print presets.",
    url: "https://labelpro.in/templates",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Label Presets & Templates - LabelPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Label Presets & QR Code Templates | LabelPro.in",
    description:
      "Create custom QR code positions, store link stamps, and dynamic print presets.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/templates",
  },
};

const templatesSchema = {
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
          "name": "Custom Label Presets & Templates",
          "item": "https://labelpro.in/templates",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "name": "Custom Label Presets & QR Code Templates - LabelPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web-based",
      "description":
        "Create and manage custom QR code positions, Instagram follower boosters, Meesho store links, and dynamic print templates for thermal shipping labels.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
    },
  ],
};

export default function TemplatesLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(templatesSchema) }}
      />
      {children}
    </>
  );
}
