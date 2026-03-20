"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractProfile } from "@/lib/api";
import type { CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/* ── step indicator ─────────────────────────────────────────── */
function StepIndicator({ step }: { step: number }) {
  const steps = ["Upload Contract", "Configure", "Review Profile"];
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step >= num;
        const current = step === num;
        return (
          <div key={label} className="flex items-center gap-1">
            {i > 0 && (
              <div className={`h-px w-6 transition-colors duration-300 ${active ? "bg-primary/60" : "bg-border/40"}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-5 w-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all duration-300 ${
                  current
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                    : active
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/40 text-muted-foreground/50"
                }`}
              >
                {active && step > num ? (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : num}
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${current ? "text-foreground" : active ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── file drop zone ─────────────────────────────────────────── */
function FileDropZone({
  file,
  onFileSelected,
  onClear,
}: {
  file: File | null;
  onFileSelected: (f: File) => void;
  onClear: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-2">
      <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
        Contract Document
      </span>

      {file ? (
        /* ── file selected state ── */
        <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4 flex items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-green-400 truncate">{file.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="h-7 w-7 rounded-md bg-secondary/60 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        /* ── drop zone / click to browse ── */
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) onFileSelected(dropped);
          }}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragOver
              ? "border-primary bg-primary/5 glow-cyan scale-[1.01]"
              : "border-border/50 hover:border-primary/40 hover:bg-primary/[0.02]"
          }`}
        >
          {/* The actual file input — styled as a full overlay so ANY click in the zone triggers it */}
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileSelected(f);
              // Defer reset so file ref is captured by React state first
              const input = e.target;
              requestAnimationFrame(() => { input.value = ""; });
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload contract file"
          />
          <div className="pointer-events-none">
            <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 ${
              dragOver ? "bg-primary/15" : "bg-secondary/50"
            }`}>
              <svg className={`w-5 h-5 transition-colors duration-200 ${dragOver ? "text-primary" : "text-muted-foreground"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-sm text-muted-foreground">
              Drop your contract here, or <span className="text-primary font-medium">browse files</span>
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">.txt .md .pdf accepted</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── profile result card ────────────────────────────────────── */
function ProfileResult({
  profile,
  onViewProfile,
  onOpenPlayground,
}: {
  profile: CustomerProfile;
  onViewProfile: () => void;
  onOpenPlayground: () => void;
}) {
  const TIER_STYLE: Record<string, string> = {
    simple: "border-green-500/30 text-green-400",
    medium: "border-amber-500/30 text-amber-400",
    complex: "border-red-500/30 text-red-400",
  };

  return (
    <Card className="bg-card/50 border-primary/20 glow-cyan animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-green-500/15 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{profile.customer_name}</CardTitle>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{profile.customer_id}</div>
            </div>
          </div>
          <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[9px] font-mono">PROFILE GENERATED</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── key metrics grid ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Use Case", v: profile.use_case.replace(/_/g, " "), icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" },
            { l: "Objective", v: profile.objective.replace(/_/g, " "), icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
            { l: "Region", v: profile.constraints.region, icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" },
          ].map(({ l, v, icon }) => (
            <div key={l} className="bg-secondary/20 border border-border/30 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{l}</span>
              </div>
              <div className="text-xs font-medium font-mono capitalize">{v}</div>
            </div>
          ))}
        </div>

        {/* ── constraints row ── */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/20 border border-border/30 rounded-lg px-3 py-2.5">
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Privacy Tier</div>
            <Badge variant="outline" className="text-[9px]">{profile.constraints.privacy_tier}</Badge>
          </div>
          <div className="bg-secondary/20 border border-border/30 rounded-lg px-3 py-2.5">
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1">Latency Target</div>
            <span className="text-xs font-mono font-bold text-primary">{profile.performance.latency_target_ms}ms</span>
          </div>
        </div>

        {/* ── routing preferences ── */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Routing Preferences</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(profile.routing_preferences).map(([tier, models]) => (
              <div key={tier} className="bg-secondary/20 border border-border/30 rounded-lg p-2.5">
                <Badge variant="outline" className={`text-[8px] mb-1.5 ${TIER_STYLE[tier] || "border-border text-muted-foreground"}`}>{tier}</Badge>
                <div className="space-y-0.5">
                  {models.map((m) => (
                    <div key={m} className="text-[10px] font-mono text-muted-foreground truncate">{m}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── warnings ── */}
        {profile.warnings.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-widest text-amber-400 mb-1.5 font-medium">Warnings</div>
            {profile.warnings.map((w, i) => (
              <div key={i} className="text-[10px] text-amber-300/70 flex items-start gap-1.5 py-0.5">
                <span className="text-amber-500 mt-px">&#9651;</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── actions ── */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="text-xs flex-1" onClick={onViewProfile}>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            View Full Profile
          </Button>
          <Button size="sm" variant="outline" className="text-xs flex-1" onClick={onOpenPlayground}>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
            Test in Playground
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── main page ──────────────────────────────────────────────── */
export default function NewCustomerPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CustomerProfile | null>(null);

  const currentStep = result ? 3 : file ? 2 : 1;

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

  const handleReset = () => {
    setFile(null);
    setCustomerName("");
    setCustomInstructions("");
    setError("");
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Onboard Customer</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a contract to auto-generate an AI routing profile
          </p>
        </div>
        {(file || result) && (
          <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={handleReset}>
            Start Over
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <StepIndicator step={currentStep} />

      {/* Upload + Config card */}
      {!result && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              Contract Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File drop zone */}
            <FileDropZone
              file={file}
              onFileSelected={(f) => { setFile(f); setError(""); }}
              onClear={() => setFile(null)}
            />

            {/* Customer name — appears after file selected */}
            {file && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  Customer Name
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., ACME Corp"
                  className="bg-secondary/30 border-border/50"
                  autoFocus
                />
              </div>
            )}

            {/* Custom instructions — appears after name */}
            {file && customerName.trim() && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  Custom Instructions{" "}
                  <span className="text-muted-foreground/40">(optional)</span>
                </label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g., Prioritize response speed. Only use EU data centers."
                  rows={3}
                  className="bg-secondary/30 border-border/50 text-sm resize-none"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            {file && (
              <Button
                onClick={handleExtract}
                disabled={loading || !customerName.trim()}
                className="w-full animate-in fade-in duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Analyzing contract with AI...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    Extract Profile
                  </span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <ProfileResult
          profile={result}
          onViewProfile={() => router.push(`/customers/${result.customer_id}`)}
          onOpenPlayground={() => router.push(`/playground?customer=${result.customer_id}`)}
        />
      )}
    </div>
  );
}
