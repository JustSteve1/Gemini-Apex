// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#08080D] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-600/20">
          <span className="text-4xl font-black text-white">A</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
          APEX
        </h1>

        <p className="text-lg text-zinc-400 mb-2 font-mono tracking-widest text-sm">
          AI RACE ENGINEER
        </p>

        <p className="text-zinc-500 text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Talk to live F1 data. Ask questions mid-race. Get answers powered by
          causal telemetry analysis and Gemini.
        </p>

        {/* CTA */}
        <Link
          href="/agent"
          className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Launch Agent</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        {/* Tech badges */}
        <div className="flex items-center justify-center gap-4 mt-12 flex-wrap">
          {["Gemini 2.5", "BigQuery", "Google Cloud", "Next.js"].map(
            (tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono text-zinc-600 border border-zinc-800 rounded-full px-3 py-1"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center">
        <p className="text-[11px] text-zinc-700 font-mono">
          GEMINI LIVE AGENT CHALLENGE 2026
        </p>
      </footer>
    </main>
  );
}
