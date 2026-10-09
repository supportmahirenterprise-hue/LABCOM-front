"use client";

import Link from "next/link";
import { ShieldCheckIcon } from "../components/Icons";

export default function PrivacyPolicyPage() {
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
          <span style={{ color: "#0F172A", fontWeight: 600 }}>Privacy Policy</span>
        </div>

        <div className="premium-glass" style={{ padding: "32px 36px", borderRadius: "20px", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79, 70, 229, 0.08)", border: "1px solid rgba(79, 70, 229, 0.2)", padding: "4px 12px", borderRadius: "9999px", color: "#4F46E5", fontSize: "0.75rem", fontWeight: 700, marginBottom: 14 }}>
            <ShieldCheckIcon size={14} color="#4F46E5" /> Safe Harbor & DPDP Act 2023 Compliant • Mahir Enterprise
          </div>
          <h1 className="heading-display" style={{ fontSize: "2.1rem", color: "#0F172A", margin: "0 0 10px 0", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Privacy Policy & Data Protection Governance
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#475569", margin: 0, maxWidth: 850, lineHeight: 1.6 }}>
            LabelPro Print Engine (operated by <b>Mahir Enterprise</b>, Ratanvav, Gujarat, India) operates with a strict zero-retention, client-side first architecture. This policy details our absolute commitment to seller privacy, ephemeral document processing, and the complete limitation of liability regarding third-party logistics and marketplace data.
          </p>
          <div style={{ marginTop: 16, fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>
            Effective Date: <b>{lastUpdated}</b> • Version: <b>4.2 (Zero-PII Storage Standard)</b> • Entity: <b>Mahir Enterprise</b>
          </div>
        </div>
      </div>

      {/* Main Legal Content Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Section 1: Core Architecture Principle */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>1</span>
            Ephemeral Client-Side Processing Architecture
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              LabelPro Print Engine operates predominantly as an in-browser client-side engine. When you upload PDF shipping labels, manifests, or courier invoices:
            </p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <b>Zero Permanent PII Storage:</b> Document parsing, barcode extraction, cropping, and QR stamping occur in the volatile memory of your local web browser via WebAssembly and JavaScript engines.
              </li>
              <li>
                <b>No Sale or Monetization of Buyer Data:</b> Mahir Enterprise does not collect, catalog, sell, lease, or monetize customer names, delivery addresses, telephone numbers, or cart items extracted from shipping documents.
              </li>
              <li>
                <b>Auto-Purge Lifecycle:</b> Any temporary buffers transmitted to our secure servers for auxiliary processing (such as automated WhatsApp document dispatch or analytical summary generation) are strictly held in volatile memory and permanently purged immediately upon task fulfillment or within a maximum retention window of 24 hours.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: Non-Affiliation & Marketplace Safe Harbor */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px", borderLeft: "4px solid #4F46E5" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>2</span>
            Absolute Third-Party & Marketplace Safe Harbor Statement
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              <b>Independent Software Utility:</b> LabelPro Print Engine is an independent productivity software utility developed by Mahir Enterprise for e-commerce warehouse operational efficiency. We are <b>NOT affiliated with, sponsored by, authorized by, maintained by, or endorsed by Meesho (Fashnear Technologies Private Limited), Flipkart, Amazon India, Delhivery, Xpressbees, Shadowfax, Ecom Express, or any of their parent corporations or subsidiaries.</b>
            </p>
            <p>
              All product names, logos, trademarks, and registered trademarks displayed or referenced within the software are the property of their respective owners. Their mention does not imply any affiliation, sponsorship, endorsement, or recommendation.
            </p>
          </div>
        </section>

        {/* Section 3: Absolute Non-Liability & Indemnification */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px", background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#92400E", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#FEF3C7", color: "#B45309", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>3</span>
            Total Limitation of Liability & User Hold-Harmless Indemnity
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#78350F", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              <b>User Discretion & Verification Obligation:</b> The seller (User) assumes sole and absolute responsibility for verifying the physical readability, barcode scan accuracy, cropping boundaries, QR placement, and recipient details of all generated labels prior to handing parcels over to 3PL logistics carriers.
            </p>
            <p>
              <b>No Liability for Lost Sales, Fines, or RTO Charges:</b> To the maximum extent permitted by applicable law, Mahir Enterprise, LabelPro, its proprietors, developers, contractors, and affiliates shall <b>NOT be liable for any direct, indirect, incidental, punitive, special, or consequential damages</b>, including but not limited to:
            </p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Courier return-to-origin (RTO) penalty charges or logistics weight discrepancies.</li>
              <li>Marketplace penalty points, suspension of seller accounts, or listing suppressions.</li>
              <li>Unreadable barcodes or thermal printer smudging caused by local printer hardware or incorrect DPI settings.</li>
              <li>Undelivered or misrouted parcels resulting from user configuration or marketplace format alterations.</li>
            </ul>
            <p>
              By using this service, you explicitly agree to indemnify, defend, and hold harmless Mahir Enterprise and LabelPro from any claims, liabilities, damages, losses, or expenses arising from your usage of the platform.
            </p>
          </div>
        </section>

        {/* Section 4: WhatsApp Business Messaging & Data Policy */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>4</span>
            WhatsApp Automation & Third-Party Messaging Disclaimers
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              When utilizing optional automated WhatsApp dispatch features:
            </p>
            <ul style={{ paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <b>User-Controlled API Keys:</b> WhatsApp dispatches are routed through user-provided API credentials or authorized gateway webhooks. Mahir Enterprise acts solely as a technical conduit.
              </li>
              <li>
                <b>Compliance with Meta Policies:</b> The User is strictly responsible for ensuring that all WhatsApp notifications, customer messages, or order summaries comply with Meta&apos;s WhatsApp Business Messaging Policies and applicable anti-spam legislation.
              </li>
              <li>
                <b>Explicit Opt-in Responsibility:</b> The User warrants that they have acquired all necessary consents from recipient phone numbers before initiating automated transmissions.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Statutory Compliance */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>5</span>
            Compliance with Information Technology Act & DPDP Act 2023
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
            <p>
              We implement reasonable security practices and procedures in compliance with the <b>Information Technology Act, 2000</b>, the <b>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</b>, and the <b>Digital Personal Data Protection Act (DPDP Act, 2023) of India</b>.
            </p>
            <p>
              All communication between your browser and our server endpoints is protected via standard TLS 1.3 encryption in transit, and access controls prevent unauthorized intrusion.
            </p>
          </div>
        </section>

        {/* Section 6: Right to Erasure & Contact */}
        <section className="premium-glass" style={{ padding: "28px 32px", borderRadius: "18px", background: "#F8FAFC" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>6</span>
            Data Protection Officer & Privacy Inquiries
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.7, margin: "0 0 16px 0" }}>
            If you have any questions regarding this Privacy Policy, wish to exercise your statutory rights regarding data erasure, or require an audit confirmation, you may contact our designated Data Protection Officer:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "16px 20px", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Official Email</div>
              <div style={{ fontSize: "0.92rem", color: "#4F46E5", fontWeight: 700, marginTop: 4 }}>support.mahirenterprise@gmail.com</div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "16px 20px", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Legal Entity &amp; Jurisdiction</div>
              <div style={{ fontSize: "0.92rem", color: "#0F172A", fontWeight: 700, marginTop: 4 }}>Mahir Enterprise, Ratanvav, Gujarat, India</div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "16px 20px", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Direct Helpline / WhatsApp</div>
              <div style={{ fontSize: "0.92rem", color: "#059669", fontWeight: 700, marginTop: 4 }}>+91 96647 20473</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
