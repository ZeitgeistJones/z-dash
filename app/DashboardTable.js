"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import TripwirePanel from "./TripwirePanel";
import AboutPanel from "./AboutPanel";
import ClawdPanel from "./ClawdPanel";


// ── Custom delayed tooltip ────────────────────────────────────────────────────
const HEADER_TOOLTIP_DELAY = 1200;
const CELL_TOOLTIP_DELAY   = 3000;

function useDelayedTooltip() {
  const [tooltip, setTooltip] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((content, e, delay = HEADER_TOOLTIP_DELAY) => {
    clearTimeout(timerRef.current);
    if (!content) return;
    const { clientX, clientY } = e;
    timerRef.current = setTimeout(() => {
      setTooltip({ content, x: clientX, y: clientY });
    }, delay);
  }, []);

  const move = useCallback((e) => {
    setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setTooltip(null);
  }, []);

  return { tooltip, show, move, hide };
}

function TooltipBox({ tooltip }) {
  if (!tooltip) return null;
  const { content, x, y } = tooltip;
  return (
    <div style={{
      position: "fixed",
      left: x + 14,
      top: y + 14,
      maxWidth: "280px",
      background: "var(--bg-muted)",
      border: "1px solid var(--border-strong)",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
      color: "var(--text)",
      lineHeight: "1.5",
      zIndex: 9999,
      pointerEvents: "none",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}>
      {typeof content === "string" ? content : content}
    </div>
  );
}

// ── Pin state helpers ─────────────────────────────────────────────────────────
function loadPins() {
  try { return JSON.parse(localStorage.getItem("zdash-pins") || "[]"); }
  catch { return []; }
}
function savePins(pins) {
  try { localStorage.setItem("zdash-pins", JSON.stringify(pins)); }
  catch {}
}

const TAB_ORDER = ["Overview", "Activity", "Wallets", "Buyers & Risk", "Discover", "CLAWD", "The Wire", "About"];

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
  Beacon: "teal", "Low Hum": "teal", Undercurrent: "teal", "Quiet Beacon": "teal",
  Flare: "amber", "Low Signal": "amber", "Soft Ping": "amber", Afterglow: "amber", Standby: "amber", Mirage: "amber",
  Backdraft: "coral", Flashpoint: "coral", Overshoot: "coral", Bleed: "coral", "False Flare": "coral", Flatline: "coral",
};

const READ_TIER_COLORS = {
  teal: { bg: "var(--read-teal-bg)", text: "var(--read-teal-text)" },
  amber: { bg: "var(--read-amber-bg)", text: "var(--read-amber-text)" },
  coral: { bg: "var(--read-coral-bg)", text: "var(--read-coral-text)" },
};

function ReadBadge({ value }) {
  if (!value) return "—";
  const tier = READ_TIERS[value] || "amber";
  const colors = READ_TIER_COLORS[tier];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "12px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "6px",
        background: colors.bg,
        color: colors.text,
        whiteSpace: "nowrap",
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
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{
          fontSize: "14px", fontWeight: 600, color: "var(--text)", background: "var(--bg)",
          padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
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
    <div style={{
      background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "8px",
      padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5",
    }}>
      <strong>v1 — running on free-tier infrastructure.</strong> Behavioral scores (Opp/Mom/Sus and the
      Activity/Wallets/Buyers &amp; Risk tabs) are refreshed manually, not live —{" "}
      <strong>scores last updated: {formatted}</strong>. Price and Market Cap refresh automatically about
      once an hour. The Wire triggers a real, fresh on-chain query every time it's clicked, so usage may be
      limited to stay within free-tier query credits.
    </div>
  );
}

function SummaryBar({ data }) {
  const arr = Array.isArray(data) ? data : [];
  const total = arr.length;
  const breakouts = arr.filter((d) => d["Prof"] === "Breakout").length;
  const oppValues = arr.map((d) => d["Opp"]).filter((v) => v != null && !Number.isNaN(Number(v)));
  const avgOpp = oppValues.length > 0
    ? (oppValues.reduce((a, b) => a + Number(b), 0) / oppValues.length).toFixed(1)
    : "—";
  const momValues = arr.map((d) => d["Mom"]).filter((v) => v != null && !Number.isNaN(Number(v)));
  const avgMom = momValues.length > 0
    ? (momValues.reduce((a, b) => a + Number(b), 0) / momValues.length).toFixed(1)
    : "—";
  const susValues = arr.map((d) => d["Sus"]).filter((v) => v != null && !Number.isNaN(Number(v)));
  const avgSus = susValues.length > 0
    ? (susValues.reduce((a, b) => a + Number(b), 0) / susValues.length).toFixed(1)
    : "—";
  const withPrice = arr.filter((d) => d["priceUsd"] != null).length;

  const pill = (label, value) => (
    <span key={label} style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: "var(--bg-muted)", border: "1px solid var(--border)",
      borderRadius: "6px", padding: "5px 12px", fontSize: "13px", color: "var(--text)",
    }}>
      <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "var(--pill-value)" }}>{value}</span>
    </span>
  );

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
      {pill("Projects tracked", total)}
      {pill("Breakout", breakouts)}
      {pill("Avg Opp Score", avgOpp)}
      {pill("Avg Mom Score", avgMom)}
      {pill("Avg Sus Score", avgSus)}
      {pill("Price data", withPrice)}
    </div>
  );
}

const PROF_GRID_DATA = [
  {
    prof: "Breakout",
    subtitle: "strong momentum + strong sustainability",
    signals: [
      { signal: "Confirmed Growth", read: "Beacon", desc: "Strongest combo: real usage growing, price agrees." },
      { signal: "Absorbed",         read: "Undercurrent", desc: "Volume isn't moving price yet — possible quiet accumulation." },
      { signal: "Thin Rally",       read: "Overshoot", desc: "Price up on light volume — may be ahead of itself." },
      { signal: "Cooling",          read: "Quiet Beacon", desc: "Market hasn't noticed yet. Possibly undiscovered." },
    ],
  },
  {
    prof: "Quick Mover",
    subtitle: "strong momentum, weak sustainability",
    signals: [
      { signal: "Confirmed Growth", read: "Flare",      desc: "Hot right now, but durability is unproven." },
      { signal: "Absorbed",         read: "Backdraft",  desc: "Fast activity, price not rewarding it." },
      { signal: "Thin Rally",       read: "Flashpoint", desc: "Classic pump pattern: thin volume, price popping." },
      { signal: "Cooling",          read: "Afterglow",  desc: "Momentum likely fading along with price." },
    ],
  },
  {
    prof: "Slow Burner",
    subtitle: "weak momentum, strong sustainability",
    signals: [
      { signal: "Confirmed Growth", read: "Low Hum",    desc: "Steady, sticky usage with price finally agreeing." },
      { signal: "Absorbed",         read: "Low Signal", desc: "Durable usage, possibly undervalued." },
      { signal: "Thin Rally",       read: "Soft Ping",  desc: "Modest, low-risk price tick on a stable base." },
      { signal: "Cooling",          read: "Standby",    desc: "Stable but quiet — a sleeper." },
    ],
  },
  {
    prof: "Cold",
    subtitle: "weak momentum + weak sustainability",
    signals: [
      { signal: "Confirmed Growth", read: "Mirage",      desc: "Price rising despite weak fundamentals — hype-driven." },
      { signal: "Absorbed",         read: "Bleed",       desc: "Weak fundamentals, falling price — possible distribution." },
      { signal: "Thin Rally",       read: "False Flare", desc: "Weakest, highest-risk combo. No substance behind it." },
      { signal: "Cooling",          read: "Flatline",    desc: "Weak across the board — lowest priority." },
    ],
  },
];

function ProfSignalKey() {
  return (
    <details style={{ marginBottom: "4px", fontSize: "14px", color: "var(--text)" }}>
      <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--text)", marginBottom: "10px" }}>
        Key: Profile, Signal & Read explained
      </summary>
      <p style={{ marginTop: "8px", marginBottom: "12px", color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5" }}>
        <strong>Prof</strong> = behavioral profile (price-independent). <strong>Signal</strong> = does price agree with volume this week. <strong>Read</strong> = the named verdict for that combination.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
      }}>
        {PROF_GRID_DATA.map((col) => (
          <div key={col.prof} style={{
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "var(--bg)",
          }}>
            <div style={{
              background: "var(--bg-muted)",
              padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{col.prof}</div>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "2px" }}>{col.subtitle}</div>
            </div>
            {col.signals.map((row) => (
              <div key={row.signal} style={{
                padding: "8px 12px",
                borderTop: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: "11px", color: "var(--text-faint)", marginBottom: "4px", fontWeight: 500 }}>
                  {row.signal}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", flexWrap: "wrap" }}>
                  <ReadBadge value={row.read} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", paddingTop: "2px" }}>
                    {row.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}


export default function DashboardTable({ data, discoveryData = [], lastUpdated }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortKey, setSortKey] = useState("Opp");
  const [sortDir, setSortDir] = useState("desc");
  const [pinnedKeys, setPinnedKeys] = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const dragKeyRef = useRef(null);
  const { tooltip, show: showTooltip, move: moveTooltip, hide: hideTooltip } = useDelayedTooltip();

  useEffect(() => { setPinnedKeys(loadPins()); }, []);

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

  const isTripwire = activeTab === "The Wire";
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
      .sort((a, b) => ascending ? Number(a[field]) - Number(b[field]) : Number(b[field]) - Number(a[field]));
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
  RANK_FIELDS.forEach((f) => { ranks[f] = rankBy(f, LOWER_IS_BETTER.has(f)); });

  function togglePin(key) {
    setPinnedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      savePins(next);
      return next;
    });
  }

  function handleDragStart(key) { dragKeyRef.current = key; }
  function handleDragEnter(key) { setDragOver(key); }
  function handleDragEnd() {
    const from = dragKeyRef.current;
    const to = dragOver;
    dragKeyRef.current = null;
    setDragOver(null);
    if (!from || !to || from === to) return;
    setPinnedKeys((prev) => {
      const next = [...prev];
      const fi = next.indexOf(from);
      const ti = next.indexOf(to);
      if (fi === -1 || ti === -1) return prev;
      next.splice(fi, 1);
      next.splice(ti, 0, from);
      savePins(next);
      return next;
    });
  }

  function getCellRank(colKey, colType, rowData) {
    if (colType !== "number" || isDiscover) return null;
    const val = rowData[colKey];
    if (val == null || val === "" || Number.isNaN(Number(val))) return null;
    const lowerBetter = new Set(["Risk %", "Top10 %"]);
    const asc = lowerBetter.has(colKey);
    const all = dataArr
      .map((d) => Number(d[colKey]))
      .filter((v) => !Number.isNaN(v) && v != null);
    if (all.length === 0) return null;
    const sorted = [...all].sort((a, b) => asc ? a - b : b - a);
    const rank = sorted.indexOf(Number(val)) + 1;
    return { rank, total: sorted.length };
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "The Wire" || tab === "About" || tab === "CLAWD") return;
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

  function tabLabel(tab) {
    if (tab === "Discover") return `Discover${discoveryData.length > 0 ? ` (${discoveryData.length})` : ""}`;
    return tab;
  }

  const pinnedRows = !isDiscover
    ? pinnedKeys.map((k) => sorted.find((d) => d[rowKeyField] === k)).filter(Boolean)
    : [];
  const unpinnedRows = !isDiscover
    ? sorted.filter((d) => !pinnedKeys.includes(d[rowKeyField]))
    : sorted;
  const displayRows = [...pinnedRows, ...unpinnedRows];

  function renderRow(d, idx) {
    const isPinned   = !isDiscover && pinnedKeys.includes(d[rowKeyField]);
    const unpinnedIdx = idx - pinnedRows.length;
    const isRowGated = !isDiscover && !isPinned && unpinnedIdx >= FREE_ROW_COUNT && !hasAccess;
    const isClawdRow = !isDiscover && d["Project"] === "CLAWD";
    const isDragTarget = dragOver === d[rowKeyField] && isPinned;

    return (
      <tr
        key={d[rowKeyField]}
        draggable={isPinned}
        onDragStart={isPinned ? () => handleDragStart(d[rowKeyField]) : undefined}
        onDragEnter={isPinned ? () => handleDragEnter(d[rowKeyField]) : undefined}
        onDragEnd={isPinned ? handleDragEnd : undefined}
        onDragOver={isPinned ? (e) => e.preventDefault() : undefined}
        style={{
          ...(isClawdRow ? { borderLeft: "3px solid #3B6D11", background: "var(--clawd-row-bg)" } : {}),
          ...(isPinned ? { background: isDragTarget ? "var(--bg-subtle)" : "rgba(124,111,205,0.07)" } : {}),
          ...(isDragTarget ? { outline: "2px solid var(--btn-active-bg)", outlineOffset: "-2px" } : {}),
          cursor: isPinned ? "grab" : "default",
        }}
      >
        {!isDiscover && (
          <td style={{ padding: "4px 8px", whiteSpace: "nowrap", width: "28px" }}>
            <button
              onClick={() => togglePin(d[rowKeyField])}
              title={isPinned ? "Unpin" : "Pin to top"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: 1,
                color: isPinned ? "var(--btn-active-bg)" : "var(--text-faint)",
                padding: "0 2px",
                opacity: isPinned ? 1 : 0.65,
                transition: "opacity 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--btn-active-bg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = isPinned ? "1" : "0.65"; e.currentTarget.style.color = isPinned ? "var(--btn-active-bg)" : "var(--text-faint)"; }}
            >
              {isPinned ? "📌" : "📍"}
            </button>
          </td>
        )}
        {columns.map((col) => {
          const rankInfo = !isRowGated ? getCellRank(col.key, col.type, d) : null;
          const cellContent = col.key === "read"
            ? <ReadBadge value={d[col.key]} />
            : col.format ? formatValue(d[col.key], col.format)
            : (d[col.key] ?? "—");
          const rankTooltipContent = rankInfo ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
                {rankInfo.rank} <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>/ {rankInfo.total}</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Rank for <strong>{col.label}</strong>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "4px", borderTop: "1px solid var(--border)", paddingTop: "4px" }}>
                1 = best · {rankInfo.total} = worst
              </div>
            </div>
          ) : null;
          return (
            <td
              key={col.key}
              style={{ padding: "6px 12px", whiteSpace: "nowrap" }}
              onMouseEnter={rankTooltipContent ? (e) => showTooltip(rankTooltipContent, e, 3000) : undefined}
              onMouseMove={rankTooltipContent ? moveTooltip : undefined}
              onMouseLeave={rankTooltipContent ? hideTooltip : undefined}
            >
              <GatedCell blurred={isRowGated}>
                {cellContent}
              </GatedCell>
            </td>
          );
        })}
      </tr>
    );
  }

  const tableBody = !isSpecialTab && (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", marginTop: "8px", width: "100%" }}>
        <thead>
          <tr>
            {!isDiscover && <th style={{ width: "28px", borderBottom: "1px solid var(--border-strong)", padding: "6px 8px" }} />}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                onMouseEnter={col.tooltip ? (e) => showTooltip(col.tooltip, e, 1200) : undefined}
                onMouseMove={col.tooltip ? moveTooltip : undefined}
                onMouseLeave={col.tooltip ? hideTooltip : undefined}
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid var(--border-strong)",
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
          {pinnedRows.length > 0 && (
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: "2px 12px 0", fontSize: "10px", color: "var(--text-xfaint)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", background: "var(--bg-subtle)" }}>
                Pinned — drag to reorder
              </td>
            </tr>
          )}
          {displayRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: "16px", color: "var(--text-muted)" }}>
                {isDiscover ? "No new candidates found." : "No data."}
              </td>
            </tr>
          ) : (
            displayRows.map((d, idx) => renderRow(d, idx))
          )}
        </tbody>
      </table>
    </div>
  );

  const allTabsToRender = [...Object.keys(TABS), "CLAWD", "The Wire", "About"];

  return (
    <div>
      <StatusBanner lastUpdated={lastUpdated} />

      <div style={{ display: "flex", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
        {allTabsToRender.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: activeTab === tab ? "1px solid var(--btn-active-bg)" : "1px solid var(--btn-inactive-border)",
              background: activeTab === tab ? "var(--btn-active-bg)" : "var(--btn-inactive-bg)",
              color: activeTab === tab ? "var(--btn-active-text)" : "var(--btn-inactive-text)",
              cursor: "pointer",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-xfaint)", marginBottom: "12px" }}>
        Tip: press <strong>[</strong> or <strong>]</strong> to switch tabs. Hover a column header 1–2s for its definition. Hover any number 3s to see its rank. Click 📍 to pin a row to the top.
      </p>

      {!isSpecialTab && !isDiscover && <SummaryBar data={dataArr} />}

      {isDiscover && (
        <p style={{ color: "var(--text-muted)", marginBottom: "12px", fontSize: "14px" }}>
          AI-category coins from CoinGecko (AI Agents, AI Agent Launchpad, AI Framework, DeFAI) with a Base
          contract address, not yet in your tracked list. Verify each before adding — category tagging on
          CoinGecko isn't perfect either.
        </p>
      )}

      {activeTab === "Overview" && <ProfSignalKey />}

      <div style={{ minHeight: "500px" }}>
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

      <TooltipBox tooltip={tooltip} />
    </div>
  );
}
