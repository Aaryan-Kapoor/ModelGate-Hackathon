"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractProfile } from "@/lib/api";
import type { CustomerProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ── step indicator ─────────────────────────────────────────── */
function StepIndicator({ step }: { step: number }) {
  const steps = ["Upload Contract", "Configure", "Review Profile"];
  return (
    <div className="flex items-center gap-2 mb-12">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step >= num;
        const current = step === num;
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`h-px w-8 transition-colors duration-500 ${active ? "bg-primary/60" : "bg-border"}`} />
            )}
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full text-xs font-mono flex items-center justify-center transition-all duration-500 ${
                  current
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                    : active
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-surface border border-border text-muted-foreground"
                }`}
              >
                {active && step > num ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : num}
              </div>
              <span className={`text-sm font-medium tracking-wide transition-colors duration-500 ${current ? "text-foreground" : active ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
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
    <div className="space-y-3">
      <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Contract Document
      </span>

      {file ? (
        /* ── file selected state ── */
        <div className="border border-success/30 bg-success/5 rounded-xl p-5 flex items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-base font-medium text-success truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="h-10 w-10 rounded-full bg-surface hover:bg-danger/20 text-muted-foreground hover:text-danger flex items-center justify-center transition-colors flex-shrink-0 border border-border hover:border-danger/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragOver
              ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,229,255,0.1)] scale-[1.02]"
              : "border-border hover:border-primary/40 hover:bg-surface"
          }`}
        >
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileSelected(f);
              const input = e.target;
              requestAnimationFrame(() => { input.value = ""; });
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload contract file"
          />
          <div className="pointer-events-none">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${
              dragOver ? "bg-primary/20 text-primary" : "bg-surface text-muted-foreground border border-border"
            }`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-lg text-muted-foreground mb-2">
              Drop your contract here, or <span className="text-primary font-medium">browse files</span>
            </div>
            <div className="text-xs text-muted-foreground/60 font-mono">.txt, .md, .pdf accepted</div>
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
    simple: "border-success/30 text-success bg-success/5",
    medium: "border-warning/30 text-warning bg-warning/5",
    complex: "border-danger/30 text-danger bg-danger/5",
  };

  return (
    <div className="glass-panel rounded-2xl p-8 border border-primary/30 shadow-[0_0_30px_rgba(0,229,255,0.1)] animate-fade-in-up">
      <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center border border-success/30">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-light tracking-tight">{profile.customer_name}</h2>
            <div className="text-xs text-muted-foreground font-mono mt-1">{profile.customer_id}</div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/30 text-xs font-mono uppercase tracking-widest">
          Profile Generated
        </span>
      </div>

      <div className="space-y-8">
        {/* ── key metrics grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { l: "Use Case", v: profile.use_case.replace(/_/g, " "), icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" },
            { l: "Objective", v: profile.objective.replace(/_/g, " "), icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
            { l: "Region", v: profile.constraints.region, icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" },
          ].map(({ l, v, icon }) => (
            <div key={l} className="bg-surface/50 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</span>
              </div>
              <div className="text-sm font-medium capitalize text-foreground">{v}</div>
            </div>
          ))}
        </div>

        {/* ── constraints row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface/50 border border-border rounded-xl p-4 flex justify-between items-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Privacy Tier</div>
            <span className={`text-xs font-mono px-2 py-1 rounded border ${profile.constraints.privacy_tier === 'high' ? 'border-danger/30 text-danger bg-danger/5' : 'border-border text-muted-foreground'}`}>{profile.constraints.privacy_tier}</span>
          </div>
          <div className="bg-surface/50 border border-border rounded-xl p-4 flex justify-between items-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Latency Target</div>
            <span className="text-lg font-mono font-light text-primary">{profile.performance.latency_target_ms}ms</span>
          </div>
        </div>

        {/* ── routing preferences ── */}
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Routing Preferences</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(profile.routing_preferences).map(([tier, models]) => (
              <div key={tier} className="bg-surface/30 border border-border rounded-xl p-4">
                <span className={`inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded border mb-3 ${TIER_STYLE[tier] || "border-border text-muted-foreground"}`}>{tier}</span>
                <div className="space-y-2">
                  {models.map((m) => (
                    <div key={m} className="text-xs font-mono text-muted-foreground truncate">{m}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── warnings ── */}
        {profile.warnings.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Diagnostics</div>
            <div className="space-y-2">
              {profile.warnings.map((w, i) => {
                const isStructured = typeof w === "object" && w !== null;
                const severity = isStructured ? w.severity : "warning";
                const type = isStructured ? w.type : "contract_ambiguity";
                const message = isStructured ? w.message : String(w);

                const severityStyles = {
                  critical: "border-danger/30 bg-danger/5",
                  warning: "border-warning/30 bg-warning/5",
                  info: "border-primary/30 bg-primary/5",
                };
                const severityIcon = {
                  critical: "text-danger",
                  warning: "text-warning",
                  info: "text-primary",
                };
                const typeLabels: Record<string, string> = {
                  provider_gap: "PROVIDER",
                  model_gap: "MODEL",
                  region_gap: "REGION",
                  missing_field: "MISSING",
                  contract_ambiguity: "AMBIGUITY",
                };

                return (
                  <div key={i} className={`border rounded-xl p-4 flex items-start gap-4 ${severityStyles[severity] || severityStyles.warning}`}>
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${severityIcon[severity] || severityIcon.warning}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {severity === "critical" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      ) : severity === "info" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      )}
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest ${severityIcon[severity] || ""} border-current/30`}>
                          {severity}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{typeLabels[type] || type}</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── actions ── */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
          <Button size="lg" className="flex-1 bg-surface hover:bg-surface/80 border border-border text-foreground" onClick={onViewProfile}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            View Full Profile
          </Button>
          <Button size="lg" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onOpenPlayground}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
            Test in Playground
          </Button>
        </div>
      </div>
    </div>
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
    <div className="max-w-4xl mx-auto py-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">Onboard Customer</h1>
          <p className="text-lg text-muted-foreground">
            Upload a contract to auto-generate an AI routing profile.
          </p>
        </div>
        {(file || result) && (
          <Button variant="outline" size="sm" className="border-border hover:bg-surface" onClick={handleReset}>
            Start Over
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <StepIndicator step={currentStep} />

      {/* Upload + Config Form */}
      {!result && (
        <div className="space-y-8">
          <FileDropZone
            file={file}
            onFileSelected={(f) => { setFile(f); setError(""); }}
            onClear={() => setFile(null)}
          />

          {file && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Customer Name
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., ACME Corp"
                  className="bg-surface border-border h-12 text-base focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              {customerName.trim() && (
                <div className="space-y-3 animate-fade-in-up">
                  <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Custom Instructions <span className="text-muted-foreground/40 font-normal lowercase">(optional)</span>
                  </label>
                  <Textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Prioritize response speed. Only use EU data centers."
                    rows={4}
                    className="bg-surface border-border text-base resize-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger px-5 py-4 rounded-xl text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <Button
                onClick={handleExtract}
                disabled={loading || !customerName.trim()}
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-medium mt-4"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Analyzing contract with AI...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Extract Profile
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
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
