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
    <Suspense fallback={<div>Loading...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

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
      const preselected = searchParams.get("customer");
      if (preselected) {
        setSelectedCustomer(preselected);
      } else if (c.length > 0) {
        setSelectedCustomer(c[0].customer_id);
      }
    });
  }, [searchParams]);

  const handleSend = async () => {
    if (!selectedCustomer || !prompt.trim()) return;

    setLoading(true);
    try {
      const result = await sendPrompt(selectedCustomer, prompt);
      setHistory((prev) => [
        {
          prompt,
          response: result.response,
          routing: result.routing,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      setPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = customers.find((c) => c.customer_id === selectedCustomer);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Playground</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
              {selectedProfile && (
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <div>Objective: {selectedProfile.objective.replace(/_/g, " ")}</div>
                  <div>Region: {selectedProfile.constraints.region}</div>
                  <div>Latency target: {selectedProfile.performance.latency_target_ms}ms</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Send a Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your prompt here..."
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
                }}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !prompt.trim() || !selectedCustomer}
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Routing...
                  </span>
                ) : (
                  "Send"
                )}
              </Button>
              <div className="text-xs text-gray-400">Ctrl+Enter to send</div>
            </CardContent>
          </Card>

          {/* Quick prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Simple", text: "What is your return policy?" },
                { label: "Medium", text: "Summarize the warranty coverage for my electronics purchase and explain what's included" },
                { label: "Complex", text: "Analyze the liability exposure across multiple product warranty claims, evaluate coverage gaps, and recommend a comprehensive resolution strategy that minimizes legal risk" },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => setPrompt(q.text)}
                  className="w-full text-left text-xs p-2 rounded border hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{q.label}:</span> {q.text.slice(0, 60)}...
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-4">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <p>Send a prompt to see routing decisions and responses</p>
              </CardContent>
            </Card>
          ) : (
            history.map((entry, i) => (
              <Card key={i} className={i === 0 ? "border-blue-200" : ""}>
                <CardContent className="pt-4 space-y-3">
                  {/* Routing info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={
                        entry.routing.classification === "simple"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : entry.routing.classification === "complex"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {entry.routing.classification}
                    </Badge>
                    <Badge variant="outline">{entry.routing.model}</Badge>
                    <Badge variant="outline">{entry.routing.latency}ms</Badge>
                    <Badge variant="outline">{entry.routing.tokens} tokens</Badge>
                    <span className="text-xs text-gray-400 ml-auto">{entry.timestamp}</span>
                  </div>

                  {/* Routing reason */}
                  {entry.routing.reason && (
                    <div className="text-xs bg-gray-50 p-2 rounded text-gray-600">
                      <span className="font-medium">Why: </span>
                      {entry.routing.reason}
                    </div>
                  )}

                  {/* Prompt */}
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Prompt: </span>
                    {entry.prompt}
                  </div>

                  {/* Response */}
                  <div className="text-sm bg-blue-50/50 border border-blue-100 rounded-lg p-3 whitespace-pre-wrap">
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
