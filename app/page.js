import { getDashboardData } from "../lib/getData";
import { getDiscoveryData } from "../lib/getDiscoveryData";
import DashboardTable from "./DashboardTable";

export const revalidate = 3600;

export default async function Home() {
  const { rows: data, lastUpdated } = await getDashboardData();
  const trackedAddresses = data.map((d) => d["Address"]).filter(Boolean);
  const discoveryData = await getDiscoveryData(trackedAddresses).catch(() => []);

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="page-title">
          <span className="dot" aria-hidden="true" />
          z-dash
        </h1>
        <p className="page-subtitle">
          Cohort dashboard — behavioral scores + price signal. Click any column header to sort.
        </p>
      </header>
      <DashboardTable data={data} discoveryData={discoveryData} lastUpdated={lastUpdated} />
    </main>
  );
}
