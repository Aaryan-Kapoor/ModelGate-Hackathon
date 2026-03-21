"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview", icon: "grid" },
  { href: "/customers", label: "Clients", icon: "users" },
  { href: "/customers/new", label: "Onboard", icon: "plus" },
  { href: "/models", label: "Models", icon: "cpu" },
  { href: "/playground", label: "Playground", icon: "terminal" },
];

const icons: Record<string, React.ReactNode> = {
  grid: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  users: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  plus: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  cpu: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" /></svg>,
  terminal: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`transition-all duration-300 border-r border-slate-300/60 bg-slate-50/70 backdrop-blur-xl h-screen flex flex-col relative z-50 ${collapsed ? 'w-16' : 'w-64'}`}>
      <button 
        onClick={() => setCollapsed(!collapsed)} 
        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 bg-slate-100/90 hover:bg-slate-200 border border-slate-300 shadow-sm absolute -right-3 top-4 z-50 transition-transform"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center h-14 px-4 border-b border-slate-200/50 flex-shrink-0">
        <Link href="/" className={`flex items-center gap-2.5 group ${collapsed ? 'w-full justify-center' : ''}`}>
          <div className="h-7 w-7 rounded-md bg-slate-900 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
            <span className="text-white font-bold text-[10px] tracking-tight">MG</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-slate-800 whitespace-nowrap">ModelGate</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto overflow-x-hidden">
        {links.map((link) => {
          const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="flex-shrink-0">{icons[link.icon]}</div>
              {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-slate-200/50 flex items-center gap-2 text-[10px] text-emerald-600 font-mono font-medium tracking-wide flex-shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot shadow-[0_0_8px_rgba(16,185,129,0.4)] flex-shrink-0" />
        {!collapsed && <span className="whitespace-nowrap">SYSTEM NORMAL</span>}
      </div>
    </aside>
  );
}
