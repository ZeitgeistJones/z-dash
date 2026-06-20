import DashboardTable from "../DashboardTable";

const mock = [
  { Address: "0x1", Project: "Aether", Opp: 82.4, Mom: 71, Sus: 64, Prof: "Breakout", priceUsd: 0.0231, marketCapUsd: 14200000, signal: "Confirmed Growth", signalScore: 41, "Vol 30d": 8200000, "Txs 30d": 41200, "Wallets 30d": 9100, "Retention %": 62, Traders: 3100, "Risk %": 18, "Qlty %": 88 },
  { Address: "0x2", Project: "Nimbus", Opp: 74.1, Mom: 80, Sus: 41, Prof: "Quick Mover", priceUsd: 1.84, marketCapUsd: 92000000, signal: "Thin Rally", signalScore: 22, "Vol 30d": 23100000, "Txs 30d": 88000, "Wallets 30d": 15400, "Retention %": 38, Traders: 6200, "Risk %": 44, "Qlty %": 61 },
  { Address: "0x3", Project: "Cobalt", Opp: 69.8, Mom: 44, Sus: 77, Prof: "Slow Burner", priceUsd: 0.412, marketCapUsd: 31000000, signal: "Absorbed", signalScore: -8, "Vol 30d": 4100000, "Txs 30d": 22000, "Wallets 30d": 5300, "Retention %": 71, Traders: 1800, "Risk %": 12, "Qlty %": 92 },
  { Address: "0x4", Project: "Drift", Opp: 38.2, Mom: 29, Sus: 33, Prof: "Cold", priceUsd: 0.0009, marketCapUsd: 2100000, signal: "Cooling", signalScore: -37, "Vol 30d": 410000, "Txs 30d": 3100, "Wallets 30d": 880, "Retention %": 24, Traders: 410, "Risk %": 61, "Qlty %": 47 },
];

const discovery = [
  { address: "0xa", name: "Volta", symbol: "VLT", marketCapUsd: 5400000, priceUsd: 0.067 },
  { address: "0xb", name: "Quark", symbol: "QRK", marketCapUsd: 12800000, priceUsd: 0.31 },
];

export default function StyleCheck() {
  return (
    <main className="page">
      <header className="page-head">
        <h1 className="page-title">
          <span className="dot" aria-hidden="true" />
          z-dash
        </h1>
        <p className="page-subtitle">Style check preview</p>
      </header>
      <DashboardTable data={mock} discoveryData={discovery} lastUpdated={new Date().toISOString()} />
    </main>
  );
}
