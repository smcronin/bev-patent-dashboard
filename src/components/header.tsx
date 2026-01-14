"use client";

import { Bell, Settings, User } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors">
          <User className="h-4 w-4" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
}
