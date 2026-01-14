"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioSummary, CompanyStats, calculateGrowthRate } from "@/lib/data";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import { Search, Filter, Building2, FileText, TrendingUp, ExternalLink } from "lucide-react";

type FilterOption = "all" | "high_growth" | "large_portfolio" | "recent_activity";

export default function SearchPage() {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [minPatents, setMinPatents] = useState(0);

  useEffect(() => {
    fetch("/data/portfolio_summary.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!data) return [];

    let companies = data.companies.filter((c) => c.total_patents > 0);

    // Apply search query
    if (searchQuery) {
      companies = companies.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply min patents filter
    if (minPatents > 0) {
      companies = companies.filter((c) => c.total_patents >= minPatents);
    }

    // Apply preset filters
    switch (filter) {
      case "high_growth":
        companies = companies.filter((c) => calculateGrowthRate(c.yearly) > 20);
        break;
      case "large_portfolio":
        companies = companies.filter((c) => c.total_patents >= 100);
        break;
      case "recent_activity":
        companies = companies.filter((c) => {
          const years = Object.keys(c.yearly);
          return years.includes("2025") || years.includes("2024");
        });
        break;
    }

    return companies.sort((a, b) => b.total_patents - a.total_patents);
  }, [data, searchQuery, filter, minPatents]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading search...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Failed to load data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title="Search & Filter"
        description="Find companies by name, patent count, or growth characteristics"
      />

      <div className="p-6 space-y-6">
        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search Input */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search company names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Quick Filters */}
              <div>
                <label className="mb-1 block text-xs text-[var(--muted-foreground)]">
                  Quick Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterOption)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="all">All Companies</option>
                  <option value="high_growth">High Growth ({">"}20% YoY)</option>
                  <option value="large_portfolio">Large Portfolio (100+)</option>
                  <option value="recent_activity">Recent Activity (2024-25)</option>
                </select>
              </div>

              {/* Min Patents */}
              <div>
                <label className="mb-1 block text-xs text-[var(--muted-foreground)]">
                  Minimum Patents
                </label>
                <input
                  type="number"
                  min={0}
                  value={minPatents}
                  onChange={(e) => setMinPatents(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Filter className="h-4 w-4" />
          <span>
            Found <span className="font-medium text-[var(--foreground)]">{filteredCompanies.length}</span> companies
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const growth = calculateGrowthRate(company.yearly);
            const years = Object.keys(company.yearly).sort();
            const latestYear = years[years.length - 1];
            const latestCount = company.yearly[latestYear] || 0;

            return (
              <Card key={company.name} className="hover:border-[var(--primary)] transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{company.name}</CardTitle>
                    <Link
                      href={`/company/${slugify(company.name)}`}
                      className="rounded-md bg-[var(--primary)]/10 p-1.5 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[var(--muted-foreground)]">
                        <FileText className="h-3 w-3" />
                      </div>
                      <p className="mt-1 text-xl font-bold text-[var(--foreground)]">
                        {company.total_patents}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">Total</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[var(--muted-foreground)]">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <p className={`mt-1 text-xl font-bold ${growth > 0 ? "text-emerald-400" : growth < 0 ? "text-red-400" : "text-[var(--muted-foreground)]"}`}>
                        {growth > 0 ? "+" : ""}{growth}%
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">Growth</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[var(--muted-foreground)]">
                        <Building2 className="h-3 w-3" />
                      </div>
                      <p className="mt-1 text-xl font-bold text-[var(--foreground)]">
                        {latestCount}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{latestYear}</p>
                    </div>
                  </div>

                  {/* Mini Sparkline */}
                  <div className="mt-4 flex h-8 items-end gap-0.5">
                    {years.slice(-8).map((year) => {
                      const count = company.yearly[year] || 0;
                      const maxCount = Math.max(...Object.values(company.yearly));
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div
                          key={year}
                          className="flex-1 rounded-t bg-[var(--primary)]/60 transition-all hover:bg-[var(--primary)]"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${year}: ${count} patents`}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-lg font-medium text-[var(--foreground)]">No companies found</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
