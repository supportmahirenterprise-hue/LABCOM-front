const fs = require('fs');
const filePath = 'app/customer-analysis/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const searchStr = `            )}
          </div>
        </div>
      </div>

      {/* Controls Section:`;

const replaceStr = `            )}
          </div>

          {/* Top State Hubs */}
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
                ??? Top High-Volume State Hubs
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Top States</span>
            </div>
            {(!data?.summary?.allStatesWithCounts || data.summary.allStatesWithCounts.length === 0) ? (
              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>No state data logged yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[...(data.summary.allStatesWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((s) => (
                  <div
                    key={s.name}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#a7f3d0",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>?? {s.name}</span>
                    <span style={{ background: "#10b981", color: "#000", padding: "1px 6px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 800 }}>
                      {s.count} Orders
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section:`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
