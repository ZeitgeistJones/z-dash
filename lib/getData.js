async function fetchCoinGeckoPrices(addresses) {
  const lookup = {};
  const batchSize = 100;

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize).map((a) => a.toLowerCase());
    const joined = batch.join(",");

    const url =
      `https://api.coingecko.com/api/v3/onchain/simple/networks/base/token_price/${joined}` +
      `?include_market_cap=true&include_24hr_vol=true&include_24hr_price_change=true&include_inactive_source=true&` +
      `x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;

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
