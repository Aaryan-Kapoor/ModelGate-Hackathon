"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { extractProfile } from "@/lib/api";
import type { CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function NewCustomerPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<CustomerProfile | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleExtract = async () => {
    if (!file || !customerName.trim()) {
      setError("Please provide a customer name and upload a contract file.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const profile = await extractProfile(file, customerName, customInstructions);
      setResult(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Onboard Customer</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Upload a contract to auto-generate an AI routing profile</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Contract Upload</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Customer Name</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., ACME Corp" className="bg-secondary/30 border-border/50" />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Contract Document</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                dragOver ? "border-primary bg-primary/5 glow-cyan" : file ? "border-green-500/40 bg-green-500/5" : "border-border/50 hover:border-border"
              }`}
            >
              {file ? (
                <div>
                  <div className="text-sm font-medium text-green-400">{file.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 mx-auto text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  <div className="text-sm text-muted-foreground">Drop contract file here</div>
                  <div className="text-[10px] text-muted-foreground mt-1">or click to browse (.txt, .pdf)</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Custom Instructions <span className="text-muted-foreground/50">(optional)</span></label>
            <Textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} placeholder="e.g., Prioritize response speed. Only use EU data centers." rows={3} className="bg-secondary/30 border-border/50 text-sm resize-none" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs">{error}</div>
          )}

          <Button onClick={handleExtract} disabled={loading || !file || !customerName.trim()} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Analyzing contract...
              </span>
            ) : "Extract Profile"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card/50 border-primary/30 glow-cyan">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs uppercase tracking-widest text-primary">Profile Generated</CardTitle>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[9px]">Success</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Customer", v: result.customer_name },
                { l: "Use Case", v: result.use_case.replace(/_/g, " ") },
                { l: "Objective", v: result.objective.replace(/_/g, " ") },
                { l: "Region", v: result.constraints.region },
                { l: "Privacy", v: result.constraints.privacy_tier },
                { l: "Latency Target", v: `${result.performance.latency_target_ms}ms` },
              ].map(({ l, v }) => (
                <div key={l} className="bg-secondary/30 rounded px-3 py-2">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{l}</div>
                  <div className="text-xs font-medium font-mono mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {/* Routing */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Routing Preferences</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(result.routing_preferences).map(([tier, models]) => (
                  <div key={tier} className="bg-secondary/30 rounded p-2">
                    <Badge variant="outline" className={`text-[8px] mb-1 ${
                      tier === "simple" ? "border-green-500/30 text-green-400" : tier === "complex" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"
                    }`}>{tier}</Badge>
                    {models.map((m) => <div key={m} className="text-[10px] font-mono text-muted-foreground">{m}</div>)}
                  </div>
                ))}
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-400 mb-1">Warnings</div>
                {result.warnings.map((w, i) => (
                  <div key={i} className="text-[10px] text-amber-300/70 flex items-start gap-1.5 py-0.5">
                    <span className="text-amber-500">&#9651;</span>{w}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" className="text-xs" onClick={() => router.push(`/customers/${result.customer_id}`)}>View Profile</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/playground?customer=${result.customer_id}`)}>Open Playground</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
