"use client";
import { useEffect, useState } from "react";

function SimpleLineChart({ data, height = 120, color = "#4f8a5b", formatY }) {
  if (!data || data.length === 0) {
    return <p style={{ color: "#888", fontSize: "13px" }}>No data yet.</p>;
  }
  const width = 600;
  const padding = 30;
  const values = data.map((d) => d.y).filter((v) => v != null && !Number.isNaN(v));
  if (values.length === 0) return <p style={{ color: "#888", fontSize: "13px" }}>No data yet.</p>;

  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const range = maxY - minY || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.y - minY) / range) * (height - padding * 2);
    return { x, y, label: d.x, value: d.y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: `${height}px` }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
      {points.map((p, i) => (
        <text key={`label-${i}`} x={p.x} y={height - 6} fontSize="9" textAnchor="middle" fill="#888">
          {p.label}
        </text>
      ))}
      <text x={last.x} y={last.y - 10} fontSize="10" textAnchor="middle" fill={color} fontWeight="600">
        {formatY ? formatY(last.value) : last.value}
      </text>
    </svg>
  );
}

function formatUsd(v) {
  if (v == null) return "—";
  return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDateShort(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return String(d);
  }
}

export default function ClawdPanel({ clawdRow, rank, totalProjects }) {
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
        if (json.error) {
          setErrorMsg(json.error);
          setStatus("error");
          return;
        }
        setBehavioralHistory(json.behavioralHistory || []);
        setPriceHistory(json.priceHistory || { prices: [], market_caps: [] });
        setStatus("done");
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(String(err));
          setStatus("error");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const oppSeries = behavioralHistory.map((r) => ({
    x: formatDateShort(r["Snapshot Date"]),
    y: Number(r["Opp"]),
  }));
  const momSeries = behavioralHistory.map((r) => ({
    x: formatDateShort(r["Snapshot Date"]),
    y: Number(r["Mom"]),
  }));
  const susSeries = behavioralHistory.map((r) => ({
    x: formatDateShort(r["Snapshot Date"]),
    y: Number(r["Sus"]),
  }));

  function thinSeries(rawPairs, targetPoints = 30) {
    if (!rawPairs || rawPairs.length === 0) return [];
    const step = Math.max(1, Math.floor(rawPairs.length / targetPoints));
    return rawPairs
      .filter((_, i) => i % step === 0)
      .map(([ts, val]) => ({ x: formatDateShort(ts), y: val }));
  }

  const marketCapSeries = thinSeries(priceHistory.market_caps);
  const priceSeries = thinSeries(priceHistory.prices);

  const cards = [
    ["Opportunity", clawdRow?.["Opp"], rank ? `Rank #${rank} of ${totalProjects}` : null],
    ["Momentum", clawdRow?.["Mom"], null],
    ["Sustainability", clawdRow?.["Sus"], null],
    ["Profile", clawdRow?.["Prof"], null],
    ["Price", clawdRow?.priceUsd != null ? `$${Number(clawdRow.priceUsd).toPrecision(4)}` : "—", null],
    ["Market Cap", clawdRow?.marketCapUsd != null ? `$${Number(clawdRow.marketCapUsd).toLocaleString()}` : "—", null],
    ["Signal", clawdRow?.signal, null],
  ];

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>CLAWD — Health Check</h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        {cards.map(([label, value, sub]) => (
          <div
            key={label}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "12px 16px",
              minWidth: "130px",
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>{value ?? "—"}</div>
            {sub && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{sub}</div>}
          </div>
        ))}
      </div>

      <h3>Behavioral Trend — last 8 weeks</h3>
      {status === "loading" && <p style={{ color: "#666" }}>Loading history…</p>}
      {status === "error" && <p style={{ color: "#c0392b" }}>Couldn't load history: {errorMsg}</p>}
      {status === "done" && (
        <>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Opportunity Score</p>
          <SimpleLineChart data={oppSeries} color="#4f8a5b" />
          <p style={{ fontSize: "13px", color: "#666", margin: "16px 0 8px" }}>Momentum</p>
          <SimpleLineChart data={momSeries} color="#3a6ea5" />
          <p style={{ fontSize: "13px", color: "#666", margin: "16px 0 8px" }}>Sustainability</p>
          <SimpleLineChart data={susSeries} color="#a55a3a" />

          <h3 style={{ marginTop: "24px" }}>Market Trend — last ~60 days</h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Market Cap (USD)</p>
          <SimpleLineChart data={marketCapSeries} color="#8a4f8a" formatY={formatUsd} />
          <p style={{ fontSize: "13px", color: "#666", margin: "16px 0 8px" }}>Price (USD)</p>
          <SimpleLineChart data={priceSeries} color="#4f8a8a" />
        </>
      )}

      <p style={{ fontSize: "12px", color: "#999", marginTop: "24px" }}>
        Behavioral history (Opp/Mom/Sus) is a true backtest — recomputed from on-chain activity as of each past
        date, including full cohort context, not just CLAWD in isolation. Refreshed roughly weekly, not live.
        Price/Market Cap history comes from CoinGecko.
      </p>
    </div>
  );
}
