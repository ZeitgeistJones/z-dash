import { fetchCoinGeckoJSON } from "../../../lib/coingeckoFetch";

const DUNE_QUERY_ID = "7767406";
const CLAWD_ADDRESS = "0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07";

export async function GET() {
  try {
    const duneRes = await fetch(
      `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results`,
      {
        headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
        cache: "no-store",
      }
    );
    if (!duneRes.ok) {
      return Response.json({ error: `Dune API error: ${duneRes.status}` }, { status: 500 });
    }
    const duneJson = await duneRes.json();
    const behavioralHistory = duneJson.result?.rows || [];

    let priceHistory = { prices: [], market_caps: [] };
    const cgResult = await fetchCoinGeckoJSON(
      `https://api.coingecko.com/api/v3/coins/base/contract/${CLAWD_ADDRESS}/market_chart?vs_currency=usd&days=60`
    );
    if (cgResult.ok) {
      priceHistory = {
        prices: cgResult.data.prices || [],
        market_caps: cgResult.data.market_caps || [],
      };
    } else {
      priceHistory.error = `CoinGecko ${cgResult.status || "error"}`;
    }

    return Response.json({ behavioralHistory, priceHistory });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
