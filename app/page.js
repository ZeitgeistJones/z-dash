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
          <h1 style={{ margin: 0, color: "var(--text)" }}>z-dash</h1>
          <p style={{ marginTop: "6px", marginBottom: 0, color: "var(--text-muted)", fontSize: "14px" }}>
            Cohort dashboard — behavioral scores + price signal. Click any column header to sort.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <div style={{ marginTop: "20px" }}>
        <DashboardTable data={data} discoveryData={discoveryData} lastUpdated={lastUpdated} />
      </div>
    </main>
  );
}
