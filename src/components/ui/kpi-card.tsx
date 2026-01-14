"use client";

import { cn, formatNumber } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  description?: string;
}

export function KPICard({ title, value, change, icon: Icon, description }: KPICardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg hover:border-[var(--primary)] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {change !== undefined && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-[var(--muted-foreground)]"
              )}
            >
              {change > 0 ? "+" : ""}
              {change}% from last year
            </p>
          )}
          {description && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
          )}
        </div>
        <div className="ml-4 rounded-full bg-[var(--primary)]/10 p-3">
          <Icon className="h-6 w-6 text-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}
