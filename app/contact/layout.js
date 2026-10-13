export const metadata = {
  title: "Contact Support | LabelPro E-Commerce Label Studio",
  description:
    "Get in touch with LabelPro customer support for assistance with batch PDF label cropping, duplicate remover, SKU sorting, and seller account help.",
  keywords: [
    "contact labelpro",
    "labelpro customer support",
    "shipping label help",
    "seller support desk",
  ],
  openGraph: {
    title: "Contact Support | LabelPro E-Commerce Label Studio",
    description:
      "Get in touch with LabelPro customer support for assistance with batch PDF label cropping, duplicate remover, SKU sorting, and seller account help.",
    url: "https://labelpro.in/contact",
    siteName: "LabelPro",
    type: "website",
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
