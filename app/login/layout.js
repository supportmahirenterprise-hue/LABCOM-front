export const metadata = {
  title: "Seller Login & Portal Authentication",
  description:
    "Log in to your LabelPro seller account to access PDF label processing, SKU batch sorters, and district demand intelligence.",
  robots: {
    index: false,
    follow: false,
  },
  keywords: ["labelpro login", "seller portal login"],
  openGraph: {
    title: "Seller Login & Portal Authentication",
    description:
      "Log in to access PDF label processing, SKU batch sorters, and district demand intelligence.",
    url: "https://labelpro.in/login",
    siteName: "LabelPro.in",
    type: "website",
    images: [
      {
        url: "https://labelpro.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "LabelPro Seller Login",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seller Login & Portal Authentication | LabelPro.in",
    description:
      "Log in to your LabelPro seller account.",
    images: ["https://labelpro.in/og-image.png"],
  },
  alternates: {
    canonical: "https://labelpro.in/login",
  },
};

export default function LoginLayout({ children }) {
  return children;
}
