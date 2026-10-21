"use client";

import { useEffect, useState, useRef } from "react";
import { updateAdsConfigMemory } from "../../components/AdSlot";
import { DEFAULT_ADS_CONFIG } from "../../../lib/adsConfig";

function CheckIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function RefreshCwIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

function CodeIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function EyeIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ToggleSwitch({ checked, onChange, label, description, badge = "", activeColor = "#4F46E5" }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 18px",
        background: checked ? "rgba(79, 70, 229, 0.04)" : "#F8FAFC",
        border: checked ? `1.5px solid ${activeColor}` : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{label}</span>
          <span
            style={{
              fontSize: "0.64rem",
              padding: "2px 7px",
              borderRadius: "999px",
              fontWeight: 800,
              background: checked ? activeColor : "#E2E8F0",
              color: checked ? "#FFFFFF" : "#64748B",
              transition: "all 0.2s ease",
            }}
          >
            {checked ? (badge || "ACTIVE") : "DISABLED"}
          </span>
        </div>
        {description && (
          <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 3 }}>
            {description}
          </div>
        )}
      </div>

      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          background: checked ? activeColor : "#CBD5E1",
          position: "relative",
          transition: "background 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#FFFFFF",
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}

const SLOT_DEFINITIONS = [
  {
    id: "rightSkyscraper",
    title: "Right Side Skyscraper",
    badge: "DESKTOP GUTTER",
    location: "Right margin of main workspace",
    dimensions: "160x600 px",
    minWidthText: "Desktop >= 1400px only",
    policyNote: "Policy Compliant: Placed in the outer gutter with zero overlap over the tool or action buttons.",
    recommendedFormat: "vertical",
  },
  {
    id: "bottomBanner",
    title: "Bottom Results Banner",
    badge: "WORKFLOW FOOTER",
    location: "Below duplicate remover & studio results",
    dimensions: "728x90 px / Responsive",
    minWidthText: "All viewports",
    policyNote: "Policy Compliant: Placed with 24px safety distance below output tables to avoid accidental clicks.",
    recommendedFormat: "horizontal",
  },
];

export default function AdsSettingsView({ adminEmail, showToast }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState("rightSkyscraper");
  const [previewCustomHtml, setPreviewCustomHtml] = useState(false);
  const previewRef = useRef(null);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, [adminEmail]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads?email=${encodeURIComponent(adminEmail)}`, {
        headers: adminEmail ? { "x-user-email": adminEmail } : {},
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success && data?.adsConfig) {
        setConfig(data.adsConfig);
      } else {
        setConfig(DEFAULT_ADS_CONFIG);
      }
    } catch (err) {
      console.error("Error fetching admin ads config:", err);
      setConfig(DEFAULT_ADS_CONFIG);
      if (showToast) showToast("Failed to fetch ads configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ads?email=${encodeURIComponent(adminEmail)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-user-email": adminEmail } : {}),
        },
        body: JSON.stringify({ adsConfig: config }),
      });

      const data = await res.json();
      if (data?.success) {
        setConfig(data.adsConfig);
        updateAdsConfigMemory(data.adsConfig);
        if (showToast) showToast("Google Ads settings saved & updated live platform-wide!", "success");
      } else {
        if (showToast) showToast(data?.error || "Failed to save ads settings", "error");
      }
    } catch (err) {
      console.error("Save ads config error:", err);
      if (showToast) showToast("Network error while saving ads settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all ad slots and publisher settings to default configuration?")) {
      setConfig({
        ...DEFAULT_ADS_CONFIG,
        updatedAt: new Date().toISOString(),
      });
      if (showToast) showToast("Reset to defaults. Click 'Save Changes' to apply.", "info");
    }
  };

  // Mutators for nested config
  const updateMasterToggle = (val) => {
    setConfig((prev) => ({ ...prev, adsEnabled: val }));
  };

  const updateAutoAdsToggle = (val) => {
    setConfig((prev) => ({ ...prev, autoAdsEnabled: val }));
  };

  const updatePublisherId = (val) => {
    setConfig((prev) => ({ ...prev, publisherId: val }));
  };

  const updateSlotField = (slotId, field, val) => {
    setConfig((prev) => {
      const existingSlot = prev?.slots?.[slotId] || {};
      return {
        ...prev,
        slots: {
          ...prev?.slots,
          [slotId]: {
            ...existingSlot,
            [field]: val,
          },
        },
      };
    });
  };

  const currentSlotDef = SLOT_DEFINITIONS.find((s) => s.id === activeSlotId) || SLOT_DEFINITIONS[0];
  const activeSlotConfig = config?.slots?.[activeSlotId] || {};

  // Render custom HTML in preview
  useEffect(() => {
    if (previewCustomHtml && activeSlotConfig?.customCode && previewRef.current) {
      previewRef.current.innerHTML = activeSlotConfig.customCode;
    }
  }, [previewCustomHtml, activeSlotConfig?.customCode]);

  if (loading || !config) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
        <div className="spinner-ring-lg" style={{ marginBottom: 12 }} />
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Loading Google Ads Configuration...</div>
      </div>
    );
  }

  const isPubIdValid = /^ca-pub-\d{10,20}$/.test(config.publisherId?.trim() || "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Controls Banner */}
      <div
        className="premium-glass"
        style={{
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "20px",
          padding: "24px 28px",
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#0F172A", letterSpacing: "-0.02em" }}>
                Google AdSense &amp; Ads Engine Control
              </h2>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: config.adsEnabled ? "#F0FDF4" : "#FEF2F2",
                  color: config.adsEnabled ? "#16A34A" : "#DC2626",
                  border: config.adsEnabled ? "1px solid #BBF7D0" : "1px solid #FECACA",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {config.adsEnabled ? "● ADS SYSTEM ACTIVE" : "○ ALL ADS DISABLED"}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.85rem" }}>
              Configure individual ad units, toggle display on/off per slot, customize AdSense Slot IDs or embed custom affiliate/HTML code.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                padding: "9px 16px",
                background: "#F1F5F9",
                color: "#475569",
                border: "1px solid #CBD5E1",
                borderRadius: "12px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "9px 22px",
                background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              {saving ? <span className="spinner-ring-white" /> : <CheckIcon size={16} />}
              <span>{saving ? "Saving Changes..." : "Save Ads Configuration"}</span>
            </button>
          </div>
        </div>

        {/* Master Switches Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <ToggleSwitch
            checked={Boolean(config.adsEnabled)}
            onChange={updateMasterToggle}
            label="Master Ads Power Toggle"
            description="Turn all platform advertisements ON or OFF globally in 1 click."
            badge="PLATFORM ON"
            activeColor="#16A34A"
          />

          <ToggleSwitch
            checked={Boolean(config.autoAdsEnabled)}
            onChange={updateAutoAdsToggle}
            label="Google Auto Ads Support"
            description="Allows Google AI to place anchor or side rail ads automatically."
            badge="AUTO ADS ON"
            activeColor="#0284C7"
          />
        </div>

        {/* AdSense Publisher Client ID Input */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
              Google AdSense Publisher Client ID
            </label>
            {isPubIdValid ? (
              <span style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckIcon size={14} color="#16A34A" /> Valid AdSense Publisher ID
              </span>
            ) : (
              <span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertTriangleIcon size={14} color="#DC2626" /> Format should be "ca-pub-XXXXXXXXXXXXXXXX"
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={config.publisherId || ""}
              onChange={(e) => updatePublisherId(e.target.value)}
              placeholder="ca-pub-9861920280316596"
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: isPubIdValid ? "1.5px solid #CBD5E1" : "1.5px solid #FCA5A5",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                color: "#0F172A",
                outline: "none",
              }}
            />
          </div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B" }}>
            This publisher ID is used to dynamically inject ads and verify site ownership on <code>labelpro.in</code>.
          </p>
        </div>
      </div>

      {/* Slots Configuration Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0F172A" }}>
              Individual Ad Slot Management
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748B" }}>
              Select an ad placement slot to customize its delivery code and toggle state.
            </p>
          </div>
        </div>

        {/* Slot Selection Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {SLOT_DEFINITIONS.map((def) => {
            const isSelected = activeSlotId === def.id;
            const slotData = config?.slots?.[def.id] || {};
            const isEnabled = Boolean(slotData.enabled);

            return (
              <div
                key={def.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveSlotId(def.id)}
                style={{
                  background: isSelected ? "#F0F9FF" : "#FFFFFF",
                  border: isSelected ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 8px 20px -4px rgba(2, 132, 199, 0.2)" : "0 2px 6px rgba(15, 23, 42, 0.03)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.66rem", fontWeight: 800, color: "#0284C7", letterSpacing: "0.06em" }}>
                      {def.badge}
                    </span>
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: isEnabled ? "#DCFCE7" : "#F1F5F9",
                        color: isEnabled ? "#15803D" : "#64748B",
                      }}
                    >
                      {isEnabled ? "ENABLED" : "MUTED"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.98rem", fontWeight: 800, color: "#0F172A" }}>
                    {def.title}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 2 }}>
                    {def.location}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: 8, fontSize: "0.74rem", color: "#64748B" }}>
                  <span>Size: <strong>{def.dimensions}</strong></span>
                  <span>Target: <strong>{def.minWidthText}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Slot Detailed Editor Card */}
        <div
          className="premium-glass"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            borderRadius: "20px",
            padding: "24px 28px",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Slot Header & Specific ON/OFF Toggle */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                  {currentSlotDef.title} Configuration
                </h4>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "#EEF2FF", color: "#4F46E5", padding: "2px 8px", borderRadius: "6px" }}>
                  Slot ID: {activeSlotId}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748B" }}>
                {currentSlotDef.policyNote}
              </p>
            </div>

            {/* Individual Slot Switch */}
            <div style={{ minWidth: 240 }}>
              <ToggleSwitch
                checked={Boolean(activeSlotConfig.enabled)}
                onChange={(val) => updateSlotField(activeSlotId, "enabled", val)}
                label={`Show ${currentSlotDef.title}`}
                description="Controls visibility on live website"
                badge="SLOT ACTIVE"
                activeColor="#0284C7"
              />
            </div>
          </div>

          {/* Ad Mode Selector (AdSense Slot vs Custom HTML/Code) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
              Ad Delivery Mode
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => updateSlotField(activeSlotId, "mode", "adsense")}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: activeSlotConfig.mode !== "custom" ? "2px solid #4F46E5" : "1.5px solid #CBD5E1",
                  background: activeSlotConfig.mode !== "custom" ? "#EEF2FF" : "#F8FAFC",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeSlotConfig.mode !== "custom" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4F46E5" }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#0F172A" }}>Google AdSense Unit</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>Uses standard AdSense responsive &amp; slot tag</div>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => updateSlotField(activeSlotId, "mode", "custom")}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: activeSlotConfig.mode === "custom" ? "2px solid #4F46E5" : "1.5px solid #CBD5E1",
                  background: activeSlotConfig.mode === "custom" ? "#EEF2FF" : "#F8FAFC",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeSlotConfig.mode === "custom" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4F46E5" }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#0F172A" }}>Custom Code / Script / Embed</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>Paste any HTML, JavaScript, iframe, or affiliate code</div>
                </div>
              </div>
            </div>
          </div>

          {/* AdSense Mode Inputs */}
          {activeSlotConfig.mode !== "custom" ? (
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <label style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                  Google AdSense Ad Slot ID (data-ad-slot)
                </label>
                <input
                  type="text"
                  value={activeSlotConfig.slotId || ""}
                  onChange={(e) => updateSlotField(activeSlotId, "slotId", e.target.value)}
                  placeholder="e.g. 5849204192 (Leave empty for automatic responsive fill)"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: "0.88rem",
                    fontFamily: "var(--font-mono)",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
                <p style={{ margin: "6px 0 0", fontSize: "0.74rem", color: "#64748B" }}>
                  You can create a targeted Display Ad unit in your Google AdSense console under "By ad unit" and paste its 10-digit Slot ID here. If left empty, AdSense serves default responsive auto units.
                </p>
              </div>

              <div style={{ fontSize: "0.78rem", color: "#334155", background: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <strong>Generated AdSense Tag Preview:</strong>
                <pre style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "#475569", overflowX: "auto", fontFamily: "var(--font-mono)" }}>
{`<ins className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client="${config.publisherId || "ca-pub-9861920280316596"}"
  data-ad-slot="${activeSlotConfig.slotId || "AUTO_RESPONSIVE"}"
  data-ad-format="${currentSlotDef.recommendedFormat}"
  data-full-width-responsive="true" />`}
                </pre>
              </div>
            </div>
          ) : (
            /* Custom Code Editor Mode */
            <div
              style={{
                background: "#0F172A",
                border: "1px solid #334155",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.84rem", fontWeight: 700, color: "#E2E8F0", display: "flex", alignItems: "center", gap: 6 }}>
                  <CodeIcon size={16} color="#38BDF8" /> Custom HTML / Embed / Script Code
                </label>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                  Raw HTML/JS allowed
                </span>
              </div>
              <textarea
                rows={6}
                value={activeSlotConfig.customCode || ""}
                onChange={(e) => updateSlotField(activeSlotId, "customCode", e.target.value)}
                placeholder={'<script async src="..."></script>\n<div id="ad-custom-unit">...</div>'}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #334155",
                  background: "#1E293B",
                  color: "#F8FAFC",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1.5,
                  outline: "none",
                  resize: "vertical",
                }}
              />
              <p style={{ margin: 0, fontSize: "0.73rem", color: "#94A3B8" }}>
                Scripts and iframes pasted here will be cleanly evaluated inside this slot container on the live website.
              </p>
            </div>
          )}

          {/* Visual Live Preview of Current Slot */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px dashed #CBD5E1",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                <EyeIcon size={16} /> Live Ad Slot Representation ({currentSlotDef.dimensions})
              </span>
              <span style={{ fontSize: "0.72rem", color: activeSlotConfig.enabled ? "#16A34A" : "#64748B", fontWeight: 700 }}>
                {activeSlotConfig.enabled ? "Visible to Visitors" : "Hidden (Muted)"}
              </span>
            </div>

            {/* Simulated Frame */}
            <div
              style={{
                width: activeSlotId === "rightSkyscraper" ? 160 : "100%",
                maxWidth: 728,
                minHeight: activeSlotId === "rightSkyscraper" ? 280 : 90,
                background: "#FFFFFF",
                border: "1.5px solid #CBD5E1",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.08em", marginBottom: 6 }}>
                ADVERTISEMENT
              </div>
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                {currentSlotDef.title}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4 }}>
                {activeSlotConfig.mode === "custom"
                  ? (activeSlotConfig.customCode ? "Custom Script Loaded" : "No Custom Code Pasted")
                  : `AdSense Slot: ${activeSlotConfig.slotId || "Auto Dynamic"}`}
              </div>
              {!activeSlotConfig.enabled && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(241, 245, 249, 0.85)",
                    backdropFilter: "blur(2px)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#64748B",
                    fontSize: "0.8rem",
                  }}
                >
                  SLOT MUTED / DISABLED
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
