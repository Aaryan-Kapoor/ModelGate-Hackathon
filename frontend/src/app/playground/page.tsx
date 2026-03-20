"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCustomers, sendPrompt } from "@/lib/api";
import type { CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface HistoryEntry {
  prompt: string;
  response: string;
  routing: Record<string, string>;
  timestamp: string;
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm animate-pulse">Loading...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

const QUICK_PROMPTS = [
  { label: "Simple", tier: "simple", text: "What is your return policy?", color: "border-green-500/30 text-green-400 hover:bg-green-500/10" },
  { label: "Medium", tier: "medium", text: "Summarize the warranty coverage for my electronics purchase and explain what's included in the extended protection plan", color: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" },
  { label: "Complex", tier: "complex", text: "Analyze the liability exposure across multiple product warranty claims, evaluate coverage gaps in our current policy structure, and recommend a comprehensive resolution strategy that minimizes legal risk while maintaining customer satisfaction", color: "border-red-500/30 text-red-400 hover:bg-red-500/10" },
];

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    getCustomers().then((c) => {
      setCustomers(c);
      const pre = searchParams.get("customer");
      setSelectedCustomer(pre || (c.length > 0 ? c[0].customer_id : ""));
    });
  }, [searchParams]);

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Playground</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Test prompt routing in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Customer selector */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full bg-secondary/50 border border-border/50 rounded-md px-3 py-2 text-sm text-foreground"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>
                ))}
              </select>
              {selected && (
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Objective</span><span className="font-mono text-primary">{selected.objective.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Region</span><span className="font-mono text-blue-400">{selected.constraints.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Latency target</span><span className="font-mono">{selected.performance.latency_target_ms}ms</span>
                  </div>
                  {selected.constraints.forbidden_providers.length > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Blocked</span>
                      <span className="font-mono text-red-400">{selected.constraints.forbidden_providers.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt input */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your prompt..."
                rows={4}
                className="bg-secondary/30 border-border/50 text-sm resize-none"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
              />
              <Button onClick={handleSend} disabled={loading || !prompt.trim() || !selectedCustomer} className="w-full text-xs">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Routing...
                  </span>
                ) : "Send"}
              </Button>
              <div className="text-[9px] text-muted-foreground text-center">Ctrl+Enter to send</div>
            </CardContent>
          </Card>

          {/* Quick prompts */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Quick Prompts</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setPrompt(q.text)}
                  className={`w-full text-left text-[11px] p-2.5 rounded border transition-colors ${q.color}`}
                >
                  <span className="font-semibold">{q.label}:</span> {q.text.slice(0, 80)}...
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right panel - results */}
        <div className="lg:col-span-8 space-y-4">
          {history.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-20 text-center">
                <div className="text-muted-foreground text-sm">Send a prompt to see routing decisions</div>
                <div className="text-[10px] text-muted-foreground mt-1">The routing engine will classify your prompt and select the optimal model</div>
              </CardContent>
            </Card>
          ) : (
            history.map((entry, i) => (
              <Card key={i} className={`bg-card/50 border-border/50 ${i === 0 ? "glow-cyan" : ""}`}>
                <CardContent className="pt-4 space-y-3">
                  {/* Routing decision panel */}
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Routing Decision</div>
                      <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={`text-[9px] ${
                        entry.routing.classification === "simple" ? "border-green-500/30 text-green-400"
                        : entry.routing.classification === "complex" ? "border-red-500/30 text-red-400"
                        : "border-amber-500/30 text-amber-400"
                      }`}>{entry.routing.classification}</Badge>
                      <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{entry.routing.model || entry.routing.selected_model}</Badge>
                      {entry.routing.selected_provider && <Badge variant="outline" className="text-[9px]">{entry.routing.selected_provider}</Badge>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: "Total Latency", value: `${entry.routing.latency || entry.routing.latency_ms || "?"}ms` },
                        { label: "TTFT", value: `${entry.routing.ttft || entry.routing.ttft_ms || "?"}ms` },
                        { label: "Classify", value: `${entry.routing.classifyMs || entry.routing.classify_ms || "?"}ms` },
                        { label: "Cost", value: `$${Number(entry.routing.cost || 0).toFixed(6)}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-secondary/40 rounded px-2 py-1">
                          <div className="text-[8px] uppercase tracking-widest text-muted-foreground">{label}</div>
                          <div className="text-[11px] font-mono">{value}</div>
                        </div>
                      ))}
                    </div>
                    {entry.routing.reason && (
                      <div className="text-[10px] text-muted-foreground">
                        <span className="text-foreground font-medium">Why: </span>{entry.routing.reason}
                      </div>
                    )}
                    {entry.routing.candidates_eliminated && typeof entry.routing.candidates_eliminated === "object" && Object.keys(entry.routing.candidates_eliminated).length > 0 && (
                      <div className="text-[10px]">
                        <span className="text-muted-foreground">Eliminated: </span>
                        {Object.entries(entry.routing.candidates_eliminated).map(([m, r]) => (
                          <span key={m} className="text-red-400">{m} ({String(r)}) </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prompt */}
                  <div className="text-xs">
                    <span className="text-muted-foreground font-medium">Prompt: </span>{entry.prompt}
                  </div>

                  {/* Response */}
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {entry.response}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
