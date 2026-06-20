// ============================================================
// DISCOVERY: pulls CoinGecko's curated AI category coins,
// filters for ones with a Base contract address, and excludes
// anything already tracked OR already reviewed-and-rejected.
// ============================================================
const AI_CATEGORIES = [
  "ai-agents",
  "ai-agent-launchpad",
  "ai-framework",
  "defai",
];

// Reviewed and explicitly declined — not core AI agent projects.
// These aren't in the tracked list, so without this they'd keep
// resurfacing every scan. Add to this list any time you review
// and pass on a candidate, so it's permanently hidden going forward.
const REJECTED_ADDRESSES = [
  "0xa81a52b4dda010896cdd386c7fbdc5cdc835ba23", // TRAC - DePIN/data infra
  "0x5576d6ed9181f2225aff5282ac0ed29f755437ea", // SERV - not agent-focused
  "0xbcbaf311cec8a4eac0430193a528d9ff27ae38c1", // IOTX - IoT/Layer1
  "0x1f16e03c1a5908818f47f6ee7bb16690b40d0671", // RECALL - data/storage
  "0x7cea5b9548a4b48cf9551813ef9e73de916e41e0", // MIA - not agent-focused
  "0xff8104251e7761163fac3211ef5583fb3f8583d6", // REPPO - community/meme
  "0x02300ac24838570012027e0a90d3feccef3c51d2", // FOOM - not agent-focused
  "0x614577036f0a024dbc1c88ba616b394dd65d105a", // GNUS - not agent-focused
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
    return json.platforms?.base || null;
  } catch {
    return null;
  }
}

export async function getDiscoveryData(trackedAddresses) {
  try {
    const excludedLower = new Set(
      [...(trackedAddresses || []), ...REJECTED_ADDRESSES].map((a) =>
        a.toLowerCase()
      )
    );

    const categoryResults = await Promise.all(AI_CATEGORIES.map(fetchCategoryCoins));
    const seen = new Map();
    categoryResults.flat().forEach((coin) => {
      if (coin && coin.id && !seen.has(coin.id)) {
        seen.set(coin.id, coin);
      }
    });
    const uniqueCoins = Array.from(seen.values());
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

    const newCandidates = withAddresses
      .filter((c) => c !== null)
      .filter((c) => !excludedLower.has(c.address.toLowerCase()))
      .sort((a, b) => (b.marketCapUsd || 0) - (a.marketCapUsd || 0));

    return newCandidates;
  } catch {
    return [];
  }
}
