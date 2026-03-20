"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLogs, getStats, getCustomer } from "@/lib/api";
import type { RequestLogEntry, CustomerStats, CustomerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c"];
const TT_STYLE = { backgroundColor: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "6px", fontSize: "11px" };

const TIER_BADGE: Record<string, string> = {
  simple: "border-green-500/30 text-green-400",
  medium: "border-amber-500/30 text-amber-400",
  complex: "border-red-500/30 text-red-400",
};

function LogRow({ log, expanded, onToggle }: { log: RequestLogEntry; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer hover:bg-secondary/30 transition-colors border-b border-border/20">
        <td className="px-3 py-2.5 text-[10px] text-muted-foreground font-mono whitespace-nowrap">
          {new Date(log.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="px-3 py-2.5 text-xs max-w-[300px] truncate">{log.prompt_preview}</td>
        <td className="px-3 py-2.5">
          <Badge variant="outline" className={`text-[9px] ${TIER_BADGE[log.classification] || ""}`}>
            {log.classification}
          </Badge>
        </td>
        <td className="px-3 py-2.5 text-xs font-mono text-primary">{log.selected_model}</td>
        <td className="px-3 py-2.5 text-xs font-mono">{log.latency_ms}ms</td>
        <td className="px-3 py-2.5 text-xs font-mono">{log.ttft_ms}ms</td>
        <td className="px-3 py-2.5 text-xs font-mono">${log.estimated_cost.toFixed(6)}</td>
        <td className="px-3 py-2.5 text-xs font-mono">{log.tokens_used}</td>
        <td className="px-3 py-2.5">
          <span className={`h-1.5 w-1.5 rounded-full inline-block ${log.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
        </td>
        <td className="px-3 py-2.5 text-muted-foreground">
          <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-secondary/10">
          <td colSpan={10} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Routing decision details */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Routing Decision</div>
                <div className="text-xs text-muted-foreground">{log.reason}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary/40 rounded px-2 py-1.5">
                    <div className="text-[9px] text-muted-foreground">Input</div>
                    <div className="text-xs font-mono">{log.input_tokens} tokens</div>
                  </div>
                  <div className="bg-secondary/40 rounded px-2 py-1.5">
                    <div className="text-[9px] text-muted-foreground">Output</div>
                    <div className="text-xs font-mono">{log.output_tokens} tokens</div>
                  </div>
                  <div className="bg-secondary/40 rounded px-2 py-1.5">
                    <div className="text-[9px] text-muted-foreground">Provider</div>
                    <div className="text-xs font-mono">{log.selected_provider}</div>
                  </div>
                </div>
              </div>
              {/* Candidates */}
              <div className="space-y-3">
                {log.candidates_considered && log.candidates_considered.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Candidates Considered</div>
                    <div className="flex flex-wrap gap-1">
                      {log.candidates_considered.map((c) => (
                        <Badge key={c} variant="outline" className={`text-[9px] ${c === log.selected_model ? "border-primary text-primary" : ""}`}>
                          {c} {c === log.selected_model && " (selected)"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {log.candidates_eliminated && Object.keys(log.candidates_eliminated).length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Eliminated</div>
                    {Object.entries(log.candidates_eliminated).map(([model, reason]) => (
                      <div key={model} className="flex items-center gap-2 text-xs py-0.5">
                        <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400">{model}</Badge>
                        <span className="text-muted-foreground">{reason}</span>
                      </div>
                    ))}
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

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="text-muted-foreground text-sm animate-pulse">Loading logs...</div></div>;

  const modelData = stats ? Object.entries(stats.model_distribution).map(([name, value]) => ({ name, value })) : [];
  const tierData = stats ? Object.entries(stats.requests_by_tier).map(([name, value]) => ({ name, value })) : [];

  const filteredLogs = tierFilter === "all" ? logs : logs.filter((l) => l.classification === tierFilter);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{customer?.customer_name} — Request Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{logs.length} requests logged</p>
        </div>
        <Link href={`/customers/${id}`}><Button variant="outline" size="sm" className="text-xs">Back to Profile</Button></Link>
      </div>

      {/* Charts */}
      {stats && stats.total_requests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Model Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={modelData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none" label={({ name, value }) => `${name} (${value})`}>
                    {modelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Complexity Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tierData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {tierData.map((d) => <Cell key={d.name} fill={d.name === "simple" ? "#34d399" : d.name === "complex" ? "#f87171" : "#fbbf24"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1.5">
        {["all", "simple", "medium", "complex"].map((t) => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              tierFilter === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >{t}</button>
        ))}
        <span className="text-xs text-muted-foreground ml-2 self-center">{filteredLogs.length} results</span>
      </div>

      {/* Log table */}
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/30 bg-secondary/20">
                {["Time", "Prompt", "Tier", "Model", "Latency", "TTFT", "Cost", "Tokens", "Status", ""].map((h) => (
                  <th key={h} className="px-3 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  expanded={expandedId === log.id}
                  onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
