const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state
content = content.replace(/const \[loadingPreview,\s*setLoadingPreview\]\s*=\s*useState\(false\);/, 'const [loadingPreview, setLoadingPreview] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);');

// 2. Add setUploadProgress(0)
content = content.replace(/setLoadingPreview\(true\);\s*try\s*\{/, 'setLoadingPreview(true);\n    setUploadProgress(0);\n    try {');

// 3. Small PDF progress
content = content.replace(/allExtractedPages\s*=\s*data\.pages\s*\|\|\s*\[\];\s*\}\s*else\s*\{/, 'allExtractedPages = data.pages || [];\n        setUploadProgress(100);\n      } else {');

// 4. Chunk loop progress
content = content.replace(/allExtractedPages\s*=\s*\[\.\.\.allExtractedPages,\s*\.\.\.\(data\.pages\s*\|\|\s*\[\]\)\];\s*\}/, 'allExtractedPages = [...allExtractedPages, ...(data.pages || [])];\n          setUploadProgress(Math.round(((c + 1) / totalChunks) * 100));\n        }');

// 5. Finally block
content = content.replace(/setLoadingPreview\(false\);\s*\}/, 'setLoadingPreview(false);\n      setUploadProgress(0);\n    }');

// 6. Replace UI
const oldUI = /{loadingPreview && \(\s*<div style={{ marginTop: 14, color: "var\(--aurora-1\)", fontSize: "0\.85rem", fontWeight: 600 }}>\s*[^<]*Extracting label fields & metadata\.\.\.\s*<\/div>\s*\)}/g;

const newUI = `{loadingPreview && (
                  <div style={{ marginTop: 24, width: "100%", maxWidth: "340px", margin: "24px auto 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem", color: "var(--aurora-1)", fontWeight: 600 }}>
                      <span>Extracting label fields & metadata...</span>
                      <span>\${uploadProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: \`\${uploadProgress}%\`, background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2))", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                )}`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Progress bar added successfully');
