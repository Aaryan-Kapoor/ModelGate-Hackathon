"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCustomers, getModels, sendPrompt } from "@/lib/api";
import type { CustomerProfile, ModelConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlaygroundSkeleton } from "@/components/Skeletons";

interface HistoryEntry {
  prompt: string;
  response: string;
  routing: Record<string, string>;
  timestamp: string;
}

const PREMIUM_MODEL = {
  name: "gemini-2.5-pro",
  provider: "google",
  cost_per_m_input: 2.50,
  cost_per_m_output: 15.00,
  avg_latency_ms: 1500,
};

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm animate-pulse font-mono">Initializing workspace...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

const QUICK_PROMPTS = [
  { label: "Simple", tier: "simple", text: "What is your return policy?", color: "border-success/30 text-success hover:bg-success/10" },
  { label: "Medium", tier: "medium", text: "Summarize the warranty coverage for my electronics purchase and explain what's included in the extended protection plan", color: "border-warning/30 text-warning hover:bg-warning/10" },
  { label: "Complex", tier: "complex", text: "Analyze the liability exposure across multiple product warranty claims, evaluate coverage gaps in our current policy structure, and recommend a comprehensive resolution strategy that minimizes legal risk while maintaining customer satisfaction", color: "border-danger/30 text-danger hover:bg-danger/10" },
];

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [allModels, setAllModels] = useState<ModelConfig[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    Promise.all([getCustomers(), getModels()]).then(([c, m]) => {
      setCustomers(c);
      setAllModels(m);
      const pre = searchParams.get("customer");
      setSelectedCustomer(pre || (c.length > 0 ? c[0].customer_id : ""));
    }).finally(() => setPageLoading(false));
  }, [searchParams]);

  if (pageLoading) return <PlaygroundSkeleton />;

  const handleSend = async () => {
    if (!selectedCustomer || !prompt.trim()) return;
    setLoading(true);
    try {
      const result = await sendPrompt(selectedCustomer, prompt);
      setHistory((prev) => [{ prompt, response: result.response, routing: result.routing, timestamp: new Date().toLocaleTimeString() }, ...prev]);
      setPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selected = customers.find((c) => c.customer_id === selectedCustomer);

  const premiumModelRaw = allModels.length > 0
    ? allModels.reduce((prev, curr) => curr.cost_per_m_input > prev.cost_per_m_input ? curr : prev, allModels[0])
    : null;
  const premiumModel = premiumModelRaw
    ? { name: premiumModelRaw.model_name, provider: premiumModelRaw.provider, cost_per_m_input: premiumModelRaw.cost_per_m_input, cost_per_m_output: premiumModelRaw.cost_per_m_output, avg_latency_ms: premiumModelRaw.avg_latency_ms }
    : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-light tracking-tight">Playground</h1>
        <p className="text-muted-foreground mt-1">Test prompt routing and evaluate latency/cost tradeoffs in real-time.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left panel: Command Center */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          
          {/* Customer Context */}
          <div className="space-y-3">
            <label className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Routing Profile</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>
              ))}
            </select>
            
            {selected && (
              <div className="bg-surface/50 rounded-lg p-4 border border-border/50 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objective</span>
                  <span className="text-primary">{selected.objective.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span className="text-foreground">{selected.constraints.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Latency</span>
                  <span className="text-foreground">{selected.performance.latency_target_ms}ms</span>
                </div>
                {selected.constraints.forbidden_providers.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blocked</span>
                    <span className="text-danger">{selected.constraints.forbidden_providers.join(", ")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="space-y-3">
            <label className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Test Vectors</label>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setPrompt(q.text)}
                  className={`text-left text-xs p-3 rounded-lg border transition-all duration-200 ${q.color}`}
                >
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">{q.label}</span>
                  <span className="opacity-90 leading-relaxed">{q.text.slice(0, 80)}...</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="mt-auto space-y-3">
            <label className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Input</label>
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt to evaluate routing..."
                rows={5}
                className="w-full bg-[#0a0a0a] border border-border rounded-xl p-4 text-sm font-mono resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline-block">⌘ + Enter</span>
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !prompt.trim() || !selectedCustomer}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 rounded-md text-xs font-medium transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Routing
                    </span>
                  ) : "Execute"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Results Stream */}
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-surface border-b border-border px-6 py-3 flex justify-between items-center">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Execution Log</span>
            <span className="text-xs font-mono text-muted-foreground">{history.length} entries</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-lg font-light text-foreground">Awaiting Execution</div>
                <div className="text-sm text-muted-foreground mt-2 font-mono">System ready for prompt injection</div>
              </div>
            ) : (
              history.map((entry, i) => {
                const actualModel = entry.routing.model || entry.routing.selected_model || "unknown";
                const actualModelInfo = allModels.find(m => m.model_name === actualModel);
                const actualCost = Number(entry.routing.cost || 0);
                const inputTokens = Number(entry.routing.input_tokens || 0);
                const outputTokens = Number(entry.routing.output_tokens || 0);

                const premiumRef = premiumModel || PREMIUM_MODEL;
                const premiumCost = inputTokens > 0
                  ? (inputTokens / 1_000_000) * premiumRef.cost_per_m_input + (outputTokens / 1_000_000) * premiumRef.cost_per_m_output
                  : actualCost * 3;
                const savings = premiumCost - actualCost;
                const savingsPercent = premiumCost > 0 ? ((savings / premiumCost) * 100) : 0;

                return (
                  <div key={i} className={`space-y-4 animate-fade-in-up ${i !== history.length - 1 ? "pb-8 border-b border-border/30" : ""}`}>
                    {/* Input */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0 border border-border">
                        <span className="text-xs font-mono text-muted-foreground">IN</span>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className="text-sm text-foreground leading-relaxed">{entry.prompt}</div>
                      </div>
                    </div>

                    {/* Routing Decision Block */}
                    <div className="ml-12 bg-surface/30 border border-border/50 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium tracking-widest text-primary uppercase">Routing Decision</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${
                            entry.routing.classification === "simple" ? "border-success/30 text-success bg-success/5"
                            : entry.routing.classification === "complex" ? "border-danger/30 text-danger bg-danger/5"
                            : "border-warning/30 text-warning bg-warning/5"
                          }`}>{entry.routing.classification}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selected Model */}
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Selected Model</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-primary">{actualModel}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">{entry.routing.selected_provider || actualModelInfo?.provider || "?"}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            <span className="text-foreground">Reason: </span>{entry.routing.reason || "Optimal balance of cost and performance"}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Latency</div>
                            <div className="text-sm font-mono">{entry.routing.latency || entry.routing.latency_ms || "?"}ms</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Cost</div>
                            <div className="text-sm font-mono text-success">${actualCost.toFixed(6)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Savings Comparison */}
                      {savings > 0 && (
                        <div className="mt-4 bg-success/5 border border-success/20 rounded-lg p-3 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Premium alternative (<span className="font-mono text-foreground">{premiumRef.name}</span>) would cost <span className="font-mono text-danger">${premiumCost.toFixed(6)}</span>
                          </div>
                          <div className="text-xs font-mono text-success font-bold">
                            Saved ${(savings).toFixed(6)} ({savingsPercent.toFixed(0)}%)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Output */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                        <span className="text-xs font-mono text-primary">OUT</span>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.response}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
