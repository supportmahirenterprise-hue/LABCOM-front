const fs = require('fs');
const filePath = 'app/customer-analysis/page.js';
let content = fs.readFileSync(filePath, 'utf8');

// Title icons
content = content.replace(/<span[^>]*?>\s*[^<a-zA-Z0-9]*(Top High-Volume District Hubs.*?)<\/span>/g, '<span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>$1</span>');
content = content.replace(/<span[^>]*?>\s*[^<a-zA-Z0-9]*(Top High-Volume State Hubs.*?)<\/span>/g, '<span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>$1</span>');

// Pill icons
content = content.replace(/<span>[^<a-zA-Z0-9]*(\{d\.name\})<\/span>/g, '<span>$1</span>');
content = content.replace(/<span>[^<a-zA-Z0-9]*(\{s\.name\})<\/span>/g, '<span>$1</span>');

// Main heading icon
content = content.replace(/<h3[^>]*?>\s*[^<a-zA-Z0-9]*(District-Wise Demand Analysis.*?)<\/h3>/g, '<h3 className="heading-display" style={{ fontSize: "1.1rem", color: "var(--text-pure)", margin: 0 }}>$1</h3>');

// Table column icons
content = content.replace(/<span[^>]*?>\s*[^<a-zA-Z0-9]*(\{c\.state\})<\/span>/g, '<span className="tag-pill" style={{ fontSize: "0.75rem", padding: "3px 8px", background: "rgba(0, 242, 254, 0.08)", border: "1px solid rgba(0, 242, 254, 0.2)", color: "var(--aurora-1)" }}>$1</span>');
content = content.replace(/<span[^>]*?>\s*[^<a-zA-Z0-9]*(\{c\.district \|\| "Central"\})<\/span>/g, '<span className="tag-pill" style={{ fontSize: "0.78rem", padding: "3px 10px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", fontWeight: 700 }}>$1</span>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Removed icons successfully');
