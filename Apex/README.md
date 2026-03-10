# APEX — AI Race Engineer

> Voice-powered live agent that turns your phone into an F1 command center.  
> Talk to live race data via Gemini, get answers mid-race.

**Built for the [Gemini Live Agent Challenge](https://geminiliveagentchallenge.devpost.com/) 2026**

---

## Architecture

```
User Question (text / voice)
        ↓
┌─────────────────────────────┐
│  Next.js API Route          │
│  POST /api/agent            │
│                             │
│  ┌───────────────────────┐  │
│  │ Gemini 2.5 Flash      │  │
│  │ (generate SQL)        │  │
│  └──────────┬────────────┘  │
│             ↓               │
│  ┌───────────────────────┐  │
│  │ BigQuery              │  │
│  │ (execute query)       │  │
│  └──────────┬────────────┘  │
│             ↓               │
│  ┌───────────────────────┐  │
│  │ Gemini 2.5 Flash      │  │
│  │ (interpret results)   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
        ↓
Conversational Answer + SQL transparency
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15 + React 19 + Tailwind CSS |
| Agent Brain | Gemini 2.5 Flash (Google GenAI SDK) |
| Data Layer | BigQuery (10Hz F1 telemetry) |
| Deployment | Cloud Run (Docker) |
| Data Pipeline | FastF1 → BigQuery (Colab notebooks) |

---

## Quick Start (Local Dev)

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A Google Cloud project with BigQuery
- F1 telemetry data loaded in BigQuery (via the data pipeline)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/Apex.git
cd Apex
pnpm install
```

### 2. Get your API keys

**Gemini API Key:**
1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create a new API key
3. Copy it

**BigQuery Service Account:**
1. Go to [GCP Console → IAM → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Create a service account (or use existing)
3. Grant it the `BigQuery Data Viewer` and `BigQuery Job User` roles
4. Create a JSON key and download it

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
GOOGLE_GENAI_API_KEY=your-gemini-key-here
GCP_PROJECT_ID=your-gcp-project-id
BQ_DATASET=f1_telemetry
GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-key.json
```

### 4. Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → click **Launch Agent** → start asking questions.

---

## Deploy to GitHub

### First time setup

```bash
cd Apex

# Initialise git
git init
git add .
git commit -m "feat: Apex v1 — AI race engineer with Gemini + BigQuery"

# Create repo on GitHub (using gh CLI or manually)
gh repo create Apex --public --source=. --remote=origin

# Push
git push -u origin main
```

### Or manually

1. Go to [github.com/new](https://github.com/new)
2. Create a repo called `Apex` (public)
3. Run:
```bash
git init
git add .
git commit -m "feat: Apex v1 — AI race engineer with Gemini + BigQuery"
git remote add origin https://github.com/YOUR_USERNAME/Apex.git
git branch -M main
git push -u origin main
```

---

## Deploy to Google Cloud Run

This satisfies the hackathon requirement: *"Agents must be hosted on Google Cloud"*

### Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- Docker installed (or use Cloud Build)

### Option A: Deploy with Cloud Build (recommended)

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  bigquery.googleapis.com

# Create Artifact Registry repo (one time)
gcloud artifacts repositories create apex \
  --repository-format=docker \
  --location=us-central1

# Build and deploy in one command
gcloud run deploy apex \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_GENAI_API_KEY=your-key,GCP_PROJECT_ID=your-project,BQ_DATASET=f1_telemetry,BQ_LOCATION=US" \
  --memory 512Mi \
  --cpu 1 \
  --port 8080
```

### Option B: Build locally and push

```bash
# Build Docker image
docker build -t apex .

# Tag for Artifact Registry
docker tag apex us-central1-docker.pkg.dev/YOUR_PROJECT_ID/apex/apex:latest

# Push
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/apex/apex:latest

# Deploy to Cloud Run
gcloud run deploy apex \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/apex/apex:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_GENAI_API_KEY=your-key,GCP_PROJECT_ID=your-project,BQ_DATASET=f1_telemetry" \
  --port 8080
```

### Using Secrets (production)

For production, store sensitive values as secrets:

```bash
# Create secrets
echo -n "your-gemini-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n '{"type":"service_account",...}' | gcloud secrets create bq-service-account --data-file=-

# Deploy with secrets
gcloud run deploy apex \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/apex/apex:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets "GOOGLE_GENAI_API_KEY=gemini-api-key:latest,GCP_SERVICE_ACCOUNT_KEY=bq-service-account:latest" \
  --set-env-vars "GCP_PROJECT_ID=your-project,BQ_DATASET=f1_telemetry" \
  --port 8080
```

---

## Project Structure

```
Apex/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── agent/
│   │   └── page.tsx            # Agent chat page
│   └── api/
│       └── agent/
│           └── route.ts        # Agent API (Gemini + BigQuery)
├── components/
│   └── agents/
│       └── google/
│           ├── ApexAgent.tsx    # Chat UI
│           ├── AgentMessage.tsx # Message bubbles
│           ├── types.ts        # Shared types
│           └── index.ts        # Barrel export
├── lib/
│   ├── gemini.ts               # Gemini client (Google GenAI SDK)
│   ├── bigquery.ts             # BigQuery client + query executor
│   └── schema.ts               # Table schemas + system prompt
├── public/                     # Static assets
├── Dockerfile                  # Cloud Run deployment
├── .env.example                # Environment template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts              # standalone output for Docker
```

---

## BigQuery Schema

The agent can query 5 tables in your `f1_telemetry` dataset:

| Table | Description | Scale |
|-------|-------------|-------|
| `telemetry` | 10Hz raw data (speed, throttle, brake, XYZ coords) | ~1.4M rows/race |
| `laps` | Lap times, sectors, tyres, positions | ~5k rows/race |
| `sessions` | Session metadata, weather, temps | ~5 rows/race |
| `corner_markers` | Geometric corner definitions per circuit | ~14 rows/track |
| `corner_telemetry_sequences` | ML-ready corner measurements (7 points/corner) | ~270k rows/race |

See `lib/schema.ts` for full column definitions.

---

## Customisation

### Change the dataset name
Edit `BQ_DATASET` in `.env.local` (or the Cloud Run env var).

### Add new tables
Update `lib/schema.ts` — add the table definition to `TABLE_SCHEMAS`. Gemini will automatically start generating SQL for it.

### Add Neo4j (knowledge graph)
The architecture is ready for it:
1. Add a Neo4j client in `lib/neo4j.ts`
2. In the API route, add routing logic: relational queries → Neo4j, data queries → BigQuery
3. Update the system prompt in `lib/schema.ts`

### Add voice (Gemini Live API)
This text agent is the foundation for the voice layer:
1. Add Gemini Live API streaming in a new API route
2. The same schema/prompt system works for voice
3. Add a microphone button to the chat UI

---

## Hackathon Checklist

- [x] Uses Gemini model (Gemini 2.5 Flash)
- [x] Built with Google GenAI SDK
- [x] Uses Google Cloud service (BigQuery)
- [x] Backend hosted on Google Cloud (Cloud Run)
- [ ] Demo video (<4 min)
- [ ] Architecture diagram
- [ ] Proof of GCP deployment (console screenshot)
- [ ] Public code repository

---

## License

MIT
