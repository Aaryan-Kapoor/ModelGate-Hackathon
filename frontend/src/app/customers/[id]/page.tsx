"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCustomer, getStats } from "@/lib/api";
import type { CustomerProfile, CustomerStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";

const COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c"];
const TT_STYLE = { backgroundColor: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "6px", fontSize: "11px" };

function MetricBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-secondary/30 rounded-lg px-3 py-2.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold font-mono stat-value ${accent || ""}`}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomer(id), getStats(id)])
      .then(([p, s]) => { setProfile(p); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !profile) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="text-muted-foreground text-sm animate-pulse">Loading profile...</div></div>;
  }

  const endpointUrl = `http://localhost:8000/v1/${profile.customer_id}/chat/completions`;
  const modelData = stats ? Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value })) : [];
  const costData = stats ? Object.entries(stats.cost_by_model).map(([name, cost]) => ({ name, cost: Number(cost.toFixed(6)) })) : [];
  const latencyData = stats ? Object.entries(stats.latency_by_model).map(([name, ms]) => ({ name, ms })) : [];
  const hourlyData = stats?.hourly_requests.slice(-24) || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">{profile.customer_name}</h1>
            <Badge variant="outline" className="text-[9px]">{profile.use_case.replace(/_/g, " ")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{profile.customer_id}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/logs`}><Button variant="outline" size="sm" className="text-xs">Request Logs</Button></Link>
          <Link href={`/playground?customer=${id}`}><Button size="sm" className="text-xs">Playground</Button></Link>
        </div>
      </div>

      {/* Endpoint */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 glow-cyan">
        <div className="text-[10px] uppercase tracking-widest text-primary mb-1">Customer API Endpoint</div>
        <code className="text-xs font-mono text-foreground">POST {endpointUrl}</code>
      </div>

      {/* Metrics grid */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <MetricBox label="Requests" value={stats.total_requests.toLocaleString()} />
          <MetricBox label="Avg Latency" value={`${stats.avg_latency_ms.toFixed(0)}ms`} />
          <MetricBox label="P95 Latency" value={`${stats.p95_latency_ms}ms`} />
          <MetricBox label="P99 Latency" value={`${stats.p99_latency_ms}ms`} />
          <MetricBox label="Avg TTFT" value={`${stats.avg_ttft_ms.toFixed(0)}ms`} />
          <MetricBox label="Total Cost" value={`$${stats.total_cost.toFixed(4)}`} />
          <MetricBox label="Savings" value={`$${stats.cost_savings_vs_premium.toFixed(4)}`} accent="text-green-400" sub="vs premium" />
          <MetricBox label="Success" value={`${stats.success_rate}%`} accent={stats.success_rate >= 99 ? "text-green-400" : "text-amber-400"} />
        </div>
      )}

      {/* Charts */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timeline */}
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Request Timeline</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={hourlyData}>
                  <defs><linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#6b7280" }} tickFormatter={(v) => v.split(" ")[1] || v} />
                  <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Area type="monotone" dataKey="count" stroke="#38bdf8" fill="url(#tGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model distribution */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Model Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={modelData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                    {modelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-1">
                {modelData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1 text-[10px]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost & Latency by model */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Cost by Model</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={costData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {costData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Avg Latency by Model</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={latencyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Bar dataKey="ms" radius={[4, 4, 0, 0]}>
                    {latencyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Constraints + Routing Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Constraints */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Contract Constraints</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Region", value: profile.constraints.region, color: "text-blue-400" },
              { label: "Privacy Tier", value: profile.constraints.privacy_tier, color: profile.constraints.privacy_tier === "high" ? "text-red-400" : "text-gray-400" },
              { label: "Objective", value: profile.objective.replace(/_/g, " "), color: "text-cyan-400" },
              { label: "Latency Target", value: `${profile.performance.latency_target_ms}ms`, color: "" },
              { label: "Cost Sensitivity", value: profile.performance.cost_sensitivity, color: "" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`text-xs font-medium font-mono ${color}`}>{value}</span>
              </div>
            ))}
            {profile.constraints.allowed_providers.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <div className="text-[10px] text-muted-foreground mb-1.5">Allowed Providers</div>
                <div className="flex gap-1.5">
                  {profile.constraints.allowed_providers.map((p) => (
                    <Badge key={p} variant="outline" className="text-[9px] border-green-500/30 text-green-400">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.constraints.forbidden_providers.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <div className="text-[10px] text-muted-foreground mb-1.5">Blocked Providers</div>
                <div className="flex gap-1.5">
                  {profile.constraints.forbidden_providers.map((p) => (
                    <Badge key={p} variant="outline" className="text-[9px] border-red-500/30 text-red-400">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Routing Preferences */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Routing Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(profile.routing_preferences).map(([tier, models]) => (
              <div key={tier} className="flex items-start gap-3 py-1.5">
                <Badge variant="outline" className={`text-[9px] w-16 justify-center flex-shrink-0 ${
                  tier === "simple" ? "border-green-500/30 text-green-400"
                  : tier === "complex" ? "border-red-500/30 text-red-400"
                  : "border-amber-500/30 text-amber-400"
                }`}>{tier}</Badge>
                <div className="flex flex-wrap gap-1.5">
                  {models.map((m, i) => (
                    <Badge key={m} variant={i === 0 ? "default" : "outline"} className="text-[9px]">{m}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {profile.warnings.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-amber-400">Contract Warnings</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {profile.warnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-300/80 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">&#9651;</span>{w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Token stats */}
      {stats && stats.total_requests > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Token Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono stat-value">{stats.total_tokens.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Total Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono stat-value text-blue-400">{stats.total_input_tokens.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Input Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono stat-value text-green-400">{stats.total_output_tokens.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Output Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
