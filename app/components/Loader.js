"use client";

import React from "react";

export function ButtonSpinner({ color = "white", size = 15 }) {
  const borderColor = color === "white" ? "rgba(255, 255, 255, 0.3)" : "rgba(79, 70, 229, 0.2)";
  const topColor = color === "white" ? "#FFFFFF" : "var(--aurora-1, #4F46E5)";
  
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
        borderTopColor: topColor,
        borderRadius: "50%",
        display: "inline-block",
        animation: "spinnerRotate 0.7s linear infinite",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  );
}

export function SkeletonBar({ width = "100%", height = 20, radius = 6, style = {} }) {
  return (
    <span
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function PageLoader({ title = "Loading Data...", subtitle = "Syncing real-time records from cloud database..." }) {
  return (
    <div className="page-loader-container" style={{ margin: "24px 0" }}>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div className="spinner-ring-lg" />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--aurora-1, #4F46E5)",
          }}
        />
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-pure, #0F172A)", margin: "0 0 6px 0" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-silver, #64748B)", margin: 0, maxWidth: 420 }}>
        {subtitle}
      </p>
    </div>
  );
}

export function TableSkeletonRows({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} style={{ borderBottom: "1px solid #F1F5F9" }}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} style={{ padding: "16px 14px" }}>
              <SkeletonBar
                height={16}
                width={cIdx === 0 ? "40px" : cIdx === 1 ? "120px" : cIdx === cols - 1 ? "90px" : "80px"}
                radius={4}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ========================================================
   DEDICATED FULL-PAGE SKELETON SCREENS
   ======================================================== */

export function SettingsSkeleton() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, width: "100%" }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SkeletonBar width={240} height={32} radius={8} />
          <SkeletonBar width={120} height={24} radius={9999} />
        </div>
        <SkeletonBar width={450} height={16} radius={4} style={{ marginTop: 10, maxWidth: "100%" }} />
      </div>

      {/* Card 1: Store Profile Skeleton */}
      <div className="premium-glass" style={{ padding: "26px 28px", borderRadius: "18px", marginBottom: 24, background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <SkeletonBar width={28} height={28} radius={8} />
          <SkeletonBar width={180} height={22} radius={6} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <SkeletonBar width={110} height={14} radius={4} style={{ marginBottom: 8 }} />
              <SkeletonBar width="100%" height={42} radius={10} />
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Print & QR Preferences Skeleton */}
      <div className="premium-glass" style={{ padding: "26px 28px", borderRadius: "18px", marginBottom: 24, background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <SkeletonBar width={28} height={28} radius={8} />
          <SkeletonBar width={220} height={22} radius={6} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <SkeletonBar width={130} height={14} radius={4} style={{ marginBottom: 8 }} />
              <SkeletonBar width="100%" height={42} radius={10} />
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: WhatsApp Dispatcher Skeleton */}
      <div className="premium-glass" style={{ padding: "26px 28px", borderRadius: "18px", marginBottom: 24, background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <SkeletonBar width={28} height={28} radius={8} />
          <SkeletonBar width={200} height={22} radius={6} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {[1, 2].map((i) => (
            <div key={i}>
              <SkeletonBar width={140} height={14} radius={4} style={{ marginBottom: 8 }} />
              <SkeletonBar width="100%" height={42} radius={10} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Button Skeleton */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SkeletonBar width={180} height={46} radius={9999} />
      </div>
    </div>
  );
}

export function TemplatesSkeleton() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 className="heading-display" style={{ fontSize: "1.6rem", color: "#0F172A", margin: 0 }}>
            Label Presets & Templates
          </h1>
          <span className="tag-pill active" style={{ fontSize: "0.72rem" }}>
            Custom Presets
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: 6, marginBottom: 0 }}>
          Save and switch between different QR positions, custom printed lines, and sorting presets with 1-click.
        </p>
      </div>

      {/* Create Template Form Skeleton */}
      <div className="premium-glass" style={{ padding: "24px 26px", borderRadius: "18px", marginBottom: 28, background: "#FFFFFF" }}>
        <SkeletonBar width={180} height={20} radius={6} style={{ marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <SkeletonBar width={90} height={14} radius={4} style={{ marginBottom: 8 }} />
              <SkeletonBar width="100%" height={42} radius={10} />
            </div>
          ))}
        </div>
      </div>

      {/* Template Cards Grid Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="premium-glass" style={{ padding: "22px 24px", borderRadius: "16px", background: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <SkeletonBar width={140} height={20} radius={6} />
              <SkeletonBar width={60} height={22} radius={9999} />
            </div>
            <SkeletonBar width="100%" height={14} radius={4} style={{ marginBottom: 8 }} />
            <SkeletonBar width="75%" height={14} radius={4} style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
              <SkeletonBar width={80} height={32} radius={8} />
              <SkeletonBar width={80} height={32} radius={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 className="heading-display" style={{ fontSize: "1.6rem", color: "#0F172A", margin: 0 }}>
            QR Scan Analytics & Insights
          </h1>
          <span className="tag-pill active" style={{ fontSize: "0.72rem", padding: "4px 12px" }}>
            Live Tracking Engine
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: 6, marginBottom: 0 }}>
          Real-time conversion metrics on how many buyers scan your package QR codes, date-wise engagement, and top-converting SKUs.
        </p>
      </div>

      {/* 4 Stat KPI Cards Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="premium-glass" style={{ padding: "22px 20px", borderRadius: "16px", background: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonBar width={100} height={14} radius={4} />
              <SkeletonBar width={32} height={32} radius={10} />
            </div>
            <SkeletonBar width={90} height={36} radius={8} style={{ marginTop: 12, marginBottom: 8 }} />
            <SkeletonBar width={120} height={14} radius={4} />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="premium-glass" style={{ padding: "24px 26px", borderRadius: "18px", marginBottom: 24, background: "#FFFFFF" }}>
        <SkeletonBar width={180} height={20} radius={6} style={{ marginBottom: 20 }} />
        <SkeletonBar width="100%" height={220} radius={12} />
      </div>

      {/* Top SKUs Table Skeleton */}
      <div className="premium-glass" style={{ padding: 0, borderRadius: "16px", overflow: "hidden", background: "#FFFFFF" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #E2E8F0" }}>
          <SkeletonBar width={200} height={20} radius={6} />
        </div>
        <div className="table-responsive-container" style={{ border: "none" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>SKU NAME</th>
                <th>TOTAL SCANS</th>
                <th>PERCENTAGE</th>
                <th>TREND</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeletonRows rows={5} cols={5} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, width: "100%" }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SkeletonBar width={260} height={32} radius={8} />
          <SkeletonBar width={100} height={24} radius={9999} />
        </div>
        <SkeletonBar width={450} height={16} radius={4} style={{ marginTop: 10, maxWidth: "100%" }} />
      </div>

      {/* Table Skeleton */}
      <div className="premium-glass" style={{ padding: 0, borderRadius: "16px", overflow: "hidden", background: "#FFFFFF" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between" }}>
          <SkeletonBar width={180} height={20} radius={6} />
          <SkeletonBar width={120} height={18} radius={6} />
        </div>
        <div className="table-responsive-container" style={{ border: "none" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>BATCH FILE NAME</th>
                <th>PAGES</th>
                <th>PROCESSED DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeletonRows rows={6} cols={6} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
