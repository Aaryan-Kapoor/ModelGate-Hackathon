"use client";

import { useEffect, useState } from "react";
import { getModels, updateModel } from "@/lib/api";
import type { ModelConfig } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "border-amber-500/40 text-amber-400",
  openai: "border-green-500/40 text-green-400",
  google: "border-blue-500/40 text-blue-400",
  deepseek: "border-purple-500/40 text-purple-400",
};

const TIER_COLORS: Record<string, string> = {
  simple: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  complex: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getModels()
      .then(setModels)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (model: ModelConfig) => {
    setUpdating(model.model_name);
    try {
      await updateModel(model.model_name, !model.enabled, model.description);
      setModels((prev) =>
        prev.map((m) =>
          m.model_name === model.model_name ? { ...m, enabled: !m.enabled } : m
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground text-sm animate-pulse">Loading model registry...</div>
      </div>
    );
  }

  const enabledCount = models.filter((m) => m.enabled).length;
  const providers = [...new Set(models.map((m) => m.provider))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Model Registry</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure which models are available for customer routing
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span>{enabledCount}/{models.length} enabled</span>
          <span>{providers.length} providers</span>
        </div>
      </div>

      {/* Provider summary */}
      <div className="flex gap-2">
        {providers.map((p) => {
          const count = models.filter((m) => m.provider === p).length;
          const enabled = models.filter((m) => m.provider === p && m.enabled).length;
          return (
            <div key={p} className="bg-card/50 border border-border/50 rounded-lg px-4 py-2.5 flex items-center gap-3">
              <Badge variant="outline" className={`text-[10px] ${PROVIDER_COLORS[p] || "border-gray-500/40 text-gray-400"}`}>
                {p}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">{enabled}/{count}</span>
            </div>
          );
        })}
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card
            key={model.model_name}
            className={`bg-card/50 border-border/50 transition-all ${
              model.enabled ? "opacity-100" : "opacity-50"
            } ${updating === model.model_name ? "animate-pulse" : ""}`}
          >
            <CardContent className="pt-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{model.model_name}</h3>
                    <Badge variant="outline" className={`text-[9px] ${TIER_COLORS[model.tier] || ""}`}>
                      {model.tier}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${PROVIDER_COLORS[model.provider] || ""}`}>
                    {model.provider}
                  </Badge>
                </div>
                <Switch
                  checked={model.enabled}
                  onCheckedChange={() => handleToggle(model)}
                  disabled={updating === model.model_name}
                />
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground">{model.description}</p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/30 rounded px-2.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Input</div>
                  <div className="text-xs font-mono font-medium">${model.cost_per_m_input.toFixed(2)}/MTok</div>
                </div>
                <div className="bg-secondary/30 rounded px-2.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Output</div>
                  <div className="text-xs font-mono font-medium">${model.cost_per_m_output.toFixed(2)}/MTok</div>
                </div>
                <div className="bg-secondary/30 rounded px-2.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Latency</div>
                  <div className="text-xs font-mono font-medium">{model.avg_latency_ms}ms</div>
                </div>
                <div className="bg-secondary/30 rounded px-2.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Context</div>
                  <div className="text-xs font-mono font-medium">{(model.max_context / 1000).toFixed(0)}K</div>
                </div>
              </div>

              {/* Regions & ID */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {model.regions.map((r) => (
                    <Badge key={r} variant="outline" className="text-[9px] px-1.5">{r}</Badge>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[140px]">
                  {model.openrouter_id}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
