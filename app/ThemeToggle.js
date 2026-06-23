This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
app/
  api/
    clawd-history/
      route.js
    tripwire/
      start/
        route.js
      status/
        route.js
  AboutPanel.js
  ClawdPanel.js
  DashboardTable.js
  GateButton.js
  Header.js
  layout.js
  page.js
  providers.js
  ThemeToggle.js
  TripwirePanel.js
lib/
  coingeckoFetch.js
  getData.js
  getDiscoveryData.js
  tokens.js
public/
  .gitkeep
  clawd-pfp.png
jsconfig.json
package.json
README.md
ThemeToggle.js
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="app/api/clawd-history/route.js">
import { fetchCoinGeckoJSON } from "../../../lib/coingeckoFetch";

const DUNE_QUERY_ID = "7767406";
const CLAWD_ADDRESS = "0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07";

export async function GET() {
  try {
    const duneRes = await fetch(
      `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results`,
      {
        headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
        cache: "no-store",
      }
    );
    if (!duneRes.ok) {
      return Response.json({ error: `Dune API error: ${duneRes.status}` }, { status: 500 });
    }
    const duneJson = await duneRes.json();
    const behavioralHistory = duneJson.result?.rows || [];

    let priceHistory = { prices: [], market_caps: [] };
    const cgResult = await fetchCoinGeckoJSON(
      `https://api.coingecko.com/api/v3/coins/base/contract/${CLAWD_ADDRESS}/market_chart?vs_currency=usd&days=60`
    );
    if (cgResult.ok) {
      priceHistory = {
        prices: cgResult.data.prices || [],
        market_caps: cgResult.data.market_caps || [],
      };
    } else {
      priceHistory.error = `CoinGecko ${cgResult.status || "error"}`;
    }

    return Response.json({ behavioralHistory, priceHistory });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
</file>

<file path="app/api/tripwire/start/route.js">
const TRIPWIRE_QUERY_ID = "7765068";

export async function POST() {
  try {
    const res = await fetch(
      `https://api.dune.com/api/v1/query/${TRIPWIRE_QUERY_ID}/execute`,
      {
        method: "POST",
        headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
      }
    );
    if (!res.ok) {
      return Response.json({ error: `Dune execute failed: ${res.status}` }, { status: 500 });
    }
    const json = await res.json();
    return Response.json({ executionId: json.execution_id });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
</file>

<file path="app/api/tripwire/status/route.js">
async function fetchCoinGeckoMarketCap(address) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/base/contract/${address}`,
      {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.market_data?.market_cap?.usd || null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get("executionId");
  if (!executionId) {
    return Response.json({ error: "Missing executionId" }, { status: 400 });
  }

  try {
    const statusRes = await fetch(
      `https://api.dune.com/api/v1/execution/${executionId}/status`,
      { headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY } }
    );
    const statusJson = await statusRes.json();

    if (statusJson.state !== "QUERY_STATE_COMPLETED") {
      return Response.json({ state: statusJson.state });
    }

    const resultsRes = await fetch(
      `https://api.dune.com/api/v1/execution/${executionId}/results`,
      { headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY } }
    );
    const resultsJson = await resultsRes.json();
    const rows = resultsJson.result?.rows || [];

    const enriched = await Promise.all(
      rows.map(async (row) => {
        const address = row["Address"];
        const marketCapUsd = address ? await fetchCoinGeckoMarketCap(address) : null;
        return { ...row, marketCapUsd };
      })
    );

    return Response.json({ state: "QUERY_STATE_COMPLETED", rows: enriched });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
</file>

<file path="app/AboutPanel.js">
export default function AboutPanel() {
  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ maxWidth: "800px", lineHeight: "1.7", color: "#333", flex: "1 1 500px" }}>
        <h2 style={{ marginTop: 0 }}>About z-dash</h2>
        <p>
          z-dash tracks AI agent projects on Base — combining on-chain behavior (wallets, transactions, retention)
          from Dune with live price and market cap from CoinGecko. The three core scores are deliberately
          <strong> price-independent</strong> — they measure real usage, not speculation — while Price, Market Cap,
          and Signal sit alongside them as a separate, informational layer.
        </p>

        <h3>The Three Core Scores</h3>

        <p><strong>Momentum Score</strong> — growth-first. Weighted toward what's changing right now:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>25% New wallet acquisition</li>
          <li>25% Week-over-week growth (blend of tx/user/volume growth)</li>
          <li>20% Retention rate</li>
          <li>15% Economic density (volume per tx + volume per wallet)</li>
          <li>10% Wallet engagement trend</li>
          <li>3% Top-10 wallet concentration (penalty — less concentration scores higher)</li>
          <li>2% Transactions per user</li>
        </ul>

        <p><strong>Sustainability Score</strong> — retention-first. Same seven ingredients as Momentum, reweighted to favor staying power over speed:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>10% New wallet acquisition</li>
          <li>15% Week-over-week growth</li>
          <li>30% Retention rate</li>
          <li>25% Economic density</li>
          <li>15% Wallet engagement trend</li>
          <li>3% Top-10 concentration penalty</li>
          <li>2% Transactions per user</li>
        </ul>

        <p>
          <strong>Opportunity Score</strong> = (Momentum × 0.5 + Sustainability × 0.5) × (Quality % ÷ 100) ×
          (1 − Risk % ÷ 100). A behavioral blend of the two scores above, with a quality/risk haircut applied —
          not a financial metric, no price involved anywhere in the math.
        </p>

        <h3>The Two Modifiers</h3>
        <p>
          <strong>Activity Quality %</strong> — starts at 100, then subtracts penalties for: transaction growth
          outpacing user growth (bot-like signal), high top-10 wallet concentration, and retention spiking
          unrealistically above 150%.
        </p>
        <p>
          <strong>Volume Concentration Risk %</strong> — 65% based on volume-per-trader relative to the cohort's
          highest, 35% based on top-10 wallet transaction share. Higher = more concentrated in a few hands.
        </p>

        <h3>Profile</h3>
        <p>Each project is split above/below the cohort median on Momentum and Sustainability:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Breakout</strong> — above median on both</li>
          <li><strong>Quick Mover</strong> — above median Momentum, below median Sustainability</li>
          <li><strong>Slow Burner</strong> — below median Momentum, above median Sustainability</li>
          <li><strong>Cold</strong> — below median on both</li>
        </ul>

        <h3>Signal &amp; Signal Score</h3>
        <p>
          The only price-aware layer on the site — compares 7-day volume growth (from Dune) against 7-day price
          change (from CoinGecko):
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth</strong> — volume up, price up</li>
          <li><strong>Absorbed</strong> — volume up, price flat or down</li>
          <li><strong>Thin Rally</strong> — volume down, price up</li>
          <li><strong>Cooling</strong> — volume down, price down</li>
        </ul>
        <p>
          <strong>Signal Score</strong> — a single number version: (price change % × 0.6) + (volume growth % × 0.4),
          clipped to −100/+100. Price weighted higher since it's the "confirming" half.
        </p>

        <h3>Column Glossary</h3>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "8px" }}>
          <tbody>
            {[
              ["O Rk / M Rk / S Rk", "Rank by Opportunity / Momentum / Sustainability"],
              ["Opp / Mom / Sus", "The three core scores"],
              ["Prof", "Profile category — Breakout / Quick Mover / Slow Burner / Cold"],
              ["Qlty %", "Activity Quality % — the behavioral-health modifier"],
              ["Risk %", "Volume Concentration Risk % — the concentration modifier"],
              ["Vol 30d", "DEX trading volume, last 30 days, USD"],
              ["Vol/Tx, Vol/Wlt", "Volume per transaction / per wallet — economic density"],
              ["Vol Grw % / Tx Grw % / User Grw %", "Week-over-week growth, volume / transactions / users"],
              ["Txs 30d / 7d", "Transaction counts"],
              ["Txs/User", "Average transactions per user, 30d"],
              ["Wallets 30d / 7d", "Unique wallet counts"],
              ["New Wallets / Returning Wallets", "New vs. returning wallets, 30d"],
              ["New Wallet %", "Share of wallets that are new, 30d"],
              ["Retention %", "This week's users ÷ last week's users"],
              ["Avg Txs Ret", "Average transactions by returning wallets, 7d"],
              ["Traders", "Unique DEX traders, 30d"],
              ["Buyers / 1st Buyers / 1st Sellers", "Unique buyers, and first-ever buyers/sellers in the window"],
              ["Non-Trade New 30d", "New wallets that arrived without a first buy or sell — e.g. airdrop, transfer"],
              ["Top10 %", "Share of transactions from the top 10 wallets"],
              ["Price / Market Cap", "Live from CoinGecko, matched by contract address"],
            ].map(([term, def]) => (
              <tr key={term}>
                <td style={{ padding: "6px 12px", borderBottom: "1px solid #eee", fontWeight: 600, whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {term}
                </td>
                <td style={{ padding: "6px 12px", borderBottom: "1px solid #eee", color: "#555" }}>{def}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Tabs</h3>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Overview</strong> — scores, profile, price, signal at a glance</li>
          <li><strong>Activity</strong> — volume and transaction detail</li>
          <li><strong>Wallets</strong> — wallet counts, growth, retention</li>
          <li><strong>Buyers &amp; Risk</strong> — buyer/seller detail, concentration, quality flags</li>
          <li><strong>Discover</strong> — new AI-category candidates from CoinGecko not yet tracked</li>
          <li><strong>Tripwire</strong> — on-demand 15m/1h/6h/24h pulse check, for right after news breaks</li>
        </ul>

        <h3 style={{ marginTop: "32px" }}>Thanks</h3>
        <p>
          To the CLAWD community, to clawdbotatg, and to Austin — for lighting the builder fire that turned into
          this. Appreciate it.
        </p>

        <p style={{ fontSize: "13px", color: "#888", marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
          Built by a community member. Not affiliated with CLAWD. Verify on Basescan. Do your own research.
        </p>
      </div>

      <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center", paddingTop: "8px" }}>
        <img
          src="/clawd-pfp.png"
          alt="CLAWD mascot"
          style={{
            width: "1152px",
            maxWidth: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}
</file>

<file path="app/ClawdPanel.js">
"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const READ_TIER_COLORS = {
  teal:  { bg: "#9FE1CB", text: "#04342C" },
  amber: { bg: "#FAC775", text: "#412402" },
  coral: { bg: "#F5C4B3", text: "#4A1B0C" },
};

const READ_TIERS = {
  Beacon: "teal", "Low Hum": "teal", Undercurrent: "teal", "Quiet Beacon": "teal",
  Flare: "amber", "Low Signal": "amber", "Soft Ping": "amber", Afterglow: "amber", Standby: "amber", Mirage: "amber",
  Backdraft: "coral", Flashpoint: "coral", Overshoot: "coral", Bleed: "coral", "False Flare": "coral", Flatline: "coral",
};

const COMBO_EXPLANATIONS = {
  "Breakout|Confirmed Growth": "Strongest combo on the board: real usage growing, price agrees.",
  "Breakout|Absorbed": "Strong fundamentals, but volume isn't moving price yet. Possible accumulation or quiet selling pressure.",
  "Breakout|Thin Rally": "Strong fundamentals, price up on light volume. Price may be ahead of activity.",
  "Breakout|Cooling": "Strong fundamentals, market hasn't noticed yet. Possibly undiscovered.",
  "Quick Mover|Confirmed Growth": "Hot right now, but durability unproven. Could fade.",
  "Quick Mover|Absorbed": "Fast activity, price not rewarding it. Possible heavy selling into the move.",
  "Quick Mover|Thin Rally": "Classic pump pattern: real activity, price popping on thin volume.",
  "Quick Mover|Cooling": "Momentum likely fading along with price/volume.",
  "Slow Burner|Confirmed Growth": "Steady, sticky usage with price/volume finally agreeing.",
  "Slow Burner|Absorbed": "Durable usage, possibly undervalued relative to its retention strength.",
  "Slow Burner|Thin Rally": "Modest, low-risk price tick on a stable base.",
  "Slow Burner|Cooling": "Stable but quiet. A 'sleeper' — unexciting short-term.",
  "Cold|Confirmed Growth": "Price/volume rising despite weak fundamentals. Disconnect — possibly hype-driven.",
  "Cold|Absorbed": "Weak fundamentals, rising volume, falling price. Possible distribution — worth caution.",
  "Cold|Thin Rally": "Weakest, highest-risk combo: price popping on thin volume with no fundamentals behind it.",
  "Cold|Cooling": "Weak across the board. Lowest priority.",
};

function formatUsd(v) {
  if (v == null) return "—";
  return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function formatPrice(v) {
  if (v == null) return "—";
  return `$${Number(v).toPrecision(4)}`;
}
function formatDateShort(d) {
  try { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  catch { return String(d); }
}
function formatRowValue(val, format) {
  if (val == null || val === "") return "—";
  const n = Number(val);
  if (Number.isNaN(n)) return "—";
  if (format === "pct1") return `${n.toFixed(1)}%`;
  if (format === "int") return Math.round(n).toLocaleString();
  if (format === "dec1") return n.toFixed(1);
  if (format === "usd") return formatUsd(n);
  if (format === "usd2") return `$${n.toFixed(2)}`;
  return n;
}

// Read CSS variable from document — fallbacks for SSR
function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function Sparkline({ data, labels, color, formatY }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const gridColor = cssVar("--chart-grid", "rgba(136,135,128,0.15)");
    const tickColor = cssVar("--chart-tick", "#888");

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [{
          data, borderColor: color, backgroundColor: color,
          pointRadius: 2.5, borderWidth: 2, tension: 0.25,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { font: { size: 10 }, color: tickColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
            grid: { display: false },
          },
          y: {
            ticks: { font: { size: 10 }, color: tickColor, maxTicksLimit: 4, callback: formatY || ((v) => Math.round(v * 10) / 10) },
            grid: { color: gridColor },
          },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), JSON.stringify(labels), color]);

  if (!data || data.length === 0) return <p style={{ color: "var(--text-faint)", fontSize: "13px" }}>No data yet.</p>;
  return (
    <div style={{ position: "relative", height: "90px", width: "100%" }}>
      <canvas ref={canvasRef} role="img" aria-label="Trend chart" />
    </div>
  );
}

function MiniSparkline({ data, color }) {
  const values = (data || []).filter((v) => v != null && !Number.isNaN(v));
  if (values.length < 2) return <div style={{ height: 22, width: 64 }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 64, h = 22, pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function MetricCard({ label, sublabel, value, valueColor, rank, totalProjects, data, labels, color, formatY }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", background: "var(--card-bg)" }}>
      <div style={{ background: "var(--card-header-bg)", padding: "10px 16px" }}>
        <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text)" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "var(--text-faint)" }}>{sublabel}</div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <span style={{ fontSize: "26px", fontWeight: 600, color: valueColor }}>{value ?? "—"}</span>
          {rank != null && totalProjects != null && (
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>Rank #{rank} of {totalProjects}</span>
          )}
        </div>
        <Sparkline data={data} labels={labels} color={color} formatY={formatY} />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-faint)", margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

function CompactRow({ label, value, rank, totalProjects, lowerBetter, data, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderTop: "1px solid var(--border)" }}>
      <span style={{ width: 124, fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ width: 64, fontSize: 13, fontWeight: 600, flexShrink: 0, color: "var(--text)" }}>{value}</span>
      <span style={{ width: 110, fontSize: 11, color: "var(--text-faint)", flexShrink: 0 }}>
        {rank != null && totalProjects != null ? `#${rank} of ${totalProjects}` : "—"}
        {lowerBetter && <span style={{ display: "block" }}>(lower better)</span>}
      </span>
      <MiniSparkline data={data} color={color} />
    </div>
  );
}

const COMPACT_SECTIONS = [
  {
    title: "Growth rates", color: "#185FA5",
    rows: [
      { key: "Vol Grw %", label: "Vol Grw %", format: "pct1" },
      { key: "Tx Grw %", label: "Tx Grw %", format: "pct1" },
      { key: "User Grw %", label: "User Grw %", format: "pct1" },
    ],
  },
  {
    title: "Raw activity", color: "#D85A30",
    rows: [
      { key: "Txs 30d", label: "Txs 30d", format: "int" },
      { key: "Vol 30d", label: "Vol 30d", format: "usd" },
      { key: "Txs/User", label: "Txs/User", format: "dec1" },
      { key: "Traders", label: "Traders", format: "int" },
    ],
  },
  {
    title: "New, returning & retention", color: "#3B6D11",
    rows: [
      { key: "Retention %", label: "Retention %", format: "pct1" },
      { key: "New %", label: "New %", format: "pct1" },
      { key: "New Wallets", label: "New Wallets", format: "int" },
      { key: "Returning Wallets", label: "Returning Wallets", format: "int" },
      { key: "Non-Trade New 30d", label: "Non-Trade New", format: "int" },
    ],
  },
  {
    title: "Buyers & sellers", color: "#534AB7",
    rows: [
      { key: "Buyers 30d", label: "Buyers 30d", format: "int" },
      { key: "Buyers 7d", label: "Buyers 7d", format: "int" },
      { key: "1st Buyers 30d", label: "1st Buyers 30d", format: "int" },
      { key: "1st Buyers 7d", label: "1st Buyers 7d", format: "int" },
      { key: "1st Sellers 30d", label: "1st Sellers 30d", format: "int" },
      { key: "1st Sellers 7d", label: "1st Sellers 7d", format: "int" },
    ],
  },
  {
    title: "Quality & risk", color: "#993556",
    rows: [
      { key: "Qlty %", label: "Qlty %", format: "pct1" },
      { key: "Risk %", label: "Risk %", format: "pct1", lowerBetter: true },
      { key: "Top10 %", label: "Top10 %", format: "pct1", lowerBetter: true },
      { key: "Vol/Tx", label: "Vol/Tx", format: "usd2" },
    ],
  },
];

function ProfileSignalBanner({ profile, signal, read }) {
  const readTier = read ? READ_TIERS[read] || "amber" : null;
  const readColor = readTier ? READ_TIER_COLORS[readTier] : null;
  const explanation = COMBO_EXPLANATIONS[`${profile}|${signal}`] || "Explanation not available for this combination.";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
      background: "var(--bg-subtle)", border: "1px solid var(--border)",
      borderRadius: "8px", padding: "16px 20px", marginBottom: "20px", flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {read && (
          <span style={{ fontSize: "16px", padding: "6px 14px", borderRadius: "6px", background: readColor.bg, color: readColor.text, fontWeight: 700 }}>
            Read: {read}
          </span>
        )}
        <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "var(--badge-neutral-bg)", color: "var(--badge-neutral-text)", fontWeight: 500 }}>
          Profile: {profile ?? "—"}
        </span>
        <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "var(--badge-neutral-bg)", color: "var(--badge-neutral-text)", fontWeight: 500 }}>
          Signal: {signal ?? "—"}
        </span>
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, maxWidth: "420px", textAlign: "right" }}>
        {explanation}
      </p>
    </div>
  );
}

export default function ClawdPanel({ clawdRow, totalProjects, opportunityRank, momentumRank, sustainabilityRank, marketCapRank, walletsRank, ranks = {} }) {
  const [status, setStatus] = useState("loading");
  const [behavioralHistory, setBehavioralHistory] = useState([]);
  const [priceHistory, setPriceHistory] = useState({ prices: [], market_caps: [] });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/clawd-history");
        const json = await res.json();
        if (cancelled) return;
        if (json.error) { setErrorMsg(json.error); setStatus("error"); return; }
        setBehavioralHistory(json.behavioralHistory || []);
        setPriceHistory(json.priceHistory || { prices: [], market_caps: [] });
        setStatus("done");
      } catch (err) {
        if (!cancelled) { setErrorMsg(String(err)); setStatus("error"); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function thinSeries(rawPairs, targetPoints = 30) {
    if (!rawPairs || rawPairs.length === 0) return [];
    const step = Math.max(1, Math.floor(rawPairs.length / targetPoints));
    return rawPairs.filter((_, i) => i % step === 0).map(([ts, val]) => ({ x: formatDateShort(ts), y: val }));
  }

  const weekLabels  = behavioralHistory.map((r) => formatDateShort(r["Snapshot Date"]));
  const oppData     = behavioralHistory.map((r) => Number(r["Opp"]));
  const momData     = behavioralHistory.map((r) => Number(r["Mom"]));
  const susData     = behavioralHistory.map((r) => Number(r["Sus"]));
  const walletsData = behavioralHistory.map((r) => Number(r["Wallets 30d"]));
  const mcapThinned = thinSeries(priceHistory.market_caps);
  const priceThinned = thinSeries(priceHistory.prices);

  return (
    <div>
      <h2 style={{ marginTop: 0, color: "var(--text)" }}>CLAWD — Health Check</h2>

      <ProfileSignalBanner profile={clawdRow?.["Prof"]} signal={clawdRow?.signal} read={clawdRow?.read} />

      {status === "loading" && <p style={{ color: "var(--text-muted)" }}>Loading history…</p>}
      {status === "error"   && <p style={{ color: "#c0392b" }}>Couldn't load history: {errorMsg}</p>}
      {priceHistory.error   && <p style={{ fontSize: "12px", color: "#c0392b", marginBottom: "8px" }}>Price/market cap history failed to load: {priceHistory.error}</p>}

      {status === "done" && (
        <>
          <SectionLabel>Behavioral</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <MetricCard label="Opportunity" sublabel="Score & trend (8w)" value={clawdRow?.["Opp"]} valueColor="#3B6D11" rank={opportunityRank} totalProjects={totalProjects} data={oppData} labels={weekLabels} color="#3B6D11" />
            <MetricCard label="Momentum" sublabel="Score & trend (8w)" value={clawdRow?.["Mom"]} valueColor="#185FA5" rank={momentumRank} totalProjects={totalProjects} data={momData} labels={weekLabels} color="#185FA5" />
            <MetricCard label="Sustainability" sublabel="Score & trend (8w)" value={clawdRow?.["Sus"]} valueColor="#854F0B" rank={sustainabilityRank} totalProjects={totalProjects} data={susData} labels={weekLabels} color="#854F0B" />
          </div>

          <SectionLabel>Market</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <MetricCard label="Wallets" sublabel="30d active, trend (8w)" value={clawdRow?.["Wallets 30d"]} valueColor="#3a6ea5" rank={walletsRank} totalProjects={totalProjects} data={walletsData} labels={weekLabels} color="#3a6ea5" formatY={(v) => Math.round(v)} />
            <MetricCard label="Market Cap" sublabel="USD, trend (60d)" value={clawdRow?.marketCapUsd != null ? formatUsd(clawdRow.marketCapUsd) : "—"} valueColor="#534AB7" rank={marketCapRank} totalProjects={totalProjects} data={mcapThinned.map((p) => p.y)} labels={mcapThinned.map((p) => p.x)} color="#534AB7" formatY={formatUsd} />
            <MetricCard label="Price" sublabel="USD, trend (60d)" value={clawdRow?.priceUsd != null ? formatPrice(clawdRow.priceUsd) : "—"} valueColor="#0F6E56" rank={null} totalProjects={totalProjects} data={priceThinned.map((p) => p.y)} labels={priceThinned.map((p) => p.x)} color="#0F6E56" formatY={formatPrice} />
          </div>

          <SectionLabel>Full breakdown</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
            {COMPACT_SECTIONS.map((section, idx) => (
              <div key={section.title} style={{
                border: "1px solid var(--border)", borderRadius: "8px",
                background: "var(--card-bg)", padding: "10px 16px",
                gridColumn: idx === COMPACT_SECTIONS.length - 1 ? "span 2" : undefined,
              }}>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 4px", color: section.color }}>{section.title}</p>
                {section.rows.map((row) => (
                  <CompactRow
                    key={row.key}
                    label={row.label}
                    value={formatRowValue(clawdRow?.[row.key], row.format)}
                    rank={ranks[row.key] ?? null}
                    totalProjects={totalProjects}
                    lowerBetter={row.lowerBetter}
                    data={behavioralHistory.map((r) => Number(r[row.key]))}
                    color={section.color}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "20px" }}>
        Behavioral history is a true backtest — recomputed from on-chain activity as of each past date,
        including full cohort context, not just CLAWD in isolation. Refreshed roughly weekly, not live.
        Price/Market Cap history comes from CoinGecko.
      </p>
    </div>
  );
}
</file>

<file path="app/DashboardTable.js">
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import TripwirePanel from "./TripwirePanel";
import AboutPanel from "./AboutPanel";
import ClawdPanel from "./ClawdPanel";


// ── Custom delayed tooltip ────────────────────────────────────────────────────
const HEADER_TOOLTIP_DELAY = 1200; // column header definitions
const CELL_TOOLTIP_DELAY   = 3000; // cell rank on hover

function useDelayedTooltip() {
  const [tooltip, setTooltip] = useState(null); // { content, x, y }
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

// ── Task 1: Grid-layout ProfSignalKey ────────────────────────────────────────
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
            {/* Column header */}
            <div style={{
              background: "var(--bg-muted)",
              padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{col.prof}</div>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "2px" }}>{col.subtitle}</div>
            </div>
            {/* Signal rows */}
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
  const [dragOver, setDragOver] = useState(null); // key being dragged over
  const dragKeyRef = useRef(null); // key being dragged
  const { tooltip, show: showTooltip, move: moveTooltip, hide: hideTooltip } = useDelayedTooltip();

  // Load pins from localStorage on mount
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

  // ── Pin helpers ───────────────────────────────────────────────────────────
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

  // ── Per-cell rank computation ─────────────────────────────────────────────
  // Returns "rank / total" string for a numeric cell value within the full dataset
  function getCellRank(colKey, colType, rowData) {
    if (colType !== "number" || isDiscover) return null;
    const val = rowData[colKey];
    if (val == null || val === "" || Number.isNaN(Number(val))) return null;
    const lowerBetter = new Set(["Risk %", "Top10 %"]);
    // Sort descending by default (higher = better = rank 1), ascending for lower-is-better
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

  // Split sorted into pinned-first, then rest
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
        {/* Pin toggle cell — always first */}
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
            {/* Pin column header */}
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
      <TooltipBox tooltip={tooltip} />
    </div>
  );
}
</file>

<file path="app/GateButton.js">
"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function GateButton({ hasAccess }) {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", marginBottom: "12px" }}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            background: hasAccess ? "#E1F5EE" : "#FAECE7",
            color: hasAccess ? "#085041" : "#712B13",
            fontWeight: 600,
          }}
        >
          {hasAccess ? "✓ CLAWD holder — scores unlocked" : "Connected — 10M CLAWD required to unlock"}
        </span>
        <span style={{ color: "#888" }}>{shortAddress(address)}</span>
        <button
          onClick={() => disconnect()}
          style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: "12px" }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        border: "1px solid #333",
        background: "#333",
        color: "#fff",
        cursor: isPending ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: "13px",
        marginBottom: "12px",
      }}
    >
      {isPending ? "Connecting…" : "Connect Wallet to Unlock Scores"}
    </button>
  );
}
</file>

<file path="app/Header.js">
"use client";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import ThemeToggle from "./ThemeToggle";

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

function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function ConnectButton() {
  const { connectors, connect, isPending } = useConnect();
  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      style={{
        padding: "12px 24px",
        borderRadius: "8px",
        border: "none",
        background: "var(--btn-active-bg)",
        color: "var(--btn-active-text)",
        cursor: isPending ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: "15px",
        letterSpacing: "0.01em",
        width: "100%",
        maxWidth: "280px",
        opacity: isPending ? 0.7 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}

// ── State 1: public landing — two-column layout ───────────────────────────────
function PublicHeader() {
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "48px",
        alignItems: "start",
        marginBottom: "20px",
      }}
      className="header-grid"
      >
        {/* Left column */}
        <div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Tripwire
          </h1>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text)", lineHeight: "1.6" }}>
            Community-built intelligence for CLAWD holders on Base. Track AI agent tokens with on-chain behavioral scores, wallet stats, and real-time pulse checks.
          </p>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>
              Access requires 10,000,000 CLAWD.
            </p>
            <ConnectButton />
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)", lineHeight: "1.6" }}>
            What you get: behavioral scoring across momentum, sustainability &amp; opportunity · wallet growth, retention &amp; buyer/seller flow · The Wire pulse check across 15m, 1h, 6h &amp; 24h windows · price signal and concentration risk.
          </p>
        </div>
      </div>

      {/* Full-width disclaimer */}
      <p style={{
        margin: 0,
        fontSize: "11px",
        color: "var(--text-xfaint)",
        lineHeight: "1.6",
        borderTop: "1px solid var(--border)",
        paddingTop: "12px",
      }}>
        Built by a community member. Not affiliated with CLAWD. Data from Dune Analytics and CoinGecko — best-effort, not guaranteed. Not financial advice. Formulas are not scientifically backed. Token gate built with LeftClaw researchers.
      </p>

      <style>{`
        @media (max-width: 640px) {
          .header-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}

// ── State 2: holder — single slim bar ────────────────────────────────────────
function HolderHeader({ address, disconnect }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      justifyContent: "space-between",
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>
          Tripwire
        </h1>
        <span style={{ fontSize: "13px", color: "var(--text-faint)" }}>
          Community dashboard for CLAWD holders · Dune + CoinGecko · DYOR
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          fontSize: "12px", fontWeight: 600,
          padding: "4px 10px", borderRadius: "6px",
          background: "var(--gate-ok-bg)", color: "var(--gate-ok-text)",
        }}>
          ✓ Unlocked
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{shortAddress(address)}</span>
        <button
          onClick={disconnect}
          style={{
            padding: "4px 10px", borderRadius: "6px",
            border: "1px solid var(--border)", background: "var(--bg-muted)",
            color: "var(--text-muted)", cursor: "pointer", fontSize: "12px",
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ── State 2b: connected but not a holder ────────────────────────────────────
function ConnectedNotHolder({ address, disconnect }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      justifyContent: "space-between",
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>
          Tripwire
        </h1>
        <span style={{ fontSize: "13px", color: "var(--text-faint)" }}>
          Requires 10,000,000 CLAWD to unlock
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          fontSize: "12px", fontWeight: 600,
          padding: "4px 10px", borderRadius: "6px",
          background: "var(--gate-fail-bg)", color: "var(--gate-fail-text)",
        }}>
          Insufficient CLAWD
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{shortAddress(address)}</span>
        <button
          onClick={disconnect}
          style={{
            padding: "4px 10px", borderRadius: "6px",
            border: "1px solid var(--border)", background: "var(--bg-muted)",
            color: "var(--text-muted)", cursor: "pointer", fontSize: "12px",
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: hasAccessRaw } = useReadContract({
    address: GATE_ADDRESS,
    abi: GATE_ABI,
    functionName: "hasAccess",
    args: address ? [address, 1] : undefined,
    chainId: base.id,
    query: { enabled: !!address },
  });
  const hasAccess = !!hasAccessRaw;

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <ThemeToggle />
      </div>

      {!isConnected && <PublicHeader />}
      {isConnected && hasAccess && <HolderHeader address={address} disconnect={disconnect} />}
      {isConnected && !hasAccess && <ConnectedNotHolder address={address} disconnect={disconnect} />}
    </div>
  );
}
</file>

<file path="app/layout.js">
import Providers from "./providers";

export const metadata = {
  title: "Tripwire",
  description: "On-chain intelligence for CLAWD holders on Base",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('zdash-theme');
                  // Default is dark — only remove it if user explicitly chose light
                  if (saved !== 'light') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ── Light mode ─────────────────────────────────────────── */
              :root {
                --bg:               #f8f7f4;
                --bg-subtle:        #f2f0ec;
                --bg-muted:         #eceae4;
                --border:           #dedad2;
                --border-strong:    #c8c4ba;
                --text:             #2c2a26;
                --text-muted:       #5a5750;
                --text-faint:       #8a877f;
                --text-xfaint:      #b0ada5;

                --pill-bg:          #eceae4;
                --pill-border:      #dedad2;
                --pill-text:        #3a3830;
                --pill-label:       #8a877f;
                --pill-value:       #1e1c18;

                --clawd-row-bg:     rgba(59,109,17,0.06);
                --clawd-row-border: #3B6D11;

                --btn-active-bg:    #3d3a52;
                --btn-active-text:  #f0eeff;
                --btn-inactive-bg:  #f8f7f4;
                --btn-inactive-text:#3a3830;
                --btn-inactive-border:#c8c4ba;

                --badge-neutral-bg: #eceae4;
                --badge-neutral-text:#2c2a26;

                --gate-ok-bg:       #e6f4ee;
                --gate-ok-text:     #1a5c3a;
                --gate-fail-bg:     #faecea;
                --gate-fail-text:   #7a2118;

                --read-teal-bg:     #ddf4ec;
                --read-teal-text:   #085041;
                --read-amber-bg:    #faeeda;
                --read-amber-text:  #633806;
                --read-coral-bg:    #faecea;
                --read-coral-text:  #712B13;

                --chart-grid:       rgba(0,0,0,0.07);
                --chart-tick:       #8a877f;
                --card-bg:          #f8f7f4;
                --card-header-bg:   #eceae4;
              }

              /* ── Dark mode — warm slate with lavender accent ─────────── */
              [data-theme="dark"] {
                --bg:               #1c1b22;
                --bg-subtle:        #23222b;
                --bg-muted:         #2a2933;
                --border:           #383644;
                --border-strong:    #4a4758;
                --text:             #e8e6f0;
                --text-muted:       #a8a4bc;
                --text-faint:       #6e6a80;
                --text-xfaint:      #4e4a5e;

                --pill-bg:          #2a2933;
                --pill-border:      #38364a;
                --pill-text:        #ccc8e0;
                --pill-label:       #6e6a80;
                --pill-value:       #e8e6f0;

                --clawd-row-bg:     rgba(130,180,80,0.08);
                --clawd-row-border: #7ab84a;

                --btn-active-bg:    #7c6fcd;
                --btn-active-text:  #f0eeff;
                --btn-inactive-bg:  #23222b;
                --btn-inactive-text:#a8a4bc;
                --btn-inactive-border:#38364a;

                --badge-neutral-bg: #2a2933;
                --badge-neutral-text:#ccc8e0;

                --gate-ok-bg:       #1a2e24;
                --gate-ok-text:     #74c99a;
                --gate-fail-bg:     #2e1a1a;
                --gate-fail-text:   #e08080;

                --read-teal-bg:     #1a2e28;
                --read-teal-text:   #74c9a8;
                --read-amber-bg:    #2e2210;
                --read-amber-text:  #d4a864;
                --read-coral-bg:    #2e1a1a;
                --read-coral-text:  #e08878;

                --chart-grid:       rgba(200,190,255,0.08);
                --chart-tick:       #6e6a80;
                --card-bg:          #23222b;
                --card-header-bg:   #2a2933;
              }

              *, *::before, *::after { box-sizing: border-box; }

              body {
                background: var(--bg);
                color: var(--text);
                margin: 0;
                font-family: sans-serif;
                transition: background 0.25s, color 0.25s;
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
</file>

<file path="app/page.js">
import { getDashboardData } from "@/lib/getData";
import { getDiscoveryData } from "@/lib/getDiscoveryData";
import DashboardTable from "./DashboardTable";
import Header from "./Header";

export const revalidate = 3600;

export default async function Home() {
  const { rows: data, lastUpdated } = await getDashboardData();
  const trackedAddresses = data.map((d) => d["Address"]).filter(Boolean);
  const discoveryData = await getDiscoveryData(trackedAddresses).catch(() => []);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <Header />
      <DashboardTable data={data} discoveryData={discoveryData} lastUpdated={lastUpdated} />
    </main>
  );
}
</file>

<file path="app/providers.js">
"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
</file>

<file path="app/ThemeToggle.js">
"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true); // default dark
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dark is default — light only if localStorage explicitly says so
    setDark(localStorage.getItem("zdash-theme") !== "light");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      // Switching to dark — this is the default, so just remove the light override
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.removeItem("zdash-theme"); // no need to save — dark is default
    } else {
      // Switching to light — explicitly save so it survives refresh
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("zdash-theme", "light");
    }
  }

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return <div style={{ width: "80px", height: "34px" }} />;
  }

  return (
    <button
      onClick={toggle}
      style={{
        flexShrink: 0,
        padding: "8px 18px",
        borderRadius: "20px",
        border: "1px solid var(--border-strong)",
        background: dark ? "var(--btn-active-bg)" : "var(--bg-muted)",
        color: dark ? "var(--btn-active-text)" : "var(--text-muted)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "7px",
        whiteSpace: "nowrap",
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      <span style={{ fontSize: "15px", lineHeight: 1 }}>{dark ? "☀︎" : "☽"}</span>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
</file>

<file path="app/TripwirePanel.js">
"use client";
import { useState, useRef } from "react";

const COLUMNS = [
  { key: "Project", label: "Project" },
  { key: "marketCapUsd", label: "Market Cap", format: "usd" },
  { key: "Wallets 15m", label: "Active Wallets 15m" },
  { key: "Txs 15m", label: "Txs 15m" },
  { key: "New Wallets 15m", label: "New Wallets 15m" },
  { key: "Wallets 1h", label: "Active Wallets 1h" },
  { key: "Txs 1h", label: "Txs 1h" },
  { key: "New Wallets 1h", label: "New Wallets 1h" },
  { key: "Wallets 6h", label: "Active Wallets 6h" },
  { key: "Txs 6h", label: "Txs 6h" },
  { key: "New Buyers 6h", label: "New Buyers 6h" },
  { key: "New Sellers 6h", label: "New Sellers 6h" },
  { key: "Wallets 24h", label: "Active Wallets 24h" },
  { key: "Txs 24h", label: "Txs 24h" },
  { key: "New Buyers 24h", label: "New Buyers 24h" },
  { key: "New Sellers 24h", label: "New Sellers 24h" },
];

const TRIPWIRE_KEY_METRICS = [
  { name: "Txs 15m / 1h / 6h / 24h",          desc: "On-chain transactions in each window — a spike means something just happened" },
  { name: "Active Wallets 15m / 1h / 6h / 24h", desc: "Unique wallets that transacted — distinguishes broad activity from one whale moving" },
  { name: "New Wallets 15m / 1h",               desc: "Wallets interacting for the first time — new arrivals, not existing holders" },
  { name: "New Buyers 6h / 24h",                desc: "Wallets buying for the first time in the window — a demand signal" },
  { name: "New Sellers 6h / 24h",               desc: "Wallets selling for the first time in the window — a distribution signal" },
  { name: "Market Cap",                          desc: "Live market cap from CoinGecko at time of query" },
];

function MetricPill({ name, desc }) {
  return (
    <div style={{
      background: "var(--bg-muted)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "8px 14px",
      minWidth: "180px",
      maxWidth: "240px",
      flex: "1 1 180px",
    }}>
      <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text)", marginBottom: "3px" }}>{name}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>{desc}</div>
    </div>
  );
}

function formatValue(val, format) {
  if (val == null || val === "") return "—";
  if (format === "usd") return `$${Number(val).toLocaleString()}`;
  return val;
}

export default function TripwirePanel({ hasAccess }) {
  const [status, setStatus] = useState("idle");
  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [sortKey, setSortKey] = useState("Txs 15m");
  const [sortDir, setSortDir] = useState("desc");
  const pollRef = useRef(null);
  const attemptsRef = useRef(0);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  async function runTripwire() {
    setStatus("starting");
    setErrorMsg("");
    setRows([]);
    attemptsRef.current = 0;

    try {
      const startRes = await fetch("/api/tripwire/start", { method: "POST" });
      const startJson = await startRes.json();
      if (!startRes.ok || !startJson.executionId) {
        throw new Error(startJson.error || "Failed to start The Wire run");
      }

      setStatus("running");
      pollRef.current = setInterval(async () => {
        attemptsRef.current += 1;
        if (attemptsRef.current > 90) {
          stopPolling();
          setStatus("error");
          setErrorMsg("Taking longer than expected. Try again in a moment.");
          return;
        }
        try {
          const statusRes = await fetch(`/api/tripwire/status?executionId=${startJson.executionId}`);
          const statusJson = await statusRes.json();
          if (statusJson.state === "QUERY_STATE_COMPLETED") {
            stopPolling();
            setRows(statusJson.rows || []);
            setStatus("done");
          } else if (statusJson.state === "QUERY_STATE_FAILED" || statusJson.state === "QUERY_STATE_CANCELLED") {
            stopPolling();
            setStatus("error");
            setErrorMsg("Dune query failed or was cancelled.");
          }
        } catch {
          // transient fetch error, keep trying until attempt limit
        }
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(String(err.message || err));
    }
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "Project") {
      aVal = aVal == null ? "" : String(aVal);
      bVal = bVal == null ? "" : String(bVal);
      return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    aVal = aVal == null || aVal === "" ? -Infinity : Number(aVal);
    bVal = bVal == null || bVal === "" ? -Infinity : Number(bVal);
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const isRunning = status === "starting" || status === "running";

  // Explanation block — always visible
  const explanationBlock = (
    <div style={{
      background: "var(--bg-subtle)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "20px",
      fontSize: "13px",
      color: "var(--text-muted)",
      lineHeight: "1.6",
      maxWidth: "680px",
    }}>
      The Wire is an on-demand pulse check — it runs a fresh Dune query right now and returns activity from
      the last 15 minutes, 1 hour, 6 hours, and 24 hours across every tracked project. Use it right after
      news breaks, a token gets mentioned, or you want to know what's moving at this exact moment. It takes
      1–2 minutes to run. Usage may be limited to stay within free-tier Dune query credits.
    </div>
  );

  if (!hasAccess) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "24px" }}>
        {explanationBlock}
        <button
          disabled
          style={{
            padding: "16px 40px",
            borderRadius: "8px",
            border: "1px solid var(--border-strong)",
            background: "var(--bg-muted)",
            color: "var(--text-faint)",
            cursor: "not-allowed",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          🔒 Run The Wire
        </button>
        <span style={{ color: "var(--text-faint)", fontSize: "13px", marginTop: "10px" }}>
          Connect a wallet holding 10M+ CLAWD to use The Wire.
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Explanation + button — centered, always visible */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
        {explanationBlock}
        <button
          onClick={runTripwire}
          disabled={isRunning}
          style={{
            padding: "16px 40px",
            borderRadius: "8px",
            border: isRunning ? "1px solid var(--border-strong)" : "1px solid var(--btn-active-bg)",
            background: isRunning ? "var(--text-faint)" : "var(--btn-active-bg)",
            color: "var(--btn-active-text)",
            cursor: isRunning ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          {status === "starting" && "Starting…"}
          {status === "running" && "Running on Dune…"}
          {(status === "idle" || status === "done" || status === "error") && "Trip The Wire"}
        </button>

        {status === "running" && (
          <span style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "13px", textAlign: "center" }}>
            Calling Dune fresh — takes 1–2 minutes.
          </span>
        )}
        {status === "error" && (
          <span style={{ marginTop: "10px", color: "#c0392b", fontSize: "13px" }}>
            {errorMsg}
          </span>
        )}
      </div>

      {/* Column key — only after results load */}
      {rows.length > 0 && (
        <details style={{ marginBottom: "16px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "var(--text)", marginBottom: "8px" }}>
            Key: what am I looking at?
          </summary>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            {TRIPWIRE_KEY_METRICS.map((m) => (
              <MetricPill key={m.name} name={m.name} desc={m.desc} />
            ))}
          </div>
        </details>
      )}

      {status === "done" && rows.length === 0 && (
        <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No activity in the last 24h.</p>
      )}

      {rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid var(--border-strong)",
                      padding: "6px 12px",
                      cursor: "pointer",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      color: "var(--text)",
                    }}
                  >
                    {col.label}
                    {sortKey === col.key ? (sortDir === "desc" ? " ▼" : " ▲") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r["Address"] || r["Project"]}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} style={{ padding: "6px 12px", whiteSpace: "nowrap", color: "var(--text)" }}>
                      {col.format ? formatValue(r[col.key], col.format) : r[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
</file>

<file path="lib/coingeckoFetch.js">
// Shared CoinGecko fetch helper: retries once on 429 (rate limit),
// and a concurrency-limited batch runner so we never fire 50+ requests
// all at once and trip CoinGecko's burst limit.
// Pass { revalidate: <seconds> } to let Next.js cache a given call across
// page regenerations (e.g. Discovery data, which doesn't need to be hourly-fresh).
// Omit it and the call stays fully live, same as before.
export async function fetchCoinGeckoJSON(
  url,
  { retries = 2, retryDelayMs = 1500, revalidate } = {}
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const fetchOptions = {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
      };
      if (revalidate) {
        fetchOptions.next = { revalidate };
      } else {
        fetchOptions.cache = "no-store";
      }

      const res = await fetch(url, fetchOptions);
      if (res.status === 429) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
          continue;
        }
        return { ok: false, status: 429, data: null };
      }
      if (!res.ok) {
        return { ok: false, status: res.status, data: null };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
      return { ok: false, status: 0, data: null, error: String(err) };
    }
  }
  return { ok: false, status: 0, data: null };
}

// Runs async tasks with a max concurrency instead of firing all at once.
export async function mapWithConcurrency(items, limit, asyncFn) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await asyncFn(items[currentIndex], currentIndex);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
</file>

<file path="lib/getData.js">
import tokens from "./tokens";

const DUNE_QUERY_ID = "7762446";

async function fetchCoinGeckoJSON(
  url,
  { retries = 2, retryDelayMs = 1500, revalidate } = {}
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const fetchOptions = {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
      };

      if (revalidate) {
        fetchOptions.next = { revalidate };
      } else {
        fetchOptions.cache = "no-store";
      }

      const res = await fetch(url, fetchOptions);

      if (res.status === 429) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
          continue;
        }
        return { ok: false, status: 429, data: null };
      }

      if (!res.ok) {
        return { ok: false, status: res.status, data: null };
      }

      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
      return { ok: false, status: 0, data: null, error: String(err) };
    }
  }

  return { ok: false, status: 0, data: null };
}

async function fetchDuneData() {
  const res = await fetch(
    `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results`,
    {
      headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error(`Dune API error: ${res.status}`);

  const json = await res.json();
  return json.result?.rows || [];
}

async function fetchCoinGeckoPrices(addresses) {
  const lookup = {};
  // simple/token_price works on demo keys; onchain endpoint requires Pro
  const batchSize = 100;

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize).map((a) => a.toLowerCase());
    const joined = batch.join(",");

    const url =
      `https://api.coingecko.com/api/v3/simple/token_price/base` +
      `?contract_addresses=${joined}` +
      `&vs_currencies=usd` +
      `&include_market_cap=true` +
      `&include_24hr_vol=true` +
      `&include_24hr_change=true`;

    const res = await fetchCoinGeckoJSON(url, { retries: 2 });
    if (!res.ok) {
      console.error(`[CoinGecko] batch fetch failed: status=${res.status}`, res.error ?? "");
      continue;
    }

    // Response: { "0xabc...": { usd, usd_market_cap, usd_24h_vol, usd_24h_change }, ... }
    const data = res.data || {};
    for (const addr of batch) {
      const entry = data[addr] ?? null;
      lookup[addr] = {
        priceUsd: entry?.usd ?? null,
        marketCapUsd: entry?.usd_market_cap ?? null,
        volume24h: entry?.usd_24h_vol ?? null,
        priceChange24h: entry?.usd_24h_change ?? null,
      };
    }
  }

  return lookup;
}

function getSignal(volumeChangePct, priceChangePct) {
  if (volumeChangePct == null || priceChangePct == null) return "No Data";

  const volUp = volumeChangePct > 0;
  const priceUp = priceChangePct > 0;

  if (volUp && priceUp) return "Confirmed Growth";
  if (volUp && !priceUp) return "Absorbed";
  if (!volUp && priceUp) return "Thin Rally";
  return "Cooling";
}

function getSignalScore(volumeChangePct, priceChangePct) {
  if (volumeChangePct == null || priceChangePct == null) return null;

  const clip = (v) => Math.max(-100, Math.min(100, v));
  return Math.round((clip(priceChangePct) * 0.6 + clip(volumeChangePct) * 0.4) * 10) / 10;
}

function getRead(prof, signal) {
  if (!prof || !signal || signal === "No Data" || signal === "No CG Data") return null;

  const map = {
    Breakout: {
      "Confirmed Growth": "Beacon",
      Absorbed: "Undercurrent",
      "Thin Rally": "Overshoot",
      Cooling: "Quiet Beacon",
    },
    "Quick Mover": {
      "Confirmed Growth": "Flare",
      Absorbed: "Backdraft",
      "Thin Rally": "Flashpoint",
      Cooling: "Afterglow",
    },
    "Slow Burner": {
      "Confirmed Growth": "Low Hum",
      Absorbed: "Low Signal",
      "Thin Rally": "Soft Ping",
      Cooling: "Standby",
    },
    Cold: {
      "Confirmed Growth": "Mirage",
      Absorbed: "Bleed",
      "Thin Rally": "False Flare",
      Cooling: "Flatline",
    },
  };

  return map[prof]?.[signal] ?? null;
}

// Safely coerce a Dune value to a float, returning null if missing/NaN.
function toFloat(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

export async function getDashboardData() {
  const duneRows = await fetchDuneData();
  const duneByAddress = {};

  for (const row of duneRows) {
    const addr = row["Address"]?.toLowerCase();
    if (addr) duneByAddress[addr] = row;
  }

  const allAddresses = tokens.filter((t) => t.address).map((t) => t.address);
  const priceLookup = await fetchCoinGeckoPrices(allAddresses);

  const tokensWithAddress = tokens.filter((t) => t.address);
  const tokensWithout = tokens.filter((t) => !t.address);

  const enrichedWithAddress = tokensWithAddress.map((token) => {
    const addrKey = token.address.toLowerCase();
    const duneRow = duneByAddress[addrKey];
    const cg = priceLookup[addrKey] || null;

    const priceChange = cg?.priceChange24h ?? null;
    const volumeGrowth = toFloat(
      duneRow?.["Vol Grw %"] ?? duneRow?.["Vol Grw"] ?? null
    );

    const signal = cg ? getSignal(volumeGrowth, priceChange) : "No Data";

    const prof = duneRow?.["Prof"] ?? null;
    const read = getRead(prof, signal);

    // "New %" — Dune may output this as a ratio (0–1) or a percentage (0–100).
    // Normalise: if the value is <= 1.5 treat it as a ratio and multiply by 100.
    const rawNewPct = toFloat(duneRow?.["New %"] ?? duneRow?.["New Wallet %"] ?? duneRow?.["New"] ?? null);
    const newPct = rawNewPct != null && rawNewPct <= 1.5 ? rawNewPct * 100 : rawNewPct;

    return {
      Project: duneRow?.["Project"] ?? token.name,
      Symbol: token.symbol,
      Address: token.address,
      Tag: token.tag,
      "O Rk": duneRow?.["O Rk"] ?? null,
      Opp: toFloat(duneRow?.["Opp"]),
      "M Rk": duneRow?.["M Rk"] ?? null,
      Mom: toFloat(duneRow?.["Mom"]),
      "S Rk": duneRow?.["S Rk"] ?? null,
      Sus: toFloat(duneRow?.["Sus"]),
      Prof: prof,
      "Qlty %": toFloat(duneRow?.["Qlty %"] ?? duneRow?.["Qlty"]),
      "Vol 30d": toFloat(duneRow?.["Vol 30d"]),
      "Vol/Tx": toFloat(duneRow?.["Vol/Tx"] ?? duneRow?.["VolTx"]),
      "Vol/Wlt": toFloat(duneRow?.["Vol/Wlt"] ?? duneRow?.["VolWlt"]),
      "Vol Grw %": volumeGrowth,
      "Txs 30d": toFloat(duneRow?.["Txs 30d"]),
      "Txs 7d": toFloat(duneRow?.["Txs 7d"]),
      "Tx Grw %": toFloat(duneRow?.["Tx Grw %"] ?? duneRow?.["Tx Grw"]),
      "Txs/User": toFloat(duneRow?.["Txs/User"] ?? duneRow?.["TxsUser"]),
      "Wallets 30d": toFloat(duneRow?.["Wallets 30d"]),
      "Wallets 7d": toFloat(duneRow?.["Wallets 7d"]),
      "User Grw %": toFloat(duneRow?.["User Grw %"] ?? duneRow?.["User Grw"]),
      "New Wallets": toFloat(duneRow?.["New Wallets"] ?? duneRow?.["New 30d"]),
      "Returning Wallets": toFloat(duneRow?.["Returning Wallets"] ?? duneRow?.["Return 30d"]),
      "New %": newPct,
      "Retention %": toFloat(duneRow?.["Retention %"] ?? duneRow?.["Retention"]),
      "Avg Txs Ret": toFloat(duneRow?.["Avg Txs Ret"]),
      Traders: toFloat(duneRow?.["Traders"]),
      "Buyers 30d": toFloat(duneRow?.["Buyers 30d"]),
      "Buyers 7d": toFloat(duneRow?.["Buyers 7d"]),
      "1st Buyers 30d": toFloat(duneRow?.["1st Buyers 30d"]),
      "1st Buyers 7d": toFloat(duneRow?.["1st Buyers 7d"]),
      "1st Sellers 30d": toFloat(duneRow?.["1st Sellers 30d"]),
      "1st Sellers 7d": toFloat(duneRow?.["1st Sellers 7d"]),
      "Non-Trade New 30d": toFloat(duneRow?.["Non-Trade New 30d"]),
      "Top10 %": toFloat(duneRow?.["Top10 %"] ?? duneRow?.["Top10"]),
      "Risk %": toFloat(duneRow?.["Risk %"] ?? duneRow?.["Risk"]),
      priceUsd: cg?.priceUsd ?? null,
      marketCapUsd: cg?.marketCapUsd ?? null,
      priceChange7d: priceChange,
      signal,
      signalScore: cg ? getSignalScore(volumeGrowth, priceChange) : null,
      read,
    };
  });

  const enrichedWithout = tokensWithout.map((token) => ({
    Project: token.name,
    Symbol: token.symbol,
    Address: null,
    Tag: token.tag,
    "O Rk": null,
    Opp: null,
    "M Rk": null,
    Mom: null,
    "S Rk": null,
    Sus: null,
    Prof: null,
    "Qlty %": null,
    "Vol 30d": null,
    "Vol/Tx": null,
    "Vol/Wlt": null,
    "Vol Grw %": null,
    "Txs 30d": null,
    "Txs 7d": null,
    "Tx Grw %": null,
    "Txs/User": null,
    "Wallets 30d": null,
    "Wallets 7d": null,
    "User Grw %": null,
    "New Wallets": null,
    "Returning Wallets": null,
    "New %": null,
    "Retention %": null,
    "Avg Txs Ret": null,
    Traders: null,
    "Buyers 30d": null,
    "Buyers 7d": null,
    "1st Buyers 30d": null,
    "1st Buyers 7d": null,
    "1st Sellers 30d": null,
    "1st Sellers 7d": null,
    "Non-Trade New 30d": null,
    "Top10 %": null,
    "Risk %": null,
    priceUsd: null,
    marketCapUsd: null,
    priceChange7d: null,
    signal: "No Address",
    signalScore: null,
    read: null,
  }));

  return {
    rows: [...enrichedWithAddress, ...enrichedWithout],
    lastUpdated: null,
  };
}
</file>

<file path="lib/getDiscoveryData.js">
import { fetchCoinGeckoJSON, mapWithConcurrency } from "./coingeckoFetch";

const AI_CATEGORIES = ["ai-agents"];

const REJECTED_ADDRESSES = [
  "0xa81a52b4dda010896cdd386c7fbdc5cdc835ba23",
  "0x5576d6ed9181f2225aff5282ac0ed29f755437ea",
  "0xbcbaf311cec8a4eac0430193a528d9ff27ae38c1",
  "0x1f16e03c1a5908818f47f6ee7bb16690b40d0671",
  "0x7cea5b9548a4b48cf9551813ef9e73de916e41e0",
  "0xff8104251e7761163fac3211ef5583fb3f8583d6",
  "0x02300ac24838570012027e0a90d3feccef3c51d2",
  "0x614577036f0a024dbc1c88ba616b394dd65d105a",
];

async function fetchCategoryCoins(categoryId) {
  const result = await fetchCoinGeckoJSON(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
    { revalidate: 86400 }
  );
  return result.ok ? result.data : [];
}

async function fetchCoinPlatforms(coinId) {
  const result = await fetchCoinGeckoJSON(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
    { revalidate: 86400 }
  );
  if (!result.ok) return null;
  return result.data.platforms?.base || null;
}

export async function getDiscoveryData(trackedAddresses) {
  try {
    const excludedLower = new Set(
      [...(trackedAddresses || []), ...REJECTED_ADDRESSES].map((a) =>
        a.toLowerCase()
      )
    );
    const categoryResults = await Promise.all(AI_CATEGORIES.map(fetchCategoryCoins));
    const seen = new Map();
    categoryResults.flat().forEach((coin) => {
      if (coin && coin.id && !seen.has(coin.id)) {
        seen.set(coin.id, coin);
      }
    });
    const uniqueCoins = Array.from(seen.values());
    const candidates = uniqueCoins.slice(0, 50);
    const withAddresses = await mapWithConcurrency(candidates, 8, async (coin) => {
      const baseAddress = await fetchCoinPlatforms(coin.id);
      return baseAddress
        ? {
            name: coin.name,
            symbol: coin.symbol?.toUpperCase(),
            address: baseAddress,
            marketCapUsd: coin.market_cap,
            priceUsd: coin.current_price,
            coingeckoId: coin.id,
          }
        : null;
    });
    const newCandidates = withAddresses
      .filter((c) => c !== null)
      .filter((c) => !excludedLower.has(c.address.toLowerCase()))
      .sort((a, b) => (b.marketCapUsd || 0) - (a.marketCapUsd || 0));
    return newCandidates;
  } catch {
    return [];
  }
}
</file>

<file path="lib/tokens.js">
// lib/tokens.js — v2, all addresses populated from master v4
const tokens = [

  // ── AGENT INDEPENDENT ─────────────────────────────────────────────────────
  { name: "Virtuals Protocol",              symbol: "VIRTUAL",   address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", tag: "agent-independent" },
  { name: "Clanker",                        symbol: "CLANKER",   address: "0x1bc0c42215582d5a085795f4badbac3ff36d1bcb", tag: "agent-independent" },
  { name: "Venice",                         symbol: "VENICE",    address: "0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf", tag: "agent-independent" },
  { name: "AWE",                            symbol: "AWE",       address: "0x1b4617734c43f6159f3a70b7e06d883647512778", tag: "agent-independent" },
  { name: "FAI",                            symbol: "FAI",       address: "0xb33Ff54b9F7242EF1593d2C9Bcd8f9df46c77935", tag: "agent-independent" },
  { name: "Bankr",                          symbol: "BNKR",      address: "0x22af33fe49fd1fa80c7149773dde5890d3c76f3b", tag: "agent-independent" },
  { name: "AI Agent Layer",                symbol: "AIFUN",     address: "0xbdf317f9c153246c429f23f4093087164b145390", tag: "agent-independent" },
  { name: "AI Rig Complex",                symbol: "ARC",       address: "0x61ca70b867a48265e553a7fbb81bfe44fada7ae6", tag: "agent-independent" },
  { name: "Agent Zero",                     symbol: "A0T",       address: "0xcc4adb618253ed0d4d8a188fb901d70c54735e03", tag: "agent-independent" },
  { name: "ElizaOS",                        symbol: "ELIZAOS",   address: "0xea17df5cf6d172224892b5477a16acb111182478", tag: "agent-independent" },
  { name: "Autonolas",                      symbol: "OLAS",      address: "0x54330d28ca3357f294334bdc454a032e7f353416", tag: "agent-independent" },
  { name: "Cookie DAO",                     symbol: "COOKIE",    address: "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f", tag: "agent-independent" },
  { name: "AITECH Cloud Network",           symbol: "ACN",       address: "0xd71552d9e08e5351adb52163b3bbbc4d7de53ce1", tag: "agent-independent" },
  { name: "Morpheus AI",                    symbol: "MOR",       address: "0x7431ada8a591c955a994a21710752ef9b882b8e3", tag: "agent-independent" },
  { name: "Artificial Liquid Intelligence", symbol: "ALI",       address: "0x97c806e7665d3afd84a8fe1837921403d59f3dcc", tag: "agent-independent" },
  { name: "Cortex",                         symbol: "CX",        address: "0x000000000000012def132e61759048be5b5c6033", tag: "agent-independent" },
  { name: "Elsa",                           symbol: "HEYELSA",   address: "0x29cc30f9d113b356ce408667aa6433589cecbdca", tag: "agent-independent" },
  { name: "Wayfinder",                      symbol: "PROMPT",    address: "0x30c7235866872213f68cb1f08c37cb9eccb93452", tag: "agent-independent" },
  { name: "AXOBOTL",                        symbol: "AXOBOTL",   address: "0x810affc8aadad2824c65e0a2c5ef96ef1de42ba3", tag: "agent-independent" },
  { name: "Big Tony",                       symbol: "TONY",      address: "0xb22a793a81ff5b6ad37f40d5fe1e0ac4184d52f3", tag: "agent-independent" },
  { name: "AUTONOMOPOLY",                   symbol: "AUTONO",    address: "0xB3D7e0c3C39A1D3F1B304663065A2F83Ddf56d8e", tag: "agent-independent" },
  { name: "BitVault Signal",                symbol: "BV7X",      address: "0xD88FD4a11255E51f64f78b4a7d74456325c2d8dC", tag: "agent-independent" },
  { name: "ODEI AI",                        symbol: "ODAI",      address: "0x0086cFF0c1E5D17b19F5bCd4c8840a5B4251D959", tag: "agent-independent" },
  { name: "Trackgood AI",                   symbol: "TRAI",      address: "0xdd32659b1e7a6a6b3c6e96cd8a4c936bcfea0607", tag: "agent-independent" },
  { name: "Thirdfy",                        symbol: "TFY",       address: "0xb2aca4ca8b7bbd9a5388ccb044c87dedf8a51c7c", tag: "agent-independent" },
  { name: "Doppel",                         symbol: "Doppel",    address: "0xf27b8ef47842E6445E37804896f1BC5e29381b07", tag: "agent-independent" },
  { name: "Amper",                          symbol: "AMPR",      address: "0x494C4cf6C8F971DDfCa95184282b86220FAB9B07", tag: "agent-independent" },
  { name: "PerkOS",                         symbol: "PERKOS",    address: "0xF714E60f85497D70508F7E356b5DB80e64539BA3", tag: "agent-independent" },
  { name: "Messy Virgo",                    symbol: "MESSY",     address: "0x09f87F948C88848363B124C9099CbB58E4Cc7cB6", tag: "agent-independent" },
  { name: "Toriva",                         symbol: "TORIVA",    address: "0xb886cf1444bff05e9a99e00543bc4054d423ebfd", tag: "agent-independent" },
  { name: "SIMMI",                          symbol: "SIMMI",     address: "0x161e113b8e9bbaefb846f73f31624f6f9607bd44", tag: "agent-independent" },
  { name: "ARGUE.FUN",                      symbol: "ARGUE",     address: "0x7ffd8f91b0b1b5c7a2e6c7c9efb8be0a71885b07", tag: "agent-independent" },
  { name: "Osobot",                         symbol: "OSO",       address: "0xc78fAbC2cB5B9cf59E0Af3Da8E3Bc46d47753A4e", tag: "agent-independent" },
  { name: "SIRE",                           symbol: "SIRE",      address: "0x7Ce02e86354EA0Cc3b302AeAdC0Ab56bC7EB44b8", tag: "agent-independent" },
  { name: "Aubrai",                         symbol: "AUBRAI",    address: "0x9d56c29e820Dd13b0580B185d0e0Dc301d27581d", tag: "agent-independent" },
  { name: "AION 5100",                      symbol: "AION",      address: "0xfc48314ad4aD5bD36a84E8307b86A68A01D95d9C", tag: "agent-independent" },

  // ── AGENT VIA VIRTUALS ────────────────────────────────────────────────────
  { name: "Spectral",                       symbol: "SPEC",      address: "0x96419929d7949d6a801a6909c145c8eef6a40431", tag: "agent-via-virtuals" },
  { name: "AIXBT",                          symbol: "AIXBT",     address: "0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825", tag: "agent-via-virtuals" },
  { name: "Ethy AI",                        symbol: "ETHY",      address: "0xC44141a684f6AA4E36cD9264ab55550B03C88643", tag: "agent-via-virtuals" },
  { name: "Axelrod",                        symbol: "AXR",       address: "0x58Db197E91Bc8Cf1587F75850683e4bd0730e6BF", tag: "agent-via-virtuals" },
  { name: "VADER",                          symbol: "VADER",     address: "0x731814e491571a2e9ee3c5b1f7f3b962ee8f4870", tag: "agent-via-virtuals" },
  { name: "Ribbita",                        symbol: "TIBBIR",    address: "0xA4A2E2ca3fBfE21aed83471D28b6f65A233C6e00", tag: "agent-via-virtuals" },
  { name: "LUNA",                           symbol: "LUNA",      address: "0x55cd6469f597452b5a7536e2cd98fde4c1247ee4", tag: "agent-via-virtuals" },
  { name: "GAME by Virtuals",              symbol: "GAME",      address: "0x1c4cca7c5db003824208adda61bd749e55f463a3", tag: "agent-via-virtuals" },
  { name: "BYTE by Virtuals",              symbol: "BYTE",      address: "0x2d90785e30a9df6cce329c0171cb8ba0f4a5c17b", tag: "agent-via-virtuals" },
  { name: "SWARM",                          symbol: "SWARM",     address: "0xea87169699dabd028a78d4b91544b4298086baf6", tag: "agent-via-virtuals" },
  { name: "Athena",                         symbol: "ATHENA",    address: "0x1a43287cbfcc5f35082e6e2aa98e5b474fe7bd4e", tag: "agent-via-virtuals" },
  { name: "PRXVT",                          symbol: "PRXVT",     address: "0x4b5D32A07b8d3eC5D6928cAa30196f8dd6a7C5A9", tag: "agent-via-virtuals" },
  { name: "Litebeam",                       symbol: "LBM",       address: "0x15B15FA54b629C634958E8BD639b2fc8af654974", tag: "agent-via-virtuals" },
  { name: "ReplyCorp",                      symbol: "REPLY",     address: "0x05B1266DDCeE093cE060DBF697e230EA9B453633", tag: "agent-via-virtuals" },
  { name: "Instaclaw",                      symbol: "INSTACLAW", address: "0xA9E23871156718C1D55e90dad1c4ea8a33480DFd", tag: "agent-via-virtuals" },
  { name: "Chromia EVAL",                  symbol: "EVAL",      address: "0xdd78523217390bb0d49C7601e7e54C36d71622F0", tag: "agent-via-virtuals" },
  { name: "BLACK HOLE",                    symbol: "BLKH",      address: "0xd63F21E7f4205d59c5b486273C42e261d5CD4d1d", tag: "agent-via-virtuals" },
  { name: "Music by Virtuals",             symbol: "MUSIC",     address: "0xc655C331d1Aa7f96c252F1f40CE13D80eAc53504", tag: "agent-via-virtuals" },
  { name: "Iona",                           symbol: "IONA",      address: "0x645C7Aa841087E2e7f741C749aB27422fF5BbA8E", tag: "agent-via-virtuals" },
  { name: "Aurra",                          symbol: "AURA",      address: "0xdcaa5e062b2be18e52ea6ed7ba232538621ddc10", tag: "agent-via-virtuals" },
  { name: "GAM3S.GG",                      symbol: "G3",        address: "0xcf67815cce72e682eb4429eca46843bed81ca739", tag: "agent-via-virtuals" },
  { name: "DTRXBT",                         symbol: "DTRXBT",    address: "0x84a9aae8fcc085dbe11524f570716d89b772f430", tag: "agent-via-virtuals" },
  { name: "CONVO",                          symbol: "CONVO",     address: "0xab964f7b7b6391bd6c4e8512ef00d01f255d9c0d", tag: "agent-via-virtuals" },
  { name: "Sage",                           symbol: "SAGE",      address: "0x8dd524a86195a6ef95304e7f0dd9c405a2e78859", tag: "agent-via-virtuals" },
  { name: "A.T.M.",                         symbol: "ATM",       address: "0xe095b8127823708dc07e739ef4149050acc836e7", tag: "agent-via-virtuals" },
  { name: "Wakehacker",                     symbol: "WAKEAI",    address: "0xabd3718656dbb5547d6b426c18b03848d18981ea", tag: "agent-via-virtuals" },
  { name: "VERONICA",                       symbol: "VERONICA",  address: "0x164239fa94aec9c4e437bf6890ea8602b759fd74", tag: "agent-via-virtuals" },
  { name: "Waveform",                       symbol: "WAVE",      address: "0x64712FbDF19aE8b5B3B6D0478750E3D5e1A17718", tag: "agent-via-virtuals" },
  { name: "MUTE SWAP",                     symbol: "MUTE",      address: "0xa023316FA5c85dADF008C611790B3235433e781e", tag: "agent-via-virtuals" },
  { name: "Velvet Unicorn",                symbol: "VU",        address: "0x511ef9Ad5E645E533D15DF605B4628e3D0d0Ff53", tag: "agent-via-virtuals" },
  { name: "Rabbi Schlomo",                 symbol: "SHEKEL",    address: "0x5F6a682A58854C7fBE228712aEEFfcCDe0008Ac0", tag: "agent-via-virtuals" },
  { name: "Cybercentry",                    symbol: "CENTRY",    address: "0x80Ded22d9c6487181Ed74D0222Add805815e8dF4", tag: "agent-via-virtuals" },
  { name: "Predi",                          symbol: "PREDI",     address: "0xaeA742f80922f7C94B8FD91686c9dFbDFE90d9E6", tag: "agent-via-virtuals" },
  { name: "Replicat-One",                  symbol: "RCAT",      address: "0x6AF73D4579c70A24D52e4F4b43EeCB2A75019F94", tag: "agent-via-virtuals" },
  { name: "Starly",                         symbol: "STAR",      address: "0x3b92844c5abd9f0562c71ebf219628f1676a856d", tag: "agent-via-virtuals" },
  { name: "Upsider AI",                    symbol: "UP",        address: "0x9e271ec4d66f2b400ad92de8a10e5c9c1914259c", tag: "agent-via-virtuals" },
  { name: "Jeff CEO",                      symbol: "CEO",       address: "0xa66f68ef2d8091e13585a502464bd11a159cf710", tag: "agent-via-virtuals" },
  { name: "LYRA",                           symbol: "LYRA",      address: "0x99956f143dcca77cddf4b4b2a0fa4d491703244d", tag: "agent-via-virtuals" },
  { name: "717ai",                          symbol: "WIRE",      address: "0x0b3AE50BaBE7FFa4E1A50569ceE6bDEFd4ccAeE0", tag: "agent-via-virtuals" },
  { name: "1000x",                          symbol: "1000X",     address: "0x352b850b733ab8baB50aED1Dab5D22E3186ce984", tag: "agent-via-virtuals" },
  { name: "SIBYL",                          symbol: "SIBYL",     address: "0x797f214a2CD64a4963A91Fa21c8C55Ec3EBa4714", tag: "agent-via-virtuals" },
  { name: "Acolyte",                        symbol: "ACOLYT",    address: "0x79dacb99A8698052a9898E81Fdf883c29efb93cb", tag: "agent-via-virtuals" },
  { name: "Loky",                           symbol: "LOKY",      address: "0x1A3e429D2D22149Cc61e0f539B112a227c844aa3", tag: "agent-via-virtuals" },
  { name: "Gekko AI",                      symbol: "GEKKO",     address: "0xf7b0dd0B642a6ccc2fc4d8FfE2BfFb0caC8C43C8", tag: "agent-via-virtuals" },
  { name: "Degenerate SQuiD",             symbol: "SQDGN",     address: "0x4674F73545F1db4036250ff8C33A39ad1678D864", tag: "agent-via-virtuals" },
  { name: "Robostack",                      symbol: "ROBOT",     address: "0x708c2B2eEb9578dFe4020895139E88F7654647Ff", tag: "agent-via-virtuals" },
  { name: "maicrotrader",                   symbol: "MAICRO",    address: "0xE74731ba9d1Da6Fd3C8c60Ff363732bebAc5273E", tag: "agent-via-virtuals" },
  { name: "Fyni AI",                       symbol: "FYNI",      address: "0x22c0a2e55AeD8B317A285ccbd4f3D8eE24C9e5e3", tag: "agent-via-virtuals" },
  { name: "Solace",                         symbol: "SOLACE",    address: "0x7d6fcB3327D7E17095fA8B0E3513AC7A3564f5E1", tag: "agent-via-virtuals" },
  { name: "H1DR4",                          symbol: "H1DR4",     address: "0x83AbFC4bEEC2ecf12995005d751a42df691c09c1", tag: "agent-via-virtuals" },
  { name: "Neurobro",                       symbol: "BRO",       address: "0xc796E499CC8f599A2a8280825d8BdA92F7a895e0", tag: "agent-via-virtuals" },
  { name: "Capminal",                       symbol: "CAP",       address: "0xbfa733702305280F066D470afDFA784fA70e2649", tag: "agent-via-virtuals" },
  { name: "Otto AI",                       symbol: "OTTO",      address: "0x380337d0180db7D0DF76ac4fAaE2fcea908EE1fC", tag: "agent-via-virtuals" },
  { name: "SANTA",                          symbol: "SANTA",     address: "0x815269D17C10f0F3dF7249370E0c1B9efe781aa8", tag: "agent-via-virtuals" },
  { name: "VPay",                           symbol: "VPAY",      address: "0x98aC5B33A4Ef1151f138941c979211599c2fF953", tag: "agent-via-virtuals" },
  { name: "ArAIstotle",                     symbol: "FACY",      address: "0xFAC77f01957ed1B3DD1cbEa992199B8f85B6E886", tag: "agent-via-virtuals" },
  { name: "Jaihoz",                         symbol: "JAIHOZ",    address: "0xe2816b27a5613b0aaf5d6dafa80584156e2fb1b6", tag: "agent-via-virtuals" },
  { name: "Maya World",                    symbol: "MAYA",      address: "0x072915a43ac255cde1fa568218e5b6b10d0cb10f", tag: "agent-via-virtuals" },
  { name: "Degen AI",                      symbol: "DGENAI",    address: "0x54eaf6bb665565bb8897f9d7ad5b3818ded143b4", tag: "agent-via-virtuals" },
  { name: "nomAI",                          symbol: "NOMAI",     address: "0x4d70f1058b73198f12a76c193aef5db5dd75babd", tag: "agent-via-virtuals" },
  { name: "Kolwaii",                        symbol: "VIBES",     address: "0x33479a07983561ab5e27ad435399fc88159eea8b", tag: "agent-via-virtuals" },
  { name: "WachAI",                         symbol: "WACH",      address: "0xcc9ad02796dec5f4f0710df80c1f011af85eb9e1", tag: "agent-via-virtuals" },
  { name: "0xMonk",                         symbol: "MONK",      address: "0x06abb84958029468574b28b6e7792a770ccaa2f6", tag: "agent-via-virtuals" },
  { name: "Gigabrain",                      symbol: "BRAIN",     address: "0xce1eab31756a48915b7e7bb79c589835aac6242d", tag: "agent-via-virtuals" },
  { name: "Olyn",                           symbol: "OLYN",      address: "0x91273b316240879fd902c0c3fcf7c0158777b42f", tag: "agent-via-virtuals" },
  { name: "Gloria AI",                     symbol: "GLORIA",    address: "0x3b313f5615bbd6b200c71f84ec2f677b94df8674", tag: "agent-via-virtuals" },

  // ── CLANKER VIA BANKRBOT PREFORK ──────────────────────────────────────────
  { name: "CLAWD",                          symbol: "CLAWD",     address: "0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07", tag: "clanker-via-bankrbot-prefork" },
  { name: "Clawnch",                        symbol: "CLAWNCH",   address: "0xa1f72459dfa10bad200ac160ecd78c6b77a747be", tag: "clanker-via-bankrbot-prefork" },
  { name: "KellyClaude",                    symbol: "KCLAUDE",   address: "0x50d2280441372486beecdd328c1854743ebacb07", tag: "clanker-via-bankrbot-prefork" },
  { name: "FELIX",                          symbol: "FELIX",     address: "0xf30bf00edd0c22db54c9274b90d2a4c21fc09b07", tag: "clanker-via-bankrbot-prefork" },
  { name: "Juno Agent",                    symbol: "JUNO",      address: "0x4e6c9f48f73e54ee5f3ab7e2992b2d733d0d0b07", tag: "clanker-via-bankrbot-prefork" },

  // ── AGENT VIA CLANKER ─────────────────────────────────────────────────────
  { name: "Faircaster",                     symbol: "FAIR",      address: "0x7D928816CC9c462DD7adef911De41535E444CB07", tag: "agent-via-clanker" },
  { name: "Sairi",                          symbol: "SAIRI",     address: "0xde61878b0b21ce395266c44d4d548d1c72a3eb07", tag: "agent-via-clanker" },

  // ── AGENT VIA BANKR ───────────────────────────────────────────────────────
  { name: "ClawBank",                       symbol: "CLAWBANK",  address: "0x16332535E2c27da578bC2e82bEb09Ce9d3C8EB07", tag: "agent-via-bankr" },
  { name: "Gitlawb",                        symbol: "GITLAWB",   address: "0x5f980dcfc4c0fa3911554cf5ab288ed0eb13dba3", tag: "agent-via-bankr" },
  { name: "SMC Factory",                    symbol: "SMCF",      address: "0x9326314259102cfb0448e3a5022188d56e61cba3", tag: "agent-via-bankr" },

  // ── NON-AGENT VIA BANKR ───────────────────────────────────────────────────
  { name: "Surplus Intelligence",           symbol: "SURP",      address: "0xc52aedec3374422d7510e294cfaa90799595cba3", tag: "non-agent-via-bankr" },
  { name: "aeon",                           symbol: "AEON",      address: "0xBf8E8f0e8866a7052F948C16508644347c57aba3", tag: "non-agent-via-bankr" },
  { name: "nookplot",                       symbol: "NOOK",      address: "0xb233bdffd437e60fa451f62c6c09d3804d285ba3", tag: "non-agent-via-bankr" },
  { name: "BOTCOIN",                        symbol: "BOTCOIN",   address: "0xa601877977340862ca67f816eb079958e5bd0ba3", tag: "non-agent-via-bankr" },
  { name: "Root Edge",                     symbol: "ROOT",      address: "0x461d3c96d170e551611f54fa466d3d74a680aba3", tag: "non-agent-via-bankr" },
  { name: "Robot Money",                   symbol: "ROBOT",     address: "0x65021a79aeef22b17cdc1b768f5e79a8618beba3", tag: "non-agent-via-bankr" },
  { name: "Basemate",                       symbol: "BASE",      address: "0x07E61D8a4e197dfC269e90D7ECe1dF0D26702bA3", tag: "non-agent-via-bankr" },
  { name: "Ratspeak",                       symbol: "RATS",      address: "0xf1e9baa65d418a9025e1851dd2d37f1ad208bba3", tag: "non-agent-via-bankr" },
  { name: "FreeCode",                       symbol: "FREE",      address: "0x67a7ca081dc79b45fd1fa059cd3b8dcca779aba3", tag: "non-agent-via-bankr" },
  { name: "Blocktronics",                   symbol: "BLOCK",     address: "0x7afe438411ee3959c7de6f7fb76bf9c769320ba3", tag: "non-agent-via-bankr" },
  { name: "cyb3rwr3n",                      symbol: "CYB3R",     address: "0x26E6e2E7a9289B6485c53Cd498dE510d3a8c8ba3", tag: "non-agent-via-bankr" },
  { name: "DARKSOL",                        symbol: "DARKSOL",   address: "0x00cb1fbca324d51325a7264d54072bc073c28ba3", tag: "non-agent-via-bankr" },
  { name: "Delu",                           symbol: "DELU",      address: "0x7b0ee9dcb5c1d4d7cd630c652959951936512ba3", tag: "non-agent-via-bankr" },
  { name: "grantr",                         symbol: "GRANTR",    address: "0x753f2af0f46361c9ae6fc347797f99b0c9e82ba3", tag: "non-agent-via-bankr" },
  { name: "LITCOIN",                        symbol: "LIT",       address: "0x316ffb9c875f900adcf04889e415cc86b564eba3", tag: "non-agent-via-bankr" },
  { name: "WOON",                           symbol: "WOON",      address: "0x85eac631c800af804476b140f87039f742c28ba3", tag: "non-agent-via-bankr" },
  { name: "1clawAI",                        symbol: "1CLAW",     address: "0x61d91cff0fc9fbbdb89f505cf8a7422bf95fdba3", tag: "non-agent-via-bankr" },
  { name: "evo",                            symbol: "EVO",       address: "0x721b072dbb616f29eea73ac004e03fd4e884bba3", tag: "non-agent-via-bankr" },
  { name: "HermesOS",                       symbol: "HERMES",    address: "0x95ccfD2B81A9667b0Cc979992632F98fc853EBa3", tag: "non-agent-via-bankr" },
  { name: "MiroShark",                      symbol: "MIRO",      address: "0xd7bc6a05a56655FB2052F742B012d1DFD66e1BA3", tag: "non-agent-via-bankr" },
  { name: "TACHI",                          symbol: "TACHI",     address: "0x39b4b879b8521d6a8c3a87cda64b969327b7fba3", tag: "non-agent-via-bankr" },
  { name: "HALO",                           symbol: "HALO",      address: "0x0a56431ecc9d0b39be0b1e27e795f4c4f19d0ba3", tag: "non-agent-via-bankr" },
  { name: "Polygraph",                      symbol: "POLY",      address: "0x2878cfc54aabdadd9bb5d70dd24d6b91485afba3", tag: "non-agent-via-bankr" },
  { name: "TEMPO",                          symbol: "TEMPO",     address: "0x591666816c7c527b02a162a88aae75f20b90eba3", tag: "non-agent-via-bankr" },
  { name: "A2H",                            symbol: "A2H",       address: "0xc46c41005a1a88b0c1491f2b542a4831d6d1eba3", tag: "non-agent-via-bankr" },
  { name: "Protean",                        symbol: "PRTN",      address: "0x8070b5e222f1ec077845e46ced2267e0def4cba3", tag: "non-agent-via-bankr" },
  { name: "Atlas",                          symbol: "ATL",       address: "0x0b9f23645c9053becd257f2de5fd961091112fb1", tag: "non-agent-via-bankr" },
  { name: "LienFi",                         symbol: "LIEN",      address: "0x3722264aB15a1dfCe5a5af89e6547F7949A8ABA3", tag: "non-agent-via-bankr" },

  // ── NON-AGENT VIA CLANKER ─────────────────────────────────────────────────
  { name: "Moltbook",                       symbol: "MOLT",      address: "0xB695559b26BB2c9703ef1935c37AeaE9526bab07", tag: "non-agent-via-clanker" },
  { name: "Dickbutt",                       symbol: "DICKBUTT",  address: "0x2D57C47BC5D2432FEEEdf2c9150162A9862D3cCf", tag: "non-agent-via-clanker" },
  { name: "Based Fartcoin",                symbol: "Fartcoin",  address: "0x2f6c17fa9f9bC3600346ab4e48C0701e1d5962AE", tag: "non-agent-via-clanker" },
  { name: "QR coin",                       symbol: "QR",        address: "0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF", tag: "non-agent-via-clanker" },
  { name: "Dimes",                          symbol: "DIME",      address: "0x17d70172c7c4205bd39ce80f7f0ee660b7dc5a23", tag: "non-agent-via-clanker" },
  { name: "noice",                          symbol: "noice",     address: "0x9Cb41FD9dC6891BAe8187029461bfAADF6CC0C69", tag: "non-agent-via-clanker" },
  { name: "WYDE End Hunger",               symbol: "EAT",       address: "0x680BC6ed5c7222E2f29bdBc87f8E8f3400D8Ce04", tag: "non-agent-via-clanker" },
  { name: "Super Anon",                    symbol: "ANON",      address: "0x0Db510e79909666d6dEc7f5e49370838c16D950f", tag: "non-agent-via-clanker" },
  { name: "UPONLY",                         symbol: "UPONLY",    address: "0x2100A39f514d8FE3F26963A29B95b030A0A5d4b7", tag: "non-agent-via-clanker" },
  { name: "Minted Merch",                  symbol: "mintedmerch",address: "0x774EAeFE73Df7959496Ac92a77279A8D7d690b07", tag: "non-agent-via-clanker" },
  { name: "TurboUSD",                       symbol: "TUSD",      address: "0x3d5e487b21e0569048c4d1a60e98c36e1b09db07", tag: "non-agent-via-clanker" },
  { name: "minidev",                        symbol: "MINI",      address: "0x534b7aad1cdb6f02ec48cabe428f0d9131e40b07", tag: "non-agent-via-clanker" },
  { name: "Politics",                       symbol: "POLITICS",  address: "0x43ad5adae56fa09127ba147d5b24c4bc34abdb07", tag: "non-agent-via-clanker" },
  { name: "DebtReliefBot",                 symbol: "DRB",       address: "0x3ec2156D4c0A9CBdAB4a016633b7BcF6a8d68Ea2", tag: "non-agent-via-clanker" },
  { name: "Defense of the Agents",        symbol: "DOTA",      address: "0x5F09821CBb61e09D2a83124Ae0B56aaa3ae85B07", tag: "non-agent-via-clanker" },
  { name: "ProductClank",                  symbol: "PRO",       address: "0x2e7df1528f4eA427F48B49Ae8A1f78149db7185A", tag: "non-agent-via-clanker" },
  { name: "Cody",                           symbol: "CODY",      address: "0x3977fc913dB86b01a257232C568317798B903B07", tag: "non-agent-via-clanker" },
  { name: "luminous",                       symbol: "LUM",       address: "0x0fD7a301B51d0A83FCAf6718628174D527B373b6", tag: "non-agent-via-clanker" },
  { name: "Regent",                         symbol: "REGENT",    address: "0x6f89bcA4eA5931EdFCB09786267b251DeE752b07", tag: "non-agent-via-clanker" },
  { name: "RETAKE.TV",                     symbol: "RETAKE",    address: "0x5eeB2662615782b58251b6f0c3E107571ae1AB07", tag: "non-agent-via-clanker" },
  { name: "BETRMINT",                       symbol: "BETR",      address: "0x051024B653E8ec69E72693F776c41C2A9401FB07", tag: "non-agent-via-clanker" },
  { name: "airgap.finance",                symbol: "AIRGAP",    address: "0x46082c1F77569DF4fE72Eb261cF377973d9Dcb07", tag: "non-agent-via-clanker" },
  { name: "A0x",                            symbol: "A0X",       address: "0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7", tag: "non-agent-via-clanker" },
  { name: "Zoe",                            symbol: "ZOE",       address: "0xC29832025E7652ef58D15F7fA3e232A2fDfaaB07", tag: "non-agent-via-clanker" },

  // ── NON-AGENT VIA VIRTUALS ────────────────────────────────────────────────
  { name: "Wasabot",                        symbol: "BOT",       address: "0xc2427bf51d99b6ed0da0da103bc51235638ee868", tag: "non-agent-via-virtuals" },
  { name: "Fabric Protocol",               symbol: "ROBO",      address: "0x32b4d049fe4c888d2b92eecaf729f44df6b1f36e", tag: "non-agent-via-virtuals" },
  { name: "Shadow Combat League",         symbol: "SCL",       address: "0xefc6fd02b39142ffc4a42d1078157f609be0a5b8", tag: "non-agent-via-virtuals" },
  { name: "PEAK",                           symbol: "PEAK",      address: "0x296eB9c4D8fCbd00fBc6D5027e4202BF955fA76f", tag: "non-agent-via-virtuals" },
  { name: "VIRGEN",                         symbol: "VIRGEN",    address: "0xbf8566956b4e2D8BEB90c4c19dbb8c67A9290C36", tag: "non-agent-via-virtuals" },
  { name: "Bio Unit 000",                  symbol: "BIO",       address: "0xd655790b0486fa681c23b955f5ca7cd5f5c8cb07", tag: "non-agent-via-virtuals" },
  { name: "Agent YP",                      symbol: "AIYP",      address: "0x919e43a2cce006710090e64bde9e01b38fd7f32f", tag: "non-agent-via-virtuals" },
  { name: "DessalinesAI",                  symbol: "DESSAI",    address: "0xb56b5269c03421765c28aa61037536ea5690741c", tag: "non-agent-via-virtuals" },
  { name: "Gluteus Maximus",               symbol: "GLUTEU",    address: "0x06a63c498ef95ad1fa4fff841955e512b4b2198a", tag: "non-agent-via-virtuals" },

  // ── NON-AGENT INFRASTRUCTURE ──────────────────────────────────────────────
  { name: "Hive Intelligence",             symbol: "HINT",      address: "0x91dA780BC7f4B7Cf19ABE90411a2a296Ec5FF787", tag: "non-agent-infrastructure" },
  { name: "Rivalz Token",                  symbol: "RIZ",       address: "0x67543CF0304C19CA62AC95ba82FD4F4B40788dc1", tag: "non-agent-infrastructure" },
  { name: "Mythos Router",                 symbol: "MYTHOS",    address: "0xb942B75A602fA318ac091370D93d9143Ba345Ba3", tag: "non-agent-infrastructure" },

  // ── NEITHER ───────────────────────────────────────────────────────────────
  { name: "BEATS on BASE",                symbol: "BEATS",     address: "0x315B8c9A1123c10228d469551033440441b41F0b", tag: "neither" },
  { name: "Super Champs",                  symbol: "CHAMP",     address: "0xEb6d78148F001F3aA2f588997c5E102E489Ad341", tag: "neither" },

];

export default tokens;
</file>

<file path="public/.gitkeep">

</file>

<file path="jsconfig.json">
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
</file>

<file path="package.json">
{
  "name": "z-dash",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "chart.js": "^4.4.1",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "viem": "^2.21.0",
    "wagmi": "^2.12.0"
  }
}
</file>

<file path="README.md">
# z-dash
</file>

<file path="ThemeToggle.js">
import Providers from "./providers";

export const metadata = {
  title: "Tripwire",
  description: "On-chain intelligence for CLAWD holders on Base",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('zdash-theme');
                  // Default is dark — only remove it if user explicitly chose light
                  if (saved !== 'light') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ── Light mode ─────────────────────────────────────────── */
              :root {
                --bg:               #f8f7f4;
                --bg-subtle:        #f2f0ec;
                --bg-muted:         #eceae4;
                --border:           #dedad2;
                --border-strong:    #c8c4ba;
                --text:             #2c2a26;
                --text-muted:       #5a5750;
                --text-faint:       #8a877f;
                --text-xfaint:      #b0ada5;

                --pill-bg:          #eceae4;
                --pill-border:      #dedad2;
                --pill-text:        #3a3830;
                --pill-label:       #8a877f;
                --pill-value:       #1e1c18;

                --clawd-row-bg:     rgba(59,109,17,0.06);
                --clawd-row-border: #3B6D11;

                --btn-active-bg:    #3d3a52;
                --btn-active-text:  #f0eeff;
                --btn-inactive-bg:  #f8f7f4;
                --btn-inactive-text:#3a3830;
                --btn-inactive-border:#c8c4ba;

                --badge-neutral-bg: #eceae4;
                --badge-neutral-text:#2c2a26;

                --gate-ok-bg:       #e6f4ee;
                --gate-ok-text:     #1a5c3a;
                --gate-fail-bg:     #faecea;
                --gate-fail-text:   #7a2118;

                --read-teal-bg:     #ddf4ec;
                --read-teal-text:   #085041;
                --read-amber-bg:    #faeeda;
                --read-amber-text:  #633806;
                --read-coral-bg:    #faecea;
                --read-coral-text:  #712B13;

                --chart-grid:       rgba(0,0,0,0.07);
                --chart-tick:       #8a877f;
                --card-bg:          #f8f7f4;
                --card-header-bg:   #eceae4;
              }

              /* ── Dark mode — warm slate with lavender accent ─────────── */
              [data-theme="dark"] {
                --bg:               #1c1b22;
                --bg-subtle:        #23222b;
                --bg-muted:         #2a2933;
                --border:           #383644;
                --border-strong:    #4a4758;
                --text:             #e8e6f0;
                --text-muted:       #a8a4bc;
                --text-faint:       #6e6a80;
                --text-xfaint:      #4e4a5e;

                --pill-bg:          #2a2933;
                --pill-border:      #38364a;
                --pill-text:        #ccc8e0;
                --pill-label:       #6e6a80;
                --pill-value:       #e8e6f0;

                --clawd-row-bg:     rgba(130,180,80,0.08);
                --clawd-row-border: #7ab84a;

                --btn-active-bg:    #7c6fcd;
                --btn-active-text:  #f0eeff;
                --btn-inactive-bg:  #23222b;
                --btn-inactive-text:#a8a4bc;
                --btn-inactive-border:#38364a;

                --badge-neutral-bg: #2a2933;
                --badge-neutral-text:#ccc8e0;

                --gate-ok-bg:       #1a2e24;
                --gate-ok-text:     #74c99a;
                --gate-fail-bg:     #2e1a1a;
                --gate-fail-text:   #e08080;

                --read-teal-bg:     #1a2e28;
                --read-teal-text:   #74c9a8;
                --read-amber-bg:    #2e2210;
                --read-amber-text:  #d4a864;
                --read-coral-bg:    #2e1a1a;
                --read-coral-text:  #e08878;

                --chart-grid:       rgba(200,190,255,0.08);
                --chart-tick:       #6e6a80;
                --card-bg:          #23222b;
                --card-header-bg:   #2a2933;
              }

              *, *::before, *::after { box-sizing: border-box; }

              body {
                background: var(--bg);
                color: var(--text);
                margin: 0;
                font-family: sans-serif;
                transition: background 0.25s, color 0.25s;
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
</file>

</files>
