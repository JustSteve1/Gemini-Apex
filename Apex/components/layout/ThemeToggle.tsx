// components/layout/ThemeToggle.tsx
// Self-contained — reads and writes theme directly, no shared context.
"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("apex-theme", next ? "dark" : "light");
  }

  // Don't render until client knows the real theme — avoids SSR mismatch
  if (isDark === null) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${className}`}
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        color: "var(--text-muted)",
      }}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
          <line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="7" y1="11.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="11.5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="2.93" y1="2.93" x2="4" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="10" y1="10" x2="11.07" y2="11.07" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="11.07" y1="2.93" x2="10" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="10" x2="2.93" y2="11.07" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M11.5 8.5A6 6 0 0 1 4.5 1.5a5.5 5.5 0 1 0 7 7z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
