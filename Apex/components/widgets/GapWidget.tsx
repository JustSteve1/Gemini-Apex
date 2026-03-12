// components/widgets/GapWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { WidgetConfig } from "./types";
import { getDriver, getTeamColour } from "@/lib/drivers";

export default function GapWidget({ config }: { config: WidgetConfig }) {
  const ahead = config.params.driverAhead || "4";
  const behind = config.params.driverBehind || "44";
  const driverAhead = getDriver(ahead);
  const driverBehind = getDriver(behind);

  const [gap, setGap] = useState(1.234);
  const [delta, setDelta] = useState(-0.031);

  useEffect(() => {
    const interval = setInterval(() => {
      const d = (Math.random() - 0.48) * 0.05;
      setGap((g) => +(Math.max(0.05, g + d)).toFixed(3));
      setDelta(d);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const closing = delta < 0;

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Driver labels */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5" style={{ background: getTeamColour(ahead) }} />
          <span className="text-[9px] font-mono text-white/40">
            {driverAhead?.code || ahead}
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/15">▸</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5" style={{ background: getTeamColour(behind) }} />
          <span className="text-[9px] font-mono text-white/40">
            {driverBehind?.code || behind}
          </span>
        </div>
      </div>

      {/* Gap number */}
      <span className="text-4xl font-mono font-light text-white tracking-tight tabular-nums">
        {gap.toFixed(3)}
      </span>
      <span className="text-[10px] font-mono text-white/20 mt-0.5">SEC</span>

      {/* Trend */}
      <div className="mt-2">
        <span
          className="text-[10px] font-mono"
          style={{ color: closing ? "var(--text-primary)" : "var(--text-subtle)" }}
        >
          {closing ? "↓" : "↑"} {Math.abs(delta).toFixed(3)}s
        </span>
      </div>
    </div>
  );
}
