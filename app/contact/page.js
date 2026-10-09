"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ZapIcon,
  CheckCircleIcon,
  WhatsAppIcon,
  MailIcon,
  BuildingIcon,
  ArrowRightIcon,
  SendIcon,
} from "../components/Icons";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    category: "support",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [submitError, setSubmitError] = useState("");

  const FAQS = [
    {
      q: "Is my label and customer address data safe when using LabelPro?",
      a: "Yes, 100%. LabelPro uses a client-side in-memory engine developed by Mahir Enterprise. When you upload your shipping label PDF, it is processed locally inside your web browser. No customer personal identification information (PII) is permanently cataloged or sold.",
    },
    {
      q: "Which marketplaces and thermal printers are compatible?",
      a: "LabelPro is fully compatible with all standard A6 (4x6 inch) thermal printers (TVS, TSC, Zebra, Xprinter, Rollo, Everycom, Citizen, etc.) and formats from Meesho, Flipkart, Amazon India, GlowRoad, and Shopify.",
    },
    {
      q: "How does the Meesho / Instagram QR Stamping feature work?",
      a: "The tool encodes your store profile URL into an ultra-high-contrast QR code and stamps it neatly in the blank area of every parcel label. When customers scan it upon parcel delivery, they are taken directly to your store or Instagram page to follow you and place repeat orders.",
    },
    {
      q: "Can I use LabelPro on multiple warehouse computers?",
      a: "Yes! You can log in on your packing station desktop, warehouse laptops, or mobile devices simultaneously without restriction.",
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReferenceId(data.referenceId || "LP-" + Math.floor(100000 + Math.random() * 900000));
        setSubmitted(true);
      } else {
        setSubmitError(data.error || "Failed to submit inquiry. Please try again or contact via WhatsApp.");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setSubmitError("Failed to connect to server. Please reach out directly on WhatsApp (+91 96647 20473).");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: "20px 0 60px" }}>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#64748B", marginBottom: 12 }}>
          <Link href="/" style={{ color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <span>Support</span>
          <span>/</span>
          <span style={{ color: "#0F172A", fontWeight: 600 }}>Contact Us</span>
        </div>

        <div className="premium-glass" style={{ padding: "32px 36px", borderRadius: "20px", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.2)", padding: "4px 12px", borderRadius: "9999px", color: "#059669", fontSize: "0.75rem", fontWeight: 700, marginBottom: 14 }}>
            <ZapIcon size={14} color="#059669" /> Live Support Desk Online • Mahir Enterprise
          </div>
          <h1 className="heading-display" style={{ fontSize: "2.1rem", color: "#0F172A", margin: "0 0 10px 0", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Get in Touch with LabelPro Support
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#475569", margin: 0, maxWidth: 850, lineHeight: 1.6 }}>
            Have questions regarding custom label templates, high-volume enterprise sorting, WhatsApp API configuration, or technical assistance? Our support team at Mahir Enterprise is here to assist.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 24, marginBottom: 36 }}>

        {/* Contact Form Card */}
        <div className="premium-glass" style={{ padding: "32px", borderRadius: "20px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#0F172A", fontWeight: 700, margin: "0 0 16px 0" }}>
            Send Us a Message
          </h2>

          {submitted ? (
            <div style={{ padding: "28px 22px", textAlign: "center", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <CheckCircleIcon size={36} color="#16A34A" />
              </div>
              <span style={{ display: "inline-block", background: "#DCFCE7", color: "#15803D", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: 10 }}>
                Reference ID: #{referenceId}
              </span>
              <h3 style={{ fontSize: "1.2rem", color: "#166534", fontWeight: 800, margin: "0 0 6px 0" }}>
                Inquiry Saved in Database!
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#15803D", margin: "0 0 16px 0", lineHeight: 1.6 }}>
                Thank you for contacting Mahir Enterprise. Your inquiry has been logged in our system. Our team will review and reply to <b>{formData.email || "your email"}</b> ({formData.phone}) shortly.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360, margin: "0 auto" }}>
                <a
                  href={`https://wa.me/919664720473?text=${encodeURIComponent(`Hello LabelPro Support, I submitted an inquiry [Ref: #${referenceId}] regarding "${formData.subject}". Name: ${formData.name}, Mobile: ${formData.phone}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "#16A34A",
                    color: "#FFFFFF",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                  }}
                >
                  <WhatsAppIcon size={18} color="#FFFFFF" /> Open in WhatsApp Chat (Instant Priority)
                </a>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSubmitted(false);
                    setReferenceId("");
                    setFormData({ name: "", email: "", phone: "", storeName: "", category: "support", subject: "", message: "" });
                  }}
                  style={{ padding: "8px 18px", fontSize: "0.82rem" }}
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {submitError && (
                <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: "10px", fontSize: "0.82rem" }}>
                  {submitError}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mahir"
                    style={{ fontSize: "0.85rem", padding: "10px 12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Store / Brand Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g. Mahir Enterprise"
                    style={{ fontSize: "0.85rem", padding: "10px 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="support.mahirenterprise@gmail.com"
                    style={{ fontSize: "0.85rem", padding: "10px 12px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 96647 20473"
                    style={{ fontSize: "0.85rem", padding: "10px 12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Inquiry Category
                </label>
                <select
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ fontSize: "0.85rem", padding: "10px 12px", background: "#FFFFFF" }}
                >
                  <option value="support">Technical Support &amp; Printer Setup</option>
                  <option value="feature">Custom Feature / Template Request</option>
                  <option value="enterprise">High-Volume Enterprise License</option>
                  <option value="legal">Privacy &amp; Data Compliance</option>
                  <option value="other">General Feedback</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Assistance setting up thermal crop for Meesho labels"
                  style={{ fontSize: "0.85rem", padding: "10px 12px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                  Detailed Message *
                </label>
                <textarea
                  required
                  className="input-field"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your query or problem in detail..."
                  style={{ fontSize: "0.85rem", padding: "10px 12px", resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {submitting ? (
                  "Sending Inquiry..."
                ) : (
                  <>
                    <SendIcon size={16} /> Submit Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact Information Cards & Direct Support */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Direct WhatsApp Support */}
          <div className="premium-glass" style={{ padding: "24px 28px", borderRadius: "18px", background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border: "1px solid #86EFAC" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(22, 163, 74, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WhatsAppIcon size={24} color="#16A34A" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "#166534", fontWeight: 800, margin: 0 }}>
                  Instant WhatsApp Live Chat
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#15803D", margin: 0 }}>
                  Get real-time assistance directly on WhatsApp (+91 96647 20473).
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/919664720473?text=Hello%20LabelPro%20Support,%20I%20need%20assistance%20with%20shipping%20label%20setup"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#16A34A",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.88rem",
                textDecoration: "none",
                marginTop: 8,
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
              }}
            >
              Open WhatsApp Support <ArrowRightIcon size={16} />
            </a>
          </div>

          {/* Email & Operational Info */}
          <div className="premium-glass" style={{ padding: "24px 28px", borderRadius: "18px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <MailIcon size={14} color="#64748B" /> Official Support Email
                </div>
                <div style={{ fontSize: "0.95rem", color: "#4F46E5", fontWeight: 700, marginTop: 2 }}>
                  support.mahirenterprise@gmail.com
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <BuildingIcon size={14} color="#64748B" /> Operational Headquarters &amp; Entity
                </div>
                <div style={{ fontSize: "0.92rem", color: "#0F172A", fontWeight: 600, marginTop: 2 }}>
                  Mahir Enterprise, Ratanvav, Gujarat, India - 360575
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                  Working Hours
                </div>
                <div style={{ fontSize: "0.92rem", color: "#0F172A", fontWeight: 600, marginTop: 2 }}>
                  Monday – Saturday: 9:00 AM – 8:00 PM IST
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Frequently Asked Questions Grid */}
      <div className="premium-glass" style={{ padding: "32px", borderRadius: "20px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.3rem", color: "#0F172A", fontWeight: 800, margin: "0 0 6px 0" }}>
            Frequently Asked Questions (FAQ)
          </h2>
          <p style={{ fontSize: "0.86rem", color: "#64748B", margin: 0 }}>
            Instant answers to common questions about LabelPro and Mahir Enterprise services.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: 16 }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "20px 22px",
                background: "#F8FAFC",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#EEF2FF",
                    color: "#4F46E5",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  Q
                </span>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0F172A", margin: 0, lineHeight: 1.45 }}>
                  {faq.q}
                </h3>
              </div>
              <div style={{ paddingLeft: 32, fontSize: "0.85rem", color: "#475569", lineHeight: 1.65 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
