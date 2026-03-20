# ModelGate — Presentation Statistics (with citations)

## 1. AI Inference Cost Differences Between Model Tiers

| Model | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Tier |
|---|---|---|---|
| GPT-4o | $2.50 | $10.00 | Premium |
| GPT-4o-mini | $0.15 | $0.60 | Budget |
| Claude Opus 4.6 | $5.00 | $25.00 | Premium |
| Claude Sonnet 4 | $3.00 | $15.00 | Mid-tier |
| Claude Haiku 3.5 | $0.80 | $4.00 | Budget |

**Key stat:** GPT-4o costs **16x more** than GPT-4o-mini for input tokens. Routing simple queries to the right tier eliminates this waste.

- Source: [OpenAI Pricing](https://openai.com/api/pricing/)
- Source: [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

---

## 2. Enterprise AI Waste / Overprovisioning

- **50–90% of enterprise inference spend is addressable** without quality loss through right-sizing model selection
  - Source: [LeanLLM.ai — LLM Cost Optimization](https://leanlm.ai/blog/llm-cost-optimization)

- **30–50% of AI cloud spend evaporates** into idle or overprovisioned resources
  - Source: [MILL5 — The Hidden Cost of AI](https://mill5.com/the-hidden-cost-of-ai/)

- Only **51% of organizations can measure AI investment returns**
  - Source: [MILL5 — The Hidden Cost of AI](https://mill5.com/the-hidden-cost-of-ai/)

- Real case study: **$47k/month → 89% savings** just by right-sizing document classification model selection
  - Source: [LeanLLM.ai — LLM Cost Optimization](https://leanlm.ai/blog/llm-cost-optimization)

---

## 3. Energy Consumption of AI Inference

- Efficient models (LLaMA 1B): **~0.218 Wh per query**
- Reasoning models (o3): **39.2 Wh per query** — a **180x difference**
  - Source: [arXiv 2505.09598 — How Hungry is AI?](https://arxiv.org/html/2505.09598v1)

- Global data centers consumed **415 TWh in 2024**, projected to exceed **1,000 TWh by 2026**
  - Source: [IEA — Energy demand from AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)

- US data centers projected to consume **6% of total US electricity by 2026**
  - Source: [IEA — Energy demand from AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)

**Key stat for presentation:** "Every time we route a simple query to a small model instead of a premium model, we use up to **180x less energy**."

---

## 4. Enterprise AI Adoption and Spending

- **$37 billion** enterprise GenAI spend in 2025, up **3.2x** from $11.5B in 2024
  - Source: [Menlo Ventures — State of GenAI in the Enterprise 2025](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)

- **73% of enterprises** spending >$50k/year on LLMs
  - Source: [Kong Inc. — Enterprise AI Spending 2025](https://konghq.com/blog/enterprise/enterprise-ai-spending-2025)

- **>80% of enterprises** will have deployed GenAI by 2026, up from <5% in 2023
  - Source: [Gartner Press Release, Oct 2023](https://www.gartner.com/en/newsroom/press-releases/2023-10-11-gartner-says-more-than-80-percent-of-enterprises-will-have-used-generative-ai-apis-or-deployed-generative-ai-enabled-applications-by-2026)

---

## 5. Customer Onboarding Time for AI Services

- Full enterprise AI deployment: **3–6 months** typical
- Proof of concept alone: **8–12 weeks**
- B2B API integration: **4–8 weeks**, reducible to **3–5 days** with standardized tooling

**Key stat for presentation:** "ModelGate reduces customer AI onboarding from weeks to seconds."

---

## 6. Model Routing / Right-Sizing Research

- **FrugalGPT** (Stanford): up to **98% cost reduction** while matching GPT-4 quality by cascading through cheaper models first
  - Source: [arXiv:2305.05176 — FrugalGPT](https://arxiv.org/abs/2305.05176)

- **RouteLLM** (LMSYS, published at ICLR 2025): **>85% cost reduction** on MT-Bench while maintaining 95% of GPT-4 performance
  - Source: [LMSYS Blog — RouteLLM](https://lmsys.org/blog/2024-07-01-routellm/)

- RouteLLM's matrix factorization router found that only **14% of calls** actually need to go to the large model
  - Source: [arXiv:2406.18665 — RouteLLM](https://arxiv.org/pdf/2406.18665)

---

## Suggested One-Liners for Presentation

1. "GPT-4o costs 16x more than GPT-4o-mini. Most customer support queries don't need the premium model."
2. "Enterprises waste 50–90% of their AI inference spend on overprovisioned models."
3. "Research shows smart routing can cut costs by 85–98% while maintaining quality."
4. "A premium model query uses up to 180x more energy than a small model query."
5. "Enterprise AI spending hit $37 billion in 2025 — and most of it is poorly optimized."
6. "Only 14% of queries actually need the most powerful model."
