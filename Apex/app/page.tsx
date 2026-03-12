// app/page.tsx
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 bg-[#F3F3F7] dark:bg-[#08080D] relative overflow-hidden pb-20 transition-colors duration-300">
      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 dark:bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Agent Section ── */}
      <div className="relative z-10 text-center max-w-2xl w-full flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-600/20">
          <span className="text-4xl font-black text-white">A</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
          APEX
        </h1>

        <p className="mb-2 font-mono tracking-widest text-sm text-gray-500 dark:text-zinc-400">
          AI RACE ENGINEER
        </p>

        <p className="text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto text-gray-500 dark:text-zinc-500">
          Talk to live F1 data. Ask questions mid-race. Get answers powered by
          causal telemetry analysis and Gemini.
        </p>

        {/* CTA */}
        <Link
          href="/agent"
          className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Launch Agent</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </Link>

        {/* Tech badges */}
        <div className="flex items-center justify-center gap-3 mt-12 flex-wrap">
          {["Gemini 2.5", "BigQuery", "Google Cloud", "Next.js"].map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-mono border rounded-full px-3 py-1 text-gray-400 dark:text-zinc-600 border-gray-200 dark:border-zinc-800"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="relative z-10 w-full max-w-2xl flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
        <span className="text-xs font-mono text-gray-400 dark:text-zinc-700 tracking-widest">OR</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
      </div>

      {/* ── Dashboard / Widgets Section ── */}
      <div className="relative z-10 text-center max-w-2xl w-full flex flex-col items-center mt-4">
        {/* Widget preview grid */}
        <div className="grid grid-cols-4 gap-[2px] w-full mb-8 opacity-40">
          <div className="col-span-2 h-14 sm:h-16 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">SPEED TRACE</span>
          </div>
          <div className="col-span-2 h-14 sm:h-16 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">TYRE DEG</span>
          </div>
          <div className="col-span-1 h-14 sm:h-16 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">GAP</span>
          </div>
          <div className="col-span-1 h-14 sm:h-16 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">ERS</span>
          </div>
          <div className="col-span-2 h-14 sm:h-16 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">HEAD TO HEAD</span>
          </div>
        </div>

        <p className="text-xs font-mono tracking-widest mb-4 text-gray-400 dark:text-zinc-600">
          LIVE TELEMETRY DASHBOARD
        </p>

        <p className="text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto text-gray-500 dark:text-zinc-500">
          Race data at a glance. Speed traces, tyre deg, ERS, gaps — all on one
          screen, updated live.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Launch Widgets</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </Link>

        {/* Widget badges */}
        <div className="flex items-center justify-center gap-3 mt-12 flex-wrap">
          {["Speed Trace", "Tyre Deg", "ERS", "Gap", "Head to Head"].map((widget) => (
            <span
              key={widget}
              className="text-[11px] font-mono border rounded-full px-3 py-1 text-gray-400 dark:text-zinc-600 border-gray-200 dark:border-zinc-800"
            >
              {widget}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 text-center">
        <p className="text-[11px] font-mono text-gray-300 dark:text-zinc-700">
          GEMINI LIVE AGENT CHALLENGE 2026
        </p>
      </footer>
    </main>
  );
}
