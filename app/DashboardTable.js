WITH agentic_contracts AS (
    SELECT address, name FROM (
        VALUES
        (0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b, 'Virtuals Protocol'),
        (0x96419929d7949d6a801a6909c145c8eef6a40431, 'Spectral'),
        (0x1bc0c42215582d5a085795f4badbac3ff36d1bcb, 'Clanker'),
        (0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf, 'Venice'),
        (0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825, 'AIXBT'),
        (0xC44141a684f6AA4E36cD9264ab55550B03C88643, 'Ethy AI'),
        (0x58Db197E91Bc8Cf1587F75850683e4bd0730e6BF, 'Axelrod'),
        (0x1b4617734c43f6159f3a70b7e06d883647512778, 'AWE'),
        (0xb33Ff54b9F7242EF1593d2C9Bcd8f9df46c77935, 'FAI'),
        (0x731814e491571a2e9ee3c5b1f7f3b962ee8f4870, 'VADER'),
        (0x9f86db9fc6f7c9408e8fda3ff8ce4e78ac7a6b07, 'CLAWD'),
        (0x22af33fe49fd1fa80c7149773dde5890d3c76f3b, 'Bankr'),
        (0xA4A2E2ca3fBfE21aed83471D28b6f65A233C6e00, 'Ribbita'),
        (0x55cd6469f597452b5a7536e2cd98fde4c1247ee4, 'LUNA (Virtuals)'),
        (0xbdf317f9c153246c429f23f4093087164b145390, 'AI Agent Layer'),
        (0x5f980dcfc4c0fa3911554cf5ab288ed0eb13dba3, 'Gitlawb'),
        (0xc52aedec3374422d7510e294cfaa90799595cba3, 'Surplus Intelligence'),
        (0x50d2280441372486beecdd328c1854743ebacb07, 'KellyClaude'),
        (0xa1f72459dfa10bad200ac160ecd78c6b77a747be, 'Clawnch'),
        (0xf30bf00edd0c22db54c9274b90d2a4c21fc09b07, 'FELIX'),
        (0xBf8E8f0e8866a7052F948C16508644347c57aba3, 'aeon'),
        (0xb233bdffd437e60fa451f62c6c09d3804d285ba3, 'nookplot'),
        (0x16332535E2c27da578bC2e82bEb09Ce9d3C8EB07, 'ClawBank'),
        (0xa601877977340862ca67f816eb079958e5bd0ba3, 'BOTCOIN'),
        (0xB695559b26BB2c9703ef1935c37AeaE9526bab07, 'Moltbook'),
        (0x4e6c9f48f73e54ee5f3ab7e2992b2d733d0d0b07, 'Juno Agent'),
        (0x461d3c96d170e551611f54fa466d3d74a680aba3, 'Root Edge'),
        (0x65021a79aeef22b17cdc1b768f5e79a8618beba3, 'Robot Money'),
        (0x07E61D8a4e197dfC269e90D7ECe1dF0D26702bA3, 'Basemate'),
        (0xf1e9baa65d418a9025e1851dd2d37f1ad208bba3, 'Ratspeak'),
        (0x67a7ca081dc79b45fd1fa059cd3b8dcca779aba3, 'FreeCode'),
        (0x7afe438411ee3959c7de6f7fb76bf9c769320ba3, 'Blocktronics'),
        (0x61ca70b867a48265e553a7fbb81bfe44fada7ae6, 'AI Rig Complex'),
        (0xcc4adb618253ed0d4d8a188fb901d70c54735e03, 'Agent Zero'),
        (0x26E6e2E7a9289B6485c53Cd498dE510d3a8c8ba3, 'cyb3rwr3n'),
        (0x00cb1fbca324d51325a7264d54072bc073c28ba3, 'DARKSOL'),
        (0x7b0ee9dcb5c1d4d7cd630c652959951936512ba3, 'Delu'),
        (0x753f2af0f46361c9ae6fc347797f99b0c9e82ba3, 'grantr'),
        (0x3722264aB15a1dfCe5a5af89e6547F7949A8ABA3, 'LienFi'),
        (0x316ffb9c875f900adcf04889e415cc86b564eba3, 'LITCOIN'),
        (0x85eac631c800af804476b140f87039f742c28ba3, 'WOON'),
        (0x61d91cff0fc9fbbdb89f505cf8a7422bf95fdba3, '1clawAI'),
        (0x721b072dbb616f29eea73ac004e03fd4e884bba3, 'evo'),
        (0x95ccfD2B81A9667b0Cc979992632F98fc853EBa3, 'HermesOS'),
        (0xd7bc6a05a56655FB2052F742B012d1DFD66e1BA3, 'MiroShark'),
        (0xde61878b0b21ce395266c44d4d548d1c72a3eb07, 'Sairi'),
        (0x39b4b879b8521d6a8c3a87cda64b969327b7fba3, 'TACHI'),
        (0x0a56431ecc9d0b39be0b1e27e795f4c4f19d0ba3, 'HALO'),
        (0x54330d28ca3357f294334bdc454a032e7f353416, 'Autonolas'),
        (0xc0041ef357b183448b235a8ea73ce4e4ec8c265f, 'Cookie DAO'),
        (0xea17df5cf6d172224892b5477a16acb111182478, 'ElizaOS'),
        (0x1c4cca7c5db003824208adda61bd749e55f463a3, 'GAME by Virtuals'),
        (0xd71552d9e08e5351adb52163b3bbbc4d7de53ce1, 'AITECH Cloud Network'),
        (0x7431ada8a591c955a994a21710752ef9b882b8e3, 'Morpheus AI'),
        (0x97c806e7665d3afd84a8fe1837921403d59f3dcc, 'Artificial Liquid Intelligence'),
        (0x000000000000012def132e61759048be5b5c6033, 'Cortex'),
        (0x29cc30f9d113b356ce408667aa6433589cecbdca, 'Elsa'),
        (0x30c7235866872213f68cb1f08c37cb9eccb93452, 'Wayfinder')
    ) AS t(address, name)
),

date_spine AS (
    SELECT CAST(d AS TIMESTAMP) AS snapshot_date
    FROM UNNEST(SEQUENCE(
        CAST(now() - INTERVAL '49' day AS TIMESTAMP),
        CAST(now() AS TIMESTAMP),
        INTERVAL '7' day
    )) AS t(d)
),

relevant_txs AS (
    SELECT t.block_time, t."from" AS wallet, ac.name AS project
    FROM base.transactions t
    INNER JOIN agentic_contracts ac ON t."to" = ac.address
    WHERE t.block_time >= now() - INTERVAL '79' day
    AND t.success = true
),

relevant_trades AS (
    SELECT dt.block_time, dt.taker, dt.amount_usd, ac.name AS project, 'buy' AS side
    FROM dex.trades dt
    INNER JOIN agentic_contracts ac ON dt.token_bought_address = ac.address
    WHERE dt.block_time >= now() - INTERVAL '79' day AND dt.blockchain = 'base'

    UNION ALL

    SELECT dt.block_time, dt.taker, dt.amount_usd, ac.name AS project, 'sell' AS side
    FROM dex.trades dt
    INNER JOIN agentic_contracts ac ON dt.token_sold_address = ac.address
    WHERE dt.block_time >= now() - INTERVAL '79' day AND dt.blockchain = 'base'
),

metrics_30d AS (
    SELECT ds.snapshot_date, rt.project,
        COUNT(*) AS txs_30d, COUNT(DISTINCT rt.wallet) AS users_30d
    FROM date_spine ds
    JOIN relevant_txs rt
        ON rt.block_time >= ds.snapshot_date - INTERVAL '30' day
        AND rt.block_time < ds.snapshot_date
    GROUP BY 1, 2
),

metrics_7d AS (
    SELECT ds.snapshot_date, rt.project,
        COUNT(*) AS txs_7d, COUNT(DISTINCT rt.wallet) AS users_7d,
        CAST(COUNT(*) AS DOUBLE) / NULLIF(COUNT(DISTINCT rt.wallet), 0) AS avg_txs_per_wallet_7d
    FROM date_spine ds
    JOIN relevant_txs rt
        ON rt.block_time >= ds.snapshot_date - INTERVAL '7' day
        AND rt.block_time < ds.snapshot_date
    GROUP BY 1, 2
),

metrics_prev_7d AS (
    SELECT ds.snapshot_date, rt.project,
        COUNT(*) AS txs_prev_7d, COUNT(DISTINCT rt.wallet) AS users_prev_7d,
        CAST(COUNT(*) AS DOUBLE) / NULLIF(COUNT(DISTINCT rt.wallet), 0) AS avg_txs_per_wallet_prev_7d
    FROM date_spine ds
    JOIN relevant_txs rt
        ON rt.block_time >= ds.snapshot_date - INTERVAL '14' day
        AND rt.block_time < ds.snapshot_date - INTERVAL '7' day
    GROUP BY 1, 2
),

wallet_first_seen AS (
    SELECT ac.name AS project, t."from" AS wallet, MIN(t.block_time) AS first_seen
    FROM base.transactions t
    INNER JOIN agentic_contracts ac ON t."to" = ac.address
    WHERE t.success = true
    GROUP BY 1, 2
),

new_vs_returning AS (
    SELECT ds.snapshot_date, wfs.project,
        COUNT(DISTINCT CASE WHEN wfs.first_seen >= ds.snapshot_date - INTERVAL '30' day
            AND wfs.first_seen < ds.snapshot_date THEN wfs.wallet END) AS new_wallets_30d,
        COUNT(DISTINCT CASE WHEN wfs.first_seen < ds.snapshot_date - INTERVAL '30' day THEN wfs.wallet END) AS returning_wallets_30d
    FROM date_spine ds
    CROSS JOIN wallet_first_seen wfs
    WHERE wfs.first_seen < ds.snapshot_date
    GROUP BY 1, 2
),

top10_tx_share AS (
    SELECT snapshot_date, project,
        ROUND(CAST(SUM(CASE WHEN rn <= 10 THEN wallet_txs ELSE 0 END) AS DOUBLE) / NULLIF(SUM(wallet_txs), 0) * 100, 1) AS top10_tx_share_pct
    FROM (
        SELECT ds.snapshot_date, rt.project, rt.wallet, COUNT(*) AS wallet_txs,
            ROW_NUMBER() OVER (PARTITION BY ds.snapshot_date, rt.project ORDER BY COUNT(*) DESC) AS rn
        FROM date_spine ds
        JOIN relevant_txs rt
            ON rt.block_time >= ds.snapshot_date - INTERVAL '30' day
            AND rt.block_time < ds.snapshot_date
        GROUP BY 1, 2, 3
    ) wallet_counts
    GROUP BY 1, 2
),

dex_volume AS (
    SELECT ds.snapshot_date, rtr.project,
        SUM(rtr.amount_usd) AS dex_volume_30d, COUNT(DISTINCT rtr.taker) AS unique_traders_30d,
        SUM(CASE WHEN rtr.block_time >= ds.snapshot_date - INTERVAL '7' day THEN rtr.amount_usd ELSE 0 END) AS dex_volume_7d,
        SUM(CASE WHEN rtr.block_time >= ds.snapshot_date - INTERVAL '14' day
            AND rtr.block_time < ds.snapshot_date - INTERVAL '7' day THEN rtr.amount_usd ELSE 0 END) AS dex_volume_prev_7d
    FROM date_spine ds
    JOIN relevant_trades rtr
        ON rtr.block_time >= ds.snapshot_date - INTERVAL '30' day
        AND rtr.block_time < ds.snapshot_date
    GROUP BY 1, 2
),

unique_buyers_windowed AS (
    SELECT ds.snapshot_date, rtr.project,
        COUNT(DISTINCT rtr.taker) AS unique_buyers_30d,
        COUNT(DISTINCT CASE WHEN rtr.block_time >= ds.snapshot_date - INTERVAL '7' day THEN rtr.taker END) AS unique_buyers_7d
    FROM date_spine ds
    JOIN relevant_trades rtr
        ON rtr.side = 'buy'
        AND rtr.block_time >= ds.snapshot_date - INTERVAL '30' day
        AND rtr.block_time < ds.snapshot_date
    GROUP BY 1, 2
),

buyer_first_seen AS (
    SELECT ac.name AS project, dt.taker AS wallet, MIN(dt.block_time) AS first_buy_time
    FROM dex.trades dt
    INNER JOIN agentic_contracts ac ON dt.token_bought_address = ac.address
    WHERE dt.blockchain = 'base'
    GROUP BY 1, 2
),
first_time_buyers AS (
    SELECT ds.snapshot_date, bfs.project,
        COUNT(DISTINCT CASE WHEN bfs.first_buy_time >= ds.snapshot_date - INTERVAL '30' day
            AND bfs.first_buy_time < ds.snapshot_date THEN bfs.wallet END) AS first_time_buyers_30d,
        COUNT(DISTINCT CASE WHEN bfs.first_buy_time >= ds.snapshot_date - INTERVAL '7' day
            AND bfs.first_buy_time < ds.snapshot_date THEN bfs.wallet END) AS first_time_buyers_7d
    FROM date_spine ds
    CROSS JOIN buyer_first_seen bfs
    WHERE bfs.first_buy_time < ds.snapshot_date
    GROUP BY 1, 2
),

seller_first_seen AS (
    SELECT ac.name AS project, dt.taker AS wallet, MIN(dt.block_time) AS first_sell_time
    FROM dex.trades dt
    INNER JOIN agentic_contracts ac ON dt.token_sold_address = ac.address
    WHERE dt.blockchain = 'base'
    GROUP BY 1, 2
),
first_time_sellers AS (
    SELECT ds.snapshot_date, sfs.project,
        COUNT(DISTINCT CASE WHEN sfs.first_sell_time >= ds.snapshot_date - INTERVAL '30' day
            AND sfs.first_sell_time < ds.snapshot_date THEN sfs.wallet END) AS first_time_sellers_30d,
        COUNT(DISTINCT CASE WHEN sfs.first_sell_time >= ds.snapshot_date - INTERVAL '7' day
            AND sfs.first_sell_time < ds.snapshot_date THEN sfs.wallet END) AS first_time_sellers_7d
    FROM date_spine ds
    CROSS JOIN seller_first_seen sfs
    WHERE sfs.first_sell_time < ds.snapshot_date
    GROUP BY 1, 2
),

final_metrics AS (
    SELECT
        m30.snapshot_date, m30.project, m30.txs_30d, m30.users_30d,
        m7.txs_7d, m7.users_7d AS unique_wallets_7d,
        COALESCE(nr.new_wallets_30d, 0) AS new_wallets_30d,
        COALESCE(nr.returning_wallets_30d, 0) AS returning_wallets_30d,
        CAST(m30.txs_30d AS DOUBLE) / NULLIF(m30.users_30d, 0) AS avg_txs_per_user,
        (CAST(m7.txs_7d AS DOUBLE) - COALESCE(mp7.txs_prev_7d, 0)) / NULLIF(mp7.txs_prev_7d, 0) * 100 AS wow_txs_pct,
        (CAST(m7.users_7d AS DOUBLE) - COALESCE(mp7.users_prev_7d, 0)) / NULLIF(mp7.users_prev_7d, 0) * 100 AS wow_users_pct,
        ROUND(CAST(m7.users_7d AS DOUBLE) / NULLIF(mp7.users_prev_7d, 0) * 100, 1) AS retention_rate_pct,
        m7.avg_txs_per_wallet_7d - COALESCE(mp7.avg_txs_per_wallet_prev_7d, 0) AS wallet_engagement_delta,
        t10tx.top10_tx_share_pct,
        ROUND(CAST(dv.dex_volume_30d AS DOUBLE), 0) AS dex_volume_30d_usd,
        dv.unique_traders_30d,
        (CAST(dv.dex_volume_7d AS DOUBLE) - COALESCE(dv.dex_volume_prev_7d, 0)) / NULLIF(dv.dex_volume_prev_7d, 0) * 100 AS wow_volume_pct,
        CAST(COALESCE(dv.dex_volume_30d, 0) AS DOUBLE) / NULLIF(m30.txs_30d, 0) AS vol_per_tx,
        CAST(COALESCE(dv.dex_volume_30d, 0) AS DOUBLE) / NULLIF(m30.users_30d, 0) AS vol_per_wallet,
        ROUND(CAST(COALESCE(nr.new_wallets_30d, 0) AS DOUBLE) / NULLIF(m30.users_30d, 0) * 100, 1) AS new_wallet_pct,
        COALESCE(ftb.first_time_buyers_30d, 0) AS first_time_buyers_30d,
        COALESCE(ftb.first_time_buyers_7d, 0) AS first_time_buyers_7d,
        COALESCE(ubw.unique_buyers_30d, 0) AS unique_buyers_30d,
        COALESCE(ubw.unique_buyers_7d, 0) AS unique_buyers_7d,
        COALESCE(fts.first_time_sellers_30d, 0) AS first_time_sellers_30d,
        COALESCE(fts.first_time_sellers_7d, 0) AS first_time_sellers_7d,
        GREATEST(
            COALESCE(nr.new_wallets_30d, 0)
            - COALESCE(ftb.first_time_buyers_30d, 0)
            - COALESCE(fts.first_time_sellers_30d, 0)
        , 0) AS non_trade_new_wallets_30d
    FROM metrics_30d m30
    LEFT JOIN metrics_7d                  m7    ON m30.snapshot_date = m7.snapshot_date AND m30.project = m7.project
    LEFT JOIN metrics_prev_7d             mp7   ON m30.snapshot_date = mp7.snapshot_date AND m30.project = mp7.project
    LEFT JOIN new_vs_returning            nr    ON m30.snapshot_date = nr.snapshot_date AND m30.project = nr.project
    LEFT JOIN top10_tx_share              t10tx ON m30.snapshot_date = t10tx.snapshot_date AND m30.project = t10tx.project
    LEFT JOIN dex_volume                  dv    ON m30.snapshot_date = dv.snapshot_date AND m30.project = dv.project
    LEFT JOIN first_time_buyers           ftb   ON m30.snapshot_date = ftb.snapshot_date AND m30.project = ftb.project
    LEFT JOIN unique_buyers_windowed      ubw   ON m30.snapshot_date = ubw.snapshot_date AND m30.project = ubw.project
    LEFT JOIN first_time_sellers          fts   ON m30.snapshot_date = fts.snapshot_date AND m30.project = fts.project
),

scored AS (
    SELECT
        snapshot_date, project, txs_30d, users_30d, dex_volume_30d_usd, retention_rate_pct,
        wow_volume_pct, wow_txs_pct, wow_users_pct, avg_txs_per_user, unique_traders_30d,
        vol_per_tx, new_wallet_pct, new_wallets_30d, returning_wallets_30d,
        first_time_buyers_30d, first_time_buyers_7d, unique_buyers_30d, unique_buyers_7d,
        first_time_sellers_30d, first_time_sellers_7d, non_trade_new_wallets_30d,
        (
            (LEAST(GREATEST(COALESCE(new_wallet_pct, 0), 0), 100) / 100.0) * 25.0
            + ((LEAST(GREATEST(COALESCE(wow_txs_pct,    0) + 100, 0), 300) / 300.0) * 0.34
               + (LEAST(GREATEST(COALESCE(wow_users_pct,  0) + 100, 0), 300) / 300.0) * 0.33
               + (LEAST(GREATEST(COALESCE(wow_volume_pct, 0) + 100, 0), 300) / 300.0) * 0.33) * 25.0
            + (LEAST(GREATEST(COALESCE(retention_rate_pct, 0), 0), 200) / 200.0) * 20.0
            + ((COALESCE(vol_per_tx,     0) / NULLIF(MAX(vol_per_tx)     OVER (PARTITION BY snapshot_date), 0)) * 0.5
               + (COALESCE(vol_per_wallet, 0) / NULLIF(MAX(vol_per_wallet) OVER (PARTITION BY snapshot_date), 0)) * 0.5) * 15.0
            + (LEAST(GREATEST(COALESCE(wallet_engagement_delta, 0), -10), 10) + 10) / 20.0 * 10.0
            + (1.0 - LEAST(COALESCE(top10_tx_share_pct, 0), 100) / 100.0) * 3.0
            + (COALESCE(avg_txs_per_user, 0) / NULLIF(MAX(avg_txs_per_user) OVER (PARTITION BY snapshot_date), 0)) * 2.0
        ) AS momentum_score,
        (
            (LEAST(GREATEST(COALESCE(new_wallet_pct, 0), 0), 100) / 100.0) * 10.0
            + ((LEAST(GREATEST(COALESCE(wow_txs_pct,    0) + 100, 0), 300) / 300.0) * 0.34
               + (LEAST(GREATEST(COALESCE(wow_users_pct,  0) + 100, 0), 300) / 300.0) * 0.33
               + (LEAST(GREATEST(COALESCE(wow_volume_pct, 0) + 100, 0), 300) / 300.0) * 0.33) * 15.0
            + (LEAST(GREATEST(COALESCE(retention_rate_pct, 0), 0), 200) / 200.0) * 30.0
            + ((COALESCE(vol_per_tx,     0) / NULLIF(MAX(vol_per_tx)     OVER (PARTITION BY snapshot_date), 0)) * 0.5
               + (COALESCE(vol_per_wallet, 0) / NULLIF(MAX(vol_per_wallet) OVER (PARTITION BY snapshot_date), 0)) * 0.5) * 25.0
            + (LEAST(GREATEST(COALESCE(wallet_engagement_delta, 0), -10), 10) + 10) / 20.0 * 15.0
            + (1.0 - LEAST(COALESCE(top10_tx_share_pct, 0), 100) / 100.0) * 3.0
            + (COALESCE(avg_txs_per_user, 0) / NULLIF(MAX(avg_txs_per_user) OVER (PARTITION BY snapshot_date), 0)) * 2.0
        ) AS sustainability_score,
        ROUND(GREATEST(100.0
            - LEAST(GREATEST(COALESCE(wow_txs_pct, 0) - COALESCE(wow_users_pct, 0), 0), 100) * 0.35
            - LEAST(COALESCE(top10_tx_share_pct, 0), 100) * 0.35
            - LEAST(GREATEST(COALESCE(retention_rate_pct, 0) - 150, 0), 50) * 0.30, 0), 1) AS activity_quality_pct,
        ROUND(LEAST(((COALESCE(dex_volume_30d_usd, 0) / NULLIF(unique_traders_30d, 0)
            / NULLIF(MAX(COALESCE(dex_volume_30d_usd, 0) / NULLIF(unique_traders_30d, 0)) OVER (PARTITION BY snapshot_date), 0)) * 0.65
            + LEAST(COALESCE(top10_tx_share_pct, 0), 100) / 100.0 * 0.35) * 100, 100), 1) AS volume_concentration_risk_pct,
        top10_tx_share_pct
    FROM final_metrics
),

opportunity_scored AS (
    SELECT *,
        ROUND((momentum_score * 0.5 + sustainability_score * 0.5) * (activity_quality_pct / 100.0)
            * (1.0 - LEAST(COALESCE(volume_concentration_risk_pct, 0), 100) / 100.0), 1) AS opportunity_score,
        CASE
            WHEN momentum_score >= APPROX_PERCENTILE(momentum_score, 0.5) OVER (PARTITION BY snapshot_date)
             AND sustainability_score >= APPROX_PERCENTILE(sustainability_score, 0.5) OVER (PARTITION BY snapshot_date) THEN 'Breakout'
            WHEN momentum_score >= APPROX_PERCENTILE(momentum_score, 0.5) OVER (PARTITION BY snapshot_date)
             AND sustainability_score < APPROX_PERCENTILE(sustainability_score, 0.5) OVER (PARTITION BY snapshot_date) THEN 'Quick Mover'
            WHEN momentum_score < APPROX_PERCENTILE(momentum_score, 0.5) OVER (PARTITION BY snapshot_date)
             AND sustainability_score >= APPROX_PERCENTILE(sustainability_score, 0.5) OVER (PARTITION BY snapshot_date) THEN 'Slow Burner'
            ELSE 'Cold'
        END AS profile
    FROM scored
)

SELECT
    snapshot_date AS "Snapshot Date",
    ROUND(opportunity_score, 1) AS "Opp",
    ROUND(momentum_score, 1) AS "Mom",
    ROUND(sustainability_score, 1) AS "Sus",
    profile AS "Prof",
    txs_30d AS "Txs 30d",
    users_30d AS "Wallets 30d",
    ROUND(dex_volume_30d_usd, 0) AS "Vol 30d",
    retention_rate_pct AS "Retention %",
    ROUND(wow_volume_pct, 1) AS "Vol Grw %",
    ROUND(wow_txs_pct, 1) AS "Tx Grw %",
    ROUND(wow_users_pct, 1) AS "User Grw %",
    ROUND(avg_txs_per_user, 1) AS "Txs/User",
    unique_traders_30d AS "Traders",
    ROUND(vol_per_tx, 2) AS "Vol/Tx",
    ROUND(new_wallet_pct, 1) AS "New %",
    new_wallets_30d AS "New 30d",
    returning_wallets_30d AS "Return 30d",
    non_trade_new_wallets_30d AS "Non-Trade New 30d",
    unique_buyers_30d AS "Buyers 30d",
    unique_buyers_7d AS "Buyers 7d",
    first_time_buyers_30d AS "1st Buyers 30d",
    first_time_buyers_7d AS "1st Buyers 7d",
    first_time_sellers_30d AS "1st Sellers 30d",
    first_time_sellers_7d AS "1st Sellers 7d",
    activity_quality_pct AS "Qlty %",
    ROUND(volume_concentration_risk_pct, 1) AS "Risk %",
    top10_tx_share_pct AS "Top10 %"
FROM opportunity_scored
WHERE project = 'CLAWD'
ORDER BY snapshot_date ASC;
