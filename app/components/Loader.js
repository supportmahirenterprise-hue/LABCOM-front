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
