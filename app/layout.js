import "./globals.css";

export const metadata = {
  title: "LabelPro.in | Intelligent Shipping Label QR Stamper & Sorter",
  description: "High-precision PDF shipping label QR code stamper, field editor, and smart multi-attribute sorter.",
};

import { Providers } from "./components/Providers";
import { Sidebar } from "./components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="ambient-bg" />
        <Providers>
          <div className="layout-wrapper">
            <Sidebar />
            <div style={{ flex: 1, minWidth: 0, width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column", minHeight: "100%", position: "relative", zIndex: 1 }}>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
