"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const PROFILE_COLORS = {
  Breakout: { bg: "#EAF3DE", text: "#27500A" },
  "Quick Mover": { bg: "#FAEEDA", text: "#633806" },
  "Slow Burner": { bg: "#E1F5EE", text: "#085041" },
  Cold: { bg: "#F1EFE8", text: "#444441" },
};

const SIGNAL_COLORS = {
  "Confirmed Growth": { bg: "#EAF3DE", text: "#27500A" },
  Absorbed: { bg: "#FAEEDA", text: "#633806" },
  "Thin Rally": { bg: "#FAECE7", text: "#712B13" },
  Cooling: { bg: "#F1EFE8", text: "#444441" },
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
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return String(d);
  }
}

function Sparkline({ data, labels, color, formatY }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: color,
            backgroundColor: color,
            pointRadius: 2.5,
            borderWidth: 2,
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { font: { size: 10 }, color: "#888", maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
            grid: { display: false },
          },
          y: {
            ticks: {
              font: { size: 10 },
              color: "#888",
              maxTicksLimit: 4,
              callback: formatY || ((v) => Math.round(v * 10) / 10),
            },
            grid: { color: "rgba(136,135,128,0.15)" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), JSON.stringify(labels), color]);

  if (!data || data.length === 0) {
    return <p style={{ color: "#888", fontSize: "13px" }}>No data yet.</p>;
  }

  return (
    <div style={{ position: "relative", height: "90px", width: "100%" }}>
      <canvas ref={canvasRef} role="img" aria-label="Trend chart" />
    </div>
  );
}

function MetricCard({ label, sublabel, value, valueColor, rank, totalProjects, data, labels, color, formatY }) {
  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
      <div style={{ background: "#f3f2ee", padding: "10px 16px" }}>
        <div style={{ fontWeight: 600, fontSize: "15px" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "#888" }}>{sublabel}</div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
          <span style={{ fontSize: "26px", fontWeight: 600, color: valueColor }}>{value ?? "—"}</span>
          {rank != null && totalProjects != null && (
            <span style={{ fontSize: "12px", color: "#888" }}>Rank #{rank} of {totalProjects}</span>
          )}
        </div>
        <Sparkline data={data} labels={labels} color={color} formatY={formatY} />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "#999",
        margin: "0 0 8px",
      }}
    >
      {children}
    </p>
  );
}

function ProfileSignalBanner({ profile, signal, read }) {
  const profileColor = PROFILE_COLORS[profile] || PROFILE_COLORS.Cold;
  const signalColor = SIGNAL_COLORS[signal] || SIGNAL_COLORS.Cooling;
  const readTier = read ? READ_TIERS[read] || "amber" : null;
  const readColor = readTier ? READ_TIER_COLORS[readTier] : null;
  const explanation = COMBO_EXPLANATIONS[`${profile}|${signal}`] || "Explanation not available for this combination.";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        background: "#f7f7f5",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {read && (
          <span
            style={{
              fontSize: "13px",
              padding: "5px 12px",
              borderRadius: "6px",
              background: readColor.bg,
              color: readColor.text,
              fontWeight: 700,
            }}
          >
            Read: {read}
          </span>
        )}
        <span
          style={{
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: profileColor.bg,
            color: profileColor.text,
            fontWeight: 600,
          }}
        >
          Profile: {profile ?? "—"}
        </span>
        <span
          style={{
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: signalColor.bg,
            color: signalColor.text,
            fontWeight: 600,
          }}
        >
          Signal: {signal ?? "—"}
        </span>
      </div>
      <p style={{ fontSize: "13px", color: "#555", margin: 0, maxWidth: "420px", textAlign: "right" }}>
        {explanation}
      </p>
    </div>
  );
}

export default function ClawdPanel({
  clawdRow,
  totalProjects,
  opportunityRank,
  momentumRank,
  sustainabilityRank,
  marketCapRank,
  walletsRank,
}) {
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

  function thinSeries(rawPairs, targetPoints = 30) {
    if (!rawPairs || rawPairs.length === 0) return [];
    const step = Math.max(1, Math.floor(rawPairs.length / targetPoints));
    return rawPairs
      .filter((_, i) => i % step === 0)
      .map(([ts, val]) => ({ x: formatDateShort(ts), y: val }));
  }

  const weekLabels = behavioralHistory.map((r) => formatDateShort(r["Snapshot Date"]));
  const oppData = behavioralHistory.map((r) => Number(r["Opp"]));
  const momData = behavioralHistory.map((r) => Number(r["Mom"]));
  const susData = behavioralHistory.map((r) => Number(r["Sus"]));
  const walletsData = behavioralHistory.map((r) => Number(r["Wallets 30d"]));

  const mcapThinned = thinSeries(priceHistory.market_caps);
  const priceThinned = thinSeries(priceHistory.prices);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>CLAWD — Health Check</h2>

      <ProfileSignalBanner profile={clawdRow?.["Prof"]} signal={clawdRow?.signal} read={clawdRow?.read} />

      {status === "loading" && <p style={{ color: "#666" }}>Loading history…</p>}
      {status === "error" && <p style={{ color: "#c0392b" }}>Couldn't load history: {errorMsg}</p>}
      {priceHistory.error && (
        <p style={{ fontSize: "12px", color: "#c0392b", marginBottom: "8px" }}>
          Price/market cap history failed to load: {priceHistory.error}
        </p>
      )}

      {status === "done" && (
        <>
          <SectionLabel>Behavioral</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <MetricCard
              label="Opportunity"
              sublabel="Score & trend (8w)"
              value={clawdRow?.["Opp"]}
              valueColor="#3B6D11"
              rank={opportunityRank}
              totalProjects={totalProjects}
              data={oppData}
              labels={weekLabels}
              color="#3B6D11"
            />
            <MetricCard
              label="Momentum"
              sublabel="Score & trend (8w)"
              value={clawdRow?.["Mom"]}
              valueColor="#185FA5"
              rank={momentumRank}
              totalProjects={totalProjects}
              data={momData}
              labels={weekLabels}
              color="#185FA5"
            />
            <MetricCard
              label="Sustainability"
              sublabel="Score & trend (8w)"
              value={clawdRow?.["Sus"]}
              valueColor="#854F0B"
              rank={sustainabilityRank}
              totalProjects={totalProjects}
              data={susData}
              labels={weekLabels}
              color="#854F0B"
            />
          </div>

          <SectionLabel>Market</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <MetricCard
              label="Wallets"
              sublabel="30d active, trend (8w)"
              value={clawdRow?.["Wallets 30d"]}
              valueColor="#3a6ea5"
              rank={walletsRank}
              totalProjects={totalProjects}
              data={walletsData}
              labels={weekLabels}
              color="#3a6ea5"
              formatY={(v) => Math.round(v)}
            />
            <MetricCard
              label="Market Cap"
              sublabel="USD, trend (60d)"
              value={clawdRow?.marketCapUsd != null ? formatUsd(clawdRow.marketCapUsd) : "—"}
              valueColor="#534AB7"
              rank={marketCapRank}
              totalProjects={totalProjects}
              data={mcapThinned.map((p) => p.y)}
              labels={mcapThinned.map((p) => p.x)}
              color="#534AB7"
              formatY={formatUsd}
            />
            <MetricCard
              label="Price"
              sublabel="USD, trend (60d)"
              value={clawdRow?.priceUsd != null ? formatPrice(clawdRow.priceUsd) : "—"}
              valueColor="#0F6E56"
              rank={null}
              totalProjects={totalProjects}
              data={priceThinned.map((p) => p.y)}
              labels={priceThinned.map((p) => p.x)}
              color="#0F6E56"
              formatY={formatPrice}
            />
          </div>
        </>
      )}

      <p style={{ fontSize: "12px", color: "#999", marginTop: "20px" }}>
        Behavioral history (Opp/Mom/Sus/Wallets) is a true backtest — recomputed from on-chain activity as of
        each past date, including full cohort context, not just CLAWD in isolation. Refreshed roughly weekly,
        not live. Price/Market Cap history comes from CoinGecko.
      </p>
    </div>
  );
}
