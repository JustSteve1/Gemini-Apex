// .agent/skills/widgets/blocks.ts
// Pre-defined block templates for the Widget Builder.
// Each block defines a natural language template with typed, modular slots.
// The assembled sentence is sent to Gemini which generates a WidgetConfig.

export interface SlotOption {
  label: string;
  value: string;
}

export interface BlockSlot {
  id: string;
  label: string;
  type: "select" | "number" | "text";
  options?: SlotOption[];
  defaultValue: string;
}

export interface BlockDefinition {
  id: string;
  category: "comparison" | "telemetry" | "strategy" | "battle";
  label: string;
  description: string;
  /** Template with {slotId} placeholders */
  template: string;
  slots: BlockSlot[];
  /** Builds the natural language sentence sent to Gemini */
  buildSentence: (values: Record<string, string>) => string;
  /** Hint for Gemini on what widget type to produce */
  suggestedType: string;
  suggestedSize: "1x1" | "2x1" | "1x2" | "2x2";
}

// ── Shared option sets ──────────────────────────────────

const DRIVERS: SlotOption[] = [
  { label: "Hamilton", value: "44" },
  { label: "Verstappen", value: "1" },
  { label: "Norris", value: "4" },
  { label: "Leclerc", value: "16" },
  { label: "Piastri", value: "81" },
  { label: "Russell", value: "63" },
  { label: "Sainz", value: "55" },
  { label: "Alonso", value: "14" },
  { label: "Stroll", value: "18" },
  { label: "Perez", value: "11" },
  { label: "Gasly", value: "10" },
  { label: "Ocon", value: "31" },
];

const DRIVER_NAMES: Record<string, string> = {
  "44": "Hamilton", "1": "Verstappen", "4": "Norris", "16": "Leclerc",
  "81": "Piastri", "63": "Russell", "55": "Sainz", "14": "Alonso",
  "18": "Stroll", "11": "Perez", "10": "Gasly", "31": "Ocon",
};

const SESSION_TYPES: SlotOption[] = [
  { label: "Race", value: "R" },
  { label: "Qualifying", value: "Q" },
  { label: "Practice 1", value: "FP1" },
  { label: "Practice 2", value: "FP2" },
  { label: "Practice 3", value: "FP3" },
];

const PERF_METRICS: SlotOption[] = [
  { label: "Lap Time", value: "lap_time" },
  { label: "Top Speed", value: "top_speed" },
  { label: "Average Speed", value: "avg_speed" },
  { label: "Consistency (σ)", value: "consistency" },
  { label: "Sector 1", value: "sector_1" },
  { label: "Sector 2", value: "sector_2" },
  { label: "Sector 3", value: "sector_3" },
];

const STINT_LENGTHS: SlotOption[] = [
  { label: "5 laps", value: "5" },
  { label: "10 laps", value: "10" },
  { label: "15 laps", value: "15" },
  { label: "20 laps", value: "20" },
  { label: "Full stint", value: "30" },
];

// ── Block registry ──────────────────────────────────────

export const BLOCK_REGISTRY: BlockDefinition[] = [
  {
    id: "head_to_head",
    category: "comparison",
    label: "Head to Head",
    description: "Side-by-side stat comparison between two drivers",
    template: "Compare {metric} for {driver1} and {driver2} in {session}",
    suggestedType: "head_to_head",
    suggestedSize: "2x2",
    slots: [
      {
        id: "metric",
        label: "Metric",
        type: "select",
        options: PERF_METRICS,
        defaultValue: "lap_time",
      },
      {
        id: "driver1",
        label: "Driver A",
        type: "select",
        options: DRIVERS,
        defaultValue: "44",
      },
      {
        id: "driver2",
        label: "Driver B",
        type: "select",
        options: DRIVERS,
        defaultValue: "16",
      },
      {
        id: "session",
        label: "Session",
        type: "select",
        options: SESSION_TYPES,
        defaultValue: "R",
      },
    ],
    buildSentence: (v) =>
      `Compare ${PERF_METRICS.find((m) => m.value === v.metric)?.label ?? v.metric} performance for ${DRIVER_NAMES[v.driver1] ?? v.driver1} and ${DRIVER_NAMES[v.driver2] ?? v.driver2} in the ${SESSION_TYPES.find((s) => s.value === v.session)?.label ?? v.session}`,
  },

  {
    id: "speed_trace_compare",
    category: "telemetry",
    label: "Speed Trace",
    description: "Overlay speed traces for two drivers on the same lap",
    template: "Show speed trace for {driver1} vs {driver2} on lap {lap} in {session}",
    suggestedType: "speed_trace",
    suggestedSize: "2x1",
    slots: [
      {
        id: "driver1",
        label: "Driver A",
        type: "select",
        options: DRIVERS,
        defaultValue: "44",
      },
      {
        id: "driver2",
        label: "Driver B",
        type: "select",
        options: DRIVERS,
        defaultValue: "4",
      },
      {
        id: "lap",
        label: "Lap Number",
        type: "select",
        options: Array.from({ length: 20 }, (_, i) => ({
          label: `Lap ${i + 1}`,
          value: `${i + 1}`,
        })),
        defaultValue: "10",
      },
      {
        id: "session",
        label: "Session",
        type: "select",
        options: SESSION_TYPES,
        defaultValue: "R",
      },
    ],
    buildSentence: (v) =>
      `Show speed trace overlay for ${DRIVER_NAMES[v.driver1] ?? v.driver1} vs ${DRIVER_NAMES[v.driver2] ?? v.driver2} on lap ${v.lap} in the ${SESSION_TYPES.find((s) => s.value === v.session)?.label ?? v.session}`,
  },

  {
    id: "tyre_deg_stint",
    category: "strategy",
    label: "Tyre Degradation",
    description: "Lap time degradation over a stint for one or two drivers",
    template: "Show tyre deg for {driver1} and {driver2} over {stint} in {session}",
    suggestedType: "tyre_deg",
    suggestedSize: "2x1",
    slots: [
      {
        id: "driver1",
        label: "Driver A",
        type: "select",
        options: DRIVERS,
        defaultValue: "44",
      },
      {
        id: "driver2",
        label: "Driver B",
        type: "select",
        options: DRIVERS,
        defaultValue: "16",
      },
      {
        id: "stint",
        label: "Stint Length",
        type: "select",
        options: STINT_LENGTHS,
        defaultValue: "20",
      },
      {
        id: "session",
        label: "Session",
        type: "select",
        options: SESSION_TYPES,
        defaultValue: "R",
      },
    ],
    buildSentence: (v) =>
      `Show tyre degradation for ${DRIVER_NAMES[v.driver1] ?? v.driver1} and ${DRIVER_NAMES[v.driver2] ?? v.driver2} over ${v.stint} laps in the ${SESSION_TYPES.find((s) => s.value === v.session)?.label ?? v.session}`,
  },

  {
    id: "battle_gap",
    category: "battle",
    label: "Gap Tracker",
    description: "Live gap between two drivers with closing/opening trend",
    template: "Track the gap between {driver1} and {driver2} in {session}",
    suggestedType: "gap",
    suggestedSize: "1x1",
    slots: [
      {
        id: "driver1",
        label: "Car Ahead",
        type: "select",
        options: DRIVERS,
        defaultValue: "4",
      },
      {
        id: "driver2",
        label: "Car Behind",
        type: "select",
        options: DRIVERS,
        defaultValue: "44",
      },
      {
        id: "session",
        label: "Session",
        type: "select",
        options: SESSION_TYPES,
        defaultValue: "R",
      },
    ],
    buildSentence: (v) =>
      `Track the gap between ${DRIVER_NAMES[v.driver1] ?? v.driver1} (ahead) and ${DRIVER_NAMES[v.driver2] ?? v.driver2} (behind) in the ${SESSION_TYPES.find((s) => s.value === v.session)?.label ?? v.session}`,
  },

  {
    id: "ers_battery",
    category: "telemetry",
    label: "ERS Battery",
    description: "Inferred ERS battery level and deploy/harvest status for a driver",
    template: "Show ERS battery status for {driver} on lap {lap} in {session}",
    suggestedType: "battery",
    suggestedSize: "1x1",
    slots: [
      {
        id: "driver",
        label: "Driver",
        type: "select",
        options: DRIVERS,
        defaultValue: "44",
      },
      {
        id: "lap",
        label: "Lap Number",
        type: "select",
        options: Array.from({ length: 20 }, (_, i) => ({
          label: `Lap ${i + 1}`,
          value: `${i + 1}`,
        })),
        defaultValue: "15",
      },
      {
        id: "session",
        label: "Session",
        type: "select",
        options: SESSION_TYPES,
        defaultValue: "R",
      },
    ],
    buildSentence: (v) =>
      `Show ERS battery level and deploy/harvest status for ${DRIVER_NAMES[v.driver] ?? v.driver} on lap ${v.lap} in the ${SESSION_TYPES.find((s) => s.value === v.session)?.label ?? v.session}`,
  },

  {
    id: "agent_custom",
    category: "comparison",
    label: "Ask the Agent",
    description: "Ask any question — Apex AI builds a widget from the answer",
    template: "Build a widget that shows {question}",
    suggestedType: "agent",
    suggestedSize: "1x2",
    slots: [
      {
        id: "question",
        label: "Your question",
        type: "text",
        defaultValue: "lap time delta between Hamilton and Norris",
      },
    ],
    buildSentence: (v) => `Build a widget that shows ${v.question}`,
  },
];

export function getBlockById(id: string): BlockDefinition | undefined {
  return BLOCK_REGISTRY.find((b) => b.id === id);
}

export function getBlocksByCategory(category: BlockDefinition["category"]): BlockDefinition[] {
  return BLOCK_REGISTRY.filter((b) => b.category === category);
}

export const CATEGORY_META: Record<
  BlockDefinition["category"],
  { label: string; color: string; glow: string }
> = {
  comparison: { label: "Comparison", color: "#E10600", glow: "rgba(225,6,0,0.3)" },
  telemetry:  { label: "Telemetry",  color: "#00BFFF", glow: "rgba(0,191,255,0.3)" },
  strategy:   { label: "Strategy",   color: "#F5A623", glow: "rgba(245,166,35,0.3)" },
  battle:     { label: "Battle",     color: "#FF6B35", glow: "rgba(255,107,53,0.3)" },
};
