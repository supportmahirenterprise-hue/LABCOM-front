import "./globals.css";

export const metadata = {
  title: "Veloura Label QR Engine | Intelligent Shipping Label QR Stamper & Sorter",
  description: "High-precision PDF shipping label QR code stamper, field editor, and smart multi-attribute sorter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
