"use client";

import { useEffect } from "react";

/**
 * ClientSecurityGuard
 * Prevents automated scraping of canvas renderers, shields vector barcode elements
 * from casual inspect-element harvesting, and ensures sensitive in-memory session
 * cache is properly purged on page unload.
 */
export default function ClientSecurityGuard() {
  useEffect(() => {
    // Only engage interactive guards in production environment
    if (process.env.NODE_ENV !== "production") return;

    // 1. Prevent dragging and context-menu extraction on proprietary PDF preview canvases
    const handleContextMenu = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === "CANVAS" ||
          target.closest(".label-canvas-container") ||
          target.closest(".preview-canvas") ||
          target.classList?.contains("no-scrape"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === "CANVAS" ||
          target.closest(".label-canvas-container") ||
          target.closest(".preview-canvas"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 2. Clear sensitive in-memory session caches on window unload
    const handleUnload = () => {
      try {
        sessionStorage.removeItem("cached_customer_analysis");
      } catch (err) {}
    };

    document.addEventListener("contextmenu", handleContextMenu, { passive: false });
    document.addEventListener("dragstart", handleDragStart, { passive: false });
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return null;
}

