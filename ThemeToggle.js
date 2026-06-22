"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("zdash-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("zdash-theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        border: "1px solid var(--border-strong)",
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {dark ? "○ light" : "● dark"}
    </button>
  );
}
