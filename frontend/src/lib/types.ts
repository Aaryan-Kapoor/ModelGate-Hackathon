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
}

export interface CustomerStats {
  total_requests: number;
  avg_latency_ms: number;
  total_cost: number;
  cost_savings_vs_premium: number;
  model_distribution: Record<string, number>;
  requests_by_tier: Record<string, number>;
}

export interface RoutingDecision {
  selected_provider: string;
  selected_model: string;
  classification: string;
  reason: string;
  candidates_considered: string[];
  candidates_eliminated: Record<string, string>;
}
