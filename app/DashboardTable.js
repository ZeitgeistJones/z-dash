"use client";
import { useState } from "react";

const columns = [
  { key: "Project", label: "Project", type: "string" },
  { key: "Opp", label: "Opp", type: "number" },
  { key: "Mom", label: "Mom", type: "number" },
  { key: "Sus", label: "Sus", type: "number" },
  { key: "Prof", label: "Prof", type: "string" },
  { key: "priceUsd", label: "Price", type: "number" },
  { key: "marketCapUsd", label: "Market Cap", type: "number" },
  { key: "signal", label: "Signal", type: "string" },
  { key: "signalScore", label: "Signal Score", type: "number" },
];

export default function DashboardTable({ data }) {
  const [sortKey, setSortKey] = useState("Opp");
  const [sortDir, setSortDir] = useState("desc");

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const col = columns.find((c) => c.key === sortKey);
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (col.type === "number") {
      aVal = aVal == null || aVal === "" ? -Infinity : Number(aVal);
      bVal = bVal == null || bVal === "" ? -Infinity : Number(bVal);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    } else {
      aVal = aVal == null ? "" : String(aVal);
      bVal = bVal == null ? "" : String(bVal);
      return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
  });

  return (
    <table style={{ borderCollapse: "collapse", marginTop: "20px" }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => handleSort(col.key)}
              style={{
                textAlign: "left",
                borderBottom: "1px solid #ccc",
                padding: "6px 12px",
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              {col.label}
              {sortKey === col.key ? (sortDir === "desc" ? " ▼" : " ▲") : ""}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((d) => (
          <tr key={d["Address"]}>
            <td style={{ padding: "6px 12px" }}>{d["Project"]}</td>
            <td style={{ padding: "6px 12px" }}>{d["Opp"]}</td>
            <td style={{ padding: "6px 12px" }}>{d["Mom"]}</td>
            <td style={{ padding: "6px 12px" }}>{d["Sus"]}</td>
            <td style={{ padding: "6px 12px" }}>{d["Prof"]}</td>
            <td style={{ padding: "6px 12px" }}>
              {d.priceUsd != null ? `$${Number(d.priceUsd).toPrecision(4)}` : "—"}
            </td>
            <td style={{ padding: "6px 12px" }}>
              {d.marketCapUsd != null ? `$${Number(d.marketCapUsd).toLocaleString()}` : "—"}
            </td>
            <td style={{ padding: "6px 12px" }}>{d.signal}</td>
            <td style={{ padding: "6px 12px" }}>{d.signalScore != null ? d.signalScore : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
