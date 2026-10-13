export const metadata = {
  title: "Privacy Policy | LabelPro - 100% Client-Side Privacy",
  description:
    "LabelPro ensures zero data leaks with 100% in-browser client-side processing. Your customer orders, addresses, and shipping label PDFs never leave your device.",
  keywords: [
    "labelpro privacy policy",
    "client-side pdf processing privacy",
    "e-commerce data security",
    "shipping label privacy compliance",
  ],
  openGraph: {
    title: "Privacy Policy | LabelPro - 100% Client-Side Privacy",
    description:
      "LabelPro ensures zero data leaks with 100% in-browser client-side processing. Your customer orders and addresses never leave your device.",
    url: "https://labelpro.in/privacy",
    siteName: "LabelPro",
    type: "website",
  },
  alternates: {
    canonical: "https://labelpro.in/privacy",
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
      "name": "Privacy Policy",
      "item": "https://labelpro.in/privacy",
    },
  ],
};

export default function PrivacyLayout({ children }) {
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
