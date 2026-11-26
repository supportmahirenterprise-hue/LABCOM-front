"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_ADS_CONFIG } from "../../lib/adsConfig";

// In-memory cache to prevent multiple round-trips when multiple slots mount
let cachedConfig = null;
let fetchPromise = null;
const listeners = new Set();

export function updateAdsConfigMemory(newConfig) {
  cachedConfig = newConfig;
  listeners.forEach((fn) => fn(newConfig));
}

function useAdsConfig() {
  const [config, setConfig] = useState(cachedConfig || DEFAULT_ADS_CONFIG);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    let mounted = true;

    const listener = (newConfig) => {
      if (mounted) setConfig(newConfig || DEFAULT_ADS_CONFIG);
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
            return DEFAULT_ADS_CONFIG;
          })
          .catch((err) => {
            // Silently fallback to built-in verified default configuration
            return DEFAULT_ADS_CONFIG;
          })
          .finally(() => {
            fetchPromise = null;
          });
      }

      fetchPromise.then((cfg) => {
        if (mounted) {
          const finalCfg = cfg || DEFAULT_ADS_CONFIG;
          setConfig(finalCfg);
          setLoading(false);
          listeners.forEach((fn) => fn(finalCfg));
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
  const insRef = useRef(null);
  const [isWideScreen, setIsWideScreen] = useState(false);

  // Responsive screen-size tracking for right skyscraper (must be >= 1400px to avoid 0-width error)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkWidth = () => {
      setIsWideScreen(window.innerWidth >= 1400);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth, { passive: true });
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Disable ads entirely on Admin and Auth pages
  const isExcludedPage = pathname?.startsWith("/admin") || pathname === "/login";

  const isMasterEnabled = Boolean(config?.adsEnabled);
  const slot = config?.slots?.[slotKey];
  const isSlotEnabled = Boolean(slot?.enabled);

  // Safely trigger Google AdSense
  const tryPushAdSense = useCallback(() => {
    if (typeof window === "undefined") return;
    if (adPushedRef.current) return;

    const ins = insRef.current;
    if (!ins) return;

    // Check if already processed by AdSense
    if (ins.getAttribute("data-adsbygoogle-status") === "done") {
      adPushedRef.current = true;
      return;
    }

    // Ensure slot element has painted and has non-zero client dimensions
    if (ins.offsetWidth === 0 && ins.offsetHeight === 0) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adPushedRef.current = true;
    } catch (err) {
      // Suppress adblocker / TagError warnings safely
    }
  }, []);

  // Run AdSense push when slot becomes visible and ready
  useEffect(() => {
    if (!isMasterEnabled || !isSlotEnabled || isExcludedPage || loading) return;
    if (slotKey === "rightSkyscraper" && !isWideScreen) return;

    if (slot?.mode !== "custom") {
      // Delay slightly (50ms) to allow DOM layout engine to calculate exact dimensions
      const timer = setTimeout(() => {
        tryPushAdSense();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMasterEnabled, isSlotEnabled, isExcludedPage, loading, slot, isWideScreen, slotKey, tryPushAdSense]);

  // Execute custom HTML script if custom mode
  useEffect(() => {
    if (!isMasterEnabled || !isSlotEnabled || isExcludedPage || loading) return;
    if (slotKey === "rightSkyscraper" && !isWideScreen) return;

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
  }, [isMasterEnabled, isSlotEnabled, isExcludedPage, loading, slot, isWideScreen, slotKey]);

  if (isExcludedPage || loading || !isMasterEnabled || !isSlotEnabled) {
    return null;
  }

  // Right skyscraper is strictly desktop-only (>= 1400px)
  if (slotKey === "rightSkyscraper" && !isWideScreen) {
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
                ref={insRef}
                className="adsbygoogle"
                style={{
                  display: "inline-block",
                  width: "160px",
                  height: "600px",
                  overflow: "hidden",
                }}
                data-ad-client={publisherId}
                data-ad-slot={slot?.slotId || "2412795862"}
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
              ref={insRef}
              className="adsbygoogle"
              style={{ display: "block", minHeight: 90, width: "100%", textAlign: "center" }}
              data-ad-client={publisherId}
              data-ad-slot={slot?.slotId || "4537677582"}
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
