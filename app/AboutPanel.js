export default function AboutPanel() {
  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ maxWidth: "800px", lineHeight: "1.7", color: "#333", flex: "1 1 500px" }}>
        <h2 style={{ marginTop: 0 }}>About z-dash</h2>
        <p>
          z-dash tracks AI agent projects on Base — combining on-chain behavior (wallets, transactions, retention)
          from Dune with live price and market cap from CoinGecko. The three core scores are deliberately
          <strong> price-independent</strong> — they measure real usage, not speculation — while Price, Market Cap,
          and Signal sit alongside them as a separate, informational layer.
        </p>

        <h3>Key Terms</h3>
        <p>
          <strong>Unique wallet</strong> — a distinct on-chain address (the <code>from</code> field in Base
          transactions) that sent at least one transaction to a token's contract. One person controlling
          multiple wallets would count as multiple.
        </p>
        <p>
          <strong>New wallet</strong> — a wallet that was active in the last 30 days but had no recorded
          activity with that token in the 31–90 day window before that. "New" means new to this token, not
          new to the blockchain.
        </p>
        <p>
          <strong>Returning wallet</strong> — a wallet that was active in both the last 30 days AND the
          31–90 day window before that. These are users who came back, not just arrived.
        </p>
        <p>
          <strong>30d vs 7d windows</strong> — most volume and wallet counts use a 30-day window for
          stability. Growth metrics (Vol Grw, Tx Grw, User Grw) compare the most recent 7 days against
          the 7 days before that (days 7–14 ago). Retention compares this week's wallets against last
          week's wallets.
        </p>
        <p>
          <strong>Wallets vs Traders</strong> — Wallets counts come from <code>base.transactions</code>
          (any on-chain interaction with the contract). Traders counts come from <code>dex.trades</code>
          (DEX buys and sells only). A wallet can transact without trading, so Wallets 30d ≥ Traders in
          most cases.
        </p>

        <h3>The Three Core Scores</h3>

        <p><strong>Momentum Score</strong> — growth-first. Weighted toward what's changing right now:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>25% New Wallet % — share of 30d wallets that are brand new</li>
          <li>25% WoW growth blend — average of Tx Grw, User Grw, and Vol Grw</li>
          <li>20% Retention — returning users as a share of this week's active wallets</li>
          <li>15% Vol/Tx — dollar value per transaction, capped at $1,000 = 100</li>
          <li>10% Vol/Wlt — dollar volume per wallet, capped at $5,000 = 100</li>
          <li>3% Top-10 concentration penalty — lower concentration scores higher</li>
          <li>2% Txs/User — average transactions per wallet, capped at 10 = 100</li>
        </ul>

        <p><strong>Sustainability Score</strong> — retention-first. Same ingredients as Momentum, reweighted to favour staying power over speed:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>10% New Wallet %</li>
          <li>15% WoW growth blend</li>
          <li>30% Retention</li>
          <li>25% Economic density — equal blend of Vol/Tx and Vol/Wlt</li>
          <li>15% Avg Txs Ret — average transactions by returning wallets this week (capped at 10 = 100). Measures how engaged loyal users are, not just whether they showed up</li>
          <li>3% Top-10 concentration penalty</li>
          <li>2% Txs/User</li>
        </ul>

        <p>
          <strong>Opportunity Score</strong> = (Momentum × 0.5 + Sustainability × 0.5) × (Qlty % ÷ 100) ×
          (1 − Risk % ÷ 100). Quality and Risk are applied as multipliers, not added on top — a token with
          50% quality loses half its behavioral score regardless of how strong Momentum and Sustainability are.
        </p>

        <h3>The Two Modifiers</h3>
        <p>
          <strong>Activity Quality %</strong> — starts at 100, then applies fixed penalties:
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>−20 if transaction growth outpaces user growth by more than 50 percentage points (bot-like signal)</li>
          <li>−20 if top-10 wallet concentration exceeds 60%</li>
          <li>−20 if retention spikes above 150%</li>
        </ul>
        <p>Penalties are independent and can stack — minimum score is 0 (all three penalties applied).</p>
        <p>
          <strong>Volume Concentration Risk %</strong> — 65% based on Vol/Wlt relative to the cohort
          maximum (higher spend per wallet = higher risk), 35% based on top-10 wallet transaction share.
          Higher = more concentrated in fewer hands.
        </p>

        <h3>Profile</h3>
        <p>Each project is split above/below the cohort median on Momentum and Sustainability:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Breakout</strong> — above median on both</li>
          <li><strong>Quick Mover</strong> — above median Momentum, below median Sustainability</li>
          <li><strong>Slow Burner</strong> — below median Momentum, above median Sustainability</li>
          <li><strong>Cold</strong> — below median on both</li>
        </ul>
        <p>Medians are recalculated on every query run, so profiles shift as the cohort moves.</p>

        <h3>Signal &amp; Signal Score</h3>
        <p>
          The only price-aware layer on the site — compares 7-day volume growth (from Dune) against
          24-hour price change (from CoinGecko):
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Confirmed Growth</strong> — volume up, price up</li>
          <li><strong>Absorbed</strong> — volume up, price flat or down</li>
          <li><strong>Thin Rally</strong> — volume down, price up</li>
          <li><strong>Cooling</strong> — volume down, price down</li>
        </ul>
        <p>
          <strong>Signal Score</strong> — (price change % × 0.6) + (volume growth % × 0.4), clipped to
          −100/+100. Price is weighted higher because it's the confirming half of the signal.
        </p>

        <h3>Column Glossary</h3>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "8px" }}>
          <tbody>
            {[
              ["O Rk / M Rk / S Rk", "Rank by Opportunity / Momentum / Sustainability score, across all tracked tokens"],
              ["Opp / Mom / Sus", "The three core behavioral scores — see scoring section above"],
              ["Prof", "Profile category — Breakout / Quick Mover / Slow Burner / Cold — based on position relative to cohort median"],
              ["Qlty %", "Activity Quality % — starts at 100, penalised for bot-like patterns, high concentration, or unrealistic retention. See modifier section above for exact thresholds"],
              ["Risk %", "Volume Concentration Risk % — how concentrated trading volume is in a few wallets. Formula: 65% Vol/Wlt relative to cohort max + 35% Top10 %"],
              ["Vol 30d", "Total DEX trading volume in USD over the last 30 days, from dex.trades on Base"],
              ["Vol/Tx", "Average dollar value per transaction over 30 days — a proxy for how serious the traders are. Capped at $1,000 = 100 in scoring"],
              ["Vol/Wlt", "Average dollar volume per unique wallet over 30 days. Capped at $5,000 = 100 in scoring"],
              ["Vol Grw %", "Week-over-week DEX volume change: most recent 7 days vs the 7 days before that"],
              ["Tx Grw %", "Week-over-week transaction count change: most recent 7 days vs the 7 days before that"],
              ["User Grw %", "Week-over-week unique wallet count change: most recent 7 days vs the 7 days before that"],
              ["Txs 30d / 7d", "Total on-chain transaction count to this token's contract, 30-day and 7-day windows"],
              ["Txs/User", "Average transactions per unique wallet over 30 days. Capped at 10 = 100 in scoring"],
              ["Wallets 30d / 7d", "Unique wallet addresses that sent at least one transaction to this token's contract in the window. Includes all on-chain activity, not just DEX trades"],
              ["New Wallets", "Wallets active in the last 30 days with no recorded activity in the 31–90 day window before that — new to this token, not necessarily new to Base"],
              ["Returning Wallets", "Wallets active in both the last 30 days AND the 31–90 day window before that — users who came back"],
              ["New Wallet %", "New Wallets ÷ total Wallets 30d. High % means lots of new arrivals; low % means mostly returning users"],
              ["Retention %", "Wallets retained from last week ÷ this week's active wallets. Over 100% is not possible by this formula — it would mean more retained wallets than current users, which flags as unrealistic and triggers a Quality penalty"],
              ["Avg Txs Ret", "Average transaction count for wallets that were active both this week and last week — measures how engaged the loyal users are, not just whether they returned"],
              ["Traders", "Unique wallet addresses that executed a DEX buy or sell in the last 30 days, from dex.trades. Different from Wallets 30d which counts all contract interactions"],
              ["Buyers 30d / 7d", "Unique wallets that bought this token on a DEX in the 30-day and 7-day windows"],
              ["1st Buyers 30d / 7d", "Wallets buying this token for the very first time in the window — their all-time first buy, not just first in the window"],
              ["1st Sellers 30d / 7d", "Wallets selling this token for the very first time in the window — their all-time first sell"],
              ["Buy/Sell Ratio", "Buyers 7d ÷ Sellers 7d (all unique sellers this week, not just first-timers). Above 1.0 means more buying wallets than selling wallets this week"],
              ["Non-Trade New 30d", "New wallets in the last 30 days that made no first buy or sell — likely arrived via airdrop or transfer. Formula: New Wallets − 1st Buyers 30d − 1st Sellers 30d, floored at 0"],
              ["Top10 %", "Share of all 30-day transactions from the top 10 most active wallets. Lower is healthier — high concentration is penalised in Quality and Risk"],
              ["Age (days)", "Days since this token's contract was first deployed on Base, hardcoded from on-chain data"],
              ["Price / Market Cap", "Live from CoinGecko, matched by contract address. Refreshes roughly hourly"],
            ].map(([term, def]) => (
              <tr key={term}>
                <td style={{ padding: "6px 12px", borderBottom: "1px solid #eee", fontWeight: 600, whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {term}
                </td>
                <td style={{ padding: "6px 12px", borderBottom: "1px solid #eee", color: "#555" }}>{def}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Tabs</h3>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Overview</strong> — scores, profile, price, and signal at a glance</li>
          <li><strong>Activity</strong> — volume and transaction detail</li>
          <li><strong>Wallets</strong> — wallet counts, growth, and retention</li>
          <li><strong>Buyers &amp; Risk</strong> — buyer/seller detail, concentration, and quality flags</li>
          <li><strong>Discover</strong> — new AI-category candidates from CoinGecko not yet tracked</li>
          <li><strong>CLAWD</strong> — deep health check for CLAWD including 8-week behavioral history and market trends</li>
          <li><strong>The Wire</strong> — on-demand pulse check across all 178 tracked tokens, returning 15m/1h/6h/24h activity windows. Runs a fresh Dune query each time</li>
        </ul>

        <h3 style={{ marginTop: "32px" }}>Thanks</h3>
        <p>
          To the CLAWD community, to clawdbotatg, and to Austin — for lighting the builder fire that turned into
          this. Appreciate it.
        </p>

        <p style={{ fontSize: "13px", color: "#888", marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
          Built by a community member. Not affiliated with CLAWD. Verify on Basescan. Do your own research.
        </p>
      </div>

      <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center", paddingTop: "8px" }}>
        <img
          src="/clawd-pfp.png"
          alt="CLAWD mascot"
          style={{
            width: "1152px",
            maxWidth: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}
