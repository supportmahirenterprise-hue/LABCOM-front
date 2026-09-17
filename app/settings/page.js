"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Store Profile (Optional)
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [customNote, setCustomNote] = useState("");

  // Default Stamping & Sorting Preferences
  const [enableQr, setEnableQr] = useState(true);
  const [qrText, setQrText] = useState("https://www.meesho.com/themahirenterprise");
  const [detailText, setDetailText] = useState(
    "Scan to Follow Meesho Store!\nOrder: {orderNo}\nSKU: {sku}"
  );
  const [qrX, setQrX] = useState(30);
  const [qrY, setQrY] = useState(30);
  const [qrSize, setQrSize] = useState(90);
  const [fontSize, setFontSize] = useState(8);
  const [sortBy, setSortBy] = useState("sku");
  const [sortOrder, setSortOrder] = useState("asc");
  const [downloadSummary, setDownloadSummary] = useState(false);

  // WhatsApp Dispatcher Configuration
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [waApiKey, setWaApiKey] = useState("wa_c6854599bd4b7a54cad78edbdd6ace51");
  const [waBearerToken, setWaBearerToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTVkZjQ3MzBjOWQwZTA0Nzg2OTBkMDkiLCJ1c2VybmFtZSI6IlZpc2hhbCIsImlhdCI6MTc4ODc4Mjg2MSwiZXhwIjoxNzkxMzc0ODYxfQ.mfXOSRinxqUpVpXBpaLQ4wHwaz0i9_Ni7RTxOi19k-4"
  );
  const [waReceiverNumber, setWaReceiverNumber] = useState("918140148878");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingWa, setTestingWa] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Load Settings on Mount
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    async function load() {
      try {
        const userEmail = session.user.email;
        const res = await fetch(
          `/api/user/settings?email=${encodeURIComponent(userEmail)}`,
          {
            headers: { "x-user-email": userEmail },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const s = data.settings;
            if (s.storeName !== undefined) setStoreName(s.storeName);
            if (s.phone !== undefined) setPhone(s.phone);
            if (s.supportEmail !== undefined) setSupportEmail(s.supportEmail);
            if (s.storeUrl !== undefined) setStoreUrl(s.storeUrl);
            if (s.instagramHandle !== undefined) setInstagramHandle(s.instagramHandle);
            if (s.customNote !== undefined) setCustomNote(s.customNote);

            if (s.enableQr !== undefined) setEnableQr(s.enableQr);
            if (s.qrText !== undefined) setQrText(s.qrText);
            if (s.detailText !== undefined) setDetailText(s.detailText);
            if (s.qrX !== undefined) setQrX(s.qrX);
            if (s.qrY !== undefined) setQrY(s.qrY);
            if (s.qrSize !== undefined) setQrSize(s.qrSize);
            if (s.fontSize !== undefined) setFontSize(s.fontSize);
            if (s.sortBy !== undefined) setSortBy(s.sortBy);
            if (s.sortOrder !== undefined) setSortOrder(s.sortOrder);
            if (s.downloadSummary !== undefined) setDownloadSummary(s.downloadSummary);

            if (s.enableWhatsApp !== undefined) setEnableWhatsApp(s.enableWhatsApp);
            if (s.waApiKey !== undefined) setWaApiKey(s.waApiKey);
            if (s.waBearerToken !== undefined) setWaBearerToken(s.waBearerToken);
            if (s.waReceiverNumber !== undefined) setWaReceiverNumber(s.waReceiverNumber);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  // Save Settings Handler
  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!session?.user?.email) {
      showToast("Please log in first", "error");
      return;
    }
    setSaving(true);
    try {
      const userEmail = session.user.email;
      const res = await fetch(`/api/user/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: userEmail,
          storeName,
          phone,
          supportEmail,
          storeUrl,
          instagramHandle,
          customNote,
          enableQr,
          qrText,
          detailText,
          qrX,
          qrY,
          qrSize,
          fontSize,
          sortBy,
          sortOrder,
          downloadSummary,
          enableWhatsApp,
          waApiKey,
          waBearerToken,
          waReceiverNumber,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      showToast("✅ Settings saved successfully to your cloud account!", "success");
    } catch (err) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  // Test WhatsApp Dispatch Handler
  async function handleTestWhatsApp() {
    setTestingWa(true);
    try {
      const userEmail = session?.user?.email || "";
      const targetNum = waReceiverNumber || "918140148878";
      const testRes = await fetch(`${BACKEND_URL}/api/whatsapp/send-media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
          "x-internal-secret": "core-engine-internal",
        },
        body: JSON.stringify({
          number: targetNum,
          fileData:
            "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UaXRsZSAoVGVzdCk+PgplbmRvYmoKMiAwIG9iagocPDAvUGFnZXMgMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvQ291bnQgMTAvS2lkcyBbNCAwIFJdPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvUGFnZT4+CmVuZG9iagp0cmFpbGVyCjw8L1Jvb3QgMiAwIFI+PgolJUVPRg==",
          fileName: "test_whatsapp_delivery.pdf",
          caption: "📲 WhatsApp Settings Test Message",
          typeName: "Test WhatsApp Message",
        }),
      });

      if (testRes.ok) {
        showToast(`📲 Test WhatsApp message sent successfully to ${targetNum}!`, "success");
      } else {
        throw new Error("Failed to send test WhatsApp message");
      }
    } catch (err) {
      showToast(err.message || "Test WhatsApp send failed", "error");
    } finally {
      setTestingWa(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: "40px 0", color: "var(--text-silver)", fontSize: "0.9rem" }}>
        ⏳ Loading your cloud preferences...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, position: "relative", width: "100%", maxWidth: "100%" }}>
      {/* Toast Notification */}
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
            display: "flex",
            alignItems: "center",
            gap: 10,
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
              Account & Store Settings
            </h1>
            <span className="tag-pill active" style={{ fontSize: "0.72rem" }}>
              ☁️ Cloud Synchronized
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-silver)", marginTop: 6, marginBottom: 0 }}>
            Configure your seller brand identity, support contact details, and default print defaults (All fields are optional).
          </p>
        </div>

        <div>
          <Link href="/" className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 18px" }}>
            ← Back to Studio
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Card 1: Store & Brand Profile */}
        <div className="premium-glass">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                🏪 Seller & Store Profile
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-silver)", margin: 0 }}>
                These optional details help you identify your store and can be stamped onto package slips.
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontStyle: "italic" }}>
              Optional Fields
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Store / Brand Name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Mahir Enterprise / Urban Trends"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Meesho Store Link / Custom URL
              </label>
              <input
                className="input-field"
                placeholder="https://www.meesho.com/yourstore"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Instagram Profile Link or @Handle
              </label>
              <input
                className="input-field"
                placeholder="https://instagram.com/your_handle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Custom Thank You / Return Policy Note
              </label>
              <input
                className="input-field"
                placeholder="e.g. For hassle-free exchange, contact support"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Global Default QR Configuration */}
        <div className="premium-glass" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                Global Default QR & Layout Setup
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", margin: 0 }}>
                These parameters will be automatically pre-filled every time you upload a shipping PDF.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                userSelect: "none",
                background: enableQr ? "rgba(79, 172, 254, 0.12)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${enableQr ? "var(--aurora-2)" : "var(--glass-border)"}`,
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <input
                type="checkbox"
                disabled={saving}
                checked={enableQr}
                onChange={(e) => setEnableQr(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--aurora-1)", cursor: saving ? "not-allowed" : "pointer" }}
              />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: enableQr ? "var(--aurora-1)" : "var(--text-silver)" }}>
                {enableQr ? "QR Stamper: Enabled by Default" : "QR Stamper: Disabled by Default"}
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                userSelect: "none",
                background: downloadSummary ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${downloadSummary ? "rgba(16, 185, 129, 0.4)" : "var(--glass-border)"}`,
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <input
                type="checkbox"
                disabled={saving}
                checked={downloadSummary}
                onChange={(e) => setDownloadSummary(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--border-accent)", cursor: saving ? "not-allowed" : "pointer" }}
              />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: downloadSummary ? "#a7f3d0" : "var(--text-silver)" }}>
                {downloadSummary ? "📊 Download Summary PDF: Enabled by Default" : "📊 Download Summary PDF: Disabled"}
              </span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, marginTop: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Default Sort Rule
              </label>
              <select
                className="input-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="sku">Sort by SKU (Highest Qty First)</option>
                <option value="qty">Sort by Item Quantity</option>
                <option value="orderDate">Sort by Order Date</option>
                <option value="orderNo">Sort by Order ID / Number</option>
                <option value="customerName">Sort by Customer Name</option>
                <option value="none">Original PDF Sequence (No Sorting)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Default Sort Direction
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "asc" ? "rgba(79, 172, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sortOrder === "asc" ? "var(--aurora-2)" : "var(--glass-border)",
                    color: sortOrder === "asc" ? "var(--aurora-1)" : "var(--text-silver)",
                    padding: "10px",
                  }}
                  onClick={() => setSortOrder("asc")}
                >
                  ⬆️ Ascending
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "desc" ? "rgba(79, 172, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sortOrder === "desc" ? "var(--aurora-2)" : "var(--glass-border)",
                    color: sortOrder === "desc" ? "var(--aurora-1)" : "var(--text-silver)",
                    padding: "10px",
                  }}
                  onClick={() => setSortOrder("desc")}
                >
                  ⬇️ Descending
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: WhatsApp Automatic Media Dispatcher Setup */}
        <div className="premium-glass" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                📲 WhatsApp Automatic Media Dispatcher
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", margin: 0 }}>
                Configure your personal WhatsApp API Key, Bearer Token, and Receiver Number for automatic media dispatch.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestWhatsApp}
              disabled={testingWa}
              style={{ fontSize: "0.82rem", padding: "8px 16px", borderColor: "var(--aurora-2)", color: "var(--aurora-1)", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {testingWa ? "Sending Test..." : "📲 Test WhatsApp Send"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            {/* Enable Checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                userSelect: "none",
                background: enableWhatsApp ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${enableWhatsApp ? "rgba(16, 185, 129, 0.4)" : "var(--glass-border)"}`,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                gridColumn: "1 / -1",
              }}
            >
              <input
                type="checkbox"
                disabled={saving}
                checked={enableWhatsApp}
                onChange={(e) => setEnableWhatsApp(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#10b981", cursor: saving ? "not-allowed" : "pointer" }}
              />
              <span style={{ fontSize: "0.84rem", fontWeight: 600, color: enableWhatsApp ? "#a7f3d0" : "var(--text-silver)" }}>
                {enableWhatsApp ? "WhatsApp Auto-Dispatch: Enabled" : "WhatsApp Auto-Dispatch: Disabled"}
              </span>
            </label>

            {/* Receiver Phone Number */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Default Receiver WhatsApp Number (with Country Code)
              </label>
              <input
                className="input-field"
                placeholder="e.g. 918140148878"
                value={waReceiverNumber}
                onChange={(e) => setWaReceiverNumber(e.target.value)}
              />
              <span style={{ fontSize: "0.74rem", color: "var(--text-dim)", marginTop: 4, display: "block" }}>
                Target phone number where PDFs and Summary images are delivered (Default: 918140148878)
              </span>
            </div>

            {/* Personal Secret API Key */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Personal Secret API Key (x-api-key)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  className="input-field"
                  placeholder="wa_c6854599bd4b7a54cad78edbdd6ace51"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-silver)", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  {showApiKey ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Bearer Authorization Token */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Authorization Bearer Token (JWT Token)
              </label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={waBearerToken}
                onChange={(e) => setWaBearerToken(e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}
              />
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
          <Link href="/" className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.9rem", padding: "12px 24px" }}>
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ fontSize: "0.9rem", padding: "12px 32px" }}
          >
            {saving ? "Saving Preferences..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
