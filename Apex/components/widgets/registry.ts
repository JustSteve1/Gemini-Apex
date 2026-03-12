// components/widgets/registry.ts
import { WidgetRegistryEntry } from "./types";
import SpeedTraceWidget from "./SpeedTraceWidget";
import TyreDegWidget from "./TyreDegWidget";
import GapWidget from "./GapWidget";
import BatteryWidget from "./BatteryWidget";
import HeadToHeadWidget from "./HeadToHeadWidget";
import AgentWidget from "./AgentWidget";

// ── Core Widget Registry ───────────────────────────────
// Every widget (core + UGC) registers here.
// Searchable by type, tags, dataSource table/columns.

export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  {
    type: "speed_trace",
    label: "Speed Trace",
    description: "Speed overlay comparing drivers across a lap distance.",
    defaultSize: "2x1",
    icon: "⚡",
    tags: ["speed", "comparison", "telemetry", "lap"],
    defaultConfig: {
      params: { drivers: ["44", "16"], lapNumber: 22, sessionType: "R" },
      dataSource: {
        table: "f1_data_library_DS.telemetry",
        columns: ["driver_number", "distance", "speed", "lap_number"],
        filters: { season: 2026, event_name: "Australian Grand Prix" },
      },
    },
    component: SpeedTraceWidget,
  },
  {
    type: "tyre_deg",
    label: "Tyre Degradation",
    description: "Lap time degradation over a stint showing tyre performance drop.",
    defaultSize: "2x1",
    icon: "◉",
    tags: ["tyres", "degradation", "strategy", "stint", "lap"],
    defaultConfig: {
      params: { drivers: ["44", "16"], sessionType: "R", stintStart: 1, stintEnd: 20 },
      dataSource: {
        table: "f1_data_library_DS.telemetry",
        columns: ["driver_number", "lap_number", "lap_time_sec"],
        filters: { season: 2026, event_name: "Australian Grand Prix" },
      },
    },
    component: TyreDegWidget,
  },
  {
    type: "gap",
    label: "Gap",
    description: "Live gap between two drivers with closing/opening trend.",
    defaultSize: "1x1",
    icon: "⏱",
    tags: ["gap", "position", "live", "battle"],
    defaultConfig: {
      params: { driverAhead: "4", driverBehind: "44", sessionType: "R" },
      dataSource: {
        table: "f1_data_library_DS.telemetry",
        columns: ["driver_number", "lap_number", "lap_time_sec"],
        filters: { season: 2026, event_name: "Australian Grand Prix" },
      },
    },
    component: GapWidget,
  },
  {
    type: "battery",
    label: "ERS Battery",
    description: "Inferred ERS battery level with deploy/harvest status.",
    defaultSize: "1x1",
    icon: "▮",
    tags: ["battery", "ers", "energy", "power", "2026"],
    defaultConfig: {
      params: { driver: "44", lapNumber: 22, sessionType: "R" },
      dataSource: {
        table: "f1_data_library_DS.telemetry",
        columns: ["driver_number", "distance", "speed", "throttle", "lap_number"],
        filters: { season: 2026, event_name: "Australian Grand Prix" },
      },
    },
    component: BatteryWidget,
  },
  {
    type: "head_to_head",
    label: "Head to Head",
    description: "Side-by-side driver comparison across multiple performance metrics.",
    defaultSize: "2x2",
    icon: "⚔",
    tags: ["comparison", "drivers", "stats", "battle"],
    defaultConfig: {
      params: {
        driver1: "44",
        driver2: "16",
        sessionType: "R",
        metrics: ["bestLap", "topSpeed", "avgSpeed", "consistency"],
      },
      dataSource: {
        table: "f1_data_library_DS.telemetry",
        columns: ["driver_number", "lap_number", "lap_time_sec", "speed"],
        filters: { season: 2026, event_name: "Australian Grand Prix" },
      },
    },
    component: HeadToHeadWidget,
  },
  {
    type: "agent",
    label: "Apex Agent",
    description: "Embedded AI race engineer chat. Ask questions about live data.",
    defaultSize: "1x2",
    icon: "A",
    tags: ["chat", "agent", "ai", "query"],
    defaultConfig: {
      params: {
        placeholder: "Ask about the race...",
        starterPrompts: [
          "Who has the fastest lap?",
          "Compare HAM vs LEC",
          "Tyre strategy breakdown",
        ],
      },
    },
    component: AgentWidget,
  },
];

// ── Search functions ───────────────────────────────────

export function getWidgetByType(type: string): WidgetRegistryEntry | undefined {
  return WIDGET_REGISTRY.find((w) => w.type === type);
}

export function searchWidgets(query: string): WidgetRegistryEntry[] {
  const q = query.toLowerCase();
  return WIDGET_REGISTRY.filter(
    (w) =>
      w.type.includes(q) ||
      w.label.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q) ||
      w.tags.some((t) => t.includes(q))
  );
}

export function searchByTable(table: string): WidgetRegistryEntry[] {
  return WIDGET_REGISTRY.filter(
    (w) => w.defaultConfig.dataSource?.table === table
  );
}

export function searchByColumn(column: string): WidgetRegistryEntry[] {
  return WIDGET_REGISTRY.filter((w) =>
    w.defaultConfig.dataSource?.columns?.includes(column)
  );
}

export function searchByTag(tag: string): WidgetRegistryEntry[] {
  return WIDGET_REGISTRY.filter((w) => w.tags.includes(tag.toLowerCase()));
}
