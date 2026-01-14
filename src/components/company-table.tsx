"use client";

import { useState, useMemo } from "react";
import { CompanyStats, calculateGrowthRate } from "@/lib/data";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import { ChevronUp, ChevronDown, Search, ExternalLink } from "lucide-react";

interface CompanyTableProps {
  companies: CompanyStats[];
}

type SortField = "name" | "total_patents" | "growth";
type SortDirection = "asc" | "desc";

export function CompanyTable({ companies }: CompanyTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("total_patents");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies.filter(
      (c) =>
        c.total_patents > 0 &&
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "total_patents":
          comparison = a.total_patents - b.total_patents;
          break;
        case "growth":
          comparison = calculateGrowthRate(a.yearly) - calculateGrowthRate(b.yearly);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [companies, search, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full">
          <thead className="bg-[var(--secondary)]">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Company
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                onClick={() => handleSort("total_patents")}
              >
                <div className="flex items-center justify-end gap-1">
                  Patents
                  <SortIcon field="total_patents" />
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                onClick={() => handleSort("growth")}
              >
                <div className="flex items-center justify-end gap-1">
                  YoY Growth
                  <SortIcon field="growth" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--muted-foreground)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredAndSortedCompanies.map((company) => {
              const growth = calculateGrowthRate(company.yearly);
              return (
                <tr
                  key={company.name}
                  className="bg-[var(--card)] hover:bg-[var(--secondary)] transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                    {company.name}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[var(--foreground)]">
                    <span className="font-mono">{company.total_patents.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span
                      className={
                        growth > 0
                          ? "text-emerald-400"
                          : growth < 0
                          ? "text-red-400"
                          : "text-[var(--muted-foreground)]"
                      }
                    >
                      {growth > 0 ? "+" : ""}
                      {growth}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/company/${slugify(company.name)}`}
                      className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)]/10 px-3 py-1 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--muted-foreground)]">
        Showing {filteredAndSortedCompanies.length} of {companies.filter((c) => c.total_patents > 0).length} companies with patents
      </p>
    </div>
  );
}
