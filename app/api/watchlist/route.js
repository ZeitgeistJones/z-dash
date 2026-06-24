import { kv } from '@vercel/kv';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet')?.toLowerCase();
  if (!wallet) return Response.json({ error: 'Missing wallet' }, { status: 400 });

  try {
    const data = await kv.get(`watchlist:${wallet}`);
    return Response.json(data || { watchlist: [], columns: null, columnOrder: null });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { wallet, watchlist, columns, columnOrder } = body;
    if (!wallet) return Response.json({ error: 'Missing wallet' }, { status: 400 });

    const key = `watchlist:${wallet.toLowerCase()}`;
    const existing = await kv.get(key) || {};
    const updated = {
      watchlist: watchlist ?? existing.watchlist ?? [],
      columns: columns ?? existing.columns ?? null,
      columnOrder: columnOrder ?? existing.columnOrder ?? null,
    };
    await kv.set(key, updated);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
