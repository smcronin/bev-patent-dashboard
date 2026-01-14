"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YearTrendChart } from "@/components/charts/year-trend-chart";
import { TechnologyPieChart } from "@/components/charts/technology-pie-chart";
import { CompanyBarChart } from "@/components/charts/company-bar-chart";
import { CompanyTable } from "@/components/company-table";
import {
  PortfolioSummary,
  getYearlyTrends,
  getTechnologyDistribution,
  getTopCompanies,
} from "@/lib/data";
import {
  FileText,
  Building2,
  TrendingUp,
  Globe,
  Calendar,
  ChevronDown,
} from "lucide-react";

type TopCompanyLimit = 10 | 15 | 25 | 50 | "all";

export default function DashboardPage() {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [topCompanyLimit, setTopCompanyLimit] = useState<TopCompanyLimit>(15);

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading portfolio data...</p>
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

  const yearlyTrends = getYearlyTrends(data.companies);
  const technologyDistribution = getTechnologyDistribution(data.companies);

  // Get companies with patents for the chart
  const companiesWithPatents = data.companies.filter(c => c.total_patents > 0);
  const effectiveLimit = topCompanyLimit === "all" ? companiesWithPatents.length : topCompanyLimit;
  const topCompanies = getTopCompanies(data.companies, effectiveLimit);

  // Calculate year-over-year growth: 2024 vs 2025
  const year2025Patents = yearlyTrends.find((y) => y.year === "2025")?.patents || 0;
  const year2024Patents = yearlyTrends.find((y) => y.year === "2024")?.patents || 0;
  const yoyGrowth = year2024Patents > 0
    ? Math.round(((year2025Patents - year2024Patents) / year2024Patents) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title="Portfolio Overview"
        description="Breakthrough Energy Ventures patent portfolio analysis"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Patent Families"
            value={data.portfolio_totals.total_patent_families}
            icon={FileText}
            description="Since 2015"
          />
          <KPICard
            title="Portfolio Companies"
            value={data.metadata.companies_with_patents}
            icon={Building2}
            description={`of ${data.metadata.total_companies_searched} total`}
          />
          <KPICard
            title="2024 → 2025 Growth"
            value={`${yoyGrowth > 0 ? "+" : ""}${yoyGrowth}%`}
            icon={TrendingUp}
            description={`${year2024Patents.toLocaleString()} → ${year2025Patents.toLocaleString()} patents`}
          />
          <KPICard
            title="Technology Sectors"
            value={technologyDistribution.length}
            icon={Globe}
            description="Active sectors"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--primary)]" />
                Patent Filing Trends (2015-2026)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <YearTrendChart data={yearlyTrends} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[var(--primary)]" />
                Technology Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TechnologyPieChart data={technologyDistribution} />
            </CardContent>
          </Card>
        </div>

        {/* Top Companies Chart with Dropdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[var(--primary)]" />
                Top Patent Holders
              </CardTitle>
              <div className="relative">
                <select
                  value={topCompanyLimit}
                  onChange={(e) => setTopCompanyLimit(e.target.value === "all" ? "all" : parseInt(e.target.value) as TopCompanyLimit)}
                  className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 pr-10 text-sm font-medium text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value={10}>Top 10</option>
                  <option value={15}>Top 15</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                  <option value="all">All ({companiesWithPatents.length})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CompanyBarChart data={topCompanies} limit={effectiveLimit} />
          </CardContent>
        </Card>

        {/* Company Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Portfolio Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyTable companies={data.companies} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
          <p>
            Data sourced from <span className="font-medium">{data.metadata.source}</span>
          </p>
          <p>
            Last updated: <span className="font-medium">{data.metadata.generated}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
