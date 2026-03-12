// components/widgets/TyreDegWidget.tsx
"use client";

import { WidgetConfig } from "./types";
import { getTeamColour, getDriver } from "@/lib/drivers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function useMockTyreData(drivers: string[]) {
  return Array.from({ length: 20 }, (_, i) => {
    const lap = i + 1;
    const row: Record<string, number | string> = { lap: `${lap}` };
    drivers.forEach((d, j) => {
      const base = 78.2 + j * 0.15;
      const deg = i * (0.04 + j * 0.008);
      const cliff = i > 15 ? (i - 15) * (0.06 + j * 0.03) : 0;
      const noise = (Math.sin(i * 3 + j) * 0.08);
      row[d] = +(base + deg + cliff + noise).toFixed(3);
    });
    return row;
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/10 px-2 py-1.5">
      <p className="text-[9px] text-white/30 font-mono mb-1">Lap {label}</p>
      {payload.map((p: any, i: number) => {
        const driver = getDriver(p.dataKey);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5" style={{ background: p.color }} />
            <span className="text-[10px] font-mono text-white/50">
              {driver?.code || p.dataKey}
            </span>
            <span className="text-[10px] font-mono text-white ml-auto">
              {p.value}s
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function TyreDegWidget({ config }: { config: WidgetConfig }) {
  const drivers = config.params.drivers || ["44", "16"];
  const data = useMockTyreData(drivers);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-1">
        {drivers.map((d: string) => {
          const driver = getDriver(d);
          return (
            <div key={d} className="flex items-center gap-1.5">
              <div className="w-2 h-2" style={{ background: getTeamColour(d) }} />
              <span className="text-[10px] font-mono text-white/60">
                {driver?.code || d}
              </span>
            </div>
          );
        })}
        <span className="text-[9px] font-mono text-white/20 ml-auto">
          STINT {config.params.stintStart || 1}–{config.params.stintEnd || 20}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 2, right: 2, bottom: 0, left: -24 }}
          >
            <XAxis
              dataKey="lap"
              tick={{ fontSize: 8, fill: "rgba(255,255,255,0.15)" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <YAxis
              tick={{ fontSize: 8, fill: "rgba(255,255,255,0.15)" }}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
              reversed
            />
            <Tooltip content={<CustomTooltip />} />
            {drivers.map((d: string) => (
              <Line
                key={d}
                type="monotone"
                dataKey={d}
                stroke={getTeamColour(d)}
                strokeWidth={1.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
