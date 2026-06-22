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

// Batch-fetch prices for up to 100 addresses at a time via CoinGecko's simple/token_price
async function fetchBatchPrices(addresses) {
  const lookup = {};
  // CoinGecko allows ~100 addresses per call
  const batchSize = 100;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const joined = batch.map(a => a.toLowerCase()).join(",");
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${joined}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
        {
          headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
          cache: "no-store",
        }
      );
      if (!res.ok) continue;
      const json = await res.json();
      // json shape: { "0xabc...": { usd: 1.23, usd_market_cap: 456, usd_24h_change: -2.1 } }
      for (const [addr, data] of Object.entries(json)) {
        lookup[addr.toLowerCase()] = {
          priceUsd: data.usd ?? null,
          marketCapUsd: data.usd_market_cap ?? null,
          priceChange24h: data.usd_24h_change ?? null,
        };
      }
    } catch {
      continue;
    }
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < addresses.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return lookup;
}

// Fallback: individual contract lookup for tokens not found in batch
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
  if (!prof || !signal || signal === "No Data" || signal === "No CG Data") return null;
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
  // Step 1: Fetch Dune scores
  const duneRows = await fetchDuneData();

  const duneByAddress = {};
  for (const row of duneRows) {
    const addr = row["Address"]?.toLowerCase();
    if (addr) duneByAddress[addr] = row;
  }

  // Step 2: Batch-fetch ALL token prices in 2 API calls (instead of 178)
  const allAddresses = tokens.filter(t => t.address).map(t => t.address);
  const priceLookup = await fetchBatchPrices(allAddresses);

  // Step 3: For tokens not found in batch, try individual lookup (with concurrency limit)
  const missingTokens = tokens.filter(t => t.address && !priceLookup[t.address.toLowerCase()]);
  const individualResults = await mapWithConcurrency(missingTokens, 5, async (token) => {
    const cg = await fetchCoinGeckoByContract(token.address);
    if (cg) {
      priceLookup[token.address.toLowerCase()] = cg;
    }
    return null;
  });

  // Step 4: Build enriched rows
  const tokensWithAddress = tokens.filter(t => t.address);
  const tokensWithout = tokens.filter(t => !t.address);

  const enrichedWithAddress = tokensWithAddress.map((token) => {
    const addrKey = token.address.toLowerCase();
    const duneRow = duneByAddress[addrKey];
    const cg = priceLookup[addrKey] || null;

    const priceChange = cg?.priceChange7d ?? cg?.priceChange24h ?? null;

    const signal = cg
      ? getSignal(duneRow?.["Vol Grw %"] ?? null, priceChange)
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
      priceChange7d: priceChange,
      signal,
      signalScore:   cg ? getSignalScore(duneRow?.["Vol Grw %"] ?? null, priceChange) : null,
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
