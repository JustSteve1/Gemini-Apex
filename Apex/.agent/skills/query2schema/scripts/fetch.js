const { BigQuery } = require("@google-cloud/bigquery");
const fs = require("fs");
const path = require("path");

async function fetchSchema() {
    const logDir = path.join(process.cwd(), "lib", "logs");
    const cacheFile = path.join(logDir, "schema_cache.json");

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check cache
    if (fs.existsSync(cacheFile)) {
        try {
            const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
            if (cacheData.last_updated === today) {
                console.log(JSON.stringify({
                    status: 200,
                    cached: true,
                    schema: cacheData.schema
                }, null, 2));
                return;
            }
        } catch (e) {
            console.warn("Failed to read cache, fetching fresh schema...", e.message);
        }
    }

    // Fetch fresh schema
    try {
        const projectId = process.env.GCP_PROJECT_ID || "f1-data-library";
        const datasetId = process.env.BQ_DATASET || "f1_data_library_DS";
        const location = process.env.BQ_LOCATION || "EU";

        const credentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        // Explicitly configure if local, else use default
        const options = { projectId };
        if (credentialsFile && fs.existsSync(credentialsFile)) {
            options.keyFilename = credentialsFile;
        }

        const bq = new BigQuery(options);

        // Query INFORMATION_SCHEMA for all tables in the dataset
        const query = `
      SELECT table_name, column_name, data_type 
      FROM \`${projectId}.${datasetId}.INFORMATION_SCHEMA.COLUMNS\`
    `;

        const [rows] = await bq.query({ query, location });

        // Format into hierarchical schema
        const schema = {};
        for (const row of rows) {
            const t = row.table_name;
            if (!schema[t]) schema[t] = [];
            schema[t].push({ name: row.column_name, type: row.data_type });
        }

        // Save strictly to cache
        const newCache = {
            last_updated: today,
            schema: schema
        };
        fs.writeFileSync(cacheFile, JSON.stringify(newCache, null, 2));

        console.log(JSON.stringify({
            status: 200,
            cached: false,
            schema: schema
        }, null, 2));

    } catch (err) {
        console.error(JSON.stringify({
            status: 500,
            error: err.message
        }, null, 2));
        process.exit(1);
    }
}

fetchSchema();
