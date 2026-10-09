"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
  const lastUpdated = "October 2026";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 0 60px" }}>
      {/* Header Breadcrumb & Title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748B", marginBottom: 12 }}>
          <Link href="/" style={{ color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <span>Legal & Compliance</span>
          <span>/</span>
          <span style={{ color: "#0F172A", fontWeight: 600 }}>Terms of Service</span>
        </div>

        <div className="premium-glass" style={{ padding: "32px 36px", borderRadius: "20px", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(15, 23, 42, 0.06)", border: "1px solid rgba(15, 23, 42, 0.12)", padding: "4px 12px", borderRadius: "9999px", color: "#0F172A", fontSize: "0.75rem", fontWeight: 700, marginBottom: 14 }}>
            📜 Legally Binding Agreement
          </div>
          <h1 className="heading-display" style={{ fontSize: "2.1rem", color: "#0F172A", margin: "0 0 10px 0", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Terms &amp; Conditions of Service
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#475569", margin: 0, maxWidth: 850, lineHeight: 1.6 }}>
            Please read these Terms carefully before accessing or using LabelPro. By accessing our platform, generating PDF documents, using QR stamping, or processing logistics manifests, you agree to be unconditionally bound by these Terms and our full limitation of liability.
          </p>
          <div style={{ marginTop: 16, fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>
            Effective Date: <b>{lastUpdated}</b> • Jurisdiction: <b>Surat, Gujarat, India</b>
          </div>
        </div>
      </div>

      {/* Main Terms Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Section 1: AS-IS Software Warranty Disclaimer */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px", background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#991B1B", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#FEE2E2", color: "#B91C1C", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>1</span>
            &quot;AS-IS&quot; &amp; &quot;AS-AVAILABLE&quot; Software Warranty Disclaimer
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#7F1D1D", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              THE PLATFORM, SOFTWARE ENGINES, AND ALL ACCOMPANYING DOCUMENTATION ARE PROVIDED STRICTLY ON AN <b>&quot;AS-IS&quot;</b> AND <b>&quot;AS-AVAILABLE&quot;</b> BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, COMPATIBILITY WITH THIRD-PARTY THERMAL PRINTER HARDWARE, NON-INFRINGEMENT, OR UNINTERRUPTED ACCURACY.
            </p>
            <p>
              LabelPro does not warrant that the software will be completely error-free or that document parsing will remain compatible with future unilateral updates made by third-party e-commerce marketplaces (such as Meesho, Flipkart, or Amazon).
            </p>
          </div>
        </section>

        {/* Section 2: Complete Limitation of Financial Liability */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px", borderLeft: "4px solid #DC2626" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>2</span>
            Complete Financial Liability Cap &amp; Exclusions
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY INDIAN LAW, IN NO EVENT SHALL LABELPRO, ITS DIRECTORS, EMPLOYEES, CONTRACTORS, LICENSORS, OR AFFILIATES BE LIABLE FOR:
            </p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <b>Logistics Penalties &amp; RTO Expenses:</b> Any courier weight charges, return-to-origin fees, freight penalties, or courier transit damages.
              </li>
              <li>
                <b>Marketplace Actions:</b> Late dispatch penalties, cancellation charges, order fulfillment SLA defaults, or seller account deactivations levied by marketplaces.
              </li>
              <li>
                <b>Barcode Scanning Failures:</b> Rejected parcels resulting from low-resolution printer ribbons, damaged thermal heads, incorrect crop bounds, or courier handheld scanner limitations.
              </li>
              <li>
                <b>Direct/Indirect Damages:</b> Any loss of revenue, anticipated profits, business goodwill, customer data, or incidental/consequential damages.
              </li>
            </ul>
            <p>
              In any event, our total aggregate liability arising out of or related to your use of the platform shall not exceed the total amount actually paid by you to LabelPro in the thirty (30) days preceding the incident, or INR ₹500, whichever is less.
            </p>
          </div>
        </section>

        {/* Section 3: User Verification Obligation */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>3</span>
            User Responsibilities &amp; Label Verification Duty
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              As an authorized seller and user of this platform, you acknowledge and agree that:
            </p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <b>Mandatory Test Print:</b> You must always print a sample test page using the &quot;Test Sample (Page 1)&quot; feature to verify QR alignment, text clarity, and barcode scannability prior to executing full batch downloads.
              </li>
              <li>
                <b>Third-Party Content Legality:</b> You are solely responsible for ensuring that all QR URLs, store promotion links, brand logos, and custom text stamped onto shipping parcels comply with all applicable advertising, intellectual property, and consumer protection laws.
              </li>
              <li>
                <b>Account Safeguards:</b> You are responsible for safeguarding your login credentials and ensuring unauthorized parties do not access your account dashboard.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Intellectual Property */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>4</span>
            Intellectual Property &amp; Restrictions
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              All software source code, client-side PDF sorting algorithms, UI components, vector icons, stylesheets, and documentation are the exclusive intellectual property of LabelPro.
            </p>
            <p>
              You agree not to modify, reverse-engineer, decompile, duplicate, distribute, sell, or create derivative works of any part of this software without explicit prior written authorization.
            </p>
          </div>
        </section>

        {/* Section 5: Governing Law & Jurisdiction */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px", background: "#F8FAFC" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>5</span>
            Governing Law, Arbitration &amp; Exclusive Jurisdiction
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <b>Republic of India</b>.
            </p>
            <p>
              Any disputes, controversies, or claims arising out of or in connection with these Terms or the use of LabelPro shall be subject to the exclusive jurisdiction of the competent courts situated in <b>Surat, Gujarat, India</b>.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
