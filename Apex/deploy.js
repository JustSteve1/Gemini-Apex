const fs = require('fs');
const { execSync } = require('child_process');

try {
    console.log("Reading environment variables...");
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};

    envFile.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const parts = line.split('=');
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            envVars[key] = val;
        }
    });

    console.log("Reading service account JSON...");
    const saJson = fs.readFileSync('f1-data-library-cef1fc2cbed4.json', 'utf8');
    envVars['GCP_SERVICE_ACCOUNT_KEY'] = saJson;

    console.log("Writing env_vars.yaml...");
    let yamlString = '';
    for (const [key, value] of Object.entries(envVars)) {
        // Escape single quotes if any
        const escapedVal = value.replace(/'/g, "''");
        yamlString += `${key}: '${escapedVal}'\n`;
    }

    fs.writeFileSync('env_vars.yaml', yamlString);

    console.log("Running gcloud run deploy...");
    const cmd = `gcloud run deploy apex-app --source . --region=europe-west1 --allow-unauthenticated --env-vars-file=env_vars.yaml --quiet`;

    // Inherit stdio so we can see the build logs
    execSync(cmd, { stdio: 'inherit' });

    console.log("Deployment finished successfully!");

    // Cleanup
    fs.unlinkSync('env_vars.yaml');
} catch (err) {
    console.error("Deployment failed:", err);
    process.exit(1);
}
