// Shared CoinGecko fetch helper: retries once on 429 (rate limit),
// and a concurrency-limited batch runner so we never fire 50+ requests
// all at once and trip CoinGecko's burst limit.

export async function fetchCoinGeckoJSON(url, { retries = 2, retryDelayMs = 1500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY },
        cache: "no-store",
      });
      if (res.status === 429) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
          continue;
        }
        return { ok: false, status: 429, data: null };
      }
      if (!res.ok) {
        return { ok: false, status: res.status, data: null };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
      return { ok: false, status: 0, data: null, error: String(err) };
    }
  }
  return { ok: false, status: 0, data: null };
}

// Runs async tasks with a max concurrency instead of firing all at once.
export async function mapWithConcurrency(items, limit, asyncFn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await asyncFn(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
