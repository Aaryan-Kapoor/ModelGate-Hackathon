"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGlobalStats, getAllLogs } from "@/lib/api";
import type { GlobalStats, RequestLogEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import { DashboardSkeleton } from "@/components/Skeletons";

const COLORS = ["#00e5ff", "#7000ff", "#ff3366", "#00ff9d", "#ffb800", "#ffffff"];

function StatBlock({ label, value, sub, color = "primary" }: { label: string; value: string; sub?: string; color?: string }) {
  const colorClass = 
    color === "success" ? "text-success" : 
    color === "warning" ? "text-warning" : 
    color === "danger" ? "text-danger" : 
    "text-primary";
    
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl hover:bg-surface/50 transition-colors duration-300">
      <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{label}</div>
      <div className={`text-4xl font-light tracking-tight font-mono ${colorClass}`}>{value}</div>
      {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

function LiveFeed({ logs }: { logs: RequestLogEntry[] }) {
  return (
    <div className="space-y-1 font-mono text-sm">
      {logs.slice(0, 12).map((log) => (
        <div key={log.id} className="group flex items-center gap-4 py-2 px-3 rounded-md hover:bg-surface transition-colors">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
            log.status === "success" ? "bg-success shadow-[0_0_8px_rgba(0,255,157,0.5)]" : "bg-danger shadow-[0_0_8px_rgba(255,51,102,0.5)]"
          }`} />
          <span className="text-muted-foreground w-16 flex-shrink-0">
            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 border ${
            log.classification === "simple" ? "border-success/30 text-success bg-success/5"
            : log.classification === "complex" ? "border-danger/30 text-danger bg-danger/5"
            : "border-warning/30 text-warning bg-warning/5"
          }`}>
            {log.classification}
          </span>
          <span className="text-primary w-28 flex-shrink-0 truncate">{log.selected_model}</span>
          <span className="truncate text-muted-foreground flex-1 group-hover:text-foreground transition-colors">{log.prompt_preview}</span>
          <span className="text-muted-foreground w-16 text-right flex-shrink-0">{log.latency_ms}ms</span>
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
    return <DashboardSkeleton />;
  }

  const modelData = Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value }));
  const providerData = Object.entries(stats.provider_distribution).map(([name, value]) => ({ name, value }));
  const hourlyData = stats.hourly_requests.slice(-24);
  const customerData = Object.entries(stats.customer_request_counts).map(([name, count]) => ({ name, count }));
  const hasData = stats.total_requests > 0;

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">Control Plane</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Real-time AI inference monitoring and intelligent routing analytics.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-md">
          <span className={`h-2.5 w-2.5 rounded-full ${hasData ? "bg-success animate-pulse-glow" : "bg-warning"}`} />
          <span className="text-sm font-mono tracking-wide text-muted-foreground uppercase">{hasData ? "All Systems Operational" : "Awaiting First Request"}</span>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="glass-panel rounded-2xl p-16 text-center max-w-3xl mx-auto mt-12 border border-border">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
          </div>
          <h2 className="text-2xl font-light mb-3">
            {stats.total_customers === 0 ? "Welcome to ModelGate" : "No Requests Yet"}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {stats.total_customers === 0
              ? "Get started by configuring your model registry and onboarding your first customer. Upload a contract to automatically generate an AI routing profile."
              : "You have customers configured but no requests have been routed yet. Use the Playground to send your first test prompt, or point an application at a customer endpoint."}
          </p>
          <div className="flex justify-center gap-4">
            {stats.total_customers === 0 ? (
              <>
                <Link href="/models">
                  <Button variant="outline" size="lg" className="border-border hover:bg-surface">Configure Models</Button>
                </Link>
                <Link href="/customers/new">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Onboard First Customer</Button>
                </Link>
              </>
            ) : (
              <Link href="/playground">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Open Playground</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {hasData && (
        <>
          {/* Stat blocks */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-8 border-y border-border/50">
            <StatBlock label="Total Requests" value={stats.total_requests.toLocaleString()} sub={`${stats.requests_today} today`} />
            <StatBlock label="Customers" value={stats.total_customers.toString()} color="primary" />
            <StatBlock label="Total Cost" value={`$${stats.total_cost.toFixed(4)}`} sub={`$${stats.cost_today.toFixed(4)} today`} color="warning" />
            <StatBlock label="Cost Savings" value={`$${stats.cost_savings_vs_premium.toFixed(4)}`} sub="vs always-premium" color="success" />
            <StatBlock label="Avg Latency" value={`${stats.avg_latency_ms.toFixed(0)}ms`} />
            <StatBlock label="Models Active" value={Object.keys(stats.model_distribution).length.toString()} sub={`${Object.keys(stats.provider_distribution).length} providers`} />
          </div>

          {/* Cost savings banner */}
          {stats.cost_savings_vs_premium > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-success/20 bg-success/5 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h3 className="text-success font-medium tracking-widest uppercase text-sm mb-2">Intelligent Routing Savings</h3>
                  <p className="text-muted-foreground text-lg">Without ModelGate, all requests would use the premium model tier.</p>
                </div>
                <div className="flex items-center gap-8 md:gap-12">
                  <div className="text-center">
                    <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Without ModelGate</div>
                    <div className="text-3xl font-light font-mono text-danger line-through opacity-70">${(stats.total_cost + stats.cost_savings_vs_premium).toFixed(4)}</div>
                  </div>
                  <div className="text-4xl text-muted-foreground font-light">→</div>
                  <div className="text-center">
                    <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">With ModelGate</div>
                    <div className="text-3xl font-light font-mono text-success">${stats.total_cost.toFixed(4)}</div>
                  </div>
                  <div className="text-center bg-success/10 border border-success/30 rounded-xl px-6 py-4">
                    <div className="text-xs tracking-widest text-success uppercase mb-1">Saved</div>
                    <div className="text-3xl font-bold font-mono text-success">
                      {((stats.cost_savings_vs_premium / (stats.total_cost + stats.cost_savings_vs_premium)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Anchors: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request timeline */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Request Volume (Last 24h)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#888888", fontFamily: "var(--font-jetbrains-mono)" }} tickFormatter={(v) => v.split(" ")[1] || v} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: "#888888", fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)" }}
                      itemStyle={{ color: "#00e5ff" }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#00e5ff" fill="url(#reqGradient)" strokeWidth={2} />
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
                      {modelData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)" }}
                    />
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

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-border/50">
            {/* Provider breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Provider Breakdown</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#888888" }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)" }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {providerData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer usage */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Customer Usage</h3>
              <div className="space-y-2">
                {customerData.map((c) => (
                  <Link key={c.name} href={`/customers/${c.name}`} className="block group">
                    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-surface transition-colors border border-transparent group-hover:border-border/50">
                      <span className="text-base font-medium group-hover:text-primary transition-colors">{c.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground">{c.count} reqs</span>
                        <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live feed */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Terminal Log</h3>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                  <span className="text-xs text-success font-mono uppercase tracking-wider">Streaming</span>
                </div>
              </div>
              <div className="bg-[#0a0a0a] border border-border rounded-xl p-4 h-[400px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] pointer-events-none z-10" />
                <LiveFeed logs={logs} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
