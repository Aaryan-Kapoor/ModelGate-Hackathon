"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGlobalStats, getAllLogs } from "@/lib/api";
import type { GlobalStats, RequestLogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";

const COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c"];
const TIER_COLORS: Record<string, string> = { simple: "#34d399", medium: "#fbbf24", complex: "#f87171" };

function StatCard({ label, value, sub, color = "cyan" }: { label: string; value: string; sub?: string; color?: string }) {
  const glowClass = color === "green" ? "glow-green" : color === "amber" ? "glow-amber" : color === "red" ? "glow-red" : "glow-cyan";
  return (
    <div className={`bg-card border border-border/50 rounded-lg p-4 ${glowClass} transition-all hover:scale-[1.02]`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold stat-value font-mono">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function LiveFeed({ logs }: { logs: RequestLogEntry[] }) {
  return (
    <div className="space-y-1.5">
      {logs.slice(0, 12).map((log) => (
        <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded bg-secondary/30 hover:bg-secondary/60 transition-colors">
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
            log.status === "success" ? "bg-green-500" : "bg-red-500"
          }`} />
          <span className="text-muted-foreground font-mono w-16 flex-shrink-0">
            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <Badge variant="outline" className={`text-[9px] px-1.5 flex-shrink-0 ${
            log.classification === "simple" ? "border-green-500/30 text-green-400"
            : log.classification === "complex" ? "border-red-500/30 text-red-400"
            : "border-amber-500/30 text-amber-400"
          }`}>
            {log.classification}
          </Badge>
          <span className="font-mono text-[11px] text-primary w-24 flex-shrink-0">{log.selected_model}</span>
          <span className="truncate text-muted-foreground flex-1">{log.prompt_preview}</span>
          <span className="font-mono text-muted-foreground w-14 text-right flex-shrink-0">{log.latency_ms}ms</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGlobalStats(), getAllLogs(50)])
      .then(([s, l]) => { setStats(s); setLogs(l); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground text-sm animate-pulse">Loading control plane...</div>
      </div>
    );
  }

  const modelData = Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value }));
  const providerData = Object.entries(stats.provider_distribution).map(([name, value]) => ({ name, value }));
  const hourlyData = stats.hourly_requests.slice(-24);
  const customerData = Object.entries(stats.customer_request_counts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Control Plane Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time AI inference monitoring and routing analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-dot" />
          <span className="text-xs text-muted-foreground font-mono">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Requests" value={stats.total_requests.toLocaleString()} sub={`${stats.requests_today} today`} />
        <StatCard label="Customers" value={stats.total_customers.toString()} color="green" />
        <StatCard label="Total Cost" value={`$${stats.total_cost.toFixed(4)}`} sub={`$${stats.cost_today.toFixed(4)} today`} color="amber" />
        <StatCard
          label="Cost Savings"
          value={`$${stats.cost_savings_vs_premium.toFixed(4)}`}
          sub="vs always-premium"
          color="green"
        />
        <StatCard label="Avg Latency" value={`${stats.avg_latency_ms.toFixed(0)}ms`} />
        <StatCard
          label="Models Active"
          value={Object.keys(stats.model_distribution).length.toString()}
          sub={`${Object.keys(stats.provider_distribution).length} providers`}
        />
      </div>

      {/* Cost savings banner */}
      {stats.cost_savings_vs_premium > 0 && (
        <Card className="bg-card/50 border-green-500/20 glow-green">
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-green-400 mb-1">Intelligent Routing Savings</div>
                <div className="text-sm text-muted-foreground">
                  Without ModelGate, all requests would use the premium model tier
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Without ModelGate</div>
                  <div className="text-lg font-bold font-mono text-red-400 line-through">${(stats.total_cost + stats.cost_savings_vs_premium).toFixed(4)}</div>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">With ModelGate</div>
                  <div className="text-lg font-bold font-mono text-green-400">${stats.total_cost.toFixed(4)}</div>
                </div>
                <div className="text-center bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-green-400 mb-0.5">Saved</div>
                  <div className="text-xl font-bold font-mono text-green-400">
                    {((stats.cost_savings_vs_premium / (stats.total_cost + stats.cost_savings_vs_premium)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Request timeline */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Request Volume (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#6b7280" }} tickFormatter={(v) => v.split(" ")[1] || v} />
                <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "6px", fontSize: "11px" }}
                  labelStyle={{ color: "#9ca3af" }}
                />
                <Area type="monotone" dataKey="count" stroke="#38bdf8" fill="url(#reqGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Model Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={modelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                  {modelData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "6px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {modelData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-mono">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Provider breakdown */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Provider Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={providerData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 9, fill: "#6b7280" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} width={70} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "6px", fontSize: "11px" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {providerData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer usage */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Customer Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customerData.map((c) => (
              <Link key={c.name} href={`/customers/${c.name}`}>
                <div className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer">
                  <span className="text-sm font-medium">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{c.count} requests</span>
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Live feed */}
        <Card className="lg:col-span-1 bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Live Request Feed</CardTitle>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                <span className="text-[9px] text-muted-foreground font-mono">STREAMING</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LiveFeed logs={logs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
