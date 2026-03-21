"use client";

import { startTransition, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clock3,
  Coins,
  Gauge,
  Globe2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { deleteCustomer, getCustomers, getStats } from "@/lib/api";
import type { CustomerProfile, CustomerStats, ProfileWarning } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerListSkeleton } from "@/components/Skeletons";

const OBJECTIVE_STYLES: Record<
  string,
  { badge: string; line: string; glow: string; label: string }
> = {
  low_latency: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    line: "bg-sky-500",
    glow: "from-sky-500/15 via-sky-500/5 to-transparent",
    label: "Low latency",
  },
  high_quality: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    line: "bg-amber-500",
    glow: "from-amber-500/15 via-amber-500/5 to-transparent",
    label: "High quality",
  },
  low_cost: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    line: "bg-emerald-500",
    glow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    label: "Low cost",
  },
};

const PRIVACY_STYLES: Record<string, string> = {
  high: "text-rose-700",
  standard: "text-amber-700",
  low: "text-emerald-700",
};

const WARNING_STYLES: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

function labelize(value: string) {
  return value.replace(/_/g, " ");
}

function titleize(value: string) {
  return labelize(value).replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatList(values: string[], fallback: string) {
  return values.length > 0 ? values.join(", ") : fallback;
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : value >= 10 ? 2 : 4,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(value >= 100 ? 0 : 1)}%`;
}

function normalizeWarning(warning: string | ProfileWarning) {
  if (typeof warning === "string") {
    return {
      message: warning,
      severity: "info",
      type: "contract note",
    };
  }

  return {
    message: warning.message,
    severity: warning.severity,
    type: labelize(warning.type),
  };
}

function PortfolioStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-l border-slate-200/80 pl-4 first:border-l-0 first:pl-0">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 stat-value">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-600">{detail}</div>
    </div>
  );
}

function MixBar({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: string;
}) {
  const width = total > 0 ? `${Math.max((count / total) * 100, count > 0 ? 8 : 0)}%` : "0%";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-xs text-slate-500">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div className={`h-full rounded-full ${tone}`} style={{ width }} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
      {children}
    </p>
  );
}

function DetailPair({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="border-t border-slate-200/80 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={`mt-1 text-sm leading-6 ${accent || "text-slate-700"}`}>{value}</div>
    </div>
  );
}

function CustomerMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 stat-value">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-600">{detail}</div>
    </div>
  );
}

function CustomerSheet({
  customer,
  stats,
  index,
  onDelete,
}: {
  customer: CustomerProfile;
  stats?: CustomerStats;
  index: number;
  onDelete: (id: string, name: string) => void;
}) {
  const objectiveTone = OBJECTIVE_STYLES[customer.objective] ?? OBJECTIVE_STYLES.low_latency;
  const normalizedWarnings = customer.warnings.map(normalizeWarning);
  const routingEntries = Object.entries(customer.routing_preferences)
    .sort(([left], [right]) => {
      const order = ["simple", "medium", "complex"];
      return order.indexOf(left) - order.indexOf(right);
    })
    .filter(([, models]) => models.length > 0);

  return (
    <article
      className="animate-rise-in relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white/88 p-6 shadow-[0_30px_70px_-48px_rgba(15,23,42,0.35)] backdrop-blur-sm"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-r ${objectiveTone.glow}`} />

      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/customers/${customer.customer_id}`}
                className="font-heading text-2xl font-semibold tracking-tight text-slate-950 transition-colors hover:text-primary"
              >
                {customer.customer_name}
              </Link>
              <Badge variant="outline" className="border-slate-200 bg-white/70 text-[11px] text-slate-600">
                {titleize(customer.use_case)}
              </Badge>
              {normalizedWarnings.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-[11px] text-amber-700"
                >
                  {normalizedWarnings.length} warning{normalizedWarnings.length === 1 ? "" : "s"}
                </Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <span>{customer.customer_id}</span>
              <span>Created {formatDate(customer.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[11px] ${objectiveTone.badge}`}>
              {objectiveTone.label}
            </Badge>
            <Link href={`/customers/${customer.customer_id}`}>
              <Button variant="outline" size="sm" className="border-slate-300 bg-white/80 text-xs text-slate-700 hover:bg-slate-100">
                Open profile
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon-sm"
              className="border-rose-200 bg-white/80 text-rose-600 hover:bg-rose-50"
              onClick={() => onDelete(customer.customer_id, customer.customer_name)}
              title={`Delete ${customer.customer_name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <section>
              <SectionLabel>Contract Constraints</SectionLabel>
              <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <DetailPair
                  label="Region"
                  value={customer.constraints.region}
                  accent="text-sky-700"
                />
                <DetailPair
                  label="Privacy tier"
                  value={titleize(customer.constraints.privacy_tier)}
                  accent={PRIVACY_STYLES[customer.constraints.privacy_tier]}
                />
                <DetailPair
                  label="Latency target"
                  value={`${customer.performance.latency_target_ms} ms`}
                  accent="text-slate-950"
                />
                <DetailPair
                  label="Cost sensitivity"
                  value={titleize(customer.performance.cost_sensitivity)}
                />
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              <div>
                <SectionLabel>Allowed Providers</SectionLabel>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {formatList(
                    customer.constraints.allowed_providers,
                    "All configured providers are eligible."
                  )}
                </p>
              </div>
              <div>
                <SectionLabel>Blocked Providers</SectionLabel>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {formatList(
                    customer.constraints.forbidden_providers,
                    "No provider is explicitly blocked."
                  )}
                </p>
              </div>
            </section>

            <section>
              <SectionLabel>Routing Preferences</SectionLabel>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                {(routingEntries.length > 0
                  ? routingEntries
                  : ([
                      ["simple", []],
                      ["medium", []],
                      ["complex", []],
                    ] as Array<[string, string[]]>)
                ).map(([tier, models]) => (
                  <div key={tier} className="border-t border-slate-200/80 pt-3 first:border-t-0 first:pt-0">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      {titleize(tier)}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">
                      {models.length > 0 ? models.join(", ") : "No explicit model preference."}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>Warnings</SectionLabel>
              {normalizedWarnings.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {normalizedWarnings.map((warning, warningIndex) => (
                    <div
                      key={`${customer.customer_id}-${warning.type}-${warningIndex}`}
                      className={`rounded-2xl border px-4 py-3 ${WARNING_STYLES[warning.severity]}`}
                    >
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em]">
                        {titleize(warning.type)}
                      </div>
                      <div className="mt-1 text-sm leading-6">{warning.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  No contract warnings were generated for this profile.
                </p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <SectionLabel>Live Performance</SectionLabel>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CustomerMetric
                  icon={<Activity className="h-3.5 w-3.5" />}
                  label="Requests"
                  value={`${stats?.total_requests ?? 0}`}
                  detail={
                    stats && stats.total_requests > 0
                      ? `${stats.total_tokens.toLocaleString()} total tokens`
                      : "Awaiting the first routed request"
                  }
                />
                <CustomerMetric
                  icon={<Clock3 className="h-3.5 w-3.5" />}
                  label="Avg latency"
                  value={`${Math.round(stats?.avg_latency_ms ?? 0)} ms`}
                  detail={`P95 ${Math.round(stats?.p95_latency_ms ?? 0)} ms`}
                />
                <CustomerMetric
                  icon={<Gauge className="h-3.5 w-3.5" />}
                  label="Success rate"
                  value={formatPercent(stats?.success_rate ?? 0)}
                  detail={`Avg TTFT ${Math.round(stats?.avg_ttft_ms ?? 0)} ms`}
                />
                <CustomerMetric
                  icon={<Coins className="h-3.5 w-3.5" />}
                  label="Total cost"
                  value={formatCompactCurrency(stats?.total_cost ?? 0)}
                  detail={
                    stats && stats.total_requests > 0
                      ? `${formatCompactCurrency(
                          stats.total_cost / Math.max(stats.total_requests, 1)
                        )} per request`
                      : "No accrued cost yet"
                  }
                />
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200/80 bg-linear-to-br from-slate-50 to-white p-5">
              <SectionLabel>Operating Posture</SectionLabel>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Globe2 className="mt-0.5 h-4 w-4 text-sky-600" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Regional routing</div>
                    <div className="text-sm leading-6 text-slate-600">
                      Requests are constrained to {customer.constraints.region} with a{" "}
                      {labelize(customer.objective)} objective.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {customer.constraints.privacy_tier === "high" ? (
                    <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-600" />
                  ) : (
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-slate-900">Compliance posture</div>
                    <div className="text-sm leading-6 text-slate-600">
                      Privacy guardrails are set to{" "}
                      {titleize(customer.constraints.privacy_tier)} and provider access is{" "}
                      {customer.constraints.allowed_providers.length > 0 ? "explicitly allowlisted" : "open to the global pool"}.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
              <Link
                href={`/customers/${customer.customer_id}/logs`}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-primary"
              >
                Review request logs
              </Link>
              <Link
                href={`/playground?customer=${customer.customer_id}`}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Open in playground
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, CustomerStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers()
      .then(async (profiles) => {
        setCustomers(profiles);
        const statsPromises = profiles.map((profile) =>
          getStats(profile.customer_id).then((stats) => [profile.customer_id, stats] as const)
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

  const totalRequests = customers.reduce(
    (sum, customer) => sum + (statsMap[customer.customer_id]?.total_requests ?? 0),
    0
  );
  const totalCost = customers.reduce(
    (sum, customer) => sum + (statsMap[customer.customer_id]?.total_cost ?? 0),
    0
  );
  const weightedLatency = customers.reduce((sum, customer) => {
    const stats = statsMap[customer.customer_id];
    if (!stats || stats.total_requests === 0) return sum;
    return sum + stats.avg_latency_ms * stats.total_requests;
  }, 0);
  const averageLatency = totalRequests > 0 ? weightedLatency / totalRequests : 0;
  const activeProfiles = customers.filter(
    (customer) => (statsMap[customer.customer_id]?.total_requests ?? 0) > 0
  ).length;
  const warningCount = customers.reduce((sum, customer) => sum + customer.warnings.length, 0);
  const regionCounts = customers.reduce<Record<string, number>>((acc, customer) => {
    acc[customer.constraints.region] = (acc[customer.constraints.region] ?? 0) + 1;
    return acc;
  }, {});
  const objectiveCounts = customers.reduce<Record<string, number>>((acc, customer) => {
    acc[customer.objective] = (acc[customer.objective] ?? 0) + 1;
    return acc;
  }, {});
  const blockedProviders = new Set(
    customers.flatMap((customer) => customer.constraints.forbidden_providers)
  );
  const highPrivacyProfiles = customers.filter(
    (customer) => customer.constraints.privacy_tier === "high"
  ).length;
  const busiestRegions = Object.entries(regionCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const sortedCustomers = [...customers].sort((left, right) => {
    const leftRequests = statsMap[left.customer_id]?.total_requests ?? 0;
    const rightRequests = statsMap[right.customer_id]?.total_requests ?? 0;
    return rightRequests - leftRequests || left.customer_name.localeCompare(right.customer_name);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,248,252,0.96))] px-6 py-8 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.4)] sm:px-8 sm:py-10 lg:px-10">
        <div className="animate-drift-y absolute -right-12 top-12 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute left-1/3 top-0 h-full w-28 animate-sweep bg-linear-to-r from-transparent via-white/45 to-transparent" />
        <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
              <span>ModelGate</span>
              <span className="h-px w-10 bg-slate-300" />
              <span>Customer portfolio</span>
            </div>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Contract-aware customer routing, laid out as one working surface.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Review every onboarded customer, the contract constraints that shape their routing,
              and the live cost and latency footprint that follows from those rules.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/customers/new">
                <Button size="lg" className="h-11 rounded-full bg-slate-950 px-5 text-sm text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" />
                  Onboard customer
                </Button>
              </Link>
              <Link href="/models">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-full border-slate-300 bg-white/70 px-5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Review model roster
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <PortfolioStat
                label="Profiles"
                value={`${customers.length}`}
                detail={`${activeProfiles} actively serving traffic`}
              />
              <PortfolioStat
                label="Requests"
                value={totalRequests.toLocaleString()}
                detail={`${warningCount} contract warnings across the roster`}
              />
              <PortfolioStat
                label="Avg latency"
                value={`${Math.round(averageLatency)} ms`}
                detail={totalRequests > 0 ? "Weighted by live request volume" : "No traffic yet"}
              />
              <PortfolioStat
                label="Spend"
                value={formatCompactCurrency(totalCost)}
                detail={`${blockedProviders.size} blocked providers in policy`}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/72 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
            <SectionLabel>Portfolio Mix</SectionLabel>
            <div className="mt-4 space-y-4">
              {["low_latency", "high_quality", "low_cost"].map((objective) => {
                const style = OBJECTIVE_STYLES[objective];
                return (
                  <MixBar
                    key={objective}
                    label={style.label}
                    count={objectiveCounts[objective] ?? 0}
                    total={customers.length}
                    tone={style.line}
                  />
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 border-t border-slate-200/80 pt-6 md:grid-cols-2">
              <div>
                <SectionLabel>Regional Coverage</SectionLabel>
                <div className="mt-4 space-y-3">
                  {busiestRegions.length > 0 ? (
                    busiestRegions.map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                        <span>{region}</span>
                        <span className="font-mono text-xs text-slate-500">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">Customer regions will appear here after onboarding.</p>
                  )}
                </div>
              </div>
              <div>
                <SectionLabel>Risk Snapshot</SectionLabel>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span>High privacy profiles</span>
                    <span className="font-mono text-xs text-slate-500">{highPrivacyProfiles}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Profiles without traffic</span>
                    <span className="font-mono text-xs text-slate-500">
                      {customers.length - activeProfiles}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Warning count</span>
                    <span className="font-mono text-xs text-slate-500">{warningCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {customers.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
          <div className="mx-auto max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
              Customer roster
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-slate-950">
              No customer profiles are onboarded yet.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Upload a contract to generate the first routing profile. Once a customer is created,
              this page will show their constraints, model preferences, warnings, and live request metrics.
            </p>
            <div className="mt-8">
              <Link href="/customers/new">
                <Button size="lg" className="h-11 rounded-full bg-slate-950 px-5 text-sm text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" />
                  Upload a contract
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
                Customer dossiers
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-950">
                Full profile, policy, and performance context for every customer.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Profiles are ordered by live request volume so the busiest routing surfaces stay at the top.
            </p>
          </div>

          <div className="grid gap-5 2xl:grid-cols-2">
            {sortedCustomers.map((customer, index) => (
              <CustomerSheet
                key={customer.customer_id}
                customer={customer}
                stats={statsMap[customer.customer_id]}
                index={index}
                onDelete={async (id, name) => {
                  if (!confirm(`Delete ${name}?`)) return;

                  try {
                    await deleteCustomer(id);
                    startTransition(() => {
                      setCustomers((previous) => previous.filter((customer) => customer.customer_id !== id));
                      setStatsMap((previous) => {
                        const next = { ...previous };
                        delete next[id];
                        return next;
                      });
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
