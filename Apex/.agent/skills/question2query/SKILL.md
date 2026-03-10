---
name: question2query
description: "Breaks down a user's natural language F1 prompt into its core graph components (Nodes/Entities and Relationships/Edges) before querying datasets."
---

# question2query Skill

## Instructions

When the user asks an F1-related question, your first step is to use this skill to extract the key graph components (Nodes and Relationships) of the query.

### Step 1: Component Extraction

Analyze the user's prompt and extract the **Nodes (Entities)** and **Relationships (Edges)**.

**Example input:**
> "What was Lewis's fastest lap in Australia?"

#### Nodes (Entities)
Nodes represent the "things" in your data. For the above sentence, you should extract:
- **Driver**: A node representing "Lewis Hamilton."
- **Lap**: A node representing the specific "Fastest Lap" instance (likely containing the time as a property).
- **Grand Prix**: A node representing the event "Australian Grand Prix."
- **Circuit**: A node for "Albert Park" (the venue in Australia).
- **Year/Season**: A node for a specific year (e.g., "2024" or "2026") to provide temporal context.
- **Formula 1**: Contextual root node.

#### Relationships (Edges)
Relationships define how the nodes connect. These are directional and often labelled with verbs or possessives:
- `(:Driver)-[:SET]->(:Lap)`: Connects Lewis to the lap he drove.
- `(:Lap)-[:RECORDED_AT]->(:Grand Prix)`: Contextualizes which race the lap happened in.
- `(:Grand Prix)-[:HELD_AT]->(:Circuit)`: Connects the race to the physical location in Australia.
- `(:Grand Prix)-[:IN_SEASON]->(:Season)`: Specifies the year of the race.

### Step 2: Output Formatting & Logging
Format the parsed information as a structured JSON object. 

The JSON should contain the original question and its associated metadata. The `conceptual_graph` should be one of the metadata properties, formatted as an array of edges.

**JSON Schema Example:**
```json
{
  "question": "What was Lewis's fastest lap in Australia?",
  "metadata": {
    "timestamp": "2026-03-10T12:00:00Z",
    "entities_extracted": ["Lewis Hamilton", "Fastest Lap", "Australian GP", "Melbourne"],
    "conceptual_graph": [
      {
        "source_node": {"label": "Driver", "property": {"name": "Lewis Hamilton"}},
        "relationship": "SET",
        "target_node": {"label": "Lap"}
      },
      {
        "source_node": {"label": "Lap", "property": {"time": "1:18.771"}},
        "relationship": "RECORDED_AT",
        "target_node": {"label": "Grand Prix"}
      },
      {
        "source_node": {"label": "Grand Prix", "property": {"name": "Australian GP"}},
        "relationship": "HELD_AT",
        "target_node": {"label": "Circuit"}
      },
      {
        "source_node": {"label": "Circuit", "property": {"location": "Melbourne"}},
        "relationship": "PART_OF",
        "target_node": {"label": "Country", "property": {"name": "Australia"}}
      }
    ]
  }
}
```

### Step 3: Save to Logs
Once the JSON is generated, you must save it to a file in the `lib/logs/` directory. 
- The filename should be a timestamp or a sluggified version of the question (e.g., `lib/logs/2026-03-10-lewis-fastest-lap-australia.json`).
- If the `lib/logs/` directory does not exist, you must create it.
- **Provide the absolute or relative path to the saved file as your final output.**
