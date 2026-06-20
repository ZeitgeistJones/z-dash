import { fetchCoinGeckoJSON, mapWithConcurrency } from "./coingeckoFetch";

const DUNE_QUERY_ID = "7762446";

const COMBO_TERMS = {
  "Breakout|Confirmed Growth": "Beacon",
  "Breakout|Absorbed": "Undercurrent",
  "Breakout|Thin Rally": "Overshoot",
  "Breakout|Cooling": "Quiet Beacon",
  "Quick Mover|Confirmed Growth": "Flare",
  "Quick Mover|Absorbed": "Backdraft",
  "Quick Mover|Thin Rally": "Flashpoint",
  "Quick Mover|Cooling": "Afterglow",
  "Slow Burner|Confirmed Growth": "Low Hum",
  "Slow Burner|Absorbed": "Low Signal",
  "Slow Burner|Thin Rally": "Soft Ping",
  "Slow Burner|Cooling": "Standby",
  "Cold|Confirmed Growth": "Mirage",
  "Cold|Absorbed": "Bleed",
  "Cold|Thin Rally": "False Flare",
  "Cold|Cooling": "Flatline",
};

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
  return {
    rows: json.result?.rows || [],
    lastUpdated: json.execution_ended_at || null,
  };
}

async function fetchCoinGeckoData(address) {
  const result = await fetchCoinGeckoJSON(
    `https://api.coingecko.com/api/v3/coins/base/contract/${address}`
  );
  if (!result.ok) return null;
  const json = result.data;
  return {
    priceUsd: json.market_data?.current_price?.usd ?? null,
    marketCapUsd: json.market_data?.market_cap?.usd || null,
    priceChange7d: json.market_data?.price_change_percentage_7d ?? null,
  };
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

function getReadTerm(profile, signal) {
  if (!profile || !signal || signal === "No Data" || signal === "No CG Data") return null;
  return COMBO_TERMS[`${profile}|${signal}`] || null;
}

export async function getDashboardData() {
  const { rows, lastUpdated } = await fetchDuneData();

  const enriched = await mapWithConcurrency(rows, 8, async (row) => {
    const address = row["Address"];
    const cg = address ? await fetchCoinGeckoData(address) : null;

    const signal = cg
      ? getSignal(row["Vol Grw %"], cg.priceChange7d)
      : "No CG Data";

    const signalScore = cg
      ? getSignalScore(row["Vol Grw %"], cg.priceChange7d)
      : null;

    const read = getReadTerm(row["Prof"], signal);

    return {
      ...row,
      priceUsd: cg?.priceUsd ?? null,
      marketCapUsd: cg?.marketCapUsd ?? null,
      priceChange7d: cg?.priceChange7d ?? null,
      signal,
      signalScore,
      read,
    };
  });

  return { rows: enriched, lastUpdated };
}
