export const metadata = {
  title: "Seller Account & Store Settings",
  description:
    "Configure seller store profile, brand identity, support contact details, default QR positions, and WhatsApp auto-dispatch API.",
  robots: {
    index: false,
    follow: false,
  },
  keywords: [
    "labelpro settings",
    "whatsapp media dispatcher setup",
    "seller store profile",
    "qr stamper defaults",
  ],
  openGraph: {
    title: "Seller Account & Store Settings",
    description:
      "Configure store profile, default QR positions, and WhatsApp auto-dispatch API.",
    url: "https://labelpro.in/settings",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "LabelPro Settings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seller Account & Store Settings | LabelPro.in",
    description:
      "Configure store profile and defaults.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/settings",
  },
};

export default function SettingsLayout({ children }) {
  return children;
}
