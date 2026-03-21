"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/customers", label: "Customers" },
  { href: "/customers/new", label: "Onboard" },
  { href: "/models", label: "Models" },
  { href: "/playground", label: "Playground" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <span className="text-primary font-mono font-bold text-xs tracking-tighter">MG</span>
            </div>
            <span className="text-base font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">ModelGate</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="h-4 w-px bg-border hidden md:block"></div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/30">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">System Live</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
