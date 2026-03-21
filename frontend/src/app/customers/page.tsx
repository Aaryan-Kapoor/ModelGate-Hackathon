"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomers, getStats, deleteCustomer } from "@/lib/api";
import type { CustomerProfile, CustomerStats } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerListSkeleton } from "@/components/Skeletons";

const OBJ_COLORS: Record<string, string> = {
  low_latency: "border-sky-300/50 text-sky-700 bg-sky-100/50",
  high_quality: "border-indigo-300/50 text-indigo-700 bg-indigo-100/50",
  low_cost: "border-emerald-300/50 text-emerald-700 bg-emerald-100/50",
};

function CustomerRow({ customer, stats, onDelete }: { customer: CustomerProfile; stats?: CustomerStats; onDelete: (id: string) => void }) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 px-3 hover:bg-slate-50/60 transition-colors border-b border-slate-300/60 last:border-0 relative">
      <Link href={`/customers/${customer.customer_id}`} className="absolute inset-0 z-0" />
      
      <div className="flex-1 relative z-10 pointer-events-none pr-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
            {customer.customer_name}
          </h3>
          <Badge variant="outline" className={`text-[10px] font-medium tracking-wide font-sans ${OBJ_COLORS[customer.objective] || "border-slate-200 text-slate-600 bg-slate-50/50"}`}>
            {customer.objective.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1 capitalize font-medium">
          {customer.use_case.replace(/_/g, " ")}
        </p>
        
        <div className="flex flex-wrap items-center gap-2.5 mt-3">
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            {customer.constraints.region} region
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className={`text-[11px] font-mono font-medium ${customer.constraints.privacy_tier === "high" ? "text-rose-500" : "text-slate-400"}`}>
            {customer.constraints.privacy_tier} privacy
          </span>
          {customer.constraints.forbidden_providers.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[11px] text-rose-500 font-mono font-medium">
                {customer.constraints.forbidden_providers.length} blocked
              </span>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-10 mt-5 sm:mt-0 pointer-events-none">
        {stats && stats.total_requests > 0 ? (
          <div className="flex items-center gap-8 text-right">
            <div>
              <div className="text-sm font-semibold font-mono text-slate-700">{stats.total_requests.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">Requests</div>
            </div>
            <div>
              <div className="text-sm font-semibold font-mono text-slate-700">{stats.avg_latency_ms.toFixed(0)}<span className="text-slate-400 font-normal">ms</span></div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">Avg Latency</div>
            </div>
            <div className="w-20">
              <div className="text-sm font-semibold font-mono text-slate-700">${stats.total_cost.toFixed(4)}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">Spend</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic pr-4 font-medium">No active traffic</div>
        )}
        
        <div className="pointer-events-auto h-8 flex items-center">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm(`Delete ${customer.customer_name}?`)) onDelete(customer.customer_id); }}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete customer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Hero Section */}
      <section className="pt-16 pb-12 mb-8 border-b border-slate-200/50 subtle-gradient-bg px-2 sm:px-4 rounded-3xl mx-[-0.5rem] sm:mx-[-1rem]">
        <div className="max-w-4xl px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-600 mb-6 shadow-sm">
            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            Client Configuration
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Enterprise Client Routing
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl leading-relaxed">
            Manage dedicated AI routing profiles. Tailor performance targets, enforce regional privacy constraints, and track traffic utilization per client.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/customers/new">
              <Button className="h-11 px-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Onboard Client
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl px-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Active Clients ({customers.length})</h2>
          <div className="text-sm text-slate-400 font-medium">Sorted by addition date</div>
        </div>

        {customers.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-300/80 rounded-3xl bg-slate-100/60 hover:bg-slate-100 transition-colors">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No clients found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Get started by uploading your first client contract. We'll automatically generate their routing profile.</p>
            <Link href="/customers/new">
              <Button variant="outline" className="rounded-full shadow-sm text-slate-700 font-medium border-slate-300">Upload Contract</Button>
            </Link>
          </div>
        ) : (
          <div className="border-y border-slate-200/80">
            {customers.map((c) => (
              <CustomerRow
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
      </section>
    </div>
  );
}
