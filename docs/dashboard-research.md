# ModelGate Dashboard Research
## Enterprise AI/LLM Observability — Deep Research Report

*Researched March 2026 for the KSU Social Good Hackathon — Assurant Track*

---

## Table of Contents

1. [Platforms Surveyed](#1-platforms-surveyed)
2. [Complete Metrics Inventory](#2-complete-metrics-inventory)
3. [Dashboard Page Structure](#3-dashboard-page-structure)
4. [Visual Component Patterns](#4-visual-component-patterns)
5. [Enterprise Feature Inventory](#5-enterprise-feature-inventory)
6. [ModelGate-Specific Design](#6-modelgate-specific-design)
7. [Model Registry and Global Config Flow](#7-model-registry-and-global-config-flow)
8. [Per-Request Trace View](#8-per-request-trace-view)
9. [Contract Compliance Visualization](#9-contract-compliance-visualization)
10. [Cost Savings Visualization](#10-cost-savings-visualization)
11. [Recommended Page List for ModelGate](#11-recommended-page-list-for-modelgate)
12. [Implementation Priority](#12-implementation-priority)

---

## 1. Platforms Surveyed

Research covered seven leading enterprise LLM observability and AI gateway platforms:

### 1.1 Helicone (YC W23)
- Open-source LLM observability platform + AI gateway
- Tracks cost, latency, TTFT, token usage, model distribution, user-level metrics
- Sessions view with Tree/Chat/Span visualization for multi-step agent flows
- Supports Slack/email alerts via threshold-based watchlists
- Properties page for "unit economics" (e.g., cost per conversation)
- Collapsible sidebar, filter-first UX

### 1.2 LangSmith (LangChain)
- LLM application monitoring platform focused on traces and evaluations
- Two dashboard types: prebuilt (auto-generated per project) + custom (configurable)
- Prebuilt dashboards cover: trace count, error rates, token usage, latency (P50/P99), feedback scores, TTFT
- Trace = full end-to-end execution; Run = each significant operation within a trace
- Webhooks / PagerDuty alerting when metrics cross thresholds
- Timeline view for debugging latency issues across chain steps

### 1.3 Portkey AI Gateway
- Production AI gateway with full-stack observability
- 40+ metrics tracked per request, 15+ filter dimensions
- Overview tab: cost, tokens used, mean latency, request count, top users, top models
- Monitors: requests, costs, latencies, tokens, user activity, feedback, cache hits, errors
- OpenTelemetry-compliant tracing
- Recognized as Gartner Cool Vendor in LLM Observability (2025)
- Unified Trace View covering gateway → retrieval → model → guardrails

### 1.4 LiteLLM Proxy
- Open-source AI gateway with admin dashboard UI (Next.js 14, App Router)
- Dashboard at `/ui` endpoint or deployed separately
- Pages: Keys, Usage, Models, Model Compare Playground, Endpoint Activity, Customer Usage
- Metrics: total tokens (input/output), token usage over time, total error rate, P95 latency over time, model distribution
- Virtual keys with per-key budgets, rate limits, model access controls
- Project management: groups of keys with shared budget/permissions
- Customer-level spend tracking via customer ID passed in API requests
- Model Compare Playground: side-by-side comparison of up to 3 models simultaneously

### 1.5 Datadog LLM Observability
- Enterprise-grade observability platform with LLM-specific module
- Trace-based: each request = one trace; traces contain typed spans
- Span types: LLM, workflow, agent, task, tool, embedding, retrieval
- Cost view: Total Cost, Cost Change, Total Tokens, Token Change; breakdowns by token type, provider/model, prompt version
- TTFT tracked via vLLM integration out-of-the-box dashboard
- Metrics calculated on 100% of traffic (not sampled)
- Querying spans via search with keyword filters

### 1.6 Weights & Biases (W&B Weave)
- Extends ML experiment tracking to LLM monitoring via W&B Weave
- Auto-tracks every LLM call: inputs, outputs, costs, latency, evaluation metrics
- Production monitoring service with real-time metrics and flexible dynamic querying
- Integrates with Amazon Bedrock AgentCore
- Dashboard surfaces costs, latency, and usage patterns without manual config

### 1.7 Langfuse (YC W23, Open Source)
- Open-source LLM engineering platform
- Pages: Traces, Sessions, Timeline, Users, Agent Graphs, Dashboard, Metrics
- Cost and latency broken down by user, session, geography, feature, model, prompt version
- Agent workflows visualized as graphs
- Metrics API for programmatic access
- Customizable dashboard with slicing across any dimension

---

## 2. Complete Metrics Inventory

This is the full set of metrics tracked across all surveyed platforms. Grouped by category.

### 2.1 Latency Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **TTFT** (Time to First Token) | Time from request arrival to first output token | Critical for interactive chatbots; user-perceived responsiveness |
| **E2E Latency** | Full request duration from submission to final token | Total user wait time |
| **TPOT** (Time Per Output Token) | Average time between tokens after the first | Streaming UX quality |
| **Prefill Time** | Time spent processing the input prompt | Input-dependent latency component |
| **Decode Time** | Time spent generating output tokens | Output-dependent latency component |
| **P50 Latency** | Median latency across requests | Typical user experience |
| **P95 Latency** | 95th percentile latency | Near-worst-case performance |
| **P99 Latency** | 99th percentile latency | Tail latency; SLA compliance |
| **Embedding Latency** | Time for vector embedding calls | RAG pipeline performance |
| **Tool Call Latency** | Time spent in tool/function calls | Agent pipeline breakdowns |

### 2.2 Throughput Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **TPS** (Tokens Per Second) | Total output tokens generated per second | System capacity |
| **Goodput** | Requests per second meeting SLO requirements | Effective throughput under SLA |
| **Requests Per Minute (RPM)** | Incoming request rate | Load monitoring |
| **Concurrent Requests** | Active in-flight requests at any moment | Capacity planning |

### 2.3 Token Usage Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Input Tokens / Request** | Prompt tokens sent to the model | Cost driver (charged by provider) |
| **Output Tokens / Request** | Response tokens generated | Cost driver |
| **Total Tokens / Request** | Input + output | Full request size |
| **Token Usage Over Time** | Aggregate tokens by hour/day/week | Growth trends |
| **Tokens by Model** | Token breakdown per model | Model-specific usage |
| **Tokens by Customer** | Token breakdown per customer | Per-tenant billing |
| **Tokens by Feature/Tag** | Token breakdown by custom property | Product feature attribution |

### 2.4 Cost Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Cost Per Request** | USD cost for a single API call | Unit economics |
| **Cost Per User** | Total spend attributed to a user | Per-user economics |
| **Cost Per Customer/Tenant** | Total spend per customer account | Customer profitability |
| **Cost Per Feature** | Spend attributed to a product feature | ROI analysis |
| **Cost Over Time** | Spend by hour/day/week/month | Budget tracking |
| **Cost By Model** | Spend broken down by model used | Model cost comparison |
| **Cost By Provider** | Spend broken down by provider | Provider cost comparison |
| **Estimated vs Actual Cost** | Projected vs real spend | Budget forecasting |
| **Cost Change (delta)** | Percentage change from prior period | Trend alerting |
| **Cost Savings from Routing** | $ saved vs naive single-model usage | Routing ROI |

### 2.5 Reliability Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Error Rate** | Percentage of failed requests | System health |
| **Error Rate By Model** | Error rate segmented per model | Model reliability comparison |
| **Error Count Over Time** | Absolute error counts in time series | Incident detection |
| **Timeout Rate** | Requests that exceeded time limit | SLA violations |
| **Rate Limit Hits** | Provider rate limit error frequency | Capacity/throttling issues |
| **Retry Rate** | % of requests requiring retry | Hidden latency cost |
| **Fallback Rate** | % of requests routed to backup model | Primary model health |
| **Provider Availability** | Uptime status per provider | Dependency health |

### 2.6 Request Quality Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Finish Reason Distribution** | stop / length / content_filter / tool_calls | Response completeness |
| **Guardrail Trigger Rate** | % of requests hitting safety guardrails | Safety compliance |
| **Cache Hit Rate** | % of requests served from prompt cache | Cost efficiency |
| **Hallucination Risk Score** | Model-evaluated hallucination probability | Output quality |
| **Toxicity Rate** | % of outputs flagged as toxic | Safety monitoring |
| **User Feedback Score** | Thumbs up/down or rating from users | Human quality signal |
| **Evaluation Score** | LLM-as-judge automated eval score | Automated quality |

### 2.7 ModelGate-Specific Routing Metrics

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Routing Decision Distribution** | % of requests going to each model | Load visibility |
| **Contract Compliance Rate** | % of requests honoring all contract rules | SLA adherence |
| **Region Compliance Rate** | % of requests staying in contracted region | Data residency |
| **Routing Rule Hit Rate** | Which contract rules triggered most often | Configuration validation |
| **Complexity Classification Distribution** | Simple / Medium / Complex request breakdown | Understanding traffic |
| **Model Upgrade Rate** | % of requests escalated to premium model | Quality routing |
| **Model Downgrade Rate** | % of requests routed to cheaper model | Cost optimization |
| **SLA Breach Count** | Requests that violated latency SLA | Critical alert |
| **Budget Utilization** | Current spend vs. customer budget limit | Budget management |
| **Cost Savings vs. Baseline** | $ saved vs. always-use-premium routing | Routing value |

---

## 3. Dashboard Page Structure

Based on research across all platforms, here is the standard information hierarchy used by leading enterprise LLM dashboards, adapted for ModelGate.

### 3.1 Standard Navigation Structure

Enterprise dashboards use a **left-sidebar navigation** with top-level sections:

```
[Logo / Brand]
─────────────
Overview (Home)
─────────────
OBSERVE
  Requests (Live Feed)
  Traces
  Sessions
─────────────
ANALYZE
  Analytics
  Cost
  Users
─────────────
CONFIGURE
  Customers
  Model Registry
  Routing Rules
─────────────
ADMIN
  Settings
  Alerts
  API Keys
```

### 3.2 What Each Page Contains

#### Overview / Home Page
The "at a glance" page. Should answer: *Is everything working? How much are we spending? Are SLAs being met?*

Top row KPI cards (large numbers with trend arrows):
- Total Requests (today / this week)
- Total Cost ($)
- Average TTFT (ms)
- Error Rate (%)
- Active Customers

Second section — time series charts (last 24h default, time selector):
- Requests per minute (line chart)
- Cost over time (area chart, stacked by customer or model)
- Average latency over time (line chart with P50/P95/P99 bands)
- Error rate over time

Third section — distribution charts:
- Model Distribution (pie or donut: which models are handling what % of traffic)
- Top Customers by volume
- Top Customers by cost

Bottom section — real-time activity feed (last 10-20 requests, live-updating):
- Timestamp, Customer, Model Routed To, Latency, Tokens, Cost, Status

#### Requests Page (Live Feed)
A filterable, searchable log of every request in real time. Think Datadog Log Explorer or Splunk.

Columns in the table:
- Timestamp
- Customer
- Request ID
- Model Selected
- Routing Decision (why this model was chosen)
- TTFT (ms)
- Total Latency (ms)
- Input Tokens
- Output Tokens
- Cost ($)
- Finish Reason
- Status (success / error / guardrail block)

Filters panel (15+ dimensions):
- Time range
- Customer
- Model
- Status
- Cost range
- Latency range
- Region
- Routing rule triggered
- Complexity class

Clicking a row opens the **Trace Detail Panel** (see Section 8).

#### Analytics Page
Deep-dive aggregated analysis. Tabs or sub-pages:

**Performance Tab:**
- TTFT distribution histogram (by model)
- Latency P50/P95/P99 over time (grouped line chart)
- Throughput (tokens/sec) over time
- Comparison: latency by model side-by-side bar chart

**Cost Tab:**
- Cost over time (area chart, breakdowns by model / customer / feature)
- Cost per request trend
- Top 10 most expensive requests
- Cost breakdown: tokens input vs. output
- Projected monthly spend vs. budget

**Quality Tab:**
- Finish reason distribution (pie)
- Cache hit rate over time
- Guardrail trigger rate
- Error rate by model
- Retry rate trend

**Routing Tab:**
- Routing decision distribution over time (stacked area chart)
- Model upgrade/downgrade rates
- Contract rule trigger frequency (bar chart: which rules fire most)
- Complexity classification distribution (pie)

#### Traces Page
Individual request traces with waterfall visualization. (See Section 8 for full detail.)

#### Sessions Page
Groups of related requests (multi-turn conversations or agent workflows) into a single session view. Shows:
- Session duration
- Turn count
- Accumulated cost
- Accumulated tokens
- Agent graph (for agentic workflows)

#### Customers Page
Per-customer management. Card grid or table showing each customer. Clicking a customer opens their profile.

**Customer List Columns:**
- Customer name / ID
- Contract tier
- Active since
- Requests (7d)
- Cost (7d)
- Budget used (progress bar)
- SLA status (green/yellow/red)
- Region(s)

**Customer Detail Page:**
- Contract summary (extracted policy, allowed models, region constraints)
- Cost over time chart (this customer only)
- Request volume over time
- Model distribution (for this customer)
- Contract compliance metrics
- Per-customer alerts / budget status
- Allowed models (toggle list)
- Request log filtered to this customer

#### Model Registry Page
The global admin page where Assurant configures all available models, then toggles them per customer. See Section 7 for full detail.

#### Cost Page
Dedicated cost management view:
- Total spend MTD, WTD, today
- Spend by customer (ranked)
- Spend by model (ranked)
- Budget utilization per customer (progress bars)
- Cost savings vs. baseline (routing ROI)
- Budget alert thresholds and current status

#### Settings / Alerts Page
- Alert rule management (threshold-based: cost > $X, error rate > Y%, latency p99 > Z ms)
- Notification channels (email, Slack, webhook, PagerDuty)
- API key management
- Global routing policy defaults

---

## 4. Visual Component Patterns

Based on research across Helicone, Portkey, LangSmith, Langfuse, and LiteLLM, here are the visual patterns that make enterprise AI dashboards visually impressive and functionally useful.

### 4.1 KPI Stat Cards (Top of Every Page)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Total Requests     │  │  Total Cost          │  │  Avg TTFT           │
│  24,847             │  │  $1,284.32           │  │  312ms              │
│  ↑ 12% vs yesterday │  │  ↓ 3% vs yesterday   │  │  ↑ 8ms vs yesterday │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

Design notes:
- Large bold number (primary stat)
- Small trend delta with colored arrow (green = good, red = bad — direction-aware)
- Subtle sub-label with comparison period
- Dark background with subtle border or glassmorphism style works well

### 4.2 Time-Series Line Charts

Standard for: requests/min, latency, cost over time, error rate.

Design notes:
- Multi-line with color per model or customer
- Hover tooltip showing exact values
- Shaded area for P50–P99 latency bands
- Time selector: 1h / 6h / 24h / 7d / 30d
- Zoom/pan support

### 4.3 Stacked Area Charts

Best for: cost over time broken down by model, cost by customer over time.

Design notes:
- Each layer = one model or customer
- Tooltips show breakdown at hovered time
- Legend with color swatches

### 4.4 Model Distribution Donut/Pie

Shows which models are handling what percentage of traffic.

```
        ╭────────╮
    GPT-4o  42%  │
    Claude Haiku  31%
    Llama 3  18%
    GPT-4o-mini  9%
        ╰────────╯
```

Design notes:
- Clicking a segment filters the page to that model
- Legend shows model name, %, and absolute count

### 4.5 Real-Time Request Feed

A live-scrolling table of recent requests, auto-updating every 2-5 seconds.

```
TIME       CUSTOMER     MODEL         LATENCY   TOKENS   COST      STATUS
14:32:01   Acme Corp    claude-haiku  183ms     1,240    $0.0003   ✓
14:32:00   BetaCo       gpt-4o        4,120ms   8,430    $0.213    ✓
14:31:58   Acme Corp    claude-haiku  201ms     1,050    $0.0002   ✓
14:31:55   GammaCo      gpt-4o-mini   312ms     2,100    $0.001    ✗ error
```

Design notes:
- Row color coding: red for errors, yellow for slow, green for fast
- Blinking indicator for "live" mode
- Clicking a row opens the trace detail panel
- Pause/resume live mode button

### 4.6 Latency Histogram

Shows distribution of latency across all requests in the selected time window.

- X axis: latency buckets (0-100ms, 100-250ms, 250-500ms, 500ms-1s, 1-2s, >2s)
- Y axis: request count
- Vertical lines for P50, P95, P99
- Can be overlaid: multiple models on same histogram with different colors

### 4.7 Budget Utilization Progress Bars

Per-customer budget tracking:

```
Acme Corp    ████████░░░░░░░░  $840 / $2,000 (42%)   ⚠ 14 days left
BetaCo       ██████████████░░  $4,750 / $5,000 (95%)  🔴 ALERT
GammaCo      ██░░░░░░░░░░░░░░  $120 / $1,000 (12%)   ✓ On track
```

### 4.8 Model Comparison Bar Charts

Side-by-side comparison of two or more models on the same metric:

```
Avg TTFT (ms)

GPT-4o          ████████████████████  1,200ms
Claude Sonnet   ████████████  720ms
Claude Haiku    ████  240ms
GPT-4o-mini     ██████  360ms
Llama 3 8B      ████████  480ms
```

### 4.9 Trace Waterfall / Timeline View

A horizontal bar chart showing each span in the request lifecycle:

```
Request ID: req_abc123   Customer: Acme Corp   Total: 847ms

[────────────────────────────────────────────────] 0ms - 847ms
  Contract Classification   [██] 23ms
  Routing Decision          [█] 8ms
  Provider Auth             [█] 12ms
  LLM Inference             [████████████████] 720ms
    - Prefill               [████] 180ms
    - Decode                [████████████] 540ms
  Response Formatting       [█] 14ms
  Audit Logging             [█] 70ms (async)
```

### 4.10 Geography / Region Map

For contract compliance — shows where requests are being processed:

- World map with dots/heatmap on data center regions
- Color coding: green = contracted region, red = outside contract
- Per-customer region compliance metric overlay

### 4.11 Routing Decision Flow Diagram

Visualizes the decision tree for how a request was routed:

```
Request Received
     │
     ▼
Contract Profile Loaded (Acme Corp)
     │
     ▼
Complexity Classification → "Simple" (confidence: 94%)
     │
     ▼
Contract Rules Check:
  ✓ EU region required → filter to EU providers
  ✓ Max latency: 500ms → prefer fast models
  ✓ Tier: Basic → cost-optimized
     │
     ▼
Candidates: [Claude Haiku EU, GPT-4o-mini EU]
     │
     ▼
Selected: Claude Haiku EU (183ms avg, $0.0003/req)
     │
     ▼
Response Returned ✓
```

---

## 5. Enterprise Feature Inventory

These are the features that separate "toy dashboards" from "enterprise-grade" dashboards, based on what real products offer.

### 5.1 Authentication and Access Control
- Role-based access: Admin / Operator / Viewer roles
- SSO / MFA support (enterprise requirement)
- API key management with scoped permissions
- Audit logging of all configuration changes

### 5.2 Multi-Tenant Isolation
- Per-customer namespace: one customer's data never leaks to another's view
- Virtual key system: each customer / team / project gets their own API key
- Per-key budget and rate limits enforced at the gateway level
- Team-level grouping of keys (between org and individual key)
- Project-level grouping (for cost attribution to product features)

### 5.3 Budget and Cost Controls
- Hard budget limits per customer (requests fail gracefully when exceeded)
- Soft budget alerts (notify at 80%, 90%, 100% of budget)
- Budget reset periods: daily / monthly / never
- Budget tracking across virtual keys, teams, projects, customers
- Email / Slack / webhook alerts for budget events

### 5.4 Rate Limiting
- Token-per-minute (TPM) limits per key / customer
- Request-per-minute (RPM) limits per key / customer
- Provider-level rate limit management (each provider gets isolated worker pool)
- Automatic retry with exponential backoff on rate limit errors
- Fallback routing when primary provider rate-limits

### 5.5 Model Fallback and Redundancy
- Fallback chains: if model A fails, try model B, then model C
- Load balancing across multiple deployments of same model
- Algorithms: round-robin, lowest-latency, weighted, consistent-hashing
- Health-check driven routing (unhealthy endpoints removed from rotation)
- Retry budget per request (max N retries before failing)

### 5.6 Alerting
- Metric-based alerts: cost > $X, error rate > Y%, latency P99 > Z ms
- Anomaly detection alerts (spike detection)
- Budget utilization alerts
- SLA breach alerts
- Guardrail trigger rate alerts
- Delivery channels: email, Slack, PagerDuty, webhook

### 5.7 Data Export and Integration
- Export to CSV / JSON
- Prometheus metrics endpoint
- OpenTelemetry trace export
- PostHog / Grafana / Datadog integration
- Metrics API for custom dashboards

### 5.8 Caching
- Prompt-level semantic caching
- Cache hit rate tracking
- Cache savings calculation (how much cost was avoided)
- Per-customer cache configuration

### 5.9 Guardrails and Safety
- Input guardrails (block malicious/off-topic prompts)
- Output guardrails (block unsafe responses)
- Guardrail trigger rate tracked in dashboard
- Per-customer guardrail configuration
- PII detection and redaction

---

## 6. ModelGate-Specific Design

This section translates the research into concrete design decisions for ModelGate's dashboard.

### 6.1 The Central UX Premise

ModelGate's unique value is **contract-aware routing**. The dashboard must make the invisible visible:

- Why was this model chosen for this request?
- What contract rules were applied?
- Is the customer getting what they contracted for?
- How much money is being saved by smart routing?

Every page should reinforce one of these questions.

### 6.2 The "Overview" Page for ModelGate

The overview page should lead with the routing story, not just generic metrics:

**Hero KPI Row:**
- Requests Today
- Total Cost Today
- Cost Savings Today (vs. naive all-premium routing)
- Contract Compliance Rate (%)
- Active Customers

**Second Row (routing-specific):**
- Model Distribution Donut (which models are carrying the load)
- Routing Breakdown by Contract Tier (stacked bar: Basic / Pro / Enterprise requests)
- SLA Compliance Gauge (% of requests meeting latency SLA)

**Third Row (time series):**
- Requests/min over time (last 24h)
- Cost over time with "Baseline Cost" overlay (showing savings)
- Latency P50/P95/P99 over time

**Bottom: Live Request Feed (last 20 requests, auto-refreshing)**

### 6.3 The Customer Page

This is the most differentiating page. It shows what makes ModelGate unique.

**Customer Card:**
```
┌──────────────────────────────────────────────────────────────────┐
│  ACME CORP                                          [View Full]  │
│  Contract Tier: Professional  |  Region: EU Only                 │
│  Allowed Models: Claude Haiku, Claude Sonnet, GPT-4o-mini EU     │
│  Budget: $840 / $2,000 this month (42%)  ████████░░░░░░░░        │
│  SLA: Max 500ms P99  |  Current P99: 412ms  ✓                   │
│  Requests (7d): 14,284  |  Avg Cost/Req: $0.0003                │
└──────────────────────────────────────────────────────────────────┘
```

**Customer Detail View tabs:**
1. Overview (KPIs + charts for this customer)
2. Contract (the extracted contract profile in human-readable form)
3. Requests (filtered request log for this customer)
4. Routing (routing decision breakdown for this customer)
5. Compliance (contract compliance metrics)
6. Models (which models are enabled for this customer)
7. Alerts (budget alerts, SLA alerts for this customer)

### 6.4 The Routing Analytics Page

Unique to ModelGate — not found on generic observability platforms.

**Sections:**

**Model Selection Distribution:**
- Stacked area chart over time showing which models are chosen
- Segmented by: complexity class (Simple / Medium / Complex)
- Legend shows cost-per-request for each model

**Contract Rule Analysis:**
- Table of all contract rules with how often each fires
- Example rows:
  - "EU Region Required" — fires on 100% of Acme Corp requests
  - "Max Latency 500ms" — eliminates GPT-4 from 34% of requests
  - "No Data Retention" — routes 100% to ephemeral providers

**Complexity Classification Breakdown:**
- Pie chart: what % of requests are Simple / Medium / Complex
- Trend over time (are requests getting more complex?)
- Cost per complexity class

**Cost Savings Panel:**
- "Without ModelGate routing: $X,XXX" (estimated, based on always using customer's top-tier allowed model)
- "With ModelGate routing: $XXX"
- "You saved: $XXX (YY%)"
- Trend chart showing savings over time

---

## 7. Model Registry and Global Config Flow

This is the administrative backbone of ModelGate. It enables Assurant to:
1. Define the global catalog of available models
2. Toggle models on/off globally
3. Set which models each customer is allowed to use

### 7.1 Model Registry Page Structure

**Global Model Catalog Table:**

| Model | Provider | Context Window | Cost/1M Input | Cost/1M Output | Regions | Status |
|-------|----------|----------------|---------------|----------------|---------|--------|
| claude-haiku-3.5 | Anthropic | 200K | $0.80 | $4.00 | US, EU | Active |
| claude-sonnet-3.7 | Anthropic | 200K | $3.00 | $15.00 | US, EU, APAC | Active |
| gpt-4o | OpenAI | 128K | $2.50 | $10.00 | US, EU | Active |
| gpt-4o-mini | OpenAI | 128K | $0.15 | $0.60 | US, EU | Active |
| llama-3.3-70b | Meta/Together | 128K | $0.88 | $0.88 | US | Active |
| mistral-large | Mistral | 128K | $2.00 | $6.00 | EU | Active |

**Per-model detail (clicking a row opens):**
- Provider credentials / endpoint configuration
- Deployment health status (green/yellow/red)
- Rate limits (TPM, RPM)
- Geographic availability
- Supported features (streaming, function calling, vision)
- SLA guarantees from provider
- Which customers have this model enabled

**Global toggle:** Deactivating a model here removes it from routing for ALL customers immediately. A confirmation dialog is required.

### 7.2 Per-Customer Model Assignment Flow

The key workflow: Assurant admin assigns the set of models a customer can use.

**Step 1: Navigate to Customer → Models tab**

The page shows two columns:

```
AVAILABLE MODELS (Global Registry)      ENABLED FOR ACME CORP
─────────────────────────────────       ─────────────────────────
□ claude-haiku-3.5     [+Enable]        ✓ claude-haiku-3.5
□ claude-sonnet-3.7    [+Enable]        ✓ gpt-4o-mini
□ gpt-4o               [+Enable]
□ gpt-4o-mini          [already enabled]
□ llama-3.3-70b        [+Enable]
□ mistral-large        [+Enable]
```

**Step 2: Toggle a model on/off**
- Toggle switches with instant visual feedback
- Region filter auto-applied based on customer's contract region
- Models that violate the customer's region constraints are grayed out with tooltip explanation
- Models above the customer's tier budget target are shown with a warning

**Step 3: Set routing priority order**
- Drag-and-drop to order models within the customer's allowed set
- "Primary" model = preferred when contract allows any
- "Fallback" models = used when primary is unavailable or cost target exceeded

**Step 4: Routing preview**
- After configuration, a preview panel shows:
  - "For a typical Simple request: → Model A (estimated $0.0003)"
  - "For a typical Complex request: → Model B (estimated $0.02)"
  - "Estimated monthly cost at current volume: $480"

### 7.3 Contract Profile View

After contract documents are processed, the extracted profile is shown on the Customer Detail page. This is one of ModelGate's most differentiating views.

```
EXTRACTED CONTRACT PROFILE — Acme Corp
════════════════════════════════════════════════════════════════

SOURCE DOCUMENTS
  ├── acme_corp_ai_services_agreement_2024.pdf
  ├── acme_data_processing_addendum.pdf
  └── acme_sla_schedule_v3.pdf

EXTRACTED CONSTRAINTS
┌─────────────────────────────────────────────────────────────┐
│ REGION                                                       │
│   Data must remain in: EU (GDPR Article 44)                 │
│   Allowed providers: EU-hosted endpoints only               │
│   Source: DPA Section 7.2 (page 4)                         │
├─────────────────────────────────────────────────────────────┤
│ LATENCY                                                      │
│   P99 Response Time SLA: 500ms                              │
│   Source: SLA Schedule v3, Section 2.1                     │
├─────────────────────────────────────────────────────────────┤
│ COST                                                         │
│   Monthly Budget Cap: $2,000                                │
│   Source: MSA Section 12.4                                  │
├─────────────────────────────────────────────────────────────┤
│ DATA RETENTION                                              │
│   No prompt/response data stored at model provider         │
│   Source: DPA Section 4.1                                  │
├─────────────────────────────────────────────────────────────┤
│ MODEL RESTRICTIONS                                          │
│   No open-weight models permitted                           │
│   Source: Security Addendum Section 3.3                    │
└─────────────────────────────────────────────────────────────┘

CONFIDENCE: HIGH  (89%)
Last extracted: 2026-03-18 14:22 UTC
[Re-extract] [Edit Manually] [View Raw]
```

---

## 8. Per-Request Trace View

Clicking any request in the live feed or request log opens a full-detail panel. This is the "proof of work" view that shows exactly what the system did.

### 8.1 Trace Panel Structure

```
REQUEST TRACE
════════════════════════════════════════════════════════════════
ID:       req_01J9K2M4N6P8Q0R2S4T6
Time:     2026-03-20 14:32:01.234 UTC
Customer: Acme Corp
Status:   ✓ Success
Total:    183ms  |  $0.0003  |  1,240 tokens

TIMELINE
────────────────────────────────────────────────────────────────
0ms          50ms         100ms        150ms        183ms
│            │            │            │            │
├──────┤                                              Contract Classification
      ├──┤                                           Routing Decision
          ├─┤                                        Provider Auth + DNS
             ├────────────────────────────────────┤  LLM Inference (claude-haiku-3.5)
                                                  ├┤ Response Format + Log

SPAN DETAILS
────────────────────────────────────────────────────────────────
▼ Contract Classification        23ms
  - Customer profile loaded: acme_corp (cache hit)
  - Rules applied: 5 (region=EU, latency_sla=500ms, no_retention, ...)

▼ Routing Decision               8ms
  - Complexity class: Simple (confidence: 94%)
  - Candidates after rule filter: [claude-haiku-eu, gpt-4o-mini-eu]
  - Selected: claude-haiku-3.5 (EU) — lowest cost meeting SLA
  - Reason: Simple query, cost-optimized, EU endpoint available

▼ LLM Inference                  152ms
  - Provider: Anthropic
  - Endpoint: api.eu.anthropic.com
  - Model: claude-haiku-3.5
  - TTFT: 89ms
  - Input tokens: 340
  - Output tokens: 900
  - Finish reason: stop

INPUT / OUTPUT
────────────────────────────────────────────────────────────────
PROMPT (340 tokens)
  System: You are a helpful assistant for Acme Corp...
  User: What is the status of my claim #A-2024-99123?

RESPONSE (900 tokens)
  Based on the information provided, claim #A-2024-99123...

METADATA
────────────────────────────────────────────────────────────────
  Tags:        customer=acme_corp, feature=claims-assistant
  Session:     sess_xyz789
  User ID:     user_acme_44821
  Cache:       Miss
  Guardrails:  Passed (input + output)
```

### 8.2 Key Design Notes for Trace View

- The **routing decision span** is what makes ModelGate unique — show the full reasoning
- **Complexity classification** should show confidence score
- **Contract rules applied** should be enumerated, not just a count
- **Provider endpoint** should confirm region compliance visually (e.g., a green "EU" badge)
- **TTFT vs. total latency** both shown, to help diagnose streaming experience
- The timeline bar should be interactive: hover a segment to highlight the span details below

---

## 9. Contract Compliance Visualization

This is a key differentiator for the Assurant pitch. Compliance dashboards need to answer: "Did every request follow the rules?"

### 9.1 Global Compliance Dashboard

A dedicated section on the Overview page or a tab on the Routing Analytics page:

**Compliance KPIs (last 7 days):**
- Region Compliance: 100.0% — all Acme Corp requests processed in EU
- Model Policy Compliance: 100.0% — no open-weight models used for restricted customers
- Latency SLA Compliance: 98.7% — 13 requests exceeded 500ms P99 threshold
- Budget Compliance: 3/12 customers at >80% budget utilization

**Per-Customer Compliance Table:**

| Customer | Region | Model Policy | Latency SLA | Budget |
|----------|--------|--------------|-------------|--------|
| Acme Corp | ✓ 100% EU | ✓ 100% compliant | ⚠ 98.7% | ✓ 42% |
| BetaCo | ✓ 100% US | ✓ 100% compliant | ✓ 99.9% | 🔴 95% |
| GammaCo | ✓ 100% US | ✓ 100% compliant | ✓ 100% | ✓ 12% |

### 9.2 Region Compliance Widget

For customers with data residency requirements, show a mini world-map:
- Green dots at compliant data center locations
- All request dots over the past 24h pinned to their actual processing region
- "100% of 14,284 requests processed in EU ✓"

### 9.3 SLA Compliance Timeline

A chart showing latency vs. the SLA threshold line:
- Line chart of P99 latency over time
- Horizontal red dashed line at SLA threshold (e.g., 500ms)
- Shaded red areas where P99 exceeded threshold
- Count of SLA breaches with timestamps

---

## 10. Cost Savings Visualization

One of the most compelling demo moments: showing that ModelGate saved money by routing intelligently.

### 10.1 The Savings Panel (Overview Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ROUTING COST SAVINGS  (This Month)                                  │
│                                                                      │
│  Without ModelGate (all requests → top-tier model):   $12,840       │
│  With ModelGate (intelligent routing):                 $2,847       │
│                                                                      │
│  YOU SAVED:   $9,993   (77.8% reduction)                            │
│                                                                      │
│  ████████████████████████████████░░░░░░░░  77.8% saved              │
│  $0          $2,847                         $12,840                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Cost Savings Over Time Chart

Dual-line chart:
- Line 1 (gray/dashed): Estimated cost if all requests used the customer's top-tier allowed model
- Line 2 (green/solid): Actual cost with ModelGate routing
- Shaded area between the lines = savings
- Running total savings annotation on the right axis

### 10.3 Per-Request Cost Distribution

Histogram showing the distribution of request costs:
- X axis: cost buckets ($0.0001–$0.001, $0.001–$0.01, $0.01–$0.10, >$0.10)
- Y axis: request count
- Color coding by model (cheap models = left/green, premium = right/orange-red)
- Demonstrates that most traffic is handled cheaply

### 10.4 Model Cost Comparison Table

| Model | Requests | % of Traffic | Total Tokens | Total Cost | Avg Cost/Req |
|-------|----------|--------------|--------------|------------|--------------|
| claude-haiku-3.5 | 18,420 | 74% | 24.1M | $387 | $0.0002 |
| gpt-4o-mini | 4,830 | 19% | 7.8M | $98 | $0.00002 |
| claude-sonnet-3.7 | 1,597 | 7% | 5.2M | $2,362 | $0.0148 |

Notes: Premium model (claude-sonnet-3.7) handles only 7% of requests but costs 78% of total spend. This is intelligent routing working as intended.

---

## 11. Recommended Page List for ModelGate

Based on the research, here is the prioritized page list for the ModelGate dashboard MVP.

### Tier 1 (Must Have — Demo Critical)

1. **Overview / Home** — KPIs, time series, live request feed, cost savings headline
2. **Requests / Live Feed** — Filterable log of all requests
3. **Trace Detail** — Per-request detail panel with waterfall + routing decision
4. **Customers** — List view + per-customer detail page
5. **Model Registry** — Global model catalog with per-customer toggles

### Tier 2 (High Value — Build If Time)

6. **Analytics — Routing** — Routing decision distribution, rule analysis, complexity breakdown
7. **Analytics — Cost** — Cost savings visualization, model cost comparison
8. **Analytics — Performance** — Latency histograms, TTFT distribution, model comparison
9. **Contract Profile View** — Extracted constraints in human-readable format

### Tier 3 (Nice to Have)

10. **Sessions** — Multi-turn conversation grouping
11. **Alerts** — Alert configuration UI
12. **Settings** — API key management, global defaults

---

## 12. Implementation Priority

For the hackathon demo, prioritize the views that prove the core thesis to judges:

### Priority 1: Prove Contract-Aware Routing Works
- Trace detail view showing the routing decision with contract rules
- Routing decision distribution chart

### Priority 2: Prove Cost Savings
- Cost savings panel with baseline vs. actual comparison
- Model distribution donut showing cheap models handling most traffic

### Priority 3: Prove Enterprise Readiness
- Contract profile view showing extracted constraints
- Per-customer model toggles in the model registry
- SLA compliance metrics

### Priority 4: Make It Look Real
- Live request feed (even if simulated/seeded)
- Time-series charts with realistic data
- Professional sidebar navigation

---

## Sources

- [Helicone — Open Source LLM Observability Platform](https://www.helicone.ai/)
- [Helicone — LLM Observability Blog](https://www.helicone.ai/blog/llm-observability)
- [Helicone — Essential Features Guide](https://www.helicone.ai/blog/essential-helicone-features)
- [Helicone — Complete Guide to LLM Observability Platforms](https://www.helicone.ai/blog/the-complete-guide-to-LLM-observability-platforms)
- [LangSmith — Monitor Projects with Dashboards](https://docs.langchain.com/langsmith/dashboards)
- [LangSmith — LLM Observability for AI Agents](https://www.langchain.com/langsmith/observability)
- [Portkey — Full-Stack Observability](https://portkey.ai/features/observability)
- [Portkey — Complete Guide to LLM Observability for 2026](https://portkey.ai/blog/the-complete-guide-to-llm-observability/)
- [Portkey — Analytics Docs](https://portkey.ai/docs/product/observability/analytics)
- [Portkey — Budget and Rate Limit Enforcement](https://portkey.ai/docs/product/administration/enforce-budget-and-rate-limit)
- [LiteLLM — Proxy UI Quickstart](https://docs.litellm.ai/docs/proxy/ui)
- [LiteLLM — Customer Usage Tracking](https://docs.litellm.ai/docs/proxy/customer_usage)
- [LiteLLM — Virtual Keys](https://docs.litellm.ai/docs/proxy/virtual_keys)
- [LiteLLM — Spend Tracking](https://docs.litellm.ai/docs/proxy/cost_tracking)
- [LiteLLM — Dashboard Architecture (DeepWiki)](https://deepwiki.com/BerriAI/litellm/3.7.1-dashboard-architecture-and-components)
- [Datadog — LLM Observability](https://docs.datadoghq.com/llm_observability/)
- [Datadog — LLM Observability Metrics](https://docs.datadoghq.com/llm_observability/monitoring/metrics/)
- [Datadog — Cost Monitoring](https://docs.datadoghq.com/llm_observability/monitoring/cost/)
- [Weights & Biases — LLM Observability Guide](https://wandb.ai/site/articles/llm-observability/)
- [Langfuse — Open Source LLM Metrics](https://langfuse.com/docs/metrics/overview)
- [Langfuse — LLM Observability Overview](https://langfuse.com/docs/observability/overview)
- [TrueFoundry — Observability in AI Gateway](https://www.truefoundry.com/blog/observability-in-ai-gateway)
- [TrueFoundry — Load Balancing in AI Gateway](https://www.truefoundry.com/blog/load-balancing-in-ai-gateway)
- [AIRouter — LLM Cost Optimization via Intelligent Routing](https://airouter.io/llm-cost-optimization)
- [Hivenet — LLM Inference Metrics (TTFT, TPS)](https://compute.hivenet.com/post/llm-inference-metrics-ttft-tps)
- [Statsig — LLM Response Time Tracking](https://www.statsig.com/perspectives/llm-response-tracking)
- [OneUptime — LLM Observability Dashboard with OpenTelemetry](https://oneuptime.com/blog/post/2026-02-06-llm-observability-dashboard-opentelemetry-metrics/view)
- [Traceloop — Visualizing LLM Performance with OpenTelemetry](https://www.traceloop.com/blog/visualizing-llm-performance-with-opentelemetry-tools-for-tracing-cost-and-latency)
- [Enterprise AI Control Plane — Medium](https://medium.com/@mattsreinsch/the-enterprise-ai-control-plane-871db525ea98)
- [AI Governance Dashboard Design Patterns — AufaitUX](https://www.aufaitux.com/blog/ai-design-patterns-enterprise-dashboards/)
