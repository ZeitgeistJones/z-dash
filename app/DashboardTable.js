"use client";
import { useState } from "react";

// ============================================================
// COLUMN GROUPS — each tab shows a different slice of the same
// underlying data object. No extra fetches, just different views.
// ============================================================
const TABS = {
  Overview: [
    { key: "Project", label: "Project", type: "string" },
    { key: "Opp", label: "Opp", type: "number" },
    { key: "Mom", label: "Mom", type: "number" },
    { key: "Sus", label: "Sus", type: "number" },
    { key: "Prof", label: "Prof", type: "string" },
    { key: "priceUsd", label: "Price", type: "number", format: "price" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd" },
    { key: "signal", label: "Signal", type: "string" },
    { key: "signalScore", label: "Signal Score", type: "number" },
  ],
  Activity: [
    { key: "Project", label: "Project", type: "string" },
    { key: "Vol 30d", label: "Vol 30d", type: "number", format: "usd" },
    { key: "Vol/Tx", label: "Vol/Tx", type: "number" },
    { key: "Vol/Wlt", label: "Vol/Wlt", type: "number" },
    { key: "Vol Grw %", label: "Vol Grw %", type: "number" },
    { key: "Txs 30d", label: "Txs 30d", type: "number" },
    { key: "Txs 7d", label: "Txs 7d", type: "number" },
    { key: "Tx Grw %", label: "Tx Grw %", type: "number" },
    { key: "Txs/User", label: "Txs/User", type: "number" },
  ],
  Wallets: [
    { key: "Project", label: "Project", type: "string" },
    { key: "Wallets 30d", label: "Wallets 30d", type: "number" },
    { key: "Wallets 7d", label: "Wallets 7d", type: "number" },
    { key: "User Grw %", label: "User Grw %", type: "number" },
    { key: "New 30d", label: "New 30d", type: "number" },
    { key: "Return 30d", label: "Return 30d", type: "number" },
    { key: "New %", label: "New %", type: "number" },
    { key: "Retention %", label: "Retention %", type: "number" },
    { key: "Avg Txs Ret", label: "Avg Txs Ret", type: "number" },
  ],
  "Buyers & Risk": [
    { key: "Project", label: "Project", type: "string" },
    { key: "Traders", label: "Traders", type: "number" },
    { key: "Buyers 30d", label: "Buyers 30d", type: "number" },
    { key: "Buyers 7d", label: "Buyers 7d", type: "number" },
    { key: "1st Buyers 30d", label: "1st Buyers 30d", type: "number" },
    { key: "1st Buyers 7d", label: "1st Buyers 7d", type: "number" },
    { key: "1st Sellers 30d", label: "1st Sellers 30d", type: "number" },
    { key: "1st Sellers 7d", label: "1st Sellers 7d", type: "number" },
    { key: "Non-Trade New 30d", label: "Non-Trade New", type: "number" },
    { key: "Top10 %", label: "Top10 %", type: "number" },
    { key: "Risk %", label: "Risk %", type: "number" },
    { key: "Qlty %", label: "Qlty %", type: "number" },
  ],
  Discover: [
    { key: "name", label: "Project", type: "string" },
    { key: "symbol", label: "Symbol", type: "string" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd" },
    { key: "priceUsd", label: "Price", type: "number", format: "price" },
    { key: "address", label: "Address", type: "string" },
  ],
};

function formatValue(val, format) {
  if (val == null || val === "") return "—";
  if (format === "price") return `$${Number(val).toPrecision(4)}`;
  if (format === "usd") return `$${Number(val).toLocaleString()}`;
  return val;
}

export default function DashboardTable({ data, discoveryData = [] }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortKey, setSortKey] = useState("Opp");
  const [sortDir, setSortDir] = useState("desc");

  const columns = TABS[activeTab];
  const rawSource = activeTab === "Discover" ? discoveryData : data;
  const sourceData = Array.isArray(rawSource) ? rawSource : [];
  const rowKeyField = activeTab === "Discover" ? "address" : "Address";

  function handleTabChange(tab) {
    setActiveTab(tab);
    const firstNumeric = TABS[tab].find((c) => c.type === "number");
    setSortKey(firstNumeric ? firstNumeric.key : TABS[tab][0].key);
    setSortDir("desc");
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...sourceData].sort((a, b) => {
    const col = columns.find((c) => c.key === sortKey) || columns[0];
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (col.type === "number") {
      aVal = aVal == null || aVal === "" ? -Infinity : Number(aVal);
      bVal = bVal == null || bVal === "" ? -Infinity : Number(bVal);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    } else {
      aVal = aVal == null ? "" : String(aVal);
      bVal = bVal == null ? "" : String(bVal);
      return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
  });

  return (
    <div>
      {/* TAB BAR */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {Object.keys(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: activeTab === tab ? "1px solid #333" : "1px solid #ccc",
              background: activeTab === tab ? "#333" : "#fff",
              color: activeTab === tab ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab}
            {tab === "Discover" && discoveryData.length > 0 ? ` (${discoveryData.length})` : ""}
          </button>
        ))}
      </div>

      {activeTab === "Discover" && (
        <p style={{ color: "#666", marginBottom: "12px", fontSize: "14px" }}>
          AI-category coins from CoinGecko (AI Agents, AI Agent Launchpad, AI Framework, DeFAI) with a Base
          contract address, not yet in your tracked list. Verify each before adding — category tagging on
          CoinGecko isn't perfect either.
        </p>
      )}

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", marginTop: "8px", width: "100%" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ccc",
                    padding: "6px 12px",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === "desc" ? " ▼" : " ▲") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "16px", color: "#666" }}>
                  {activeTab === "Discover" ? "No new candidates found." : "No data."}
                </td>
              </tr>
            ) : (
              sorted.map((d) => (
                <tr key={d[rowKeyField]}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: "6px 12px", whiteSpace: "nowrap" }}>
                      {col.format ? formatValue(d[col.key], col.format) : d[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
