export const metadata = {
  title: "Return Entry & Reverse Logistics Management (RTO Tracker) | LabelPro.in",
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
    title: "Return Entry & Reverse Logistics Management | LabelPro.in",
    description:
      "Auto-match delivery addresses, track Customer Returns vs Courier RTOs, and minimize delivery losses.",
    url: "https://labelpro.in/returns",
    siteName: "LabelPro.in",
    type: "website",
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
