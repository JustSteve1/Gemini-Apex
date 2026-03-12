---
name: widgets
description: "Configuration skill for dashboard widgets. Maps every widget type to its required BigQuery table, columns, config parameters, and display rules. Used by the agent when creating widgets and by UGC creators when building new ones."
---

# widgets Skill

## Instructions

When creating, configuring, or validating a dashboard widget, you MUST follow the rules below to ensure every config parameter maps to the correct BigQuery table and column. Every widget MUST declare its data source explicitly — no widget should render without a verified data binding.

### Rule 1: Widget Config Structure

Every widget MUST have a config object with these required fields:

```typescript
{
  id: string;           // unique widget ID (uuid)
  type: string;         // widget type key from the registry
  size: "1x1" | "2x1" | "1x2" | "2x2";  // grid size
  title: string;        // display title
  dataSource: {
    table: string;      // fully qualified BigQuery table
    columns: string[];  // exact column names to SELECT
    filters: Record<string, string | number>;  // WHERE clauses
  };
  params: Record<string, any>;  // widget-specific parameters
}
```

The `dataSource` block is the contract between the widget and BigQuery. If the agent generates a widget config, the `dataSource.columns` MUST match real columns in `dataSource.table`. Verify against the live schema before generating.

### Rule 2: Widget Type — speed_trace

Displays a speed trace overlay comparing one or more drivers across a lap.

**Size:** `2x1`

**Data Source:**
- **Table:** `f1_data_library_DS.telemetry`
- **Required columns:** `driver_number`, `distance`, `speed`, `lap_number`
- **Required filters:** `season`, `event_name`, `session_type`, `lap_number`

**Config params:**
| Param | Type | Description |
|-------|------|-------------|
| drivers | string[] | Array of driver_numbers to compare (e.g. ["44", "16"]) |
| lapNumber | number | Specific lap to display |
| sessionType | string | Session: 'Q', 'R', 'FP1', 'FP2', 'FP3' |

**Query pattern:**
```sql
SELECT driver_number, distance, speed
FROM f1_data_library_DS.telemetry
WHERE season = {season}
  AND event_name = '{event_name}'
  AND session_type = '{sessionType}'
  AND lap_number = {lapNumber}
  AND driver_number IN ({drivers})
ORDER BY driver_number, distance
```

**Display rules:**
- X axis: distance (meters)
- Y axis: speed (km/h)
- One line per driver, coloured by team colour
- No fill, no gridlines, just lines on black

### Rule 3: Widget Type — tyre_deg

Displays lap time degradation over a stint, showing how tyre performance drops.

**Size:** `2x1`

**Data Source:**
- **Table:** `f1_data_library_DS.telemetry`
- **Required columns:** `driver_number`, `lap_number`, `lap_time_sec`
- **Required filters:** `season`, `event_name`, `session_type`

**Config params:**
| Param | Type | Description |
|-------|------|-------------|
| drivers | string[] | Driver numbers to track |
| sessionType | string | Session type |
| stintStart | number | First lap of stint |
| stintEnd | number | Last lap of stint |

**Query pattern:**
```sql
WITH LapDurations AS (
    SELECT driver_number, lap_number, MAX(lap_time_sec) AS lap_duration
    FROM f1_data_library_DS.telemetry
    WHERE season = {season}
      AND event_name = '{event_name}'
      AND session_type = '{sessionType}'
      AND lap_number BETWEEN {stintStart} AND {stintEnd}
      AND driver_number IN ({drivers})
    GROUP BY driver_number, lap_number
)
SELECT * FROM LapDurations ORDER BY driver_number, lap_number
```

CRITICAL: Follow Rule 2 from the `answerlogic` skill — `lap_time_sec` is a running timer. You MUST use `MAX(lap_time_sec)` grouped by `driver_number, lap_number` to get completed lap times.

**Display rules:**
- X axis: lap number
- Y axis: lap time (seconds) — INVERTED (lower = faster = top)
- One line per driver, team coloured
- Show linear regression trendline for deg rate

### Rule 4: Widget Type — gap

Displays the gap in seconds between two drivers (or to driver ahead).

**Size:** `1x1`

**Data Source:**
- **Table:** `f1_data_library_DS.telemetry`
- **Required columns:** `driver_number`, `lap_number`, `lap_time_sec`
- **Required filters:** `season`, `event_name`, `session_type`

**Config params:**
| Param | Type | Description |
|-------|------|-------------|
| driverAhead | string | Driver number of car ahead |
| driverBehind | string | Driver number of car behind |
| sessionType | string | Session type |

**Query pattern:**
```sql
WITH LapDurations AS (
    SELECT driver_number, lap_number, MAX(lap_time_sec) AS lap_duration
    FROM f1_data_library_DS.telemetry
    WHERE season = {season}
      AND event_name = '{event_name}'
      AND session_type = '{sessionType}'
      AND driver_number IN ({driverAhead}, {driverBehind})
    GROUP BY driver_number, lap_number
)
SELECT
    a.lap_number,
    a.lap_duration AS ahead_time,
    b.lap_duration AS behind_time,
    (b.lap_duration - a.lap_duration) AS gap_delta
FROM LapDurations a
JOIN LapDurations b ON a.lap_number = b.lap_number
WHERE a.driver_number = '{driverAhead}' AND b.driver_number = '{driverBehind}'
ORDER BY a.lap_number
```

**Display rules:**
- Large number centre: cumulative gap in seconds (e.g. "1.234")
- Trend indicator: arrow up (gap growing) or down (gap closing)
- Colour: white text, trend arrow green (closing) / red (growing)

### Rule 5: Widget Type — battery

Displays ERS battery level inferred from speed anomalies.

**Size:** `1x1`

**Data Source:**
- **Table:** `f1_data_library_DS.telemetry`
- **Required columns:** `driver_number`, `distance`, `speed`, `throttle`, `lap_number`
- **Required filters:** `season`, `event_name`, `session_type`, `driver_number`

**Config params:**
| Param | Type | Description |
|-------|------|-------------|
| driver | string | Single driver number |
| lapNumber | number | Lap to analyse |
| sessionType | string | Session type |

**Inference logic:**
Battery level is NOT directly available in the telemetry. It is inferred by detecting zones where `throttle = 100` but `speed` is anomalously higher or lower than the lap average at that distance. Higher = deploying. Lower = harvesting/clipping. The widget estimates a percentage based on cumulative deploy/harvest balance across the lap.

**Display rules:**
- Segmented battery bar (20 segments)
- Colour: white > 50%, amber 25-50%, red < 25%
- Status label: "DEPLOYING" or "HARVESTING"
- Show driver code and lap number

### Rule 6: Widget Type — head_to_head

Side-by-side comparison of two drivers across multiple metrics.

**Size:** `2x2`

**Data Source:**
- **Table:** `f1_data_library_DS.telemetry`
- **Required columns:** `driver_number`, `lap_number`, `lap_time_sec`, `speed`, `distance`
- **Required filters:** `season`, `event_name`, `session_type`
- **Join:** `f1_data_library_DS.driver_mapping_2026` for driver names

**Config params:**
| Param | Type | Description |
|-------|------|-------------|
| driver1 | string | First driver number |
| driver2 | string | Second driver number |
| sessionType | string | Session type |
| metrics | string[] | Which metrics to compare: "bestLap", "topSpeed", "avgSpeed", "consistency" |

**Query pattern:**
```sql
WITH LapDurations AS (
    SELECT driver_number, lap_number,
           MAX(lap_time_sec) AS lap_duration,
           MAX(speed) AS top_speed,
           AVG(speed) AS avg_speed
    FROM f1_data_library_DS.telemetry
    WHERE season = {season}
      AND event_name = '{event_name}'
      AND session_type = '{sessionType}'
      AND driver_number IN ('{driver1}', '{driver2}')
    GROUP BY driver_number, lap_number
),
DriverStats AS (
    SELECT driver_number,
           MIN(lap_duration) AS best_lap,
           MAX(top_speed) AS top_speed,
           AVG(avg_speed) AS avg_speed,
           STDDEV(lap_duration) AS consistency
    FROM LapDurations
    GROUP BY driver_number
)
SELECT ds.*, dm.name_acronym, dm.full_name
FROM DriverStats ds
JOIN f1_data_library_DS.driver_mapping_2026 dm
  ON TRIM(CAST(ds.driver_number AS STRING)) = TRIM(CAST(dm.driver_number AS STRING))
```

**Display rules:**
- Two columns, one per driver
- Driver code and team colour at top
- Each metric as a horizontal bar — winner's bar is longer
- Values in monospace, white
- Metric labels in grey

### Rule 7: Widget Type — agent (Chat Tile)

Embeds the Apex race engineer chat into the dashboard grid.

**Size:** `1x2`

**Data Source:** None — this widget calls the `/api/agent` route, not BigQuery directly.

**Config params:**
| Param | Type | Description |
|-------|------|-------------|
| placeholder | string | Input placeholder text |
| starterPrompts | string[] | Quick-tap questions shown on empty state |

**Display rules:**
- Messages scroll vertically within the widget
- Input at bottom with send button
- Apex "A" avatar on assistant messages
- User messages right-aligned, assistant left-aligned
- Monospace for data in responses, sans-serif for text

### Rule 8: Driver Name Resolution

When displaying driver names or codes in ANY widget, you MUST join `f1_data_library_DS.driver_mapping_2026` using:
```sql
JOIN f1_data_library_DS.driver_mapping_2026 AS dm
  ON TRIM(CAST(t.driver_number AS STRING)) = TRIM(CAST(dm.driver_number AS STRING))
```
Use `dm.name_acronym` for the 3-letter code. Use `dm.full_name` for the full name. Never hardcode driver names.

### Rule 9: Team Colours

Widgets MUST use official team colours for driver-related data. Colours are resolved from driver_number → team via the `driver_mapping_2026` table or the client-side `lib/drivers.ts` constants.

The ONLY colour in the widget system is team colour. Everything else is black (#000000), white (#FFFFFF), or grey (#888888). No accent colours, no gradients, no decoration.

### Rule 10: UGC Widget Submissions

User-generated widgets MUST include:
1. A valid config object following the structure in Rule 1
2. A React component that accepts `{ config: WidgetConfig }` as props
3. A `dataSource` block with verified table and column names
4. A README.md describing what the widget does and its config params

UGC widgets are registered in the widget registry and are searchable by:
- `type` (widget type key)
- `dataSource.table` (which table it queries)
- `dataSource.columns` (which columns it needs)
- `params` keys (what's configurable)
- `tags` (freeform labels like "strategy", "speed", "comparison")

### Rule 11: Default Filters

If no `season`, `event_name`, or `session_type` is specified in a widget config, apply the same defaults as the `answerlogic` skill:
- `season = 2026`
- `event_name = 'Australian Grand Prix'`
- `session_type = 'R'` (race)

### Rule 12: Data Scan Limits

All widget queries MUST follow the same data scan constraints as `answerlogic`:
- NEVER use `SELECT *`
- Only select the exact columns listed in `dataSource.columns`
- Always include `season` and `event_name` in WHERE clauses
- Maximum 1GB scan per query — keep queries tight
