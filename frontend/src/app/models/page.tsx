"use client";

import { useEffect, useState, useCallback } from "react";
import { getModels, updateModel, addModel, removeModel, searchOpenRouterModels } from "@/lib/api";
import type { ModelConfig, OpenRouterModel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModelsSkeleton } from "@/components/Skeletons";

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "text-warning border-warning/30 bg-warning/5",
  openai: "text-success border-success/30 bg-success/5",
  google: "text-primary border-primary/30 bg-primary/5",
  deepseek: "text-accent border-accent/30 bg-accent/5",
  meta: "text-sky-400 border-sky-400/30 bg-sky-400/5",
  "meta-llama": "text-sky-400 border-sky-400/30 bg-sky-400/5",
  mistralai: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  cohere: "text-rose-400 border-rose-400/30 bg-rose-400/5",
  qwen: "text-teal-400 border-teal-400/30 bg-teal-400/5",
};

const TIER_COLORS: Record<string, string> = {
  simple: "text-success border-success/30",
  medium: "text-warning border-warning/30",
  complex: "text-danger border-danger/30",
};

const TIER_OPTIONS = ["simple", "medium", "complex"];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Catalog
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<OpenRouterModel[]>([]);
  const [searching, setSearching] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [addingModel, setAddingModel] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    getModels().then(setModels).catch(console.error);
  }, []);

  // Load models + initial catalog on mount
  useEffect(() => {
    Promise.all([
      getModels(),
      searchOpenRouterModels(""),
    ]).then(([m, catalog]) => {
      setModels(m);
      setCatalogResults(catalog);
      setCatalogLoaded(true);
    }).catch(console.error).finally(() => setLoading(false));
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

  const handleRemove = async (modelName: string) => {
    setUpdating(modelName);
    try {
      await removeModel(modelName);
      setModels((prev) => prev.filter((m) => m.model_name !== modelName));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearching(true);
    try {
      const results = await searchOpenRouterModels(query);
      setCatalogResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (orModel: OpenRouterModel) => {
    const tier = selectedTier[orModel.id] || "medium";
    const friendlyName = slugify(orModel.name || orModel.id.split("/").pop() || orModel.id);
    setAddingModel(orModel.id);
    try {
      await addModel({
        model_name: friendlyName,
        provider: orModel.provider,
        openrouter_id: orModel.id,
        tier,
        cost_per_m_input: orModel.cost_per_m_input || 0,
        cost_per_m_output: orModel.cost_per_m_output || 0,
        avg_latency_ms: 500,
        regions: ["US", "EU"],
        max_context: orModel.context_length || 128000,
        description: `${orModel.name || orModel.id} via OpenRouter`,
      });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingModel(null);
    }
  };

  if (loading) return <ModelsSkeleton />;

  const enabledCount = models.filter((m) => m.enabled).length;
  const existingIds = new Set(models.map((m) => m.openrouter_id));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-light tracking-tight">Model Registry</h1>
        <p className="text-muted-foreground mt-1">
          Browse the catalog and configure which models power your routing engine.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* LEFT: OpenRouter Catalog */}
        <div className="flex flex-col bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden h-full">
          <div className="p-6 border-b border-border/50 space-y-4 flex-shrink-0 bg-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Global Catalog</span>
              {catalogLoaded && (
                <span className="text-xs font-mono text-muted-foreground">{catalogResults.length} available</span>
              )}
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search models (e.g., claude, gpt-4, llama)..."
              className="bg-surface border-border/50 h-10 text-sm focus:border-primary transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {searching && catalogResults.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : catalogResults.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No models found matching your search.
              </div>
            ) : (
              <div className="space-y-1">
                {catalogResults.map((orModel) => {
                  const alreadyAdded = existingIds.has(orModel.id);
                  const tier = selectedTier[orModel.id] || "medium";
                  return (
                    <div
                      key={orModel.id}
                      className={`p-4 rounded-xl transition-colors ${
                        alreadyAdded ? "bg-success/5 border border-success/10" : "hover:bg-surface border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium text-foreground truncate">{orModel.name || orModel.id}</span>
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${PROVIDER_COLORS[orModel.provider] || "border-border text-muted-foreground bg-surface"}`}>
                              {orModel.provider}
                            </span>
                            {alreadyAdded && (
                              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-success/30 text-success bg-success/10">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                            <span>${(orModel.cost_per_m_input || 0).toFixed(2)}/M in</span>
                            <span>${(orModel.cost_per_m_output || 0).toFixed(2)}/M out</span>
                            <span>{((orModel.context_length || 0) / 1000).toFixed(0)}K ctx</span>
                          </div>
                        </div>

                        {!alreadyAdded && (
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex bg-surface rounded-lg p-1 border border-border">
                              {TIER_OPTIONS.map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setSelectedTier((prev) => ({ ...prev, [orModel.id]: t }))}
                                  className={`px-3 py-1 text-[10px] uppercase tracking-widest font-medium rounded-md transition-colors ${
                                    tier === t
                                      ? t === "simple" ? "bg-success/20 text-success"
                                        : t === "complex" ? "bg-danger/20 text-danger"
                                        : "bg-warning/20 text-warning"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => handleAdd(orModel)}
                              disabled={addingModel === orModel.id}
                            >
                              {addingModel === orModel.id ? (
                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Your Models */}
        <div className="flex flex-col bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden h-full">
          <div className="p-6 border-b border-border/50 flex-shrink-0 bg-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium tracking-widest text-primary uppercase">Active Registry</span>
              <span className="text-xs font-mono text-muted-foreground">
                <span className="text-foreground">{enabledCount}</span> / {models.length} enabled
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {models.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="text-lg font-light text-foreground">Registry Empty</p>
                <p className="text-sm text-muted-foreground mt-2">Add models from the catalog to build your routing pool.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {models.map((model) => (
                  <div
                    key={model.model_name}
                    className={`p-4 rounded-xl transition-all border border-transparent hover:border-border/50 hover:bg-surface/30 ${
                      model.enabled ? "" : "opacity-50 grayscale"
                    } ${updating === model.model_name ? "animate-pulse" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-base font-medium text-foreground">{model.model_name}</span>
                          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${TIER_COLORS[model.tier] || "border-border text-muted-foreground"}`}>
                            {model.tier}
                          </span>
                          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${PROVIDER_COLORS[model.provider] || "border-border text-muted-foreground bg-surface"}`}>
                            {model.provider}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">{model.description}</p>

                        <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                          <span>${model.cost_per_m_input.toFixed(2)}/M in</span>
                          <span>${model.cost_per_m_output.toFixed(2)}/M out</span>
                          <span>{model.avg_latency_ms}ms</span>
                          <span>{(model.max_context / 1000).toFixed(0)}K ctx</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <Switch
                          checked={model.enabled}
                          onCheckedChange={() => handleToggle(model)}
                          disabled={updating === model.model_name}
                          className="data-[state=checked]:bg-primary"
                        />
                        <button
                          onClick={() => handleRemove(model.model_name)}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Remove model"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
