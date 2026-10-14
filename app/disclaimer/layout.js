export const metadata = {
  title: "Legal Disclaimer & Marketplace Safe Harbor",
  description:
    "Legal disclaimer regarding marketplace compatibility. LabelPro is an independent third-party tool compatible with Meesho, Flipkart, and Amazon shipping label formats.",
  keywords: [
    "labelpro legal disclaimer",
    "marketplace compatibility disclaimer",
  ],
  openGraph: {
    title: "Legal Disclaimer & Marketplace Safe Harbor",
    description:
      "Legal disclaimer regarding marketplace compatibility with Meesho, Flipkart, and Amazon formats.",
    url: "https://labelpro.in/disclaimer",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Legal Disclaimer - LabelPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Disclaimer & Marketplace Safe Harbor | LabelPro.in",
    description:
      "Independent third-party tool compatible with Meesho, Flipkart, and Amazon shipping label formats.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/disclaimer",
  },
};

export default function DisclaimerLayout({ children }) {
  return children;
}
