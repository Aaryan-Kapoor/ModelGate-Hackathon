# ModelGate Presentation Script

## Slide 1 — Title
"Right now, every company using AI is making the same mistake — they pick one premium model and send everything to it. Simple questions, complex questions, it doesn't matter. They're overpaying by 10 to 30x and they don't even know it. We're Agents Assemble, and we built ModelGate to fix that."

## Slide 2 — The Assurant Way
"Assurant's mission is helping people thrive in a connected world. But right now, AI is expensive, wasteful, and impossible to configure correctly at scale. Premium models consume 180 times more energy than small models per query. 50 to 90 percent of enterprise AI spend is wasted on over-provisioned models. The market is $37 billion and growing 3.2x year over year — but only 51% of organizations can even measure their AI ROI."

## Slide 3 — The Problem Is Universal
"This hits every layer of the stack. Developers don't have time to evaluate 200+ models, so they pick one premium option and never revisit it — overpaying by 10 to 30x. Enterprise customers have contract constraints that get manually translated into config or silently ignored, creating legal exposure. End users ask 'what is your return policy?' and wait 2 seconds because it got routed to a slow premium model. And data centers burn GPU capacity on queries a small model would answer perfectly."

## Slide 4 — The Fix
"The fix is one line of code. Same OpenAI SDK. Same code. Just change the base URL to point at ModelGate. Before: every request goes to the same model forever. After: the right model, every request, automatically. It's fully API compatible — no SDK changes, no rewrites. Contract constraints become routing rules. And it always picks the cheapest model that satisfies every constraint."

## Slide 5 — Who It Serves
"Three personas benefit simultaneously. The developer who says 'I want the best AI model but I don't have time to evaluate every new one.' The compliance team who says 'our contracts ban certain providers and I'm not sure engineers will remember.' And the operations lead who says 'I have no idea what our AI is costing us or which models we're using.'"

## Slide 6 — System Architecture
"Two phases, fully automated, no ongoing effort. Phase 1 is onboarding — takes about 30 seconds. You upload your contracts and SLAs, an LLM reads and extracts constraints, it generates a structured Customer AI Profile, and an OpenAI-compatible endpoint goes live. Phase 2 is runtime routing with about 50ms of overhead. Every prompt is received and classified as simple, medium, or complex. Heuristic filters are applied, models are scored and ranked, and the best model is selected and the response is routed back. Simple queries go to cheap fast models like GPT 5.4 nano or Gemini Flash Lite. Medium queries go to mid-tier models like Sonnet 4.6 or Grok 4.1. Complex queries go to premium models like GPT 5.4 or Opus 4.6."

## Slide 7 — Live Demo
*[Run the live demo: upload a contract, show onboarding, send test queries, show routing in real-time on the dashboard]*

## Slide 8 — Evidence
"Here are our live results. Onboarding takes under 30 seconds from contract to endpoint. Classification runs in about 50 milliseconds using our fine-tuned Arch-Router model. We ran a 60-question MMLU benchmark through the router and hit 85% accuracy. And compared to always routing to the premium model, we achieved 59% cost savings. Published research backs this up — FrugalGPT from Stanford showed up to 98% cost reduction matching GPT-4 quality, RouteLLM from LMSYS at ICLR 2025 showed over 85% cost reduction at 95% of GPT-4 performance, and they found only 14% of queries actually need the most capable model."

## Slide 9 — GPT-5.4 vs. ModelGate Router
"We benchmarked this head-to-head. 60 MMLU questions across six subjects, GPT-5.4 with high reasoning versus our router. GPT-5.4 gets 90% overall, our router gets 85%. But look at the breakdown — on easy subjects like US History and College Biology, we match or tie. On Abstract Algebra, we actually beat GPT-5.4, 70% to 60%. The 5 percentage point gap comes from easy questions where cheaper models occasionally miss, but those are the exact queries saving us the most money. Cost comparison: $0.0095 for the router versus $0.023 for always-premium. That projects to $1.58 per month versus $3.83 at 10k requests. 59% cheaper, and hard questions still get routed correctly."

## Slide 10 — Model Fine-tuned
"We didn't just use the stock classifier — we fine-tuned it. 83.3% overall accuracy, 50ms latency, and we made it 3.2x faster through GGUF quantization. The big win is the medium tier. The stock Arch-Router model only gets 14.3% accuracy on medium queries — it misclassifies 86% of them as complex, routing them to expensive premium models when a mid-tier model would work fine. Our fine-tune jumps that to 85.7% — a 71.4 percentage point improvement. We used GRPO reinforcement learning through Unsloth and TRL, LoRA rank 32 training only 2.3% of parameters. The base model is Arch-Router-1.5B built on Qwen 2.5, quantized to a 1.6 gigabyte GGUF file. Training took 150 steps on 172 labeled prompts, on an RTX 3080 Laptop with 8 gigs of VRAM, evaluated on a held-out test set with zero overlap."

## Slide 11 — Impact & Close
"One change. Benefits at every layer. For the business — 60 to 98% cost savings through intelligent right-sizing. For end users — simple queries get fast answers, complex queries get powerful models. For data centers — less unnecessary GPU load on premium clusters. For the energy grid — up to 180x less energy per routed-away premium call, and that compounds. And for compliance — contract constraints become routing rules, enforced per request, automatically. Zero human error."

## Slide 12 — Thank You
"ModelGate is the lowest-friction AI optimization available today. You change one line of code. We eliminate thousands of wasteful premium model calls automatically. Thank you."
