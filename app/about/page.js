"use client";

import Link from "next/link";

export default function AboutUsPage() {
  const STATS = [
    { label: "Active Marketplace Sellers", value: "10,000+", icon: "🏪" },
    { label: "Shipping Labels Processed", value: "5,000,000+", icon: "📦" },
    { label: "Client-Side Processing Delay", value: "0 ms", icon: "⚡" },
    { label: "Barcode First-Scan Success", value: "99.98%", icon: "🎯" },
  ];

  const PILLARS = [
    {
      title: "0ms Client-Side Instant Engine",
      description:
        "Unlike legacy tools that upload multi-gigabyte PDF batches to remote servers causing massive queues, LabelPro processes everything directly inside your browser memory with zero waiting time.",
      icon: "⚡",
      badge: "Performance",
    },
    {
      title: "Smart Multi-Attribute Batch Sorter",
      description:
        "Automatically group and sort label pages by SKU, High Quantity First, Order Date, or Customer Name, cutting warehouse packing & dispatch time by over 65%.",
      icon: "📊",
      badge: "Logistics Automation",
    },
    {
      title: "Store Growth QR & Brand Stamper",
      description:
        "Turn every shipping parcel into a customer retention channel. Stamp high-contrast, scannable Meesho or Instagram store QR codes and vernacular state greetings.",
      icon: "🏷️",
      badge: "Brand Scaling",
    },
    {
      title: "Reverse Logistics & Return Intelligence",
      description:
        "Track RTO and customer returns with real-time barcode scanning, state-level return risk scoring, and channel distribution analytics to protect seller margins.",
      icon: "🛡️",
      badge: "Margin Protection",
    },
  ];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: "20px 0 60px" }}>
      {/* Breadcrumb & Hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748B", marginBottom: 12 }}>
          <Link href="/" style={{ color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <span>Company</span>
          <span>/</span>
          <span style={{ color: "#0F172A", fontWeight: 600 }}>About Us</span>
        </div>

        <div
          className="premium-glass"
          style={{
            padding: "44px 40px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%)", border: "1px solid #C7D2FE", padding: "5px 14px", borderRadius: "9999px", color: "#4F46E5", fontSize: "0.78rem", fontWeight: 700, marginBottom: 16 }}>
            🚀 Mahir Enterprise • LabelPro Print Engine
          </div>

          <h1 className="heading-display" style={{ fontSize: "2.4rem", color: "#0F172A", margin: "0 0 14px 0", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            Empowering E-Commerce Sellers with Precision Warehouse Automation
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#475569", margin: "0 0 24px 0", maxWidth: 880, lineHeight: 1.65 }}>
            Developed by <b>Mahir Enterprise</b> (Ratanvav, Gujarat), LabelPro was engineered to solve the most painful bottlenecks faced by high-volume e-commerce sellers across India: slow, clunky shipping label formatting, unorganized batch sorting, and missed customer retention opportunities.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(79, 70, 229, 0.3)",
              }}
            >
              Open Print Studio →
            </Link>

            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
        {STATS.map((stat, idx) => (
          <div
            key={idx}
            className="premium-glass"
            style={{
              padding: "24px 20px",
              borderRadius: "18px",
              textAlign: "center",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{stat.icon}</div>
            <div className="heading-display" style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Core Innovation Pillars */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 className="heading-display" style={{ fontSize: "1.6rem", color: "#0F172A", fontWeight: 800, margin: "0 0 6px 0" }}>
            Engineered for High-Velocity Logistics
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#64748B", margin: 0 }}>
            Four foundational innovations that make LabelPro the industry standard for online retailers.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20 }}>
          {PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="premium-glass"
              style={{
                padding: "28px 24px",
                borderRadius: "20px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.8rem" }}>{pillar.icon}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
                  {pillar.badge}
                </span>
              </div>
              <h3 style={{ fontSize: "1.1rem", color: "#0F172A", fontWeight: 700, margin: 0 }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Architecture Statement */}
      <div className="premium-glass" style={{ padding: "32px 36px", borderRadius: "20px", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", color: "#FFFFFF", border: "1px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: "1.5rem" }}>🔒</span>
          <h3 className="heading-display" style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
            Privacy by Design: Zero-Retention Architecture
          </h3>
        </div>
        <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.65, margin: "0 0 16px 0", maxWidth: 800 }}>
          Your business data, customer addresses, order lists, and proprietary SKUs remain completely confidential. All PDF manipulation runs on-device inside your browser without permanent cloud data recording.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.82rem", color: "#94A3B8" }}>
          <span>✓ Mahir Enterprise (Ratanvav, Gujarat)</span>
          <span>✓ 100% Client-Side In-Memory Engine</span>
          <span>✓ Zero Third-Party Data Sharing</span>
          <span>✓ Full DPDP Act 2023 &amp; IT Act 2000 Compliance</span>
        </div>
      </div>
    </div>
  );
}
