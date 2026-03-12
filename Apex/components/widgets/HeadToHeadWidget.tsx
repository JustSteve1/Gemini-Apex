// components/widgets/HeadToHeadWidget.tsx
"use client";

import { WidgetConfig } from "./types";
import { getDriver, getTeamColour } from "@/lib/drivers";

// Mock stats — replace with BigQuery fetch
function useMockStats(d1: string, d2: string) {
  return {
    [d1]: { bestLap: 78.234, topSpeed: 328, avgSpeed: 212.4, consistency: 0.31 },
    [d2]: { bestLap: 78.412, topSpeed: 325, avgSpeed: 210.8, consistency: 0.42 },
  };
}

const METRICS = [
  { key: "bestLap", label: "BEST LAP", unit: "s", better: "lower" as const, format: (v: number) => v.toFixed(3) },
  { key: "topSpeed", label: "TOP SPEED", unit: "km/h", better: "higher" as const, format: (v: number) => `${v}` },
  { key: "avgSpeed", label: "AVG SPEED", unit: "km/h", better: "higher" as const, format: (v: number) => v.toFixed(1) },
  { key: "consistency", label: "CONSISTENCY", unit: "σ", better: "lower" as const, format: (v: number) => v.toFixed(2) },
];

export default function HeadToHeadWidget({ config }: { config: WidgetConfig }) {
  const d1 = config.params.driver1 || "44";
  const d2 = config.params.driver2 || "16";
  const driver1 = getDriver(d1);
  const driver2 = getDriver(d2);
  const stats = useMockStats(d1, d2);

  return (
    <div className="h-full flex flex-col">
      {/* Driver headers */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2" style={{ background: getTeamColour(d1) }} />
          <span className="text-xs font-mono text-white/80">{driver1?.code || d1}</span>
        </div>
        <span className="text-[9px] font-mono text-white/15">VS</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-white/80">{driver2?.code || d2}</span>
          <div className="w-2 h-2" style={{ background: getTeamColour(d2) }} />
        </div>
      </div>

      {/* Metrics */}
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {METRICS.map((m) => {
          const v1 = stats[d1]?.[m.key as keyof typeof stats[typeof d1]] as number;
          const v2 = stats[d2]?.[m.key as keyof typeof stats[typeof d2]] as number;
          const d1Wins = m.better === "higher" ? v1 > v2 : v1 < v2;

          return (
            <div key={m.key}>
              {/* Label */}
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] font-mono text-white/20">{m.label}</span>
              </div>
              {/* Values and bar */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono w-16 text-right tabular-nums ${
                    d1Wins ? "text-white" : "text-white/30"
                  }`}
                >
                  {m.format(v1)}
                </span>
                <div className="flex-1 h-[3px] bg-white/[0.04] relative">
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-500"
                    style={{
                      width: d1Wins ? "60%" : "40%",
                      background: getTeamColour(d1),
                      opacity: d1Wins ? 0.8 : 0.2,
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full transition-all duration-500"
                    style={{
                      width: !d1Wins ? "60%" : "40%",
                      background: getTeamColour(d2),
                      opacity: !d1Wins ? 0.8 : 0.2,
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] font-mono w-16 tabular-nums ${
                    !d1Wins ? "text-white" : "text-white/30"
                  }`}
                >
                  {m.format(v2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
