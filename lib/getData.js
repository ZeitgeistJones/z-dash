// lib/getData.js
import tokens from "./tokens";

const DUNE_QUERY_ID = "7762446";

const AI_CATEGORIES = [
  "ai-agents",
  "ai-agent-launchpad",
  "ai-framework",
  "defai",
  "clanker-ecosystem",
  "virtuals-protocol-ecosystem",
  "ai-applications",
  "base-ecosystem",
];

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

// Step 1: Bulk-fetch prices from CoinGecko category lists (covers most tokens)
async function buildCategoryPriceLookup() {
  const lookup = {}; // lowercase address -> { priceUsd, marketCapUsd, priceChange7d }

  for (const cat of AI_CATEGORIES) {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${cat}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=7d`,
        {
          headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
          cache: "no-store",
        }
      );
      if (!res.ok) continue;
      const coins = await res.json();
      if (!Array.isArray(coins)) continue;

      // Category list doesn't include addresses, so we need to fetch each coin's platforms
      // BUT that's too many calls. Instead, store by CoinGecko ID and we'll match later.
      for (const coin of coins) {
        // Store by id for now — we'll resolve addresses in a second pass
        if (coin.id && !lookup[`id:${coin.id}`]) {
          lookup[`id:${coin.id}`] = {
            cgId: coin.id,
            name: coin.name,
            symbol: coin.symbol?.toUpperCase(),
            priceUsd: coin.current_price ?? null,
            marketCapUsd: coin.market_cap ?? null,
            priceChange7d: coin.price_change_percentage_7d_in_currency ?? coin.price_change_percentage_24h ?? null,
          };
        }
      }
    } catch {
      continue;
    }
  }

  return lookup;
}

// Step 2: For tokens not found via category, try individual contract lookup
async function fetchCoinGeckoByContract(address) {
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

// Match tokens to category data by symbol (since category list doesn't have addresses)
function findInCategoryLookup(token, lookup) {
  const sym = token.symbol?.toUpperCase();
  if (!sym) return null;
  for (const key of Object.keys(lookup)) {
    if (key.startsWith("id:") && lookup[key].symbol === sym) {
      return lookup[key];
    }
  }
  // Also try matching by name
  const nameLower = token.name?.toLowerCase();
  if (!nameLower) return null;
  for (const key of Object.keys(lookup)) {
    if (key.startsWith("id:") && lookup[key].name?.toLowerCase() === nameLower) {
      return lookup[key];
    }
  }
  return null;
}

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

function getSignalScore(volumeChangePct, priceChangePct) {
  if (volumeChangePct == null || priceChangePct == null) return null;
  const clip = (v) => Math.max(-100, Math.min(100, v));
  return Math.round((clip(priceChangePct) * 0.6 + clip(volumeChangePct) * 0.4) * 10) / 10;
}

function getRead(prof, signal) {
  if (!prof || !signal) return null;
  const map = {
    "Breakout": {
      "Confirmed Growth": "Beacon",
      "Absorbed":         "Undercurrent",
      "Thin Rally":       "Overshoot",
      "Cooling":          "Quiet Beacon",
    },
    "Quick Mover": {
      "Confirmed Growth": "Flare",
      "Absorbed":         "Backdraft",
      "Thin Rally":       "Flashpoint",
      "Cooling":          "Afterglow",
    },
    "Slow Burner": {
      "Confirmed Growth": "Low Hum",
      "Absorbed":         "Low Signal",
      "Thin Rally":       "Soft Ping",
      "Cooling":          "Standby",
    },
    "Cold": {
      "Confirmed Growth": "Mirage",
      "Absorbed":         "Bleed",
      "Thin Rally":       "False Flare",
      "Cooling":          "Flatline",
    },
  };
  return map[prof]?.[signal] ?? null;
}

export async function getDashboardData() {
  // Fetch Dune scores and category price data in parallel
  const [duneRows, categoryLookup] = await Promise.all([
    fetchDuneData(),
    buildCategoryPriceLookup(),
  ]);

  const duneByAddress = {};
  for (const row of duneRows) {
    const addr = row["Address"]?.toLowerCase();
    if (addr) duneByAddress[addr] = row;
  }

  const tokensWithAddress = tokens.filter(t => t.address);
  const tokensWithout = tokens.filter(t => !t.address);

  const enrichedWithAddress = await mapWithConcurrency(tokensWithAddress, 5, async (token) => {
    const addrKey = token.address.toLowerCase();
    const duneRow = duneByAddress[addrKey];

    // Try category lookup first (free, already fetched), then contract lookup as fallback
    let cg = findInCategoryLookup(token, categoryLookup);
    if (!cg) {
      cg = await fetchCoinGeckoByContract(token.address);
    }

    const signal = cg
      ? getSignal(duneRow?.["Vol Grw %"] ?? null, cg.priceChange7d)
      : "No CG Data";

    const prof = duneRow?.["Prof"] ?? null;
    const read = getRead(prof, signal);

    return {
      Project:       duneRow?.["Project"] ?? token.name,
      Symbol:        token.symbol,
      Address:       token.address,
      Tag:           token.tag,
      "O Rk":        duneRow?.["O Rk"]      ?? null,
      "Opp":         duneRow?.["Opp"]        ?? null,
      "M Rk":        duneRow?.["M Rk"]       ?? null,
      "Mom":         duneRow?.["Mom"]         ?? null,
      "S Rk":        duneRow?.["S Rk"]       ?? null,
      "Sus":         duneRow?.["Sus"]         ?? null,
      "Prof":        prof,
      "Qlty %":      duneRow?.["Qlty %"]      ?? null,
      "Vol 30d":     duneRow?.["Vol 30d"]     ?? null,
      "Vol/Tx":      duneRow?.["Vol/Tx"]      ?? null,
      "Vol/Wlt":     duneRow?.["Vol/Wlt"]     ?? null,
      "Vol Grw %":   duneRow?.["Vol Grw %"]   ?? null,
      "Txs 30d":     duneRow?.["Txs 30d"]     ?? null,
      "Txs 7d":      duneRow?.["Txs 7d"]      ?? null,
      "Tx Grw %":    duneRow?.["Tx Grw %"]    ?? null,
      "Txs/User":    duneRow?.["Txs/User"]    ?? null,
      "Wallets 30d": duneRow?.["Wallets 30d"] ?? null,
      "Wallets 7d":  duneRow?.["Wallets 7d"]  ?? null,
      "User Grw %":  duneRow?.["User Grw %"]  ?? null,
      "New 30d":     duneRow?.["New 30d"]     ?? null,
      "Return 30d":  duneRow?.["Return 30d"]  ?? null,
      "New %":       duneRow?.["New %"]       ?? null,
      "Retention %": duneRow?.["Retention %"] ?? null,
      "Avg Txs Ret": duneRow?.["Avg Txs Ret"] ?? null,
      "Traders":     duneRow?.["Traders"]     ?? null,
      "Buyers 30d":  duneRow?.["Buyers 30d"]  ?? null,
      "Buyers 7d":   duneRow?.["Buyers 7d"]   ?? null,
      "1st Buyers 30d":  duneRow?.["1st Buyers 30d"]  ?? null,
      "1st Buyers 7d":   duneRow?.["1st Buyers 7d"]   ?? null,
      "1st Sellers 30d": duneRow?.["1st Sellers 30d"] ?? null,
      "1st Sellers 7d":  duneRow?.["1st Sellers 7d"]  ?? null,
      "Non-Trade New 30d": duneRow?.["Non-Trade New 30d"] ?? null,
      "Top10 %":     duneRow?.["Top10 %"]     ?? null,
      "Risk %":      duneRow?.["Risk %"]      ?? null,
      priceUsd:      cg?.priceUsd             ?? null,
      marketCapUsd:  cg?.marketCapUsd         ?? null,
      priceChange7d: cg?.priceChange7d        ?? null,
      signal,
      signalScore: cg ? getSignalScore(duneRow?.["Vol Grw %"] ?? null, cg.priceChange7d) : null,
      read,
    };
  });

  const enrichedWithout = tokensWithout.map(token => ({
    Project:       token.name,
    Symbol:        token.symbol,
    Address:       null,
    Tag:           token.tag,
    "O Rk":        null,
    "Opp":         null,
    "M Rk":        null,
    "Mom":         null,
    "S Rk":        null,
    "Sus":         null,
    "Prof":        null,
    "Qlty %":      null,
    "Vol 30d":     null,
    "Vol/Tx":      null,
    "Vol/Wlt":     null,
    "Vol Grw %":   null,
    "Txs 30d":     null,
    "Txs 7d":      null,
    "Tx Grw %":    null,
    "Txs/User":    null,
    "Wallets 30d": null,
    "Wallets 7d":  null,
    "User Grw %":  null,
    "New 30d":     null,
    "Return 30d":  null,
    "New %":       null,
    "Retention %": null,
    "Avg Txs Ret": null,
    "Traders":     null,
    "Buyers 30d":  null,
    "Buyers 7d":   null,
    "1st Buyers 30d":  null,
    "1st Buyers 7d":   null,
    "1st Sellers 30d": null,
    "1st Sellers 7d":  null,
    "Non-Trade New 30d": null,
    "Top10 %":     null,
    "Risk %":      null,
    priceUsd:      null,
    marketCapUsd:  null,
    priceChange7d: null,
    signal:        "No Address",
    signalScore:   null,
    read:          null,
  }));

  return { rows: [...enrichedWithAddress, ...enrichedWithout], lastUpdated: null };
}
