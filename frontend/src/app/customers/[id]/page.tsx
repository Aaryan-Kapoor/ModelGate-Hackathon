"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCustomer, getStats, getModels, updateCustomer, deleteCustomer, getApiBase } from "@/lib/api";
import type { CustomerProfile, CustomerStats, ModelConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";
import { ProfileSkeleton } from "@/components/Skeletons";

const COLORS = ["#00e5ff", "#7000ff", "#ff3366", "#00ff9d", "#ffb800", "#ffffff"];
const TT_STYLE = { backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)" };

const OBJECTIVE_OPTIONS = ["low_latency", "high_quality", "low_cost"];
const PRIVACY_OPTIONS = ["low", "standard", "high"];
const COST_SENSITIVITY_OPTIONS = ["low", "medium", "high"];

function MetricBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl hover:bg-surface/50 transition-colors duration-300">
      <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{label}</div>
      <div className={`text-3xl font-light tracking-tight font-mono ${accent || "text-foreground"}`}>{value}</div>
      {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    objective: "",
    region: "",
    privacy_tier: "",
    latency_target_ms: 0,
    cost_sensitivity: "",
    forbidden_providers: "",
    allowed_providers: "",
  });

  useEffect(() => {
    Promise.all([getCustomer(id), getStats(id), getModels()])
      .then(([p, s, m]) => { setProfile(p); setStats(s); setModels(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const startEditing = useCallback(() => {
    if (!profile) return;
    setEditForm({
      objective: profile.objective,
      region: profile.constraints.region,
      privacy_tier: profile.constraints.privacy_tier,
      latency_target_ms: profile.performance.latency_target_ms,
      cost_sensitivity: profile.performance.cost_sensitivity,
      forbidden_providers: profile.constraints.forbidden_providers.join(", "),
      allowed_providers: profile.constraints.allowed_providers.join(", "),
    });
    setEditing(true);
  }, [profile]);

  const cancelEditing = () => setEditing(false);

  const saveEdits = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateCustomer(profile.customer_id, {
        objective: editForm.objective,
        constraints: {
          region: editForm.region,
          privacy_tier: editForm.privacy_tier,
          forbidden_providers: editForm.forbidden_providers.split(",").map(s => s.trim()).filter(Boolean),
          allowed_providers: editForm.allowed_providers.split(",").map(s => s.trim()).filter(Boolean),
        },
        performance: {
          latency_target_ms: editForm.latency_target_ms,
          cost_sensitivity: editForm.cost_sensitivity,
        },
      });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCustomer(id);
      router.push("/customers");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
    }
  };

  const copyEndpoint = () => {
    const url = `${getApiBase()}/${profile?.customer_id}/v1`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  const endpointBase = `${getApiBase()}/${profile.customer_id}/v1`;
  const modelData = stats ? Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value })) : [];
  const costData = stats ? Object.entries(stats.cost_by_model).map(([name, cost]) => ({ name, cost: Number(cost.toFixed(6)) })) : [];
  const latencyData = stats ? Object.entries(stats.latency_by_model).map(([name, ms]) => ({ name, ms })) : [];
  const hourlyData = stats?.hourly_requests.slice(-24) || [];

  const projectionRequests = 10000;
  const avgCostPerRequest = stats && stats.total_requests > 0 ? stats.total_cost / stats.total_requests : 0;
  const premiumCostPerRequest = stats && stats.total_requests > 0
    ? (stats.total_cost + stats.cost_savings_vs_premium) / stats.total_requests
    : 0;
  const projectedModelGateCost = avgCostPerRequest * projectionRequests;
  const projectedPremiumCost = premiumCostPerRequest * projectionRequests;
  const projectedSavings = projectedPremiumCost - projectedModelGateCost;
  const savingsPercent = projectedPremiumCost > 0 ? ((projectedSavings / projectedPremiumCost) * 100) : 0;

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-light tracking-tight">{profile.customer_name}</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-border bg-surface/50 text-muted-foreground">
              {profile.use_case.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-lg text-muted-foreground font-mono">{profile.customer_id}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!editing && (
            <Button variant="outline" className="border-border hover:bg-surface" onClick={startEditing}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              Edit Profile
            </Button>
          )}
          <Link href={`/customers/${id}/logs`}>
            <Button variant="outline" className="border-border hover:bg-surface">Request Logs</Button>
          </Link>
          <Link href={`/playground?customer=${id}`}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Playground</Button>
          </Link>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger render={<Button variant="outline" className="text-danger border-danger/30 hover:bg-danger/10 p-2" />}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-light">Delete Customer</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Are you sure you want to delete <strong className="text-foreground">{profile.customer_name}</strong>? This will remove the profile, routing configuration, and all associated data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <DialogClose render={<Button variant="outline" className="border-border hover:bg-surface" />}>
                  Cancel
                </DialogClose>
                <Button
                  className="bg-danger hover:bg-danger/90 text-white"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Customer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Endpoint URL */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">Customer API Base URL</div>
            <div className="flex items-center gap-4 mb-4">
              <code className="text-xl font-mono text-foreground break-all">{endpointBase}</code>
            </div>
            <div className="flex gap-6 text-sm font-mono text-muted-foreground">
              <div><span className="text-success">POST</span> /chat/completions</div>
              <div><span className="text-primary">GET</span> /models</div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Drop-in replacement for <code>https://api.openai.com/v1</code> — works with any standard SDK.</p>
          </div>
          <Button
            size="lg"
            variant={copied ? "default" : "outline"}
            className={`flex-shrink-0 transition-all ${copied ? "bg-success hover:bg-success text-black border-success" : "border-primary/40 text-primary hover:bg-primary/10"}`}
            onClick={copyEndpoint}
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                Copy URL
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editing && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
            </div>
            <div>
              <div className="text-sm text-warning font-medium">Edit Mode Active</div>
              <div className="text-xs text-warning/70">Review and modify profile fields, then save your changes.</div>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none border-warning/30 text-warning hover:bg-warning/10" onClick={cancelEditing} disabled={saving}>Cancel</Button>
            <Button className="flex-1 sm:flex-none bg-warning hover:bg-warning/90 text-black" onClick={saveEdits} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Metrics grid */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 py-8 border-y border-border/50">
          <MetricBox label="Requests" value={stats.total_requests.toLocaleString()} />
          <MetricBox label="Avg Latency" value={`${stats.avg_latency_ms.toFixed(0)}ms`} />
          <MetricBox label="P95 Latency" value={`${stats.p95_latency_ms}ms`} />
          <MetricBox label="P99 Latency" value={`${stats.p99_latency_ms}ms`} />
          <MetricBox label="Avg TTFT" value={`${stats.avg_ttft_ms.toFixed(0)}ms`} />
          <MetricBox label="Total Cost" value={`$${stats.total_cost.toFixed(4)}`} />
          <MetricBox label="Savings" value={`$${stats.cost_savings_vs_premium.toFixed(4)}`} accent="text-success" sub="vs premium" />
          <MetricBox label="Success" value={`${stats.success_rate}%`} accent={stats.success_rate >= 99 ? "text-success" : "text-warning"} />
        </div>
      )}

      {/* Cost Projection */}
      {stats && stats.total_requests > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-success/20 bg-success/5 p-8">
          <div className="text-xs uppercase tracking-widest text-success mb-6 font-medium">Cost Projection (10k requests)</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Monthly Volume</div>
              <div className="text-3xl font-light font-mono">{projectionRequests.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">With ModelGate</div>
              <div className="text-3xl font-light font-mono text-success">${projectedModelGateCost.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Without (Premium)</div>
              <div className="text-3xl font-light font-mono text-danger line-through opacity-70">${projectedPremiumCost.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Projected Savings</div>
              <div className="text-3xl font-bold font-mono text-success">${projectedSavings.toFixed(2)}</div>
              <div className="text-sm text-success mt-1">{savingsPercent.toFixed(0)}% cost reduction</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Request Timeline</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#888888", fontFamily: "var(--font-jetbrains-mono)" }} tickFormatter={(v: string) => v.split(" ")[1] || v} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: "#888888", fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: "#00e5ff" }} />
                  <Area type="monotone" dataKey="count" stroke="#00e5ff" fill="url(#tGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model distribution */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Model Distribution</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modelData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" stroke="none" paddingAngle={2}>
                    {modelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              {modelData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-mono text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Constraints + Routing Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-border/50">
        {/* Constraints */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Contract Constraints</h3>
          
          {editing ? (
            <div className="space-y-4 bg-surface/30 p-6 rounded-2xl border border-border">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Objective</label>
                <select
                  value={editForm.objective}
                  onChange={(e) => setEditForm(prev => ({ ...prev, objective: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-colors"
                >
                  {OBJECTIVE_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Region</label>
                <Input
                  value={editForm.region}
                  onChange={(e) => setEditForm(prev => ({ ...prev, region: e.target.value }))}
                  className="bg-surface border-border h-12 text-sm focus:border-primary transition-colors"
                  placeholder="e.g., EU-only, US-only, any"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Privacy Tier</label>
                  <select
                    value={editForm.privacy_tier}
                    onChange={(e) => setEditForm(prev => ({ ...prev, privacy_tier: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-colors"
                  >
                    {PRIVACY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Latency (ms)</label>
                  <Input
                    type="number"
                    value={editForm.latency_target_ms}
                    onChange={(e) => setEditForm(prev => ({ ...prev, latency_target_ms: Number(e.target.value) }))}
                    className="bg-surface border-border h-12 text-sm focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Forbidden Providers</label>
                <Input
                  value={editForm.forbidden_providers}
                  onChange={(e) => setEditForm(prev => ({ ...prev, forbidden_providers: e.target.value }))}
                  className="bg-surface border-border h-12 text-sm focus:border-primary transition-colors"
                  placeholder="e.g., deepseek, google"
                />
              </div>
            </div>
          ) : (
            <div className="bg-surface/30 p-6 rounded-2xl border border-border space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Region</div>
                  <div className="text-lg font-light text-foreground">{profile.constraints.region}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Privacy Tier</div>
                  <div className={`text-lg font-light ${profile.constraints.privacy_tier === "high" ? "text-danger" : "text-foreground"}`}>{profile.constraints.privacy_tier}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Objective</div>
                  <div className="text-lg font-light text-primary capitalize">{profile.objective.replace(/_/g, " ")}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Latency Target</div>
                  <div className="text-lg font-light font-mono text-foreground">{profile.performance.latency_target_ms}ms</div>
                </div>
              </div>
              
              {(profile.constraints.allowed_providers.length > 0 || profile.constraints.forbidden_providers.length > 0) && (
                <div className="pt-6 border-t border-border/50 space-y-4">
                  {profile.constraints.allowed_providers.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Allowed Providers</div>
                      <div className="flex flex-wrap gap-2">
                        {profile.constraints.allowed_providers.map((p) => (
                          <span key={p} className="px-3 py-1 rounded-md bg-success/10 text-success border border-success/30 text-xs font-mono">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.constraints.forbidden_providers.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Blocked Providers</div>
                      <div className="flex flex-wrap gap-2">
                        {profile.constraints.forbidden_providers.map((p) => (
                          <span key={p} className="px-3 py-1 rounded-md bg-danger/10 text-danger border border-danger/30 text-xs font-mono">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Routing Preferences */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Routing Preferences</h3>
          <div className="bg-surface/30 p-6 rounded-2xl border border-border space-y-6">
            {Object.entries(profile.routing_preferences).map(([tier, tierModels]) => (
              <div key={tier} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase tracking-widest px-3 py-1 rounded-md border font-medium ${
                    tier === "simple" ? "border-success/30 text-success bg-success/5"
                    : tier === "complex" ? "border-danger/30 text-danger bg-danger/5"
                    : "border-warning/30 text-warning bg-warning/5"
                  }`}>{tier}</span>
                  <span className="text-sm text-muted-foreground">
                    {tier === "simple" ? "Fast, low-cost queries" : tier === "medium" ? "Moderate analysis" : "Complex reasoning"}
                  </span>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  {tierModels.map((m, i) => {
                    const modelInfo = models.find(mod => mod.model_name === m);
                    const isEnabled = modelInfo ? modelInfo.enabled : true;
                    return (
                      <div key={m} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl transition-colors ${!isEnabled ? "opacity-50" : ""} ${i === 0 ? "bg-primary/5 border border-primary/20" : "bg-surface hover:bg-surface/80 border border-transparent"}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-mono ${!isEnabled ? "line-through" : "text-foreground"}`}>{m}</span>
                          {i === 0 && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary">Primary</span>}
                          {!isEnabled && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-danger/20 text-danger">Disabled</span>}
                        </div>
                        {modelInfo && (
                          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                            <span>${modelInfo.cost_per_m_input}/M</span>
                            <span>{modelInfo.avg_latency_ms}ms</span>
                            <span className="uppercase tracking-widest text-[10px]">{modelInfo.provider}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {profile.warnings.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-border/50">
          <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Diagnostics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.warnings.map((w, i) => {
              const isObj = typeof w === "object" && w !== null;
              const severity = isObj ? w.severity : "warning";
              const type = isObj ? w.type : "";
              const message = isObj ? w.message : String(w);
              const colors = { critical: "border-danger/30 bg-danger/5 text-danger", warning: "border-warning/30 bg-warning/5 text-warning", info: "border-primary/30 bg-primary/5 text-primary" };
              const typeLabels: Record<string, string> = { provider_gap: "PROVIDER", model_gap: "MODEL", region_gap: "REGION", missing_field: "MISSING", contract_ambiguity: "AMBIGUITY" };
              
              return (
                <div key={i} className={`rounded-xl p-5 border flex items-start gap-4 ${colors[severity] || colors.warning}`}>
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest">{severity}</span>
                      {type && <span className="text-[10px] font-mono text-muted-foreground/70">{typeLabels[type] || type}</span>}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
