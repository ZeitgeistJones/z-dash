import { getDashboardData } from "@/lib/getData";
import { getDiscoveryData } from "@/lib/getDiscoveryData";
import DashboardTable from "./DashboardTable";
import ThemeToggle from "./ThemeToggle";

export const revalidate = 3600;

export default async function Home() {
  const { rows: data, lastUpdated } = await getDashboardData();
  const trackedAddresses = data.map((d) => d["Address"]).filter(Boolean);
  const discoveryData = await getDiscoveryData(trackedAddresses).catch(() => []);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "4px",
        gap: "16px",
      }}>
        <div>
          <h1 style={{ margin: 0, color: "var(--text)" }}>Tripwire</h1>
          <div style={{ marginTop: "12px", maxWidth: "720px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 600, color: "var(--text)", lineHeight: "1.6" }}>
              Tripwire is a community-built intelligence dashboard for CLAWD holders on Base. Track AI agent tokens and agent-launched tokens with on-chain behavioral scores, wallet stats, real-time pulse checks, and price signal — all in one place.
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-faint)", lineHeight: "1.65" }}>
              Access requires 10,000,000 CLAWD. Connect your wallet to unlock the full dashboard.
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-faint)", lineHeight: "1.65" }}>
              What you get: behavioral scoring across momentum, sustainability, and opportunity for every tracked token. Wallet growth, retention, buyer/seller flow, and concentration risk at a glance. The Wire — an on-demand query that shows you what's moving right now across 15m, 1h, 6h, and 24h windows. Useful the moment news breaks.
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-faint)", lineHeight: "1.65" }}>
              The scoring formulas are not scientifically backed and I'm not a financial expert — they're a community member's best attempt at making on-chain behavior readable. That said, I plan to keep improving them, offer alternative formula sets, and share research material as the site evolves.
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-faint)", lineHeight: "1.65" }}>
              Built by a community member. Not affiliated with the CLAWD project. Data sourced from Dune Analytics and CoinGecko — numbers are best-effort, not guaranteed. Do your own research.
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)", lineHeight: "1.65" }}>
              The token gate was built with help from LeftClaw researchers, who continue to inform how this site is developed. Feedback from that process shapes every update.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
      <div style={{ marginTop: "28px" }}>
        <DashboardTable data={data} discoveryData={discoveryData} lastUpdated={lastUpdated} />
      </div>
    </main>
  );
}
