# ModelGate — 5-Minute Demo Script

## 0:00 - 0:30 | The Problem

"When an enterprise deploys AI services for different customers, someone has to manually read contracts, figure out which models are allowed, what regions data can flow through, what latency and cost targets matter, and wire it all up by hand. That's slow, error-prone, and wasteful."

"Every unnecessary premium model call that should have been handled by a cheaper model wastes money and compute resources."

## 0:30 - 1:30 | Upload + Extract

- Open dashboard at localhost:3000
- Click "New Customer"
- Drag and drop the ACME contract file
- Type customer name: "ACME Support"
- Add custom instruction: "Prioritize response speed for routine queries"
- Click "Extract Profile"
- Show the extracted profile:
  - EU-only region (from GDPR clause)
  - High privacy tier (PII handling)
  - DeepSeek blocked (China-based provider restriction)
  - 1000ms latency target
  - Cost-sensitive
  - Routing: simple → gpt-4o-mini, medium → claude-sonnet, complex → gpt-4o

## 1:30 - 2:15 | Review Profile

- Click through to the full profile page
- Point out the generated API endpoint URL
- Show the constraints card: region, privacy, allowed/blocked providers
- Show the routing preferences table
- Show the warnings extracted from the contract

## 2:15 - 3:30 | Live Routing

- Open the Playground
- Select ACME Support customer
- Send the **simple** quick prompt: "What is your return policy?"
  - Show: routed to gpt-4o-mini, ~300ms, $0.00004
- Send the **complex** quick prompt: "Analyze the liability exposure..."
  - Show: routed to gpt-4o, ~5s, $0.006
- Point out: **same endpoint, same API format, different models chosen automatically**
- The classification model (Arch Router) runs locally on GPU in ~50ms

## 3:30 - 4:15 | Metrics + Value

- Navigate to the Logs page
- Show the model distribution pie chart — most requests go to cheaper models
- Show the complexity bar chart — simple queries dominate
- Show the request log table with per-request routing explanations
- Point out cost savings: "If every request went to the premium model, it would cost X. Our routing saved Y%."

## 4:15 - 5:00 | Close

- "ModelGate reduces customer AI onboarding from hours to seconds"
- "Contract constraints are embedded directly into routing policy — compliance is automatic"
- "We eliminate operational waste by right-sizing model usage to each request"
- "Three personas benefit: the solutions engineer, the customer, and the ops team"
- "This is a contract-aware AI control plane for enterprise deployment"
- "It's sustainable because every unnecessary premium model call we prevent saves compute, energy, and money"
