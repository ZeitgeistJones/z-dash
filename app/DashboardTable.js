"use client";
import { useState } from "react";
import TripwirePanel from "./TripwirePanel";
import AboutPanel from "./AboutPanel";
import ClawdPanel from "./ClawdPanel";

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
    { key: "term", label: "Term", type: "string" },
    { key: "signalScore", label: "Signal Score", type: "number" },
  ],
  Activity: [
    { key: "Project", label: "Project", type: "string" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd" },
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
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd" },
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
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd" },
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

function StatusBanner({ lastUpdated }) {
  const formatted = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "unknown";

  return (
    <div
      style={{
        background: "#f7f7f5",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
        fontSize: "13px",
        color: "#555",
        lineHeight: "1.5",
      }}
    >
      <strong>v1 — running on free-tier infrastructure.</strong> Behavioral scores (Opp/Mom/Sus and the
      Activity/Wallets/Buyers &amp; Risk tabs) are refreshed manually, not live —{" "}
      <strong>scores last updated: {formatted}</strong>. Price and Market Cap refresh automatically about
      once an hour. Tripwire triggers a real, fresh on-chain query every time it's clicked, so usage may be
      limited to stay within free-tier query credits.
    </div>
  );
}

function ProfSignalKey() {
  return (
    <details style={{ marginBottom: "16px", fontSize: "14px", color: "#444" }}>
      <summary style={{ cursor: "pointer", fontWeight: 600, color: "#333" }}>
        Key: what do Prof + Signal combos mean?
      </summary>
      <div style={{ marginTop: "10px", lineHeight: "1.6" }}>
        <p style={{ marginBottom: "8px" }}>
          <strong>Prof</strong> = behavioral profile (wallets/txs/retention, price-independent).{" "}
          <strong>Signal</strong> = does price agree with volume right now (a separate, price-aware layer).{" "}
          <strong>Term</strong> = a single word naming each of the 16 combinations, shorthand for the full read.
        </p>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Breakout</strong> (strong momentum + strong sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth — Beacon</strong> — strongest combo on the board: real usage growing, price agrees.</li>
          <li><strong>Absorbed — Undercurrent</strong> — strong fundamentals, but volume isn't moving price yet. Possible accumulation or quiet selling pressure.</li>
          <li><strong>Thin Rally — Overshoot</strong> — strong fundamentals, price up on light volume. Price may be ahead of activity.</li>
          <li><strong>Cooling — Quiet Beacon</strong> — strong fundamentals, market hasn't noticed yet. Possibly undiscovered.</li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Quick Mover</strong> (strong momentum, weak sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth — Flare</strong> — hot right now, but durability unproven. Could fade.</li>
          <li><strong>Absorbed — Backdraft</strong> — fast activity, price not rewarding it. Possible heavy selling into the move.</li>
          <li><strong>Thin Rally — Flashpoint</strong> — classic pump pattern: real activity, price popping on thin volume.</li>
          <li><strong>Cooling — Afterglow</strong> — momentum likely fading along with price/volume.</li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Slow Burner</strong> (weak momentum, strong sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth — Low Hum</strong> — steady, sticky usage with price/volume finally agreeing.</li>
          <li><strong>Absorbed — Low Signal</strong> — durable usage, possibly undervalued relative to its retention strength.</li>
          <li><strong>Thin Rally — Soft Ping</strong> — modest, low-risk price tick on a stable base.</li>
          <li><strong>Cooling — Standby</strong> — stable but quiet. A "sleeper" — unexciting short-term.</li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Cold</strong> (weak momentum + weak sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth — Mirage</strong> — price/volume rising despite weak fundamentals. Disconnect — possibly hype-driven.</li>
          <li><strong>Absorbed — Bleed</strong> — weak fundamentals, rising volume, falling price. Possible distribution — worth caution.</li>
          <li><strong>Thin Rally — False Flare</strong> — weakest, highest-risk combo: price popping on thin volume with no fundamentals behind it.</li>
          <li><strong>Cooling — Flatline</strong> — weak across the board. Lowest priority.</li>
        </ul>
      </div>
    </details>
  );
}

export default function DashboardTable({ data, discoveryData = [], lastUpdated }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortKey, setSortKey] = useState("Opp");
  const [sortDir, setSortDir] = useState("desc");

  const isTripwire = activeTab === "Tripwire";
  const isAbout = activeTab === "About";
  const isClawd = activeTab === "CLAWD";
  const isSpecialTab = isTripwire || isAbout || isClawd;
  const columns = isSpecialTab ? [] : TABS[activeTab];
  const rawSource = activeTab === "Discover" ? discoveryData : data;
  const sourceData = isSpecialTab ? [] : Array.isArray(rawSource) ? rawSource : [];
  const rowKeyField = activeTab === "Discover" ? "address" : "Address";

  const dataArr = Array.isArray(data) ? data : [];
  const clawdRow = dataArr.find((d) => d["Project"] === "CLAWD") || null;
  const totalProjects = dataArr.length || null;
  const opportunityRank = clawdRow?.["O Rk"] ?? null;
  const momentumRank = clawdRow?.["M Rk"] ?? null;
  const sustainabilityRank = clawdRow?.["S Rk"] ?? null;

  function rankBy(field) {
    const sorted = [...dataArr]
      .filter((d) => d[field] != null)
      .sort((a, b) => Number(b[field]) - Number(a[field]));
    const idx = sorted.findIndex((d) => d["Project"] === "CLAWD");
    return idx >= 0 ? idx + 1 : null;
  }
  const marketCapRank = rankBy("marketCapUsd");
  const walletsRank = rankBy("Wallets 30d");

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "Tripwire" || tab === "About" || tab === "CLAWD") return;
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

  const sorted = isSpecialTab
    ? []
    : [...sourceData].sort((a, b) => {
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
      <StatusBanner lastUpdated={lastUpdated} />

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
        <button
          onClick={() => handleTabChange("CLAWD")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: activeTab === "CLAWD" ? "1px solid #333" : "1px solid #ccc",
            background: activeTab === "CLAWD" ? "#333" : "#fff",
            color: activeTab === "CLAWD" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: activeTab === "CLAWD" ? 600 : 400,
          }}
        >
          CLAWD
        </button>
        <button
          onClick={() => handleTabChange("Tripwire")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: activeTab === "Tripwire" ? "1px solid #333" : "1px solid #ccc",
            background: activeTab === "Tripwire" ? "#333" : "#fff",
            color: activeTab === "Tripwire" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: activeTab === "Tripwire" ? 600 : 400,
          }}
        >
          Tripwire
        </button>
        <button
          onClick={() => handleTabChange("About")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: activeTab === "About" ? "1px solid #333" : "1px solid #ccc",
            background: activeTab === "About" ? "#333" : "#fff",
            color: activeTab === "About" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: activeTab === "About" ? 600 : 400,
          }}
        >
          About
        </button>
      </div>

      {activeTab === "Discover" && (
        <p style={{ color: "#666", marginBottom: "12px", fontSize: "14px" }}>
          AI-category coins from CoinGecko (AI Agents, AI Agent Launchpad, AI Framework, DeFAI) with a Base
          contract address, not yet in your tracked list. Verify each before adding — category tagging on
          CoinGecko isn't perfect either.
        </p>
      )}

      {activeTab === "Overview" && <ProfSignalKey />}

      {isTripwire && <TripwirePanel />}
      {isAbout && <AboutPanel />}
      {isClawd && (
        <ClawdPanel
          clawdRow={clawdRow}
          totalProjects={totalProjects}
          opportunityRank={opportunityRank}
          momentumRank={momentumRank}
          sustainabilityRank={sustainabilityRank}
          marketCapRank={marketCapRank}
          walletsRank={walletsRank}
        />
      )}

      {!isSpecialTab && (
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
      )}
    </div>
  );
}
