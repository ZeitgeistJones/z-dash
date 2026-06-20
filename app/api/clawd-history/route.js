const CLAWD_HISTORY_QUERY_ID = "7767406";
const CLAWD_ADDRESS = "0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07";

async function fetchBehavioralHistory() {
  const res = await fetch(
    `https://api.dune.com/api/v1/query/${CLAWD_HISTORY_QUERY_ID}/results`,
    {
      headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Dune API error: ${res.status}`);
  const json = await res.json();
  return json.result?.rows || [];
}

async function fetchPriceHistory() {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/base/contract/${CLAWD_ADDRESS}/market_chart/?vs_currency=usd&days=60`,
      {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
        cache: "no-store",
      }
    );
    if (!res.ok) return { prices: [], market_caps: [] };
    const json = await res.json();
    return {
      prices: json.prices || [],
      market_caps: json.market_caps || [],
    };
  } catch {
    return { prices: [], market_caps: [] };
  }
}

export async function GET() {
  try {
    const [behavioralHistory, priceHistory] = await Promise.all([
      fetchBehavioralHistory(),
      fetchPriceHistory(),
    ]);
    return Response.json({ behavioralHistory, priceHistory });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
