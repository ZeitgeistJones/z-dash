"use client";
import { useEffect, useState } from "react";

function SimpleLineChart({ data, height = 110, color = "#4f8a5b", formatY }) {
  if (!data || data.length === 0) {
    return <p style={{ color: "#888", fontSize: "13px" }}>No data yet.</p>;
  }
  const values = data.map((d) => d.y).filter((v) => v != null && !Number.isNaN(v));
  if (values.length === 0) return <p style={{ color: "#888", fontSize: "13px" }}>No data yet.</p>;

  const width = 460;
  const padding = 10;
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const range = maxY - minY || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((d.y - minY) / range) * (height - padding * 2);
    return { x, y, label: d.x, value: d.y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount }, (_, i) => {
    const frac = i / (gridCount - 1);
    const value = maxY - frac * range;
    const y = padding + frac * (height - padding * 2);
    return { y, value };
  });

  const labelCount = Math.min(6, points.length);
  const labelStep = Math.max(1, Math.floor((points.length - 1) / (labelCount - 1 || 1)));
  const labelIndices = [];
  for (let i = 0; i < points.length; i += labelStep) labelIndices.push(i);
  if (labelIndices[labelIndices.length - 1] !== points.length - 1) {
    labelIndices.push(points.length - 1);
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ display: "flex" }}>
        <div style={{ width: "60px", flexShrink: 0, position: "relative", height: `${height}px` }}>
          {gridLines.map((g, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: `${g.y}px`,
                right: "8px",
                transform: "translateY(-50%)",
                fontSize: "10px",
                color: "#999",
                whiteSpace: "nowrap",
              }}
            >
              {formatY ? formatY(g.value) : Math.round(g.value * 10) / 10}
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: `${height}px`, display: "block" }}
        >
          {gridLines.map((g, i) => (
            <line
              key={i}
              x1={0}
              y1={g.y}
              x2={width}
              y2={g.y}
              stroke="#eee"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
          ))}
        </svg>
      </div>
      <div style={{ marginLeft: "60px", display: "flex", justifyContent: "space-between" }}>
        {labelIndices.map((i) => (
          <span key={i} style={{ fontSize: "11px", color: "#888" }}>
            {points[i].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartSection({ title, value, data, color, formatY }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", maxWidth: "640px", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", color: "#666" }}>{title}</span>
        <span style={{ fontSize: "14px", fontWeight: 600, color }}>{value ?? "—"}</span>
      </div>
      <SimpleLineChart data={data} color={color} formatY={formatY} />
    </div>
  );
}

function formatUsd(v) {
  if (v == null) return "—";
  return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPrice(v) {
  if (v == null) return "—";
  return `$${Number(v).toPrecision(4)}`;
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
    ["Price", clawdRow?.priceUsd != null ? formatPrice(clawdRow.priceUsd) : "—", null],
    ["Market Cap", clawdRow?.marketCapUsd != null ? formatUsd(clawdRow.marketCapUsd) : "—", null],
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
          <ChartSection
            title="Opportunity Score"
            value={clawdRow?.["Opp"]}
            data={oppSeries}
            color="#4f8a5b"
          />
          <ChartSection
            title="Momentum"
            value={clawdRow?.["Mom"]}
            data={momSeries}
            color="#3a6ea5"
          />
          <ChartSection
            title="Sustainability"
            value={clawdRow?.["Sus"]}
            data={susSeries}
            color="#a55a3a"
          />

          <h3 style={{ marginTop: "24px" }}>Market Trend — last ~60 days</h3>
          {priceHistory.error && (
            <p style={{ fontSize: "12px", color: "#c0392b", marginBottom: "8px" }}>
              Price/market cap history failed to load: {priceHistory.error}
            </p>
          )}
          <ChartSection
            title="Market Cap (USD)"
            value={clawdRow?.marketCapUsd != null ? formatUsd(clawdRow.marketCapUsd) : "—"}
            data={marketCapSeries}
            color="#8a4f8a"
            formatY={formatUsd}
          />
          <ChartSection
            title="Price (USD)"
            value={clawdRow?.priceUsd != null ? formatPrice(clawdRow.priceUsd) : "—"}
            data={priceSeries}
            color="#4f8a8a"
            formatY={formatPrice}
          />
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
