"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true); // default dark
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dark is default — light only if localStorage explicitly says so
    setDark(localStorage.getItem("zdash-theme") !== "light");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      // Switching to dark — this is the default, so just remove the light override
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.removeItem("zdash-theme"); // no need to save — dark is default
    } else {
      // Switching to light — explicitly save so it survives refresh
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("zdash-theme", "light");
    }
  }

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return <div style={{ width: "80px", height: "34px" }} />;
  }

  return (
    <button
      onClick={toggle}
      style={{
        flexShrink: 0,
        padding: "8px 18px",
        borderRadius: "20px",
        border: "1px solid var(--border-strong)",
        background: dark ? "var(--btn-active-bg)" : "var(--bg-muted)",
        color: dark ? "var(--btn-active-text)" : "var(--text-muted)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "7px",
        whiteSpace: "nowrap",
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      <span style={{ fontSize: "15px", lineHeight: 1 }}>{dark ? "☀︎" : "☽"}</span>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
