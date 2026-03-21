"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomers, getStats, deleteCustomer } from "@/lib/api";
import type { CustomerProfile, CustomerStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CustomerListSkeleton } from "@/components/Skeletons";

const OBJ_COLORS: Record<string, string> = {
  low_latency: "text-primary",
  high_quality: "text-accent",
  low_cost: "text-success",
};

function CustomerListItem({ customer, stats, onDelete }: { customer: CustomerProfile; stats?: CustomerStats; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 border-b border-border/50 hover:bg-surface/30 transition-colors duration-300">
      <Link href={`/customers/${customer.customer_id}`} className="absolute inset-0 z-0" />
      
      {/* Left: Identity */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl font-light tracking-tight group-hover:text-primary transition-colors truncate">
            {customer.customer_name}
          </h3>
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-border bg-surface/50 ${OBJ_COLORS[customer.objective] || "text-muted-foreground"}`}>
            {customer.objective.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {customer.use_case.replace(/_/g, " ")}
        </p>
      </div>

      {/* Middle: Constraints */}
      <div className="relative z-10 flex-1 flex flex-wrap gap-2">
        <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-surface border border-border">
          {customer.constraints.region}
        </span>
        <span className={`text-[11px] font-mono px-2 py-1 rounded border ${
          customer.constraints.privacy_tier === "high"
            ? "border-danger/30 text-danger bg-danger/5"
            : "border-border text-muted-foreground bg-surface"
        }`}>
          {customer.constraints.privacy_tier} privacy
        </span>
        <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-surface border border-border">
          &lt;{customer.performance.latency_target_ms}ms
        </span>
      </div>

      {/* Right: Stats & Actions */}
      <div className="relative z-10 flex items-center justify-between md:justify-end gap-8 min-w-[200px]">
        {stats && stats.total_requests > 0 ? (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-lg font-mono font-light">{stats.total_requests.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Reqs</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-light text-success">${stats.total_cost.toFixed(2)}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Spend</div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-mono text-muted-foreground italic">No requests</div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm(`Delete ${customer.customer_name}?`)) onDelete(customer.customer_id); }}
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete customer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
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
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">Customers</h1>
          <p className="text-lg text-muted-foreground">Manage routing profiles and monitor usage across {customers.length} organizations.</p>
        </div>
        <Link href="/customers/new">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Onboard Customer
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center border border-border">
          <div className="text-xl font-light mb-4">No customers onboarded yet</div>
          <p className="text-muted-foreground mb-8">Upload a contract to automatically generate an AI routing profile.</p>
          <Link href="/customers/new">
            <Button variant="outline" size="lg" className="border-border hover:bg-surface">Upload Contract</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden">
          {customers.map((c) => (
            <CustomerListItem
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
