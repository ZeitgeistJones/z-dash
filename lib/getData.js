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
  // 1. Pull scored rows from Dune
  const duneRows = await fetchDuneData();

  // Build a lookup: lowercase address → dune row
  const duneByAddress = {};
  for (const row of duneRows) {
    const addr = row["Address"]?.toLowerCase();
    if (addr) duneByAddress[addr] = row;
  }

  // 2. Merge: for every token in the master list, use Dune scores if available,
  //    otherwise just show the token with CoinGecko data and blank scores.
  const merged = await Promise.all(
    tokens.map(async (token) => {
      const addrKey = token.address?.toLowerCase();
      const duneRow = addrKey ? duneByAddress[addrKey] : null;

      // Fetch CoinGecko data if we have an address
      const cg = token.address ? await fetchCoinGeckoData(token.address) : null;

      const signal = cg
        ? getSignal(duneRow?.["Vol Grw %"] ?? null, cg.priceChange7d)
        : "No CG Data";

      return {
        // Token identity from master list
        Project:  duneRow?.["Project"] ?? token.name,
        Symbol:   token.symbol,
        Address:  token.address ?? null,
        Tag:      token.tag,

        // Dune scores (blank if not yet scored)
        "O Rk":     duneRow?.["O Rk"]     ?? null,
        "Opp":      duneRow?.["Opp"]      ?? null,
        "Mom":      duneRow?.["Mom"]      ?? null,
        "Sus":      duneRow?.["Sus"]      ?? null,
        "Prof":     duneRow?.["Prof"]     ?? null,
        "Vol Grw %":duneRow?.["Vol Grw %"]?? null,

        // CoinGecko enrichment
        priceUsd:     cg?.priceUsd     ?? null,
        marketCapUsd: cg?.marketCapUsd ?? null,
        priceChange7d:cg?.priceChange7d?? null,
        signal,
      };
    })
  );

  return merged;
}
