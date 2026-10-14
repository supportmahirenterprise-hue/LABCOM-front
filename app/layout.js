import "./globals.css";
import { Providers } from "./components/Providers";
import { Sidebar } from "./components/Sidebar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labelpro.in";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "India's First E-Commerce Label Studio | Duplicate Remover • Label Cropper • Label Sorter",
    template: "%s | LabelPro.in",
  },
  description:
    "India's first E-Commerce Label Studio: Duplicate Remover • Label Cropper • Label Sorter • Buyer & Return Analyser. 4x6 thermal cropping, SKU sorting, and zero double dispatches for Meesho, Flipkart & Amazon.",
  keywords: [
    "india's first e-commerce label studio",
    "e-commerce label studio",
    "duplicate label remover",
    "meesho duplicate label remover",
    "label cropper",
    "meesho label cropper",
    "flipkart label crop",
    "amazon shipping label cropper",
    "label sorter",
    "sku label sorter",
    "buyer & return analyser",
    "e-commerce return management",
    "courier rto tracking",
    "thermal shipping label qr stamper",
    "district demand intelligence",
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
    locale: "en_IN",
    url: siteUrl,
    title: "India's First E-Commerce Label Studio | Duplicate Remover • Label Cropper • Label Sorter",
    description:
      "India's first E-Commerce Label Studio: Duplicate Remover • Label Cropper • Label Sorter • Buyer & Return Analyser. Process Meesho, Flipkart, and Amazon shipping labels with zero duplicate dispatches.",
    siteName: "LabelPro.in",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "LabelPro - India's First E-Commerce Label Studio",
      },
      {
        url: `${siteUrl}/icon.png`,
        width: 512,
        height: 512,
        alt: "LabelPro App Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "India's First E-Commerce Label Studio | Duplicate Remover • Label Cropper • Label Sorter",
    description:
      "India's first E-Commerce Label Studio: Duplicate Remover • Label Cropper • Label Sorter • Buyer & Return Analyser.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
};

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "LabelPro",
      "alternateName": "India's First E-Commerce Label Studio",
      "description": "India's first E-Commerce Label Studio: Duplicate Remover • Label Cropper • Label Sorter • Buyer & Return Analyser.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "LabelPro",
      "url": siteUrl,
      "logo": `${siteUrl}/icon.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-9876543210",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["en", "hi"]
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      "name": "India's First E-Commerce Label Studio - LabelPro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web-based",
      "description": "India's first E-Commerce Label Studio: Duplicate Remover • Label Cropper • Label Sorter • Buyer & Return Analyser. Free 4x6 thermal cropping, cross-batch duplicate detection, SKU sorting, and buyer intelligence for Indian marketplace sellers.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "featureList": [
        "Duplicate Label Remover (cross-batch PDF comparison)",
        "4x6 Thermal Label Cropper for Meesho, Flipkart & Amazon",
        "Smart SKU & Courier Partner Sorter",
        "Buyer & Return Analyser with District Demand Heatmap",
        "Dynamic Marketing QR Code Stamper",
        "100% Client-Side Privacy-First Processing"
      ],
      "creator": {
        "@id": `${siteUrl}/#organization`
      }
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#sitelinks`,
      "name": "LabelPro Main Navigation",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Duplicate Label Remover",
          "description": "Compare two shipping label PDF batches, eliminate duplicate orders, and prevent double dispatch losses.",
          "url": `${siteUrl}/remove-duplicate`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Thermal Label Studio",
          "description": "Auto crop Meesho, Flipkart & Amazon shipping labels to 4x6 thermal format with SKU sorting and QR stamping.",
          "url": `${siteUrl}/`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Customer Intelligence & District Demand",
          "description": "Identify high-volume order hubs vs low-demand districts, repeat buyer rates, and SKU pause matrix.",
          "url": `${siteUrl}/customer-analysis`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Return Entry & Reverse Logistics",
          "description": "Upload supplier return CSVs to auto-match customer delivery addresses, reasons, and tracking links.",
          "url": `${siteUrl}/returns`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "QR Scan Analytics",
          "description": "Real-time conversion metrics on how many buyers scan package QR codes and top-converting SKUs.",
          "url": `${siteUrl}/analytics`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "About LabelPro",
          "description": "Learn about India's first intelligent e-commerce label studio built for Indian marketplace sellers.",
          "url": `${siteUrl}/about`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Privacy Policy",
          "description": "100% in-browser client-side PDF processing. Your customer orders and addresses never leave your device.",
          "url": `${siteUrl}/privacy`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 8,
          "name": "Contact Support",
          "description": "Get dedicated seller assistance, onboarding support, and technical help.",
          "url": `${siteUrl}/contact`
        }
      ]
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" async={false}></script>
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
