# Routing Benchmark: GPT-5.4 Direct vs. ModelGate Router

**Benchmark:** MMLU (Massive Multitask Language Understanding)
**Questions:** 60 fixed questions across 6 subjects (10 each)
**Date:** 2026-03-21

## Overview

| Metric | GPT-5.4 (Direct) | ModelGate Router |
|---|---|---|
| **Overall Accuracy** | 54/60 (90.0%) | 51/60 (85.0%) |
| **Avg Latency** | 736ms | 1,028ms |
| **Total Cost** | ~$0.023 (all premium) | **$0.0095** |
| **Output Tokens** | 300 | 96 |
| **Input Tokens** | 8,533 | 8,479 |

## Per-Subject Breakdown

| Subject | Difficulty | GPT-5.4 | Router | Delta |
|---|---|---|---|---|
| elementary_mathematics | EASY | 10/10 (100%) | 8/10 (80%) | -20pp |
| high_school_us_history | EASY | 9/10 (90%) | 9/10 (90%) | 0 |
| high_school_computer_science | EASY | 9/10 (90%) | 8/10 (80%) | -10pp |
| college_biology | MEDIUM | 10/10 (100%) | 10/10 (100%) | 0 |
| abstract_algebra | HARD | 6/10 (60%) | 7/10 (70%) | **+10pp** |
| formal_logic | HARD | 10/10 (100%) | 9/10 (90%) | -10pp |

### By Difficulty Tier

| Tier | GPT-5.4 | Router | Delta |
|---|---|---|---|
| EASY (30 questions) | 28/30 (93.3%) | 25/30 (83.3%) | -10pp |
| MEDIUM (10 questions) | 10/10 (100%) | 10/10 (100%) | 0 |
| HARD (20 questions) | 16/20 (80.0%) | 16/20 (80.0%) | 0 |

## Router Model Distribution

The router dynamically selected models based on contract constraints and query complexity:

| Model | Requests | Role |
|---|---|---|
| google-gemini-3-1-flash-lite-preview | 41 | Economy tier (simple/medium) |
| gpt-4o-mini | 10 | Economy tier (simple) |
| openai-gpt-5-4 | 9 | Premium tier (complex) |

**68% of requests** were routed to the cheapest model (Gemini Flash Lite), while only **15%** required the premium GPT-5.4.

## Cost Analysis

| Metric | ModelGate Router | Always Premium (GPT-5.4) |
|---|---|---|
| Total Cost (60 requests) | $0.0095 | $0.023 |
| Monthly Projection (10k requests) | **$1.58** | **$3.83** |
| **Savings** | **$0.0135 per run / 59% cost reduction** | -- |

## Dashboard Metrics

| Metric | Value |
|---|---|
| Requests | 60 |
| Avg Latency | 945ms |
| P95 Latency | 1,467ms |
| P99 Latency | 1,875ms |
| Avg TTFT | 945ms |
| Success Rate | 100% |

### Avg Latency by Model

| Model | Avg Latency |
|---|---|
| gpt-4o-mini | ~750ms |
| openai-gpt-5-4 | ~900ms |
| google-gemini-3-1-flash-lite-preview | ~950ms |

### Cost by Model

| Model | Cost |
|---|---|
| openai-gpt-5-4 | ~$0.008 |
| google-gemini-3-1-flash-lite-preview | ~$0.001 |
| gpt-4o-mini | ~$0.0005 |

## Contract Constraints

| Parameter | Value |
|---|---|
| Region | US-only |
| Privacy Tier | high |
| Objective | low cost |
| Latency Target | 1000ms |
| Cost Sensitivity | high |
| Allowed Providers | Google, OpenAI |

### Routing Preferences

- **Simple** (fast, low-cost queries): gpt-4o-mini (primary, $0.15/M) / openai-gpt-5-4-nano ($0.2/M)
- **Medium** (moderate analysis): google-gemini-3-1-flash-lite-preview (primary, $0.25/M) / gpt-4o ($2.5/M)
- **Complex** (complex reasoning): openai-gpt-5-4 (primary, $2.5/M)

## Token Usage

| Metric | Value |
|---|---|
| Total Tokens | 8,711 |
| Input Tokens | 8,615 |
| Output Tokens | 96 |

## Key Takeaway

ModelGate achieves **85% accuracy** (vs. 90% for always-premium GPT-5.4) while cutting costs by **59%**. Hard-tier accuracy is identical (80%) -- the router correctly escalates difficult queries to premium models. The 5pp overall accuracy gap comes entirely from easy questions, where the cheaper models occasionally miss but the cost savings far outweigh the marginal accuracy loss.
