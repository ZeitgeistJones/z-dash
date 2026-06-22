// lib/getData.js
import tokens from "./tokens";

const DUNE_QUERY_ID = "7762446";

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

async function fetchCoinGeckoData(address) {
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
    return {
      priceUsd: json.market_data?.current_price?.usd ?? null,
      marketCapUsd: json.market_data?.market_cap?.usd || null,
      priceChange7d: json.market_data?.price_change_percentage_7d ?? null,
    };
  } catch {
    return null;
  }
}

// Run async tasks with a max concurrency limit
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
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

export async function getDashboardData() {
  const duneRows = await fetchDuneData();

  const duneByAddress = {};
  for (const row of duneRows) {
    const addr = row["Address"]?.toLowerCase();
    if (addr) duneByAddress[addr] = row;
  }

  // Only fetch CoinGecko for tokens that have an address, 5 at a time
  const tokensWithAddress = tokens.filter(t => t.address);
  const tokensWithout = tokens.filter(t => !t.address);

  const enrichedWithAddress = await mapWithConcurrency(tokensWithAddress, 5, async (token) => {
    const addrKey = token.address.toLowerCase();
    const duneRow = duneByAddress[addrKey];
    const cg = await fetchCoinGeckoData(token.address);
    const signal = cg
      ? getSignal(duneRow?.["Vol Grw %"] ?? null, cg.priceChange7d)
      : "No CG Data";

    return {
      Project:      duneRow?.["Project"] ?? token.name,
      Symbol:       token.symbol,
      Address:      token.address,
      Tag:          token.tag,
      "O Rk":       duneRow?.["O Rk"]      ?? null,
      "Opp":        duneRow?.["Opp"]        ?? null,
      "Mom":        duneRow?.["Mom"]        ?? null,
      "Sus":        duneRow?.["Sus"]        ?? null,
      "Prof":       duneRow?.["Prof"]       ?? null,
      "Vol Grw %":  duneRow?.["Vol Grw %"]  ?? null,
      priceUsd:     cg?.priceUsd            ?? null,
      marketCapUsd: cg?.marketCapUsd        ?? null,
      priceChange7d:cg?.priceChange7d       ?? null,
      signal,
    };
  });

  const enrichedWithout = tokensWithout.map(token => ({
    Project:      token.name,
    Symbol:       token.symbol,
    Address:      null,
    Tag:          token.tag,
    "O Rk":       null,
    "Opp":        null,
    "Mom":        null,
    "Sus":        null,
    "Prof":       null,
    "Vol Grw %":  null,
    priceUsd:     null,
    marketCapUsd: null,
    priceChange7d:null,
    signal:       "No Address",
  }));

  return { rows: [...enrichedWithAddress, ...enrichedWithout], lastUpdated: null };
}
