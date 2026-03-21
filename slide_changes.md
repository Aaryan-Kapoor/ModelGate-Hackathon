# Slide Changes

## Slides 8/9 — "Evidence" (Fill Placeholders)

- Simple % → **85%** (MMLU, 60 questions)
- Savings vs Always-Premium → **59%**

---

## New Slide — Between Evidence and Model Fine-tuned

**Title:** GPT-5.4 vs. ModelGate Router

| Subject | GPT-5.4 | Router | Delta |
|---|---|---|---|
| Elementary Math | 100% | 80% | -20pp |
| US History | 90% | 90% | 0 |
| Computer Science | 90% | 80% | -10pp |
| College Biology | 100% | 100% | 0 |
| Abstract Algebra | 60% | 70% | +10pp |
| Formal Logic | 100% | 90% | -10pp |
| **Overall** | **90%** | **85%** | **-5pp** |

Cost: $0.0095 (router) vs $0.023 (always GPT-5.4) — projected $1.58/mo vs $3.83/mo at 10k requests

**Takeaway:** 5pp accuracy trade-off. 59% cheaper. Hard questions routed correctly.

---

## Slide 10 — "Model Fine-tuned"

**Hero stats:** 83.3% accuracy | 62ms latency | +71.4pp medium fix | 2.5 min training

| Tier | Stock | Fine-Tuned | Delta |
|---|---|---|---|
| Simple | 87.9% | 81.8% | -6.1pp |
| **Medium** | **14.3%** | **85.7%** | **+71.4pp** |
| Complex | 100% | 85.7% | -14.3pp |
| **Overall** | **70.4%** | **83.3%** | **+13.0pp** |

- **Method:** GRPO (reinforcement learning) via Unsloth + TRL, LoRA rank 32 (2.3% of params)
- **Base model:** Arch-Router-1.5B (Qwen2.5-1.5B) → GGUF Q8_0 quantized to 1.6 GB
- **Training:** 150 steps, 172 labeled prompts, RTX 3080 Laptop 8GB
- **CoT variant rejected:** 61.1% accuracy, 1,787ms latency — overfit and 9x slower

**Callout:** Stock model misclassifies 86% of medium queries as complex. Our fine-tune fixes this.
