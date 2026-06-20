"use client";
import { useState, useRef } from "react";

const COLUMNS = [
  { key: "Project", label: "Project" },
  { key: "marketCapUsd", label: "Market Cap", format: "usd" },
  { key: "Wallets 15m", label: "Wallets 15m" },
  { key: "Txs 15m", label: "Txs 15m" },
  { key: "New Buyers 15m", label: "New Buyers 15m" },
  { key: "New Sellers 15m", label: "New Sellers 15m" },
  { key: "Wallets 1h", label: "Wallets 1h" },
  { key: "Txs 1h", label: "Txs 1h" },
  { key: "New Buyers 1h", label: "New Buyers 1h" },
  { key: "New Sellers 1h", label: "New Sellers 1h" },
  { key: "Wallets 6h", label: "Wallets 6h" },
  { key: "Txs 6h", label: "Txs 6h" },
  { key: "New Buyers 6h", label: "New Buyers 6h" },
  { key: "New Sellers 6h", label: "New Sellers 6h" },
  { key: "Wallets 24h", label: "Wallets 24h" },
  { key: "Txs 24h", label: "Txs 24h" },
  { key: "New Buyers 24h", label: "New Buyers 24h" },
  { key: "New Sellers 24h", label: "New Sellers 24h" },
];

function formatValue(val, format) {
  if (val == null || val === "") return "—";
  if (format === "usd") return `$${Number(val).toLocaleString()}`;
  return val;
}

export default function TripwirePanel() {
  const [status, setStatus] = useState("idle");
  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [sortKey, setSortKey] = useState("Txs 15m");
  const [sortDir, setSortDir] = useState("desc");
  const pollRef = useRef(null);
  const attemptsRef = useRef(0);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  async function runTripwire() {
    setStatus("starting");
    setErrorMsg("");
    setRows([]);
    attemptsRef.current = 0;

    try {
      const startRes = await fetch("/api/tripwire/start", { method: "POST" });
      const startJson = await startRes.json();
      if (!startRes.ok || !startJson.executionId) {
        throw new Error(startJson.error || "Failed to start Tripwire run");
      }

      setStatus("running");
      pollRef.current = setInterval(async () => {
        attemptsRef.current += 1;
        if (attemptsRef.current > 40) {
          stopPolling();
          setStatus("error");
          setErrorMsg("Taking longer than expected. Try again in a moment.");
          return;
        }
        try {
          const statusRes = await fetch(
            `/api/tripwire/status?executionId=${startJson.executionId}`
          );
          const statusJson = await statusRes.json();

          if (statusJson.state === "QUERY_STATE_COMPLETED") {
            stopPolling();
            setRows(statusJson.rows || []);
            setStatus("done");
          } else if (
            statusJson.state === "QUERY_STATE_FAILED" ||
            statusJson.state === "QUERY_STATE_CANCELLED"
          ) {
            stopPolling();
            setStatus("error");
            setErrorMsg("Dune query failed or was cancelled.");
          }
        } catch {
          // transient fetch error, keep trying until attempt limit
        }
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(String(err.message || err));
    }
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "Project") {
      aVal = aVal == null ? "" : String(aVal);
      bVal = bVal == null ? "" : String(bVal);
      return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    aVal = aVal == null || aVal === "" ? -Infinity : Number(aVal);
    bVal = bVal == null || bVal === "" ? -Infinity : Number(bVal);
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  return (
    <div>
      <div className="tripwire-controls">
        <button
          onClick={runTripwire}
          disabled={status === "starting" || status === "running"}
          className="btn"
        >
          {status === "starting" && "Starting…"}
          {status === "running" && "Running on Dune…"}
          {(status === "idle" || status === "done" || status === "error") &&
            "Run Tripwire Check"}
        </button>
        {status === "running" && (
          <span className="hint">
            This calls Dune fresh — usually takes 10-30 seconds.
          </span>
        )}
        {status === "error" && (
          <span className="error-text">
            {errorMsg}
          </span>
        )}
      </div>

      {status === "done" && rows.length === 0 && (
        <p className="hint">No activity in the last 24h.</p>
      )}

      {rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`sortable ${col.key === "Project" ? "" : "num"}`}
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      <span className="arrow">{sortDir === "desc" ? "▼" : "▲"}</span>
                    ) : (
                      ""
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r["Address"] || r["Project"]}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className={col.key === "Project" ? "" : "num"}>
                      {col.format ? formatValue(r[col.key], col.format) : r[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
