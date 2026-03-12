// components/layout/Header.tsx
// Shared site header — scaffold. Wire up nav items, active states, etc. as needed.

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  /** Highlight one of the nav items as active */
  active?: "agent" | "dashboard";
}

export default function Header({ active }: HeaderProps) {
  return (
    <header className="glass-header sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "#E10600",
              boxShadow: "0 0 14px rgba(225,6,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <span className="text-[11px] font-black text-white">A</span>
          </div>
          <span
            className="text-xs font-mono font-bold tracking-widest transition-colors duration-200"
            style={{ color: "var(--text-muted)" }}
          >
            APEX
          </span>
        </Link>

        {/* Nav — TODO: extend with real routes */}
        <nav className="hidden sm:flex items-center gap-1">
          {[
            { href: "/agent", label: "AGENT", key: "agent" },
            { href: "/dashboard", label: "DASHBOARD", key: "dashboard" },
          ].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest transition-colors duration-200"
              style={{
                color: active === item.key ? "var(--text-primary)" : "var(--text-subtle)",
                background: active === item.key ? "var(--glass-bg-hover)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Theme toggle + slot for extra actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* TODO: add user menu, notifications, etc. */}
        </div>
      </div>
    </header>
  );
}
