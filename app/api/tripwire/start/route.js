const TRIPWIRE_QUERY_ID = "7765068";

export async function POST() {
  try {
    const res = await fetch(
      `https://api.dune.com/api/v1/query/${TRIPWIRE_QUERY_ID}/execute`,
      {
        method: "POST",
        headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY },
      }
    );
    if (!res.ok) {
      return Response.json({ error: `Dune execute failed: ${res.status}` }, { status: 500 });
    }
    const json = await res.json();
    return Response.json({ executionId: json.execution_id });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
