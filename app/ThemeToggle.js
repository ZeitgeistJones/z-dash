"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(null);

  useEffect(() => {
    // Read from the DOM — the inline script in layout.js already set this correctly
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.removeItem("zdash-theme"); // dark is default, no need to store
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("zdash-theme", "light"); // only store the non-default
    }
  }

  if (dark === null) {
    return <div style={{ width: "88px", height: "34px" }} />;
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
