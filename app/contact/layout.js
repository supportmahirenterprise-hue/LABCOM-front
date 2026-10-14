export const metadata = {
  title: "Contact Seller Support & Technical Help",
  description:
    "Get in touch with LabelPro customer support for assistance with batch PDF label cropping, duplicate remover, SKU sorting, and seller account help.",
  keywords: [
    "contact labelpro",
    "labelpro customer support",
    "shipping label help",
    "seller support desk",
  ],
  openGraph: {
    title: "Contact Seller Support & Technical Help",
    description:
      "Get in touch with LabelPro customer support for assistance with batch PDF label cropping, duplicate remover, SKU sorting, and seller account help.",
    url: "https://labelpro.in/contact",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact LabelPro Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Seller Support & Technical Help | LabelPro.in",
    description:
      "Get in touch with LabelPro customer support for seller assistance and technical onboarding.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/contact",
  },
};

const contactSchema = {
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
          "name": "Contact Support",
          "item": "https://labelpro.in/contact",
        },
      ],
    },
    {
      "@type": "ContactPage",
      "name": "LabelPro Customer Support",
      "description":
        "Contact support for LabelPro e-commerce shipping label studio.",
      "url": "https://labelpro.in/contact",
    },
  ],
};

export default function ContactLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {children}
    </>
  );
}
