import { getDashboardData } from "../lib/getData";

export const revalidate = 3600; // refresh data once per hour

export default async function Home() {
  const data = await getDashboardData();
  const sorted = [...data].sort(
    (a, b) => Number(a["O Rk"]) - Number(b["O Rk"])
  );

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>z-dash</h1>
      <p>Cohort dashboard — behavioral scores + price signal</p>
      <table style={{ borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            {["Project", "Opp", "Mom", "Sus", "Prof", "Price", "Market Cap", "Signal"].map(
              (h) => (
                <th
                  key={h}
                  style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "6px 12px" }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d["Address"]}>
              <td style={{ padding: "6px 12px" }}>{d["Project"]}</td>
              <td style={{ padding: "6px 12px" }}>{d["Opp"]}</td>
              <td style={{ padding: "6px 12px" }}>{d["Mom"]}</td>
              <td style={{ padding: "6px 12px" }}>{d["Sus"]}</td>
              <td style={{ padding: "6px 12px" }}>{d["Prof"]}</td>
              <td style={{ padding: "6px 12px" }}>
                {d.priceUsd != null ? `$${Number(d.priceUsd).toPrecision(4)}` : "—"}
              </td>
              <td style={{ padding: "6px 12px" }}>
                {d.marketCapUsd != null
                  ? `$${Number(d.marketCapUsd).toLocaleString()}`
                  : "—"}
              </td>
              <td style={{ padding: "6px 12px" }}>{d.signal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
