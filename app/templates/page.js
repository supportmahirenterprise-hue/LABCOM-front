"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "../components/Modal";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

function ZapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // New Template Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enableQr, setEnableQr] = useState(true);
  const [qrText, setQrText] = useState("https://www.meesho.com/themahirenterprise");
  const [detailText, setDetailText] = useState("Scan to Follow Meesho Store!\nOrder: {orderNo}\nSKU: {sku}");
  const [qrX, setQrX] = useState(30);
  const [qrY, setQrY] = useState(30);
  const [qrSize, setQrSize] = useState(90);
  const [fontSize, setFontSize] = useState(8);
  const [sortBy, setSortBy] = useState("sku");
  const [sortOrder, setSortOrder] = useState("asc");
  const [creating, setCreating] = useState(false);

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

  async function fetchTemplates() {
    if (!session?.user?.email) return;
    try {
      const userEmail = session.user.email;
      const res = await fetch(
        `${BACKEND_URL}/api/templates?email=${encodeURIComponent(userEmail)}`,
        {
          headers: { "x-user-email": userEmail },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchTemplates();
    }
  }, [status, session?.user?.email]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a template name", "error");
      return;
    }
    if (!session?.user?.email) {
      showToast("Please log in first", "error");
      return;
    }
    setCreating(true);
    try {
      const userEmail = session.user.email;
      const res = await fetch(`${BACKEND_URL}/api/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: userEmail,
          name,
          description,
          enableQr,
          qrText,
          detailText,
          qrX,
          qrY,
          qrSize,
          fontSize,
          sortBy,
          sortOrder,
        }),
      });

      if (!res.ok) throw new Error("Failed to save template");

      showToast("New template saved successfully!", "success");
      setShowModal(false);
      setName("");
      setDescription("");
      fetchTemplates();
    } catch (err) {
      showToast(err.message || "Error creating template", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const userEmail = session?.user?.email || "";
      const res = await fetch(
        `${BACKEND_URL}/api/templates?id=${id}&email=${encodeURIComponent(userEmail)}`,
        {
          method: "DELETE",
          headers: { "x-user-email": userEmail },
        }
      );
      if (!res.ok) throw new Error("Failed to delete template");
      showToast("Template removed", "success");
      fetchTemplates();
    } catch (err) {
      showToast(err.message || "Error deleting template", "error");
    }
  }

  async function handleApply(tpl) {
    try {
      const userEmail = session?.user?.email || "";
      // Save this template as active user settings in Node.js backend
      await fetch(`${BACKEND_URL}/api/user/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: userEmail,
          enableQr: tpl.enableQr,
          qrText: tpl.qrText,
          detailText: tpl.detailText,
          qrX: tpl.qrX,
          qrY: tpl.qrY,
          qrSize: tpl.qrSize,
          fontSize: tpl.fontSize,
          sortBy: tpl.sortBy,
          sortOrder: tpl.sortOrder,
        }),
      });
      showToast(`Applied "${tpl.name}"! Redirecting to Studio...`, "success");
      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (err) {
      showToast("Failed to apply template", "error");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: "40px 0", color: "var(--text-silver)", fontSize: "0.9rem" }}>
        Loading templates...
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
              Label Presets & Templates
            </h1>
            <span className="tag-pill active" style={{ fontSize: "0.72rem" }}>
              {templates.length} Custom Presets
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-silver)", marginTop: 6, marginBottom: 0 }}>
            Save and switch between different QR positions, custom printed lines, and sorting presets with 1-click.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 18px" }}>
            ← Back to Studio
          </Link>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "0.85rem", padding: "10px 22px" }}
          >
            + Create New Template
          </button>
        </div>
      </div>

      {/* Template Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
        {templates.map((tpl) => (
          <div
            key={tpl._id}
            className="premium-glass"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
                <h3 className="heading-display" style={{ fontSize: "1.05rem", color: "var(--text-pure)", margin: 0, flex: 1 }}>
                  {tpl.name}
                </h3>
                <span
                  className={tpl.enableQr ? "tag-pill badge-emerald" : "tag-pill badge-slate"}
                  style={{
                    fontSize: "0.72rem",
                    padding: "3px 10px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {tpl.enableQr ? "QR Stamp Active" : "Sort Only"}
                </span>
              </div>

              <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 16, lineHeight: 1.4 }}>
                {tpl.description || "No description provided."}
              </p>

              <div className="code-preview-box" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "#64748B", marginBottom: 6 }}>
                  <span>QR Destination:</span>
                  <span style={{ color: "#0284C7", fontFamily: "var(--font-mono)", fontWeight: 600, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tpl.qrText || "N/A"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "#64748B", marginBottom: 6 }}>
                  <span>Position:</span>
                  <span style={{ color: "#0F172A", fontWeight: 600 }}>X: {tpl.qrX}pt | Y: {tpl.qrY}pt | Size: {tpl.qrSize}pt</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "#64748B" }}>
                  <span>Sorting:</span>
                  <span style={{ color: "#0F172A", fontWeight: 600, textTransform: "capitalize" }}>
                    {tpl.sortBy === "sku" ? "SKU (High Qty First)" : tpl.sortBy} ({tpl.sortOrder})
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: "1px solid #E2E8F0" }}>
              <button
                className="btn-primary"
                onClick={() => handleApply(tpl)}
                style={{ flex: 1, padding: "8px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <ZapIcon /> Apply to Studio
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleDelete(tpl._id)}
                style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#DC2626", borderColor: "#FCA5A5", background: "#FEF2F2" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Template Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        maxWidth={560}
        style={{ padding: "26px 30px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 14 }}>
          <h3 className="heading-display" style={{ fontSize: "1.2rem", color: "#0F172A", margin: 0 }}>
            Create Custom Template
          </h3>
          <button
            onClick={() => setShowModal(false)}
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: "50%", width: 32, height: 32, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 6 }}>
              Template Name *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Diwali Mega Sale QR Template"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 6 }}>
              Description
            </label>
            <input
              className="input-field"
              placeholder="e.g. For festival orders with promo discount text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
            <input
              type="checkbox"
              id="modal-enableQr"
              checked={enableQr}
              onChange={(e) => setEnableQr(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--aurora-1)", cursor: "pointer" }}
            />
            <label htmlFor="modal-enableQr" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-pure)" }}>
              Enable QR Stamper in this template
            </label>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 6 }}>
              QR Code URL / Target
            </label>
            <input
              className="input-field input-field-mono"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 6 }}>
              Printed Text Lines (Next to QR)
            </label>
            <textarea
              className="input-field input-field-mono"
              style={{ height: 60 }}
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-silver)", marginBottom: 4 }}>
                X Offset (pt)
              </label>
              <input
                type="number"
                className="input-field"
                value={qrX}
                onChange={(e) => setQrX(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-silver)", marginBottom: 4 }}>
                Y Offset (pt)
              </label>
              <input
                type="number"
                className="input-field"
                value={qrY}
                onChange={(e) => setQrY(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={creating}
            >
              {creating ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
