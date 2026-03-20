export interface CustomerConstraints {
  region: string;
  privacy_tier: string;
  forbidden_providers: string[];
  allowed_providers: string[];
}

export interface CustomerPerformance {
  latency_target_ms: number;
  cost_sensitivity: string;
}

export interface CustomerProfile {
  customer_id: string;
  customer_name: string;
  use_case: string;
  objective: string;
  constraints: CustomerConstraints;
  performance: CustomerPerformance;
  routing_preferences: Record<string, string[]>;
  warnings: string[];
  created_at: string;
}

export interface RequestLogEntry {
  id: number;
  customer_id: string;
  timestamp: string;
  prompt_preview: string;
  classification: string;
  selected_provider: string;
  selected_model: string;
  reason: string;
  latency_ms: number;
  estimated_cost: number;
  tokens_used: number;
  input_tokens: number;
  output_tokens: number;
  ttft_ms: number;
  status: string;
  candidates_considered: string[];
  candidates_eliminated: Record<string, string>;
}

export interface CustomerStats {
  total_requests: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  total_cost: number;
  cost_savings_vs_premium: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_ttft_ms: number;
  success_rate: number;
  model_distribution: Record<string, number>;
  requests_by_tier: Record<string, number>;
  provider_distribution: Record<string, number>;
  cost_by_model: Record<string, number>;
  latency_by_model: Record<string, number>;
  hourly_requests: { hour: string; count: number }[];
}

export interface GlobalStats {
  total_requests: number;
  total_customers: number;
  total_cost: number;
  cost_savings_vs_premium: number;
  avg_latency_ms: number;
  requests_today: number;
  cost_today: number;
  model_distribution: Record<string, number>;
  provider_distribution: Record<string, number>;
  customer_request_counts: Record<string, number>;
  hourly_requests: { hour: string; count: number }[];
}

export interface ModelConfig {
  model_name: string;
  enabled: boolean;
  description: string;
  provider: string;
  openrouter_id: string;
  tier: string;
  cost_per_m_input: number;
  cost_per_m_output: number;
  avg_latency_ms: number;
  regions: string[];
  max_context: number;
}

export interface RoutingDecision {
  selected_provider: string;
  selected_model: string;
  classification: string;
  reason: string;
  candidates_considered: string[];
  candidates_eliminated: Record<string, string>;
  latency_ms?: number;
  ttft_ms?: number;
  classify_ms?: number;
  cost?: number;
  input_tokens?: number;
  output_tokens?: number;
}
