"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PortfolioSummary,
  getYearlyTrends,
  getTechnologyDistribution,
  getTopCompanies,
} from "@/lib/data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Activity, Layers } from "lucide-react";

const COLORS = ["#84cc16", "#22c55e", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"];

export default function TrendsPage() {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

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

  const yearlyTrends = useMemo(() => {
    if (!data) return [];
    return getYearlyTrends(data.companies);
  }, [data]);

  const topCompanyTrends = useMemo(() => {
    if (!data) return [];
    const top5 = getTopCompanies(data.companies, 5);
    const years = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];

    return years.map((year) => {
      const entry: Record<string, number | string> = { year };
      top5.forEach((company) => {
        entry[company.name] = company.yearly[year] || 0;
      });
      return entry;
    });
  }, [data]);

  const technologyTrends = useMemo(() => {
    if (!data) return [];
    return getTechnologyDistribution(data.companies);
  }, [data]);

  const growthLeaders = useMemo(() => {
    if (!data) return [];
    return data.companies
      .filter((c) => c.total_patents >= 20)
      .map((company) => {
        const years = Object.keys(company.yearly).sort();
        const recentYears = years.slice(-3);
        const recentTotal = recentYears.reduce((sum, y) => sum + (company.yearly[y] || 0), 0);
        const earlierYears = years.slice(0, -3);
        const earlierTotal = earlierYears.reduce((sum, y) => sum + (company.yearly[y] || 0), 0);
        const earlierAvg = earlierYears.length > 0 ? earlierTotal / earlierYears.length : 0;
        const recentAvg = recentYears.length > 0 ? recentTotal / recentYears.length : 0;
        const growthRate = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

        return {
          name: company.name,
          total: company.total_patents,
          recentAvg: Math.round(recentAvg),
          growthRate: Math.round(growthRate),
        };
      })
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 10);
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading trends...</p>
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

  const top5Companies = getTopCompanies(data.companies, 5);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title="Patent Trends"
        description="Analyze filing patterns and technology evolution across the portfolio"
      />

      <div className="p-6 space-y-6">
        {/* Portfolio Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              Portfolio Growth Over Time
            </CardTitle>
            <CardDescription>Total patent filings across all BEV companies</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={yearlyTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="year" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                    color: "#1a1a1a",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="patents"
                  stroke="#84cc16"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Patents"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Companies Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--primary)]" />
              Top 5 Companies - Filing Comparison
            </CardTitle>
            <CardDescription>Year-over-year patent activity for leading companies</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={topCompanyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="year" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                    color: "#1a1a1a",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ color: "#71717a" }} />
                {top5Companies.map((company, idx) => (
                  <Line
                    key={company.name}
                    type="monotone"
                    dataKey={company.name}
                    stroke={COLORS[idx]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Technology Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[var(--primary)]" />
                Technology Sector Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, technologyTrends.length * 40)}>
                <BarChart data={technologyTrends} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#71717a"
                    fontSize={11}
                    width={100}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e4e4e7",
                      borderRadius: "8px",
                      color: "#1a1a1a",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" fill="#84cc16" radius={[0, 4, 4, 0]} name="Patents" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Leaders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                Fastest Growing Companies
              </CardTitle>
              <CardDescription>Based on recent 3-year filing acceleration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {growthLeaders.map((company, idx) => (
                  <div
                    key={company.name}
                    className="flex items-center justify-between rounded-lg bg-[var(--secondary)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/20 text-sm font-bold text-[var(--primary)]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{company.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {company.total} total patents
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${company.growthRate > 0 ? "text-lime-600" : "text-red-600"}`}>
                        {company.growthRate > 0 ? "+" : ""}{company.growthRate}%
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        ~{company.recentAvg}/year
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
