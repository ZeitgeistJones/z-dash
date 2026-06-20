import { getDashboardData } from "../lib/getData";
import DashboardTable from "./DashboardTable";

export const revalidate = 3600;

export default async function Home() {
  const data = await getDashboardData();

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>z-dash</h1>
      <p>Cohort dashboard — behavioral scores + price signal. Click any column header to sort.</p>
      <DashboardTable data={data} />
    </main>
  );
}
