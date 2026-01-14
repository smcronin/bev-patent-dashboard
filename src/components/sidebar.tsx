"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Search,
  FileText,
  Zap,
  Brain,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Trends", href: "/trends", icon: TrendingUp },
  { name: "AI Analysis", href: "/ai-analysis", icon: Brain },
  { name: "Search", href: "/search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--border)] bg-[var(--card)]">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--foreground)]">BEV Patent</span>
            <span className="text-[10px] text-[var(--muted-foreground)]">Portfolio Dashboard</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Branding Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">ip</span>
            </div>
            <span className="text-xs font-semibold text-[var(--foreground)]">ipCapital Group</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
            <span>Powered by</span>
            <span className="font-semibold text-[var(--primary)]">Frix.ai</span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            AI-powered patent analytics
          </p>
        </div>
      </div>
    </aside>
  );
}
