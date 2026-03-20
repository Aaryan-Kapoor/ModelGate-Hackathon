import type {
  CustomerProfile,
  RequestLogEntry,
  CustomerStats,
  GlobalStats,
  ModelConfig,
  RoutingDecision,
} from "./types";

const API_BASE = "http://localhost:8000";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// --- Customers ---
export const getCustomers = () => fetchJSON<CustomerProfile[]>("/customers");
export const getCustomer = (id: string) => fetchJSON<CustomerProfile>(`/customers/${id}`);
export const deleteCustomer = (id: string) =>
  fetchJSON(`/customers/${id}`, { method: "DELETE" });

export async function extractProfile(
  file: File,
  customerName: string,
  customInstructions: string
): Promise<CustomerProfile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("customer_name", customerName);
  formData.append("custom_instructions", customInstructions);
  const res = await fetch(`${API_BASE}/extract/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Extraction failed: ${await res.text()}`);
  return res.json();
}

// --- Logs & Stats ---
export const getLogs = (customerId: string, limit = 200) =>
  fetchJSON<RequestLogEntry[]>(`/logs/${customerId}?limit=${limit}`);
export const getAllLogs = (limit = 100) =>
  fetchJSON<RequestLogEntry[]>(`/logs?limit=${limit}`);
export const getStats = (customerId: string) =>
  fetchJSON<CustomerStats>(`/stats/${customerId}`);
export const getGlobalStats = () => fetchJSON<GlobalStats>("/stats");

// --- Models ---
export const getModels = () => fetchJSON<ModelConfig[]>("/models");
export const updateModel = (name: string, enabled: boolean, description = "") =>
  fetchJSON(`/models/${name}`, {
    method: "PUT",
    body: JSON.stringify({ enabled, description }),
  });

// --- Proxy / Playground ---
export async function sendPrompt(
  customerId: string,
  prompt: string
): Promise<{ response: string; routing: RoutingDecision & Record<string, string> }> {
  const res = await fetch(`${API_BASE}/v1/${customerId}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "auto",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Proxy error: ${res.status}`);

  const data = await res.json();
  let routing: Record<string, string> = {
    model: res.headers.get("x-model-used") || "unknown",
    classification: res.headers.get("x-classification") || "unknown",
    latency: res.headers.get("x-latency-ms") || "0",
    ttft: res.headers.get("x-ttft-ms") || "0",
    classifyMs: res.headers.get("x-classify-ms") || "0",
    cost: res.headers.get("x-cost") || "0",
  };

  const routingHeader = res.headers.get("x-routing-decision");
  if (routingHeader) {
    try {
      const parsed = JSON.parse(routingHeader);
      routing = { ...routing, ...parsed };
    } catch {}
  }

  const usage = data.usage || {};
  return {
    response: data.choices?.[0]?.message?.content || "",
    routing: {
      ...routing,
      tokens: String(usage.total_tokens || 0),
      input_tokens: String(usage.prompt_tokens || 0),
      output_tokens: String(usage.completion_tokens || 0),
    } as RoutingDecision & Record<string, string>,
  };
}
