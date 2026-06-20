"use client";
import { useState } from "react";
import TripwirePanel from "./TripwirePanel";
import AboutPanel from "./AboutPanel";

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
    <div className="banner">
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
    <details className="key">
      <summary>
        Key: what do Prof + Signal combos mean?
      </summary>
      <div className="key-body">
        <p style={{ marginBottom: "8px" }}>
          <strong>Prof</strong> = behavioral profile (wallets/txs/retention, price-independent).{" "}
          <strong>Signal</strong> = does price agree with volume right now (a separate, price-aware layer).
          Reading both together shows whether real usage and market reaction agree.
        </p>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Breakout</strong> (strong momentum + strong sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth</strong> — strongest combo on the board: real usage growing, price agrees.</li>
          <li><strong>Absorbed</strong> — strong fundamentals, but volume isn't moving price yet. Possible accumulation or quiet selling pressure.</li>
          <li><strong>Thin Rally</strong> — strong fundamentals, price up on light volume. Price may be ahead of activity.</li>
          <li><strong>Cooling</strong> — strong fundamentals, market hasn't noticed yet. Possibly undiscovered.</li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Quick Mover</strong> (strong momentum, weak sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth</strong> — hot right now, but durability unproven. Could fade.</li>
          <li><strong>Absorbed</strong> — fast activity, price not rewarding it. Possible heavy selling into the move.</li>
          <li><strong>Thin Rally</strong> — classic pump pattern: real activity, price popping on thin volume.</li>
          <li><strong>Cooling</strong> — momentum likely fading along with price/volume.</li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Slow Burner</strong> (weak momentum, strong sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth</strong> — steady, sticky usage with price/volume finally agreeing.</li>
          <li><strong>Absorbed</strong> — durable usage, possibly undervalued relative to its retention strength.</li>
          <li><strong>Thin Rally</strong> — modest, low-risk price tick on a stable base.</li>
          <li><strong>Cooling</strong> — stable but quiet. A "sleeper" — unexciting short-term.</li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Cold</strong> (weak momentum + weak sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth</strong> — price/volume rising despite weak fundamentals. Disconnect — possibly hype-driven.</li>
          <li><strong>Absorbed</strong> — weak fundamentals, rising volume, falling price. Possible distribution — worth caution.</li>
          <li><strong>Thin Rally</strong> — weakest, highest-risk combo: price popping on thin volume with no fundamentals behind it.</li>
          <li><strong>Cooling</strong> — weak across the board. Lowest priority.</li>
        </ul>
      </div>
    </details>
  );
}

function StatCards({ data, discoveryData }) {
  const rows = Array.isArray(data) ? data : [];
  const total = rows.length;

  const breakouts = rows.filter((d) => d["Prof"] === "Breakout").length;

  const oppVals = rows
    .map((d) => Number(d["Opp"]))
    .filter((n) => Number.isFinite(n));
  const avgOpp = oppVals.length
    ? (oppVals.reduce((a, b) => a + b, 0) / oppVals.length).toFixed(1)
    : "—";

  const confirmed = rows.filter((d) => d["signal"] === "Confirmed Growth").length;

  const cards = [
    { label: "Projects Tracked", value: total, sub: "cohort size" },
    { label: "Breakouts", value: breakouts, sub: "above median on both", accent: true },
    { label: "Avg Opportunity", value: avgOpp, sub: "behavioral score" },
    {
      label: "Discover Candidates",
      value: Array.isArray(discoveryData) ? discoveryData.length : 0,
      sub: "not yet tracked",
    },
    { label: "Confirmed Growth", value: confirmed, sub: "vol up · price up" },
  ];

  return (
    <div className="stat-grid">
      {cards.slice(0, 4).map((c) => (
        <div key={c.label} className="stat-card">
          <span className="stat-label">{c.label}</span>
          <span className={`stat-value num ${c.accent ? "stat-accent" : ""}`}>{c.value}</span>
          <span className="stat-sub">{c.sub}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardTable({ data, discoveryData = [], lastUpdated }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortKey, setSortKey] = useState("Opp");
  const [sortDir, setSortDir] = useState("desc");

  const isTripwire = activeTab === "Tripwire";
  const isAbout = activeTab === "About";
  const isSpecialTab = isTripwire || isAbout;
  const columns = isSpecialTab ? [] : TABS[activeTab];
  const rawSource = activeTab === "Discover" ? discoveryData : data;
  const sourceData = isSpecialTab ? [] : Array.isArray(rawSource) ? rawSource : [];
  const rowKeyField = activeTab === "Discover" ? "address" : "Address";

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "Tripwire" || tab === "About") return;
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

      <StatCards data={data} discoveryData={discoveryData} />

      {/* TAB BAR */}
      <div className="tabs">
        {Object.keys(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`tab ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
            {tab === "Discover" && discoveryData.length > 0 ? (
              <span className="tab-count"> ({discoveryData.length})</span>
            ) : (
              ""
            )}
          </button>
        ))}
        <button
          onClick={() => handleTabChange("Tripwire")}
          className={`tab ${activeTab === "Tripwire" ? "active" : ""}`}
        >
          Tripwire
        </button>
        <button
          onClick={() => handleTabChange("About")}
          className={`tab ${activeTab === "About" ? "active" : ""}`}
        >
          About
        </button>
      </div>

      {activeTab === "Discover" && (
        <p className="note">
          AI-category coins from CoinGecko (AI Agents, AI Agent Launchpad, AI Framework, DeFAI) with a Base
          contract address, not yet in your tracked list. Verify each before adding — category tagging on
          CoinGecko isn't perfect either.
        </p>
      )}

      {activeTab === "Overview" && <ProfSignalKey />}

      {isTripwire && <TripwirePanel />}
      {isAbout && <AboutPanel />}

      {!isSpecialTab && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`sortable ${col.type === "number" ? "num" : ""}`}
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      <span className="arrow">{sortDir === "desc" ? "▼" : "▲"}</span>
                    ) : (
                      ""
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="empty">
                    {activeTab === "Discover" ? "No new candidates found." : "No data."}
                  </td>
                </tr>
              ) : (
                sorted.map((d) => (
                  <tr key={d[rowKeyField]}>
                    {columns.map((col) => (
                      <td key={col.key} className={col.type === "number" ? "num" : ""}>
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
