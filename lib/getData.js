import tokens from "./tokens";
import { fetchCoinGeckoJSON } from "./fetchData.js";

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

async function fetchCoinGeckoPrices(addresses) {
  const lookup = {};
  const batchSize = 100;

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize).map((a) => a.toLowerCase());
    const joined = batch.join(",");

    const url =
      `https://api.coingecko.com/api/v3/onchain/simple/networks/base/token_price/${joined}` +
      `?include_market_cap=true&include_24hr_vol=true&include_24hr_price_change=true&include_inactive_source=true`;

    const res = await fetchCoinGeckoJSON(url, { retries: 2 });
    const attrs = res?.data?.data?.attributes;

    const prices = attrs?.token_prices || {};
    const mcap = attrs?.market_cap_usd || {};
    const vol = attrs?.h24_volume_usd || {};
    const chg = attrs?.h24_price_change_percentage || {};

    for (const addr of batch) {
      lookup[addr] = {
        priceUsd: prices[addr] != null ? parseFloat(prices[addr]) : null,
        marketCapUsd: mcap[addr] != null ? parseFloat(mcap[addr]) : null,
        volume24h: vol[addr] != null ? parseFloat(vol[addr]) : null,
        priceChange24h: chg[addr] != null ? parseFloat(chg[addr]) : null,
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
    const signal = cg
      ? getSignal(duneRow?.["Vol Grw %"] ?? null, priceChange)
      : "No Data";

    const prof = duneRow?.["Prof"] ?? null;
    const read = getRead(prof, signal);

    return {
      Project: duneRow?.["Project"] ?? token.name,
      Symbol: token.symbol,
      Address: token.address,
      Tag: token.tag,
      "O Rk": duneRow?.["O Rk"] ?? null,
      Opp: duneRow?.["Opp"] ?? null,
      "M Rk": duneRow?.["M Rk"] ?? null,
      Mom: duneRow?.["Mom"] ?? null,
      "S Rk": duneRow?.["S Rk"] ?? null,
      Sus: duneRow?.["Sus"] ?? null,
      Prof: prof,
      "Qlty %": duneRow?.["Qlty %"] ?? null,
      "Vol 30d": duneRow?.["Vol 30d"] ?? null,
      "Vol/Tx": duneRow?.["Vol/Tx"] ?? null,
      "Vol/Wlt": duneRow?.["Vol/Wlt"] ?? null,
      "Vol Grw %": duneRow?.["Vol Grw %"] ?? null,
      "Txs 30d": duneRow?.["Txs 30d"] ?? null,
      "Txs 7d": duneRow?.["Txs 7d"] ?? null,
      "Tx Grw %": duneRow?.["Tx Grw %"] ?? null,
      "Txs/User": duneRow?.["Txs/User"] ?? null,
      "Wallets 30d": duneRow?.["Wallets 30d"] ?? null,
      "Wallets 7d": duneRow?.["Wallets 7d"] ?? null,
      "User Grw %": duneRow?.["User Grw %"] ?? null,
      "New 30d": duneRow?.["New 30d"] ?? null,
      "Return 30d": duneRow?.["Return 30d"] ?? null,
      "New %": duneRow?.["New %"] ?? null,
      "Retention %": duneRow?.["Retention %"] ?? null,
      "Avg Txs Ret": duneRow?.["Avg Txs Ret"] ?? null,
      Traders: duneRow?.["Traders"] ?? null,
      "Buyers 30d": duneRow?.["Buyers 30d"] ?? null,
      "Buyers 7d": duneRow?.["Buyers 7d"] ?? null,
      "1st Buyers 30d": duneRow?.["1st Buyers 30d"] ?? null,
      "1st Buyers 7d": duneRow?.["1st Buyers 7d"] ?? null,
      "1st Sellers 30d": duneRow?.["1st Sellers 30d"] ?? null,
      "1st Sellers 7d": duneRow?.["1st Sellers 7d"] ?? null,
      "Non-Trade New 30d": duneRow?.["Non-Trade New 30d"] ?? null,
      "Top10 %": duneRow?.["Top10 %"] ?? null,
      "Risk %": duneRow?.["Risk %"] ?? null,
      priceUsd: cg?.priceUsd ?? null,
      marketCapUsd: cg?.marketCapUsd ?? null,
      priceChange7d: priceChange,
      signal,
      signalScore: cg ? getSignalScore(duneRow?.["Vol Grw %"] ?? null, priceChange) : null,
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
    "New 30d": null,
    "Return 30d": null,
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
