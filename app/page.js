import { getDashboardData } from "../lib/getData";
import { getDiscoveryData } from "../lib/getDiscoveryData";
import DashboardTable from "./DashboardTable";

export const revalidate = 3600;

export default async function Home() {
  const data = await getDashboardData();

  // Pull every tracked address from the main dataset so discovery
  // knows what to exclude
  const trackedAddresses = data.map((d) => d["Address"]).filter(Boolean);

  const discoveryData = await getDiscoveryData(trackedAddresses);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>z-dash</h1>
      <p>Cohort dashboard — behavioral scores + price signal. Click any column header to sort.</p>
      <DashboardTable data={data} discoveryData={discoveryData} />
    </main>
  );
}
