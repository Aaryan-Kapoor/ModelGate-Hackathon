"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Grid2x2, Plus, TerminalSquare, Users } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: Grid2x2 },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/customers/new", label: "Onboard", icon: Plus },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/playground", label: "Playground", icon: TerminalSquare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-[rgba(255,252,245,0.84)] backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[4.25rem] w-full max-w-[1800px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-[0.7rem] font-semibold tracking-[0.24em] text-amber-50 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.75)] transition-transform duration-300 group-hover:scale-[1.03]">
              <span className="absolute inset-0 animate-sweep bg-linear-to-r from-transparent via-white/20 to-transparent" />
              MG
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-heading text-lg font-semibold tracking-tight text-slate-950">
                  ModelGate
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                  Live routing
                </span>
              </div>
              <p className="text-xs text-slate-500">Contract-aware AI control plane</p>
            </div>
          </Link>

          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.35)]">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-950 text-white shadow-[0_16px_30px_-20px_rgba(15,23,42,0.85)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
