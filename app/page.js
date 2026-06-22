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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
        <h1 style={{ margin: 0 }}>z-dash</h1>
        <ThemeToggle />
      </div>
      <p style={{ marginTop: "8px", color: "var(--text-muted)" }}>
        Cohort dashboard — behavioral scores + price signal. Click any column header to sort.
      </p>
      <DashboardTable data={data} discoveryData={discoveryData} lastUpdated={lastUpdated} />
    </main>
  );
}
