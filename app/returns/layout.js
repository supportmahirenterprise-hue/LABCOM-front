export const metadata = {
  title: "RTO Tracker & Reverse Logistics Return Manager",
  description:
    "Upload supplier CSVs to auto-match customer delivery addresses, track Customer Returns vs Courier RTO parcels, and minimize delivery losses.",
  keywords: [
    "courier rto tracker",
    "meesho return management",
    "reverse logistics",
    "customer return matching",
    "supplier return csv upload",
  ],
  openGraph: {
    title: "RTO Tracker & Reverse Logistics Return Manager",
    description:
      "Auto-match delivery addresses, track Customer Returns vs Courier RTOs, and minimize delivery losses.",
    url: "https://labelpro.in/returns",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reverse Logistics & RTO Manager - LabelPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RTO Tracker & Reverse Logistics Return Manager | LabelPro.in",
    description:
      "Auto-match delivery addresses, track Customer Returns vs Courier RTOs, and minimize delivery losses.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/returns",
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
          "name": "Return Entry & Reverse Logistics",
          "item": "https://labelpro.in/returns",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "name": "Reverse Logistics & RTO Return Manager - LabelPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web-based",
      "description":
        "Match customer returns with courier RTO parcels, identify high-return SKUs, and eliminate logistics losses.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
    },
  ],
};

export default function ReturnsLayout({ children }) {
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
