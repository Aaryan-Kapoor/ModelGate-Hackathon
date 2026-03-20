# ModelGate — Presentation Content
## KSU Social Good Hackathon 2026 · Assurant Track

> **Timing guide: 5-minute hard limit**
> Slides 1–8 are the core 5-minute presentation (~35 seconds each).
> Slides 9–10 are backup/planning evidence if judges ask.
> Appendices are reference only.

---

## SLIDE 1 — Title (0:00–0:20)

**ModelGate**
*Contract-Aware AI Control Plane*

> One line of code. Immediate savings. No friction.

KSU Social Good Hackathon 2026 · Assurant Track

---

## SLIDE 2 — Aligning to The Assurant Way (0:20–0:50)

### Assurant's purpose: *Helping people thrive in a connected world.*

The Connected World runs on AI.
AI is expensive, wasteful, and hard to configure correctly.

**Today's reality:**
- Developers point every query at the most powerful model available
- Nobody has time to evaluate 200+ models or read through client contracts
- 50–90% of AI inference spend is wasted on overprovisioned models
- Premium AI models consume up to **180x more energy** per query than small models

> This waste doesn't just hurt businesses.
> It slows the connected world down — and burns resources the planet can't afford.

**ModelGate fixes this.** For every developer, every business, every data center, every user.

---

## SLIDE 3 — The Problem Is Universal (0:50–1:20)

### This affects a large population across the connected world

| Who | The Problem |
|-----|-------------|
| **Developers & product teams** | No time to evaluate models — default to one expensive option |
| **Enterprise customers** | Contract constraints manually translated into config, or ignored entirely |
| **AI data centers** | Unnecessary load on premium GPU clusters that could serve other workloads |
| **End users** | Slow responses because a simple query was sent to a powerful-but-sluggish model |
| **The environment** | Massive energy waste from premium inference that wasn't needed |

> This isn't a niche enterprise problem.
> Every person or company using AI today is affected by this waste.

---

## SLIDE 4 — The Solution: One Line of Code (1:20–1:50)

### You don't need to redesign your AI infrastructure.

**Before ModelGate — what everyone does today:**
```python
client = OpenAI(api_key="sk-...", base_url="https://api.openai.com/v1")
```

**After ModelGate — what you do once:**
```python
client = OpenAI(api_key="<your-token>", base_url="https://your-modelgate/v1")
```

**That's the entire migration.**

ModelGate intercepts every request, classifies it, applies your contract constraints, routes it to the right model, and returns the answer — fully OpenAI-compatible.

> You change one line. ModelGate handles model selection, policy enforcement, cost tracking, and compliance. Forever.

---

## SLIDE 5 — How It Works (1:50–2:20)

### Two phases. Fully automated. Zero ongoing effort.

**Phase 1 — Contract Onboarding (< 30 seconds)**

Upload contract → LLM extracts constraints → Customer AI profile generated automatically:
- Data region restrictions (EU-only, US-only)
- Forbidden or approved providers
- Latency targets and cost sensitivity
- Use case type and routing preferences

**Phase 2 — Runtime Routing (50ms overhead per request)**

```
Simple query  → GPT 5.4 nano / Gemini 3.1 Flash Lite / Haiku 4.5   (fast, cheap)
Medium query  → GPT 5.4 mini / Sonnet 4.6 / Grok 4.1 Fast           (balanced)
Complex query → GPT 5.4 / Opus 4.6 / Gemini 3.1 Pro / Grok 4.20    (full power)
```

Every routing decision is logged with a plain-English explanation of why that model was chosen.

---

## SLIDE 6 — Three Personas, One Solution (2:20–2:50)

### ModelGate serves three distinct personas simultaneously

**Persona 1 — The Developer / Product Team**
> "I just want AI to work. I don't have time to evaluate every new model."
- Before: picks one model, overpays forever
- After: one URL change, automatic optimization, nothing else to do

**Persona 2 — The Enterprise Compliance Team**
> "Our contracts say EU-only. I can't trust engineers to remember that."
- Before: manual config, human error risk, compliance violations
- After: upload the contract, routing enforces it automatically, always

**Persona 3 — The Operations / Platform Team**
> "I have no idea what our AI is costing us or why."
- Before: no visibility, no cost tracking, no model distribution data
- After: live dashboard, cost savings vs. premium, per-request routing explanations

---

## SLIDE 7 — Evidence: It Works (2:50–3:20)

### Research + our live system results

**Academic validation:**
| Research | Finding |
|----------|---------|
| FrugalGPT (Stanford) | Up to **98% cost reduction** matching GPT-4 quality |
| RouteLLM (LMSYS, ICLR 2025) | **>85% cost reduction** at 95% GPT-4 performance |
| RouteLLM routing analysis | Only **14% of queries** need the largest model |

**ModelGate live results:**

> **[INSERT LIVE NUMBERS HERE]**
> - % of requests routed to simple tier: ___
> - % of requests routed to medium tier: ___
> - % of requests routed to complex tier: ___
> - Total cost vs. always-premium baseline: ___% saved
> - Average latency: before ___ ms → after ___ ms

---

## SLIDE 8 — Sustainability Impact + Close (3:20–4:00)

### This is how we help people thrive in a connected world

**Every unnecessary premium model call we prevent:**

| Layer | Impact |
|-------|--------|
| Business | 60–98% cost savings on AI inference |
| End users | Faster responses — simple queries go to fast models |
| Data centers | Less unnecessary GPU load on premium clusters |
| Energy grid | Up to **180x less energy** per routed-away premium call |
| Compliance | Contract constraints become automatic, not remembered |

**This is reusable infrastructure.** One ModelGate deployment serves every customer, every contract, every use case — with no new config required per request.

> ModelGate is the lowest-friction, highest-impact AI optimization available today.
> One line of code. Starts saving immediately. Scales to every user in the connected world.

**Thank you.**

---

## SLIDE 9 — Demo: Watch It Work (live or pre-recorded fallback)

**Step 1 — Onboard ACME Support (upload contract)**
> LLM reads the doc. Extracts: EU-only, DeepSeek blocked, 1000ms latency target, high privacy.
> Profile generated in ~20 seconds.

**Step 2 — Copy the generated endpoint**
> `http://modelgate.local/acme-support/v1/chat/completions`
> Drop this URL into any OpenAI client. No other changes needed.

**Step 3 — Simple query in Playground**
> "What is your return policy?"
> → Routes to: `GPT 5.4 nano` | ~300ms | fraction of a cent

**Step 4 — Complex query in Playground**
> "Analyze liability exposure across multiple warranty claims and recommend a resolution strategy."
> → Routes to: `Claude Opus 4.6` | ~1.5s | still cheap, just right-sized

**Step 5 — Dashboard**
> Model distribution chart, cost savings banner, live routing feed.
> Same endpoint. Different models. Automatic. Every request.

---

## SLIDE 10 — Planning & Execution (backup if judges ask)

### MVP Scope + Iterations

**MVP (delivered):**
- Contract ingestion and LLM extraction
- Customer AI profile generation
- OpenAI-compatible proxy endpoint
- Arch-Router-1.5B prompt classifier (GPU) + heuristic fallback
- Policy-filtered, objective-scored routing engine
- Dashboard: global stats, customer profiles, request logs, playground

**Subsequent iterations planned:**
- Vector search over large contract doc sets
- Provider health / latency monitoring as live routing signal
- Managed SaaS deployment (no Docker required)
- Automatic model catalog updates as new models release

### Design Artifacts Produced
1. Architecture diagram (backend services + routing pipeline)
2. Customer profile schema (JSON)
3. Routing engine decision flowchart
4. Dashboard wireframes → implemented UI
5. Demo script and sample contract

### Team Execution
- Work distributed by domain: backend routing (1), LLM extraction (1), frontend dashboard (1), integration + demo (1)
- Small iterative commits, feature branches, tested individually before merge
- Heuristic fallback classifier built alongside GPU classifier to ensure demo reliability

---

## Appendix A — Rubric Alignment Summary

| Rubric Category | Weight | Our Coverage |
|----------------|--------|--------------|
| **Problem Selection** | 25% | Large population (all AI users); 3+ connected world aspects (economic, environmental, compliance, developer efficiency); high impact; few holistic solutions exist |
| **Planning** | 15% | MVP clearly defined and delivered; 5 design artifacts; 4-person team with domain distribution; iterative builds |
| **Development** | 35% | Working software demoed live; MVP fully delivered; additional scope (editable profiles, per-request routing metadata, model admin toggles, cost savings comparisons) |
| **Presentation** | 25% | 3 explicitly named personas; 8 core slides fit within 5 minutes; group dynamic; key points covered without rambling |

---

## Appendix B — The Full Model Catalog

| Model | Provider | Tier |
|-------|----------|------|
| GPT 5.4 nano | OpenAI | Simple |
| Gemini 3.1 Flash Lite | Google | Simple |
| Claude Haiku 4.5 | Anthropic | Simple |
| GPT 5.4 mini | OpenAI | Medium |
| Grok 4.1 Fast | xAI | Medium |
| Claude Sonnet 4.6 | Anthropic | Medium |
| MiniMax M2.5 | MiniMax | Medium |
| GPT 5.4 | OpenAI | Complex |
| Claude Opus 4.6 | Anthropic | Complex |
| Gemini 3.1 Pro | Google | Complex |
| Grok 4.20 | xAI | Complex |
| MiniMax M2.7 | MiniMax | Complex |

---

## Appendix C — Contract Clause Extraction Examples

| Contract Language | Extracted Constraint |
|-------------------|---------------------|
| "All data must remain within the EEA" | `region: "EU-only"` |
| "No China-based providers" | `forbidden_providers: ["deepseek"]` |
| "P95 response time under 1 second" | `latency_target_ms: 1000` |
| "Handles personally identifiable information" | `privacy_tier: "high"` |
| "Approved vendors: Anthropic and OpenAI only" | `allowed_providers: ["anthropic", "openai"]` |
| "Cost optimization is a primary concern" | `objective: "low_cost"` |

---

## Appendix D — The 30-Second Pitch (if asked)

> Everyone in AI is moving fast, and nobody has time to optimize their model selection.
> So they default to one premium model for everything — and waste 60 to 98% of their AI budget.
>
> ModelGate fixes that with one line of code.
>
> You replace your OpenAI URL with ours. We read your contract, enforce your constraints, and route every request to the right model automatically — cheap and fast for simple queries, powerful for complex ones.
>
> Your business saves money. Your users get faster responses. Data centers waste less energy.
> It helps every person in the connected world — through technology that just works.
>
> We call it **ModelGate.**
