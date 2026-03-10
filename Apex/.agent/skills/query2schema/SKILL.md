---
name: query2schema
description: "Queries the BigQuery dataset f1_data_library_DS to extract table names and field definitions with daily caching."
---

# query2schema Skill

## Instructions

Whenever you need to verify or fetch the actual, live schema layout of the tables in the `f1_data_library_DS` BigQuery dataset, use this skill.

### Step 1: Run the Schema Fetcher Script
Execute the provided Node.js companion script to automatically handle fetching the exact table definitions and caching the results explicitly per day:

```bash
node .agent/skills/query2schema/scripts/fetch.js
```

### Step 2: Validate the Output
The script will return a strongly typed JSON response in the console. 

- **If successful:** It will map out `status: 200` alongside an object grouping all physical `tables`, containing arrays of `{ "name": "...", "type": "..." }` fields.
- **If cached:** If this has already been fetched today, `cached` will be `true`, saving a network request and returning instantly. 
- **If failing:** If there are no tables yet resulting from the data not being loaded, or authentication errors, it will print an error message. *Do not guess schemas if an error or empty schema is returned.* 

### Step 3: Utilize the Layout
Read the resulting JSON schema from the script output explicitly to discover exact table names, field names, and strict data types before attempting to write SQL querying logic. Avoid hallucinating table names that do not exist strictly inside the returned `schema` object.
