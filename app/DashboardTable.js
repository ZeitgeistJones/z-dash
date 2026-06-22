"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import TripwirePanel from "./TripwirePanel";
import AboutPanel from "./AboutPanel";
import ClawdPanel from "./ClawdPanel";
import GateButton from "./GateButton";

const TAB_ORDER = ["Overview", "Activity", "Wallets", "Buyers & Risk", "Discover", "CLAWD", "Tripwire", "About"];

const GATE_ADDRESS = "0xc22B7b983EC81523c969753c2385106835E8CfCE";
const GATE_ABI = [
  {
    name: "hasAccess",
    type: "function",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "tier", type: "uint8" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
];

const FREE_ROW_COUNT = 5;

const TABS = {
  Overview: [
    { key: "Project", label: "Project", type: "string" },
    { key: "read", label: "Read", type: "string", tooltip: "The named verdict for this token's Profile + Signal combination" },
    { key: "Opp", label: "Opp", type: "number", format: "dec1", tooltip: "How attractive this token looks overall — a blend of momentum, retention, quality, and risk" },
    { key: "Mom", label: "Mom", type: "number", format: "dec1", tooltip: "How fast this token is growing right now across wallets, transactions, and volume" },
    { key: "Sus", label: "Sus", type: "number", format: "dec1", tooltip: "How sticky the growth is — whether users keep coming back, not just showing up once" },
    { key: "Prof", label: "Prof", type: "string", tooltip: "Whether this token scores above or below average on both momentum and sustainability" },
    { key: "priceUsd", label: "Price", type: "number", format: "price", tooltip: "Live token price in USD from CoinGecko" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd", tooltip: "Live market cap in USD from CoinGecko" },
    { key: "signal", label: "Signal", type: "string", tooltip: "Whether price and volume are moving in the same direction this week" },
    { key: "signalScore", label: "Signal Score", type: "number", format: "dec1", tooltip: "A single number combining price change and volume growth — positive means both are moving up" },
  ],
  Activity: [
    { key: "Project", label: "Project", type: "string" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd", tooltip: "Live market cap in USD from CoinGecko" },
    { key: "Vol 30d", label: "Vol 30d", type: "number", format: "usd", tooltip: "Total dollar value traded on DEX in the last 30 days" },
    { key: "Vol/Tx", label: "Vol/Tx", type: "number", format: "dec2", tooltip: "Average dollar value per transaction — a proxy for how serious the traders are" },
    { key: "Vol/Wlt", label: "Vol/Wlt", type: "number", format: "dec2", tooltip: "Average dollar volume per unique wallet in 30 days" },
    { key: "Vol Grw %", label: "Vol Grw %", type: "number", format: "pct1", tooltip: "How much DEX volume changed this week vs last week" },
    { key: "Txs 30d", label: "Txs 30d", type: "number", format: "int", tooltip: "Total number of on-chain transactions in the last 30 days" },
    { key: "Txs 7d", label: "Txs 7d", type: "number", format: "int", tooltip: "Total number of on-chain transactions in the last 7 days" },
    { key: "Tx Grw %", label: "Tx Grw %", type: "number", format: "pct1", tooltip: "How much transaction count changed this week vs last week" },
    { key: "Txs/User", label: "Txs/User", type: "number", format: "dec1", tooltip: "Average number of transactions per wallet in 30 days — higher means more engaged users" },
  ],
  Wallets: [
    { key: "Project", label: "Project", type: "string" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd", tooltip: "Live market cap in USD from CoinGecko" },
    { key: "Wallets 30d", label: "Wallets 30d", type: "number", format: "int", tooltip: "Unique wallets that interacted with this token in the last 30 days" },
    { key: "Wallets 7d", label: "Wallets 7d", type: "number", format: "int", tooltip: "Unique wallets that interacted in the last 7 days" },
    { key: "User Grw %", label: "User Grw %", type: "number", format: "pct1", tooltip: "How much the unique wallet count changed this week vs last week" },
    { key: "New Wallets", label: "New Wallets", type: "number", format: "int", tooltip: "Wallets that appeared for the first time in the last 30 days" },
    { key: "Returning Wallets", label: "Returning Wallets", type: "number", format: "int", tooltip: "Wallets that had prior history and came back in the last 30 days" },
    { key: "New %", label: "New Wallet %", type: "number", format: "pct1", tooltip: "Share of 30-day users who are brand new — high means lots of new arrivals, low means mostly returning users" },
    { key: "Retention %", label: "Retention %", type: "number", format: "pct1", tooltip: "This week's active wallets divided by last week's — over 100% means the user base is growing" },
    { key: "Avg Txs Ret", label: "Avg Txs Ret", type: "number", format: "dec1", tooltip: "Average transactions per returning wallet this week — a measure of how engaged the loyal users are" },
  ],
  "Buyers & Risk": [
    { key: "Project", label: "Project", type: "string" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd", tooltip: "Live market cap in USD from CoinGecko" },
    { key: "Qlty %", label: "Qlty %", type: "number", format: "pct1", tooltip: "How clean the activity looks — penalizes bot-like patterns, extreme concentration, and unrealistic retention" },
    { key: "Traders", label: "Traders", type: "number", format: "int", tooltip: "Unique wallets that bought or sold on DEX in the last 30 days" },
    { key: "Buyers 30d", label: "Buyers 30d", type: "number", format: "int", tooltip: "Unique wallets that bought in the last 30 days" },
    { key: "Buyers 7d", label: "Buyers 7d", type: "number", format: "int", tooltip: "Unique wallets that bought in the last 7 days" },
    { key: "1st Buyers 30d", label: "1st Buyers 30d", type: "number", format: "int", tooltip: "Wallets buying this token for the very first time in the last 30 days" },
    { key: "1st Buyers 7d", label: "1st Buyers 7d", type: "number", format: "int", tooltip: "Wallets buying for the first time in the last 7 days" },
    { key: "1st Sellers 30d", label: "1st Sellers 30d", type: "number", format: "int", tooltip: "Wallets selling this token for the very first time in the last 30 days" },
    { key: "1st Sellers 7d", label: "1st Sellers 7d", type: "number", format: "int", tooltip: "Wallets selling for the first time in the last 7 days" },
    { key: "Non-Trade New 30d", label: "Non-Trade New", type: "number", format: "int", tooltip: "New wallets that arrived without buying or selling — likely from airdrops or transfers" },
    { key: "Top10 %", label: "Top10 %", type: "number", format: "pct1", tooltip: "Share of all transactions coming from the top 10 most active wallets — lower is healthier" },
    { key: "Risk %", label: "Risk %", type: "number", format: "pct1", tooltip: "How concentrated the volume is in a few wallets — higher means more concentrated, which is higher risk" },
  ],
  Discover: [
    { key: "name", label: "Project", type: "string" },
    { key: "symbol", label: "Symbol", type: "string" },
    { key: "marketCapUsd", label: "Market Cap", type: "number", format: "usd", tooltip: "Live market cap in USD from CoinGecko" },
    { key: "priceUsd", label: "Price", type: "number", format: "price", tooltip: "Live token price in USD from CoinGecko" },
    { key: "address", label: "Address", type: "string" },
  ],
};

// Task 2 — Read badge tooltips
const READ_TOOLTIPS = {
  Beacon: "Strongest combo: real usage growing and price agrees",
  "Quiet Beacon": "Strong fundamentals, but the market hasn't priced it in yet",
  Undercurrent: "Strong fundamentals, volume isn't moving price — possible quiet accumulation",
  Overshoot: "Strong fundamentals but price is up on light volume — may be ahead of itself",
  Flare: "Hot right now, but durability is unproven — watch for fade",
  Afterglow: "Momentum likely fading along with price",
  Backdraft: "Fast activity but price isn't rewarding it — possible heavy selling into the move",
  Flashpoint: "Classic pump pattern: activity up, price popping on thin volume",
  "Low Hum": "Steady, sticky usage with price and volume finally agreeing",
  Standby: "Stable but quiet — a sleeper with no near-term catalyst",
  "Low Signal": "Durable usage, possibly undervalued relative to its retention strength",
  "Soft Ping": "Modest low-risk price tick on a stable base",
  Mirage: "Price rising despite weak fundamentals — possibly hype-driven, no substance behind it",
  Flatline: "Weak across the board — lowest priority",
  Bleed: "Weak fundamentals, rising volume, falling price — possible distribution",
  "False Flare": "Weakest, highest-risk combo: price popping on thin volume with nothing behind it",
};

const READ_TIERS = {
  Beacon: "teal",
  "Low Hum": "teal",
  Undercurrent: "teal",
  "Quiet Beacon": "teal",
  Flare: "amber",
  "Low Signal": "amber",
  "Soft Ping": "amber",
  Afterglow: "amber",
  Standby: "amber",
  Mirage: "amber",
  Backdraft: "coral",
  Flashpoint: "coral",
  Overshoot: "coral",
  Bleed: "coral",
  "False Flare": "coral",
  Flatline: "coral",
};

const READ_TIER_COLORS = {
  teal: { bg: "#E1F5EE", text: "#085041" },
  amber: { bg: "#FAEEDA", text: "#633806" },
  coral: { bg: "#FAECE7", text: "#712B13" },
};

function ReadBadge({ value }) {
  if (!value) return "—";
  const tier = READ_TIERS[value] || "amber";
  const colors = READ_TIER_COLORS[tier];
  return (
    <span
      title={READ_TOOLTIPS[value] || value}
      style={{
        display: "inline-block",
        fontSize: "12px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "6px",
        background: colors.bg,
        color: colors.text,
        whiteSpace: "nowrap",
        cursor: "help",
      }}
    >
      {value}
    </span>
  );
}

function GatedCell({ blurred, children }) {
  if (!blurred) return children;
  return (
    <span style={{ filter: "blur(6px)", userSelect: "none", display: "inline-block" }}>
      {children}
    </span>
  );
}

function GatedSection({ blurred, children }) {
  if (!blurred) return children;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#333",
            background: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          🔒 Connect a wallet holding 10M+ CLAWD to unlock
        </p>
      </div>
    </div>
  );
}

function formatValue(val, format) {
  if (val == null || val === "") return "—";
  const n = Number(val);
  if (Number.isNaN(n)) return "—";
  if (format === "price") return `$${n.toPrecision(4)}`;
  if (format === "usd") return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (format === "pct1") return `${n.toFixed(1)}%`;
  if (format === "int") return Math.round(n).toLocaleString();
  if (format === "dec1") return n.toFixed(1);
  if (format === "dec2") return n.toFixed(2);
  return val;
}

function StatusBanner({ lastUpdated }) {
  const formatted = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
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

// Task 3 — Summary Stats Bar
function SummaryBar({ data }) {
  const arr = Array.isArray(data) ? data : [];
  const total = arr.length;
  const breakouts = arr.filter((d) => d["Prof"] === "Breakout").length;
  const oppValues = arr.map((d) => d["Opp"]).filter((v) => v != null && !Number.isNaN(Number(v)));
  const avgOpp = oppValues.length > 0
    ? (oppValues.reduce((a, b) => a + Number(b), 0) / oppValues.length).toFixed(1)
    : "—";
  const withPrice = arr.filter((d) => d["priceUsd"] != null).length;

  const pill = (label, value) => (
    <span
      key={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "#f3f2ee",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        padding: "5px 12px",
        fontSize: "13px",
        color: "#444",
      }}
    >
      <span style={{ color: "#888", fontWeight: 400 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#222" }}>{value}</span>
    </span>
  );

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
      {pill("Projects tracked", total)}
      {pill("Breakout", breakouts)}
      {pill("Avg Opp Score", avgOpp)}
      {pill("Price data", withPrice)}
    </div>
  );
}

function ProfSignalKey() {
  return (
    <details style={{ marginBottom: "16px", fontSize: "14px", color: "#444" }}>
      <summary style={{ cursor: "pointer", fontWeight: 600, color: "#333" }}>
        Key: what do Prof + Signal + Read mean?
      </summary>
      <div style={{ marginTop: "10px", lineHeight: "1.6" }}>
        <p style={{ marginBottom: "8px" }}>
          <strong>Prof</strong> = behavioral profile (wallets/txs/retention, price-independent).{" "}
          <strong>Signal</strong> = does price agree with volume right now (a separate, price-aware layer).{" "}
          <strong>Read</strong> = the named verdict for that specific Prof + Signal combination.
        </p>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Breakout</strong> (strong momentum + strong sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px", listStyle: "none" }}>
          <li style={{ marginBottom: "4px" }}>
            <strong>Confirmed Growth</strong> — <ReadBadge value="Beacon" /> — strongest combo on the board:
            real usage growing, price agrees.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Absorbed</strong> — <ReadBadge value="Undercurrent" /> — strong fundamentals, but volume
            isn't moving price yet.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Thin Rally</strong> — <ReadBadge value="Overshoot" /> — strong fundamentals, price up on
            light volume.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Cooling</strong> — <ReadBadge value="Quiet Beacon" /> — strong fundamentals, market hasn't
            noticed yet.
          </li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Quick Mover</strong> (strong momentum, weak sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px", listStyle: "none" }}>
          <li style={{ marginBottom: "4px" }}>
            <strong>Confirmed Growth</strong> — <ReadBadge value="Flare" /> — hot right now, durability
            unproven.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Absorbed</strong> — <ReadBadge value="Backdraft" /> — fast activity, price not rewarding it.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Thin Rally</strong> — <ReadBadge value="Flashpoint" /> — classic pump pattern.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Cooling</strong> — <ReadBadge value="Afterglow" /> — momentum likely fading.
          </li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Slow Burner</strong> (weak momentum, strong sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px", listStyle: "none" }}>
          <li style={{ marginBottom: "4px" }}>
            <strong>Confirmed Growth</strong> — <ReadBadge value="Low Hum" /> — steady, sticky usage finally
            agreeing with price.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Absorbed</strong> — <ReadBadge value="Low Signal" /> — durable usage, possibly undervalued.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Thin Rally</strong> — <ReadBadge value="Soft Ping" /> — modest, low-risk price tick.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Cooling</strong> — <ReadBadge value="Standby" /> — stable but quiet.
          </li>
        </ul>

        <p style={{ marginTop: "12px", marginBottom: "4px" }}>
          <strong>Cold</strong> (weak momentum + weak sustainability)
        </p>
        <ul style={{ marginTop: 0, paddingLeft: "20px", listStyle: "none" }}>
          <li style={{ marginBottom: "4px" }}>
            <strong>Confirmed Growth</strong> — <ReadBadge value="Mirage" /> — rising despite weak fundamentals,
            possibly hype-driven.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Absorbed</strong> — <ReadBadge value="Bleed" /> — weak fundamentals, falling price, worth
            caution.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Thin Rally</strong> — <ReadBadge value="False Flare" /> — weakest, highest-risk combo.
          </li>
          <li style={{ marginBottom: "4px" }}>
            <strong>Cooling</strong> — <ReadBadge value="Flatline" /> — weak across the board.
          </li>
        </ul>
      </div>
    </details>
  );
}

export default function DashboardTable({ data, discoveryData = [], lastUpdated }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortKey, setSortKey] = useState("Opp");
  const [sortDir, setSortDir] = useState("desc");

  const { address } = useAccount();
  const { data: hasAccessRaw } = useReadContract({
    address: GATE_ADDRESS,
    abi: GATE_ABI,
    functionName: "hasAccess",
    args: address ? [address, 1] : undefined,
    chainId: base.id,
    query: { enabled: !!address },
  });
  const hasAccess = !!hasAccessRaw;

  const isTripwire = activeTab === "Tripwire";
  const isAbout = activeTab === "About";
  const isClawd = activeTab === "CLAWD";
  const isDiscover = activeTab === "Discover";
  const isSpecialTab = isTripwire || isAbout || isClawd;
  const columns = isSpecialTab ? [] : TABS[activeTab];
  const rawSource = isDiscover ? discoveryData : data;
  const sourceData = isSpecialTab ? [] : Array.isArray(rawSource) ? rawSource : [];
  const rowKeyField = isDiscover ? "address" : "Address";

  const dataArr = Array.isArray(data) ? data : [];
  const clawdRow = dataArr.find((d) => d["Project"] === "CLAWD") || null;
  const totalProjects = dataArr.length || null;
  const opportunityRank = clawdRow?.["O Rk"] ?? null;
  const momentumRank = clawdRow?.["M Rk"] ?? null;
  const sustainabilityRank = clawdRow?.["S Rk"] ?? null;

  function rankBy(field, ascending = false) {
    const sorted = [...dataArr]
      .filter((d) => d[field] != null && d[field] !== "")
      .sort((a, b) =>
        ascending ? Number(a[field]) - Number(b[field]) : Number(b[field]) - Number(a[field])
      );
    const idx = sorted.findIndex((d) => d["Project"] === "CLAWD");
    return idx >= 0 ? idx + 1 : null;
  }

  const marketCapRank = rankBy("marketCapUsd");
  const walletsRank = rankBy("Wallets 30d");

  const RANK_FIELDS = [
    "Vol Grw %", "Tx Grw %", "User Grw %", "Txs 30d", "Vol 30d", "Txs/User", "Traders",
    "Retention %", "New %", "New Wallets", "Returning Wallets", "Non-Trade New 30d",
    "Buyers 30d", "Buyers 7d", "1st Buyers 30d", "1st Buyers 7d",
    "1st Sellers 30d", "1st Sellers 7d", "Qlty %", "Risk %", "Top10 %", "Vol/Tx",
  ];

  const LOWER_IS_BETTER = new Set(["Risk %", "Top10 %"]);
  const ranks = {};
  RANK_FIELDS.forEach((f) => {
    ranks[f] = rankBy(f, LOWER_IS_BETTER.has(f));
  });

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "Tripwire" || tab === "About" || tab === "CLAWD") return;
    const firstNumeric = TABS[tab]?.find((c) => c.type === "number");
    setSortKey(firstNumeric ? firstNumeric.key : TABS[tab]?.[0]?.key);
    setSortDir("desc");
  }

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.key !== "[" && e.key !== "]") return;
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      if (currentIndex === -1) return;
      const direction = e.key === "]" ? 1 : -1;
      const nextIndex = (currentIndex + direction + TAB_ORDER.length) % TAB_ORDER.length;
      handleTabChange(TAB_ORDER[nextIndex]);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

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

  // Task 5 — tab column count label helper
  function tabLabel(tab) {
    if (tab === "Discover") {
      return `Discover${discoveryData.length > 0 ? ` (${discoveryData.length})` : ""}`;
    }
    if (TABS[tab]) {
      return `${tab} (${TABS[tab].length})`;
    }
    return tab;
  }

  const tableBody = !isSpecialTab && (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", marginTop: "8px", width: "100%" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                title={col.tooltip || ""}
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #ccc",
                  padding: "6px 12px",
                  cursor: col.tooltip ? "help" : "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
                {sortKey === col.key ? (sortDir === "desc" ? " ▼" : " ▲") : ""}
                {col.tooltip && (
                  <span style={{ marginLeft: "3px", fontSize: "10px", color: "#bbb", fontWeight: 400 }}>ⓘ</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "16px", color: "#666" }}>
                {isDiscover ? "No new candidates found." : "No data."}
              </td>
            </tr>
          ) : (
            sorted.map((d, idx) => {
              const isRowGated = !isDiscover && idx >= FREE_ROW_COUNT && !hasAccess;
              // Task 4 — CLAWD row highlight
              const isClawd = !isDiscover && d["Project"] === "CLAWD";
              return (
                <tr
                  key={d[rowKeyField]}
                  style={
                    isClawd
                      ? { borderLeft: "3px solid #3B6D11", background: "rgba(59,109,17,0.05)" }
                      : {}
                  }
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: "6px 12px", whiteSpace: "nowrap" }}>
                      <GatedCell blurred={isRowGated}>
                        {col.key === "read" ? (
                          <ReadBadge value={d[col.key]} />
                        ) : col.format ? (
                          formatValue(d[col.key], col.format)
                        ) : (
                          d[col.key] ?? "—"
                        )}
                      </GatedCell>
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // All tab buttons — unified loop
  const allTabsToRender = [...Object.keys(TABS), "CLAWD", "Tripwire", "About"];

  return (
    <div>
      <StatusBanner lastUpdated={lastUpdated} />
      <GateButton hasAccess={hasAccess} />

      <div style={{ display: "flex", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
        {allTabsToRender.map((tab) => (
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
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "12px" }}>
        Tip: press <strong>[</strong> or <strong>]</strong> to switch tabs.
      </p>

      {/* Task 3 — Summary stats bar (shown on data tabs only) */}
      {!isSpecialTab && !isDiscover && <SummaryBar data={dataArr} />}

      {isDiscover && (
        <p style={{ color: "#666", marginBottom: "12px", fontSize: "14px" }}>
          AI-category coins from CoinGecko (AI Agents, AI Agent Launchpad, AI Framework, DeFAI) with a Base
          contract address, not yet in your tracked list. Verify each before adding — category tagging on
          CoinGecko isn't perfect either.
        </p>
      )}

      {activeTab === "Overview" && <ProfSignalKey />}

      {isTripwire && <TripwirePanel hasAccess={hasAccess} />}
      {isAbout && <AboutPanel />}
      {isClawd && (
        <GatedSection blurred={!hasAccess}>
          <ClawdPanel
            clawdRow={clawdRow}
            totalProjects={totalProjects}
            opportunityRank={opportunityRank}
            momentumRank={momentumRank}
            sustainabilityRank={sustainabilityRank}
            marketCapRank={marketCapRank}
            walletsRank={walletsRank}
            ranks={ranks}
          />
        </GatedSection>
      )}

      {isDiscover ? <GatedSection blurred={!hasAccess}>{tableBody}</GatedSection> : tableBody}
    </div>
  );
}
