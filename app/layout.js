import "./globals.css";
import { Providers } from "./components/Providers";
import { Sidebar } from "./components/Sidebar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labelpro.in";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LabelPro.in | Intelligent Shipping Label QR Stamper & Sorter",
    template: "%s | LabelPro.in",
  },
  description:
    "High-precision PDF shipping label QR code stamper, interactive field editor, district demand intelligence, and 1-click SKU batch sorter for Meesho and e-commerce sellers.",
  keywords: [
    "meesho label sorter",
    "shipping label qr stamper",
    "pdf label cropper",
    "meesho return management",
    "e-commerce order analytics",
    "district demand intelligence",
    "courier rto tracking",
  ],
  authors: [{ name: "LabelPro Team" }],
  creator: "LabelPro Engine",
  publisher: "LabelPro Engine",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "LabelPro.in | Intelligent Shipping Label QR Stamper & Sorter",
    description:
      "High-precision PDF shipping label QR stamper, field editor, district demand intelligence, and 1-click batch sorter for e-commerce sellers.",
    siteName: "LabelPro.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "LabelPro.in | Intelligent Shipping Label QR Stamper & Sorter",
    description:
      "High-precision PDF shipping label QR stamper, field editor, and smart multi-attribute batch sorter.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LabelPro Print Engine",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web-based",
  "description": "Intelligent PDF shipping label QR code stamper, SKU sorter, and reverse logistics return management platform for e-commerce sellers.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "creator": {
    "@type": "Organization",
    "name": "LabelPro Engine",
    "url": siteUrl
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body>
        <div className="ambient-bg" />
        <Providers>
          <div className="layout-wrapper">
            <Sidebar />
            <div className="page-transition" style={{ flex: 1, minWidth: 0, width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column", minHeight: "100%", position: "relative", zIndex: 1 }}>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
