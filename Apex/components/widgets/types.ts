// components/widgets/types.ts

export type WidgetSize = "1x1" | "2x1" | "1x2" | "2x2";

export interface WidgetDataSource {
  table: string;
  columns: string[];
  filters: Record<string, string | number>;
}

export interface WidgetConfig {
  id: string;
  type: string;
  size: WidgetSize;
  title: string;
  dataSource?: WidgetDataSource; // optional for non-data widgets like agent
  params: Record<string, any>;
  tags?: string[];
}

export interface WidgetRegistryEntry {
  type: string;
  label: string;
  description: string;
  defaultSize: WidgetSize;
  icon: string; // single character or emoji
  tags: string[];
  defaultConfig: Partial<WidgetConfig>;
  component: React.ComponentType<{ config: WidgetConfig }>;
}

// Grid sizing map
export const SIZE_CLASSES: Record<WidgetSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "2x1": "col-span-2 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x2": "col-span-2 row-span-2",
};
