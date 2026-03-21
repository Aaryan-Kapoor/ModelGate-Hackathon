"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLogs, getStats, getCustomer } from "@/lib/api";
import type { RequestLogEntry, CustomerStats, CustomerProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { LogsSkeleton } from "@/components/Skeletons";

const COLORS = ["#00e5ff", "#7000ff", "#ff3366", "#00ff9d", "#ffb800", "#ffffff"];
const TT_STYLE = { backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)" };

const TIER_BADGE: Record<string, string> = {
  simple: "border-success/30 text-success bg-success/5",
  medium: "border-warning/30 text-warning bg-warning/5",
  complex: "border-danger/30 text-danger bg-danger/5",
};

function LogRow({ log, expanded, onToggle }: { log: RequestLogEntry; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer hover:bg-surface/50 transition-colors border-b border-border/30 group">
        <td className="px-4 py-4 text-xs text-muted-foreground font-mono whitespace-nowrap">
          {new Date(log.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="px-4 py-4 text-sm max-w-[300px] truncate group-hover:text-primary transition-colors">{log.prompt_preview}</td>
        <td className="px-4 py-4">
          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${TIER_BADGE[log.classification] || "border-border text-muted-foreground"}`}>
            {log.classification}
          </span>
        </td>
        <td className="px-4 py-4 text-sm font-mono text-primary">{log.selected_model}</td>
        <td className="px-4 py-4 text-sm font-mono text-muted-foreground">{log.latency_ms}ms</td>
        <td className="px-4 py-4 text-sm font-mono text-muted-foreground">{log.ttft_ms}ms</td>
        <td className="px-4 py-4 text-sm font-mono text-success">${log.estimated_cost.toFixed(6)}</td>
        <td className="px-4 py-4 text-sm font-mono text-muted-foreground">{log.tokens_used}</td>
        <td className="px-4 py-4">
          <span className={`h-2 w-2 rounded-full inline-block ${log.status === "success" ? "bg-success shadow-[0_0_8px_rgba(0,255,157,0.5)]" : "bg-danger shadow-[0_0_8px_rgba(255,51,102,0.5)]"}`} />
        </td>
        <td className="px-4 py-4 text-muted-foreground">
          <svg className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180 text-primary" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#0a0a0a]">
          <td colSpan={10} className="px-6 py-6 border-b border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Routing decision details */}
              <div className="space-y-4">
                <div className="text-xs font-medium uppercase tracking-widest text-primary">Routing Decision</div>
                <div className="text-sm text-foreground/80 leading-relaxed bg-surface/30 p-4 rounded-xl border border-border">{log.reason}</div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface rounded-xl px-4 py-3 border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Input</div>
                    <div className="text-sm font-mono">{log.input_tokens} <span className="text-xs text-muted-foreground">tok</span></div>
                  </div>
                  <div className="bg-surface rounded-xl px-4 py-3 border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Output</div>
                    <div className="text-sm font-mono">{log.output_tokens} <span className="text-xs text-muted-foreground">tok</span></div>
                  </div>
                  <div className="bg-surface rounded-xl px-4 py-3 border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Provider</div>
                    <div className="text-sm font-mono uppercase tracking-widest">{log.selected_provider}</div>
                  </div>
                </div>
              </div>
              {/* Candidates */}
              <div className="space-y-6">
                {log.candidates_considered && log.candidates_considered.length > 0 && (
                  <div>
                    <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Candidates Considered</div>
                    <div className="flex flex-wrap gap-2">
                      {log.candidates_considered.map((c) => (
                        <span key={c} className={`text-xs font-mono px-3 py-1.5 rounded-md border ${c === log.selected_model ? "border-primary/50 text-primary bg-primary/10" : "border-border text-muted-foreground bg-surface"}`}>
                          {c} {c === log.selected_model && <span className="text-[10px] uppercase tracking-widest ml-1 opacity-70">(selected)</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {log.candidates_eliminated && Object.keys(log.candidates_eliminated).length > 0 && (
                  <div>
                    <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Eliminated</div>
                    <div className="space-y-2">
                      {Object.entries(log.candidates_eliminated).map(([model, reason]) => (
                        <div key={model} className="flex items-start gap-3 text-sm bg-danger/5 border border-danger/20 rounded-lg p-3">
                          <span className="text-xs font-mono text-danger mt-0.5">{model}</span>
                          <span className="text-muted-foreground">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CustomerLogsPage() {
  const params = useParams();
  const id = params.id as string;
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");

  useEffect(() => {
    Promise.all([getLogs(id), getStats(id), getCustomer(id)])
      .then(([l, s, c]) => { setLogs(l); setStats(s); setCustomer(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LogsSkeleton />;

  const modelData = stats ? Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value })) : [];
  const tierData = stats ? Object.entries(stats.requests_by_tier).map(([name, value]) => ({ name, value })) : [];

  const filteredLogs = tierFilter === "all" ? logs : logs.filter((l) => l.classification === tierFilter);

  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">{customer?.customer_name}</h1>
          <p className="text-lg text-muted-foreground">Request logs and routing analytics.</p>
        </div>
        <Link href={`/customers/${id}`}>
          <Button variant="outline" className="border-border hover:bg-surface">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Profile
          </Button>
        </Link>
      </div>

      {/* Charts */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Model Distribution</h3>
            <div className="bg-surface/30 border border-border rounded-2xl p-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modelData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {modelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Complexity Breakdown</h3>
            <div className="bg-surface/30 border border-border rounded-2xl p-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888888", fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: "#888888", fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TT_STYLE} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {tierData.map((d) => <Cell key={d.name} fill={d.name === "simple" ? "#00ff9d" : d.name === "complex" ? "#ff3366" : "#ffb800"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Table */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 bg-surface/50 p-1 rounded-lg border border-border">
            {["all", "simple", "medium", "complex"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-4 py-2 rounded-md text-xs font-medium uppercase tracking-widest transition-all duration-300 ${
                  tierFilter === t ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >{t}</button>
            ))}
          </div>
          <span className="text-sm font-mono text-muted-foreground">{filteredLogs.length} results</span>
        </div>

        <div className="bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/80">
                  {["Time", "Prompt", "Tier", "Model", "Latency", "TTFT", "Cost", "Tokens", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                      No logs found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      expanded={expandedId === log.id}
                      onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
