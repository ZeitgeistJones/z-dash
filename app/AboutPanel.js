export default function AboutPanel() {
  return (
    <div className="about">
      <h2>About z-dash</h2>
      <p>
        z-dash tracks AI agent projects on Base — combining on-chain behavior (wallets, transactions, retention)
        from Dune with live price and market cap from CoinGecko. The three core scores are deliberately
        <strong> price-independent</strong> — they measure real usage, not speculation — while Price, Market Cap,
        and Signal sit alongside them as a separate, informational layer.
      </p>

      <h3>The Three Core Scores</h3>

      <p><strong>Momentum Score</strong> — growth-first. Weighted toward what's changing right now:</p>
      <ul style={{ paddingLeft: "20px" }}>
        <li>25% New wallet acquisition</li>
        <li>25% Week-over-week growth (blend of tx/user/volume growth)</li>
        <li>20% Retention rate</li>
        <li>15% Economic density (volume per tx + volume per wallet)</li>
        <li>10% Wallet engagement trend</li>
        <li>3% Top-10 wallet concentration (penalty — less concentration scores higher)</li>
        <li>2% Transactions per user</li>
      </ul>

      <p><strong>Sustainability Score</strong> — retention-first. Same seven ingredients as Momentum, reweighted to favor staying power over speed:</p>
      <ul style={{ paddingLeft: "20px" }}>
        <li>10% New wallet acquisition</li>
        <li>15% Week-over-week growth</li>
        <li>30% Retention rate</li>
        <li>25% Economic density</li>
        <li>15% Wallet engagement trend</li>
        <li>3% Top-10 concentration penalty</li>
        <li>2% Transactions per user</li>
      </ul>

      <p>
        <strong>Opportunity Score</strong> = (Momentum × 0.5 + Sustainability × 0.5) × (Quality % ÷ 100) ×
        (1 − Risk % ÷ 100). A behavioral blend of the two scores above, with a quality/risk haircut applied —
        not a financial metric, no price involved anywhere in the math.
      </p>

      <h3>The Two Modifiers</h3>
      <p>
        <strong>Activity Quality %</strong> — starts at 100, then subtracts penalties for: transaction growth
        outpacing user growth (bot-like signal), high top-10 wallet concentration, and retention spiking
        unrealistically above 150%.
      </p>
      <p>
        <strong>Volume Concentration Risk %</strong> — 65% based on volume-per-trader relative to the cohort's
        highest, 35% based on top-10 wallet transaction share. Higher = more concentrated in a few hands.
      </p>

      <h3>Profile</h3>
      <p>Each project is split above/below the cohort median on Momentum and Sustainability:</p>
      <ul style={{ paddingLeft: "20px" }}>
        <li><strong>Breakout</strong> — above median on both</li>
        <li><strong>Quick Mover</strong> — above median Momentum, below median Sustainability</li>
        <li><strong>Slow Burner</strong> — below median Momentum, above median Sustainability</li>
        <li><strong>Cold</strong> — below median on both</li>
      </ul>

      <h3>Signal &amp; Signal Score</h3>
      <p>
        The only price-aware layer on the site — compares 7-day volume growth (from Dune) against 7-day price
        change (from CoinGecko):
      </p>
      <ul style={{ paddingLeft: "20px" }}>
        <li><strong>Confirmed Growth</strong> — volume up, price up</li>
        <li><strong>Absorbed</strong> — volume up, price flat or down</li>
        <li><strong>Thin Rally</strong> — volume down, price up</li>
        <li><strong>Cooling</strong> — volume down, price down</li>
      </ul>
      <p>
        <strong>Signal Score</strong> — a single number version: (price change % × 0.6) + (volume growth % × 0.4),
        clipped to −100/+100. Price weighted higher since it's the "confirming" half.
      </p>

      <h3>Column Glossary</h3>
      <table className="glossary">
        <tbody>
          {[
            ["O Rk / M Rk / S Rk", "Rank by Opportunity / Momentum / Sustainability"],
            ["Opp / Mom / Sus", "The three core scores"],
            ["Prof", "Profile category — Breakout / Quick Mover / Slow Burner / Cold"],
            ["Qlty %", "Activity Quality % — the behavioral-health modifier"],
            ["Risk %", "Volume Concentration Risk % — the concentration modifier"],
            ["Vol 30d", "DEX trading volume, last 30 days, USD"],
            ["Vol/Tx, Vol/Wlt", "Volume per transaction / per wallet — economic density"],
            ["Vol Grw % / Tx Grw % / User Grw %", "Week-over-week growth, volume / transactions / users"],
            ["Txs 30d / 7d", "Transaction counts"],
            ["Txs/User", "Average transactions per user, 30d"],
            ["Wallets 30d / 7d", "Unique wallet counts"],
            ["New 30d / Return 30d", "New vs. returning wallets, 30d"],
            ["New %", "Share of wallets that are new, 30d"],
            ["Retention %", "This week's users ÷ last week's users"],
            ["Avg Txs Ret", "Average transactions by returning wallets, 7d"],
            ["Traders", "Unique DEX traders, 30d"],
            ["Buyers / 1st Buyers / 1st Sellers", "Unique buyers, and first-ever buyers/sellers in the window"],
            ["Non-Trade New 30d", "New wallets that arrived without a first buy or sell — e.g. airdrop, transfer"],
            ["Top10 %", "Share of transactions from the top 10 wallets"],
            ["Price / Market Cap", "Live from CoinGecko, matched by contract address"],
          ].map(([term, def]) => (
            <tr key={term}>
              <td className="term">{term}</td>
              <td className="def">{def}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Tabs</h3>
      <ul style={{ paddingLeft: "20px" }}>
        <li><strong>Overview</strong> — scores, profile, price, signal at a glance</li>
        <li><strong>Activity</strong> — volume and transaction detail</li>
        <li><strong>Wallets</strong> — wallet counts, growth, retention</li>
        <li><strong>Buyers &amp; Risk</strong> — buyer/seller detail, concentration, quality flags</li>
        <li><strong>Discover</strong> — new AI-category candidates from CoinGecko not yet tracked</li>
        <li><strong>Tripwire</strong> — on-demand 15m/1h/6h/24h pulse check, for right after news breaks</li>
      </ul>

      <h3 style={{ marginTop: "32px" }}>Thanks</h3>
      <p>
        To the CLAWD community, to clawdbotatg, and to Austin — for lighting the builder fire that turned into
        this. Appreciate it.
      </p>
    </div>
  );
}
