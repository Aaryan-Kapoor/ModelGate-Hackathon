# ModelGate — Contract-Aware AI Control Plane

ModelGate automates the path from **customer contract to deployed AI endpoint**. Instead of manually reading contracts, choosing models, and wiring up customer-specific AI behavior by hand, ModelGate ingests customer documents, extracts SLA/privacy/routing constraints, builds a customer AI profile, and generates an OpenAI-compatible endpoint for that customer.

At runtime, each request is classified by complexity and routed to the optimal model — so AI services are faster to onboard, more compliant, and more operationally efficient.

## How It Works

1. **Upload** a customer contract (SLA, privacy docs, compliance requirements)
2. **Extract** — an AI agent analyzes the contract and produces a structured customer profile (region restrictions, allowed providers, latency targets, cost sensitivity)
3. **Route** — each user request is classified by a local 1.5B routing model (Arch Router) and sent to the best model matching the customer's contract constraints
4. **Monitor** — a dashboard shows routing decisions, cost savings, and per-request explanations

## Architecture

```
[Browser Dashboard] → [Next.js :3000] → [FastAPI :8000] → [OpenRouter API]
                                               ↓
                                        [Arch Router 1.5B]
                                        (local GPU, FP16)
```

- **Backend**: Python FastAPI + SQLite
- **Frontend**: Next.js 14 + Tailwind CSS + shadcn/ui + Recharts
- **Classification**: Arch Router 1.5B (in-process, NVIDIA GPU)
- **LLM Inference**: OpenRouter (all providers via one API)

## Quick Start

### Prerequisites
- Python 3.12 with PyTorch + CUDA
- Node.js 18+
- NVIDIA GPU (for Arch Router classification model)
- OpenRouter API key

### Setup

```bash
# Clone and enter
git clone <repo-url>
cd ksu-sg-hackathon

# Add your API key
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY

# Run everything
chmod +x scripts/start.sh
./scripts/start.sh
```

Or manually:

```bash
# Backend
python3.12 -m venv backend/venv --system-site-packages
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python scripts/seed_data.py
uvicorn backend.main:app --port 8000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

### Access
- Dashboard: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Proxy endpoint: `POST http://localhost:8000/v1/{customer_id}/chat/completions`

## Demo Flow

1. Open the dashboard and see existing customer profiles
2. Click "New Customer" and upload a contract document
3. See the AI-extracted profile with constraints, routing preferences, and warnings
4. Open the Playground and send prompts of varying complexity
5. Watch as simple queries route to cheap/fast models and complex queries route to powerful models
6. View the logs page with charts showing model distribution and cost savings

## Team

- Aaryan (Lead)
- Pradyu
- Danny

Built for the KSU Social Good Hackathon 2026 — Assurant Track
