#!/bin/bash
set -e

echo "deploying to Google Cloud Run..."

# Read the Service Account JSON
SA_JSON=$(cat f1-data-library-cef1fc2cbed4.json | tr -d '\n')

# Load env variables
source .env.local

# Construct env_vars.yaml
cat <<EOF > env_vars.yaml
GOOGLE_GENAI_API_KEY: "${GOOGLE_GENAI_API_KEY}"
GCP_PROJECT_ID: "${GCP_PROJECT_ID}"
BQ_DATASET: "${BQ_DATASET}"
BQ_LOCATION: "${BQ_LOCATION}"
GCP_SERVICE_ACCOUNT_KEY: '${SA_JSON}'
EOF

gcloud run deploy apex-app \
  --source . \
  --region=europe-west1 \
  --allow-unauthenticated \
  --env-vars-file=env_vars.yaml

# Clean up
rm env_vars.yaml

echo "Deployment finished!"
