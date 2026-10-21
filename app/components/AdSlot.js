"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

// In-memory cache to prevent multiple round-trips when multiple slots mount
let cachedConfig = null;
let fetchPromise = null;
const listeners = new Set();

export function updateAdsConfigMemory(newConfig) {
  cachedConfig = newConfig;
  listeners.forEach((fn) => fn(newConfig));
}

function useAdsConfig() {
  const [config, setConfig] = useState(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    let mounted = true;

    const listener = (newConfig) => {
      if (mounted) setConfig(newConfig);
    };
    listeners.add(listener);

    if (!cachedConfig) {
      if (!fetchPromise) {
        fetchPromise = fetch("/api/ads", { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.success && data?.adsConfig) {
              cachedConfig = data.adsConfig;
              return cachedConfig;
            }
            return null;
          })
          .catch((err) => {
            console.warn("Failed to load ads config:", err);
            return null;
          })
          .finally(() => {
            fetchPromise = null;
          });
      }

      fetchPromise.then((cfg) => {
        if (mounted && cfg) {
          setConfig(cfg);
          setLoading(false);
          listeners.forEach((fn) => fn(cfg));
        } else if (mounted) {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, []);

  return { config, loading };
}

export default function AdSlot({ slotKey = "rightSkyscraper", className = "", style = {} }) {
  const pathname = usePathname();
  const { config, loading } = useAdsConfig();
  const adPushedRef = useRef(false);
  const containerRef = useRef(null);

  // Disable ads entirely on Admin and Auth pages
  const isExcludedPage = pathname?.startsWith("/admin") || pathname === "/login";

  const isMasterEnabled = Boolean(config?.adsEnabled);
  const slot = config?.slots?.[slotKey];
  const isSlotEnabled = Boolean(slot?.enabled);

  useEffect(() => {
    if (!isMasterEnabled || !isSlotEnabled || isExcludedPage || loading) return;

    // Trigger Google AdSense render if standard adsense mode
    if (slot?.mode !== "custom" && !adPushedRef.current && typeof window !== "undefined") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushedRef.current = true;
      } catch (err) {
        // Suppress expected adsbygoogle push warnings (e.g. strict mode or ad blockers)
      }
    }
  }, [isMasterEnabled, isSlotEnabled, isExcludedPage, loading, slot]);

  // Execute custom HTML script if custom mode
  useEffect(() => {
    if (!isMasterEnabled || !isSlotEnabled || isExcludedPage || loading) return;
    if (slot?.mode === "custom" && slot?.customCode && containerRef.current) {
      try {
        const container = containerRef.current;
        container.innerHTML = slot.customCode;
        // Re-execute any scripts inside the custom snippet
        const scripts = container.querySelectorAll("script");
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
      } catch (err) {
        console.warn("Failed executing custom ad script:", err);
      }
    }
  }, [isMasterEnabled, isSlotEnabled, isExcludedPage, loading, slot]);

  if (isExcludedPage || loading || !isMasterEnabled || !isSlotEnabled) {
    return null;
  }

  const publisherId = config?.publisherId || "ca-pub-9861920280316596";

  // Specific Slot Layouts
  if (slotKey === "rightSkyscraper") {
    return (
      <aside
        aria-label="Advertisement"
        className={`ads-right-skyscraper ${className}`}
        style={{
          ...style,
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "10px 8px",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            minHeight: "600px",
          }}
        >
          <div
            style={{
              fontSize: "0.62rem",
              fontWeight: 800,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>ADVERTISEMENT</span>
          </div>

          <div style={{ width: "100%", flex: 1, display: "flex", justifyContent: "center" }}>
            {slot?.mode === "custom" ? (
              <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            ) : (
              <ins
                className="adsbygoogle"
                style={{
                  display: "inline-block",
                  width: "160px",
                  height: "600px",
                  overflow: "hidden",
                }}
                data-ad-client={publisherId}
                data-ad-slot={slot?.slotId || undefined}
                data-ad-format="vertical"
              />
            )}
          </div>
        </div>
      </aside>
    );
  }

  if (slotKey === "bottomBanner") {
    return (
      <div
        aria-label="Advertisement"
        className={`ads-bottom-banner ${className}`}
        style={{
          width: "100%",
          maxWidth: 970,
          margin: "28px auto 16px",
          padding: "12px 16px",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          ...style,
        }}
      >
        <div
          style={{
            fontSize: "0.62rem",
            fontWeight: 800,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          ADVERTISEMENT
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          {slot?.mode === "custom" ? (
            <div ref={containerRef} style={{ width: "100%", textAlign: "center" }} />
          ) : (
            <ins
              className="adsbygoogle"
              style={{ display: "block", minHeight: 90, width: "100%", textAlign: "center" }}
              data-ad-client={publisherId}
              data-ad-slot={slot?.slotId || undefined}
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
