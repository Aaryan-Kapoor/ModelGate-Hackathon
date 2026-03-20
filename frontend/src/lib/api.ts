import type { CustomerProfile, RequestLogEntry, CustomerStats } from "./types";

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

export async function getCustomers(): Promise<CustomerProfile[]> {
  return fetchJSON("/customers");
}

export async function getCustomer(id: string): Promise<CustomerProfile> {
  return fetchJSON(`/customers/${id}`);
}

export async function deleteCustomer(id: string): Promise<void> {
  await fetchJSON(`/customers/${id}`, { method: "DELETE" });
}

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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Extraction failed: ${err}`);
  }
  return res.json();
}

export async function extractProfileFromText(
  customerName: string,
  contractText: string,
  customInstructions: string
): Promise<CustomerProfile> {
  return fetchJSON("/extract", {
    method: "POST",
    body: JSON.stringify({
      customer_name: customerName,
      contract_text: contractText,
      custom_instructions: customInstructions,
    }),
  });
}

export async function getLogs(customerId: string): Promise<RequestLogEntry[]> {
  return fetchJSON(`/logs/${customerId}`);
}

export async function getStats(customerId: string): Promise<CustomerStats> {
  return fetchJSON(`/stats/${customerId}`);
}

export async function sendPrompt(
  customerId: string,
  prompt: string
): Promise<{ response: string; routing: Record<string, string> }> {
  const res = await fetch(`${API_BASE}/v1/${customerId}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "auto",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Proxy error: ${res.status}`);
  }

  const data = await res.json();
  const routing: Record<string, string> = {
    model: res.headers.get("x-model-used") || "unknown",
    classification: res.headers.get("x-classification") || "unknown",
    latency: res.headers.get("x-latency-ms") || "0",
  };

  const routingDecision = res.headers.get("x-routing-decision");
  if (routingDecision) {
    try {
      const parsed = JSON.parse(routingDecision);
      routing.reason = parsed.reason || "";
      routing.provider = parsed.selected_provider || "";
    } catch {}
  }

  const content = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};

  return {
    response: content,
    routing: {
      ...routing,
      tokens: String(usage.total_tokens || 0),
    },
  };
}
