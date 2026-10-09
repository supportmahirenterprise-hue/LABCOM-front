"use client";

import Link from "next/link";
import { ScaleIcon } from "../components/Icons";

export default function DisclaimerPage() {
  const lastUpdated = "October 2026";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 0 60px" }}>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748B", marginBottom: 12 }}>
          <Link href="/" style={{ color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <span>Legal & Compliance</span>
          <span>/</span>
          <span style={{ color: "#0F172A", fontWeight: 600 }}>Legal Disclaimer</span>
        </div>

        <div className="premium-glass" style={{ padding: "32px 36px", borderRadius: "20px", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)", padding: "4px 12px", borderRadius: "9999px", color: "#DC2626", fontSize: "0.75rem", fontWeight: 700, marginBottom: 14 }}>
            <ScaleIcon size={14} color="#DC2626" /> Legal Safe Harbor &amp; Trademark Notice • Mahir Enterprise
          </div>
          <h1 className="heading-display" style={{ fontSize: "2.1rem", color: "#0F172A", margin: "0 0 10px 0", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Legal Disclaimer &amp; Safe Harbor Statement
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#475569", margin: 0, maxWidth: 850, lineHeight: 1.6 }}>
            This disclaimer establishes the non-affiliation status, intellectual property boundaries, and hardware compatibility limitations of LabelPro Print Engine (operated by <b>Mahir Enterprise</b>, Ratanvav, Gujarat).
          </p>
          <div style={{ marginTop: 16, fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>
            Last Reviewed: <b>{lastUpdated}</b> • Entity: <b>Mahir Enterprise</b>
          </div>
        </div>
      </div>

      {/* Main Disclaimer Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Section 1: Non-Affiliation */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14 }}>
            1. Third-Party Marketplace Non-Affiliation Notice
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              LabelPro Print Engine is an independent third-party software utility built by Mahir Enterprise to assist sellers in document formatting and warehouse organization.
            </p>
            <p>
              <b>We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with:</b>
            </p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><b>Meesho</b> (Fashnear Technologies Pvt. Ltd.) or any of its subsidiaries or affiliates.</li>
              <li><b>Flipkart Internet Private Limited</b> or Walmart Inc.</li>
              <li><b>Amazon Seller Services Private Limited</b> or Amazon.com, Inc.</li>
              <li><b>Logistics Partners:</b> Delhivery, Xpressbees, Shadowfax, Ecom Express, Bluedart, DTDC, India Post.</li>
            </ul>
            <p>
              The official websites of these entities may be found at their respective registered domain names. The names &quot;Meesho&quot;, &quot;Flipkart&quot;, &quot;Amazon&quot;, as well as related names, marks, emblems, and images are registered trademarks of their respective owners.
            </p>
          </div>
        </section>

        {/* Section 2: Data Extraction & OCR Disclaimer */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14 }}>
            2. Document Parsing &amp; Regex Accuracy
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              LabelPro utilizes automated text layer parsing and heuristic regular expressions to identify SKUs, order numbers, quantities, and customer details from PDF files uploaded by the User.
            </p>
            <p>
              Because third-party marketplace PDF structures may change without notice, <b>LabelPro does not guarantee 100% automated extraction accuracy for all legacy or unstandardized PDF formats</b>. The seller retains sole responsibility for inspecting and verifying all extracted field data in the editable table prior to batch processing.
            </p>
          </div>
        </section>

        {/* Section 3: Hardware & Print Compatibility */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14 }}>
            3. Thermal Printer Compatibility &amp; Barcode Readability
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              Print quality, thermal darkness, label dimensions, and barcode scan efficiency depend substantially on the User&apos;s physical printer hardware, print head cleanliness, driver DPI settings (e.g. 203 DPI vs 300 DPI), and label roll paper quality.
            </p>
            <p>
              Mahir Enterprise and LabelPro shall not be held liable for parcels returned, rejected, or delayed by logistics carriers due to barcode smudging or hardware-level printing defects. Users are strictly advised to run a test sample page prior to high-volume printing.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
