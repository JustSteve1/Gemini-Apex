// components/layout/Footer.tsx
// Shared site footer — scaffold. Add links, legal copy, etc. as needed.

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer
      className="w-full border-t"
      style={{
        borderColor: "var(--glass-border)",
        background: "var(--glass-header-bg)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-mono font-bold tracking-widest"
            style={{ color: "var(--text-subtle)" }}
          >
            APEX
          </span>
          <span
            className="text-[9px] font-mono tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            GEMINI LIVE AGENT CHALLENGE 2026
          </span>
        </div>

        {/* Links — TODO: populate */}
        <nav className="flex items-center gap-4">
          {[
            { href: "/agent", label: "Agent" },
            { href: "/dashboard", label: "Dashboard" },
            /* { href: "/docs", label: "Docs" }, */
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[10px] font-mono tracking-widest transition-colors duration-200"
              style={{ color: "var(--text-subtle)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </footer>
  );
}
