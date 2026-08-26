"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: "40px 0", color: "var(--text-silver)", fontSize: "0.9rem" }}>
        ⏳ Loading your batch processing history...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, position: "relative", width: "100%", maxWidth: "100%" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 9999,
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="heading-display" style={{ fontSize: "1.6rem", color: "var(--text-pure)", margin: 0 }}>
              Batch Generation History
            </h1>
            <span className="tag-pill active" style={{ fontSize: "0.72rem" }}>
              {history.length} Logged Runs
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-silver)", marginTop: 6, marginBottom: 0 }}>
            Audit log of all Meesho shipping label PDFs generated, sorted, and stamped through your account.
          </p>
        </div>

        <div>
          <Link href="/" className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 18px" }}>
            ← Back to Studio
          </Link>
        </div>
      </div>

      {/* History Table Card */}
      <div className="premium-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-pure)" }}>
            Processed Batches Log
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-silver)" }}>
            Realtime cloud records from MongoDB
          </span>
        </div>

        {history.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-silver)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📂</div>
            <p style={{ fontWeight: 600, color: "var(--text-pure)", fontSize: "1rem", margin: 0 }}>
              No batch runs recorded yet
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", marginTop: 6 }}>
              Upload your shipping label PDF in the Studio and click Generate to log your first batch!
            </p>
            <Link href="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: 18 }}>
              ⚡ Go to Studio
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "160px" }}>Date & Time</th>
                  <th style={{ width: "240px" }}>File Name</th>
                  <th style={{ width: "110px" }}>Type</th>
                  <th style={{ width: "100px" }}>Pages</th>
                  <th style={{ width: "150px" }}>Sort Rule</th>
                  <th style={{ width: "140px" }}>QR Stamper</th>
                  <th style={{ width: "110px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "Just now";
                  return (
                    <tr key={item._id}>
                      <td style={{ color: "var(--text-silver)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                        {dateStr}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-pure)" }}>
                        📄 {item.fileName}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "3px 8px",
                            borderRadius: "var(--radius-full)",
                            background: item.isSample ? "rgba(249, 115, 22, 0.15)" : "rgba(79, 172, 254, 0.15)",
                            color: item.isSample ? "#fb923c" : "var(--aurora-1)",
                            border: `1px solid ${item.isSample ? "rgba(249, 115, 22, 0.3)" : "rgba(79, 172, 254, 0.3)"}`,
                            fontWeight: 600,
                          }}
                        >
                          {item.isSample ? "🧪 Page 1 Test" : "⚡ Full Batch"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--aurora-1)" }}>
                        {item.pageCount} {item.pageCount === 1 ? "page" : "pages"}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-silver)", textTransform: "capitalize" }}>
                        {item.sortBy === "sku" ? "SKU (High Qty First)" : item.sortBy} ({item.sortOrder})
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: item.enableQr ? "var(--accent-emerald)" : "var(--text-dim)",
                            fontWeight: 500,
                          }}
                        >
                          {item.enableQr ? "✅ Enabled" : "🚫 Disabled"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "3px 8px",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "var(--accent-emerald)",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            fontWeight: 600,
                          }}
                        >
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
