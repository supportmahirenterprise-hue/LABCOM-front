"use client";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "75vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: 18,
      }}
    >
      <div
        className="premium-glass"
        style={{
          padding: "36px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          borderRadius: "24px",
          boxShadow: "0 10px 40px -10px rgba(79, 70, 229, 0.12)",
        }}
      >
        <div style={{ position: "relative", width: 50, height: 50 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid #E2E8F0",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "#4F46E5",
              borderRightColor: "#0284C7",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>
            Loading Studio Module...
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 4 }}>
            Preparing smooth workspace environment
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
