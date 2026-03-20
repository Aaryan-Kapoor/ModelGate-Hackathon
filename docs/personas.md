# ModelGate — Target Personas

## Persona 1: AI Solutions Engineer at Assurant

**Role:** Deploys and configures AI-powered services for enterprise customers.

**Pain points:**
- Manually reading 50+ page contracts to identify AI constraints
- Unclear which model/provider to use for each customer
- Risk of violating data residency or provider restrictions
- Hours spent on configuration that could be automated

**How ModelGate helps:**
- Upload a contract, get a structured AI profile in seconds
- Automatic extraction of region, privacy, provider, and latency requirements
- Routing preferences generated based on contract analysis
- Eliminates manual onboarding work

---

## Persona 2: Enterprise Customer (Product Team)

**Role:** Building an AI-powered product that needs reliable, compliant AI inference.

**Pain points:**
- No internal expertise on which LLM to use
- Fear of compliance/privacy mistakes
- Unpredictable costs from using expensive models for every request
- Need a simple API endpoint — don't want to manage model infrastructure

**How ModelGate helps:**
- Receives a single OpenAI-compatible API endpoint
- Contract constraints are embedded into routing — compliance is automatic
- Smart routing minimizes costs without sacrificing quality
- Simple integration: just change the API URL

---

## Persona 3: Operations / Platform Team

**Role:** Maintains visibility and control across deployed AI services.

**Pain points:**
- No visibility into which models are being used across customers
- Fragmented logging across different providers
- Expensive default routing (everything goes to the premium model)
- Hard to compare performance across customer deployments

**How ModelGate helps:**
- Unified dashboard showing all customers, their profiles, and routing decisions
- Per-request logs with cost, latency, model used, and explanation
- Cost savings metrics: actual spend vs. if everything used the premium model
- Model distribution charts showing routing efficiency
