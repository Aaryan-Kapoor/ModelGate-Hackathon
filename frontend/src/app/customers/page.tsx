"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomers, getStats, deleteCustomer } from "@/lib/api";
import type { CustomerProfile, CustomerStats } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerListSkeleton } from "@/components/Skeletons";

const OBJ_COLORS: Record<string, string> = {
  low_latency: "border-cyan-500/40 text-cyan-400",
  high_quality: "border-purple-500/40 text-purple-400",
  low_cost: "border-green-500/40 text-green-400",
};

function CustomerCard({ customer, stats, onDelete }: { customer: CustomerProfile; stats?: CustomerStats; onDelete: (id: string) => void }) {
  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all group h-full relative">
      <Link href={`/customers/${customer.customer_id}`} className="absolute inset-0 z-0" />
      <CardContent className="pt-5 space-y-4 relative z-10 pointer-events-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
              {customer.customer_name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {customer.use_case.replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <Badge variant="outline" className={`text-[9px] ${OBJ_COLORS[customer.objective] || ""}`}>
              {customer.objective.replace(/_/g, " ")}
            </Badge>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm(`Delete ${customer.customer_name}?`)) onDelete(customer.customer_id); }}
              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete customer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

          {/* Constraint badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">
              {customer.constraints.region}
            </Badge>
            <Badge variant="outline" className={`text-[9px] ${
              customer.constraints.privacy_tier === "high"
                ? "border-red-500/30 text-red-400"
                : "border-gray-500/30 text-gray-400"
            }`}>
              {customer.constraints.privacy_tier} privacy
            </Badge>
            {customer.constraints.forbidden_providers.map((p) => (
              <Badge key={p} variant="outline" className="text-[9px] border-red-500/30 text-red-400">
                {p} blocked
              </Badge>
            ))}
          </div>

          {/* Quick stats */}
          {stats && stats.total_requests > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/30 rounded px-2 py-1.5 text-center">
                <div className="text-xs font-mono font-bold">{stats.total_requests}</div>
                <div className="text-[9px] text-muted-foreground">requests</div>
              </div>
              <div className="bg-secondary/30 rounded px-2 py-1.5 text-center">
                <div className="text-xs font-mono font-bold">{stats.avg_latency_ms.toFixed(0)}ms</div>
                <div className="text-[9px] text-muted-foreground">avg latency</div>
              </div>
              <div className="bg-secondary/30 rounded px-2 py-1.5 text-center">
                <div className="text-xs font-mono font-bold">${stats.total_cost.toFixed(4)}</div>
                <div className="text-[9px] text-muted-foreground">total cost</div>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground italic">No requests yet</div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/30">
            <span className="text-[10px] font-mono text-muted-foreground">
              {customer.performance.latency_target_ms}ms target
            </span>
            <span className="text-[10px] text-muted-foreground">
              {customer.constraints.allowed_providers.length > 0
                ? customer.constraints.allowed_providers.join(", ")
                : "all providers"}
            </span>
          </div>
        </CardContent>
      </Card>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, CustomerStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers()
      .then(async (custs) => {
        setCustomers(custs);
        const statsPromises = custs.map((c) =>
          getStats(c.customer_id).then((s) => [c.customer_id, s] as const)
        );
        const results = await Promise.all(statsPromises);
        setStatsMap(Object.fromEntries(results));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <CustomerListSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{customers.length} customer profiles configured</p>
        </div>
        <Link href="/customers/new">
          <Button size="sm" className="text-xs">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Onboard Customer
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <div className="text-muted-foreground text-sm mb-3">No customers onboarded yet</div>
            <Link href="/customers/new">
              <Button size="sm">Upload a Contract</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((c) => (
            <CustomerCard
              key={c.customer_id}
              customer={c}
              stats={statsMap[c.customer_id]}
              onDelete={async (id) => {
                try {
                  await deleteCustomer(id);
                  setCustomers((prev) => prev.filter((cu) => cu.customer_id !== id));
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
