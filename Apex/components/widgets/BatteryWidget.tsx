// components/widgets/BatteryWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { WidgetConfig } from "./types";
import { getDriver, getTeamColour } from "@/lib/drivers";

export default function BatteryWidget({ config }: { config: WidgetConfig }) {
  const driverNum = config.params.driver || "44";
  const driver = getDriver(driverNum);
  const teamColour = getTeamColour(driverNum);

  const [level, setLevel] = useState(72);
  const [deploying, setDeploying] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLevel((l) => {
        const d = deploying ? -(Math.random() * 3 + 1) : (Math.random() * 2 + 0.5);
        const next = Math.max(4, Math.min(100, l + d));
        if (next < 12) setDeploying(false);
        if (next > 88) setDeploying(true);
        return Math.round(next);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [deploying]);

  const segments = 16;
  const filled = Math.round((level / 100) * segments);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Driver */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5" style={{ background: teamColour }} />
        <span className="text-[9px] font-mono text-white/40">
          {driver?.code || driverNum}
        </span>
        <span className="text-[9px] font-mono text-white/15">
          L{config.params.lapNumber || 22}
        </span>
      </div>

      {/* Battery bar */}
      <div className="w-full max-w-[100px] mb-3">
        <div className="border border-white/10 p-[3px] relative">
          <div className="flex gap-[2px]">
            {Array.from({ length: segments }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-6 transition-all duration-300"
                style={{
                  background: i < filled ? "var(--text-primary)" : "var(--glass-border)",
                  opacity: i < filled ? 1 - (filled - i - 1) * 0.04 : 1,
                }}
              />
            ))}
          </div>
          {/* Tip */}
          <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[4px] h-3 bg-white/10" />
        </div>
      </div>

      {/* Level */}
      <span className="text-3xl font-mono font-light text-white tabular-nums">
        {level}
      </span>
      <span className="text-[10px] font-mono text-white/20">%</span>

      {/* Status */}
      <div className="mt-2 flex items-center gap-1.5">
        <div
          className={`w-1 h-1 rounded-full ${
            deploying ? "bg-white animate-pulse" : "bg-white/30 animate-pulse"
          }`}
        />
        <span className="text-[9px] font-mono text-white/30">
          {deploying ? "DEPLOY" : "HARVEST"}
        </span>
      </div>
    </div>
  );
}
