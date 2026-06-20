// ============================================================
// DISCOVERY: pulls CoinGecko's curated AI category coins,
// filters for ones with a Base contract address, and excludes
// anything already in your tracked 48 (from the main Dune query).
// ============================================================

const AI_CATEGORIES = [
  "ai-agents",
  "ai-agent-launchpad",
  "ai-framework",
  "defai",
];

async function fetchCategoryCoins(categoryId) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
      {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// CoinGecko's markets endpoint doesn't return contract addresses directly,
// so for each coin we need a second call to get platform-specific addresses.
async function fetchCoinPlatforms(coinId) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
      {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.platforms?.base || null; // returns the Base contract address, or null if not on Base
  } catch {
    return null;
  }
}

export async function getDiscoveryData(trackedAddresses) {
  const trackedLower = new Set(trackedAddresses.map((a) => a.toLowerCase()));

  // Pull all 4 categories in parallel, then flatten + de-dupe by coin id
  const categoryResults = await Promise.all(AI_CATEGORIES.map(fetchCategoryCoins));
  const seen = new Map();
  categoryResults.flat().forEach((coin) => {
    if (coin && coin.id && !seen.has(coin.id)) {
      seen.set(coin.id, coin);
    }
  });
  const uniqueCoins = Array.from(seen.values());

  // For each unique coin, check if it has a Base contract address.
  // This is the expensive part — one API call per coin — so we cap
  // it to the top 50 by market cap to conserve monthly CoinGecko quota.
  const candidates = uniqueCoins.slice(0, 50);

  const withAddresses = await Promise.all(
    candidates.map(async (coin) => {
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
    })
  );

  // Keep only coins that ARE on Base AND are NOT already tracked
  const newCandidates = withAddresses
    .filter((c) => c !== null)
    .filter((c) => !trackedLower.has(c.address.toLowerCase()))
    .sort((a, b) => (b.marketCapUsd || 0) - (a.marketCapUsd || 0));

  return newCandidates;
}
