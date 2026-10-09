"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, children, maxWidth = 680, className = "", style = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Save initial overflow values
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevBodyPaddingRight = document.body.style.paddingRight;

    // Lock body scrolling to prevent background scroll and blank white spaces on scroll
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevDocOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthStyle = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;

  return createPortal(
    <div
      className="modal-backdrop-light"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999999,
        padding: "20px",
        boxSizing: "border-box",
        margin: 0,
        overflow: "hidden",
      }}
    >
      <div
        className={`modal-card-light ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.38)",
          color: "#0F172A",
          width: "100%",
          maxWidth: maxWidthStyle,
          maxHeight: "86vh",
          overflowY: "auto",
          position: "relative",
          margin: "auto",
          animation: "modalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          ...style,
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
