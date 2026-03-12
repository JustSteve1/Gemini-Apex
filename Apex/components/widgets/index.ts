// components/widgets/index.ts
export { default as WidgetFrame } from "./WidgetFrame";
export { default as SpeedTraceWidget } from "./SpeedTraceWidget";
export { default as TyreDegWidget } from "./TyreDegWidget";
export { default as GapWidget } from "./GapWidget";
export { default as BatteryWidget } from "./BatteryWidget";
export { default as HeadToHeadWidget } from "./HeadToHeadWidget";
export { default as AgentWidget } from "./AgentWidget";

export {
  WIDGET_REGISTRY,
  getWidgetByType,
  searchWidgets,
  searchByTable,
  searchByColumn,
  searchByTag,
} from "./registry";

export type { WidgetConfig, WidgetSize, WidgetRegistryEntry, WidgetDataSource } from "./types";
export { SIZE_CLASSES } from "./types";
