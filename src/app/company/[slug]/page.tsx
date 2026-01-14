"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearTrendChart } from "@/components/charts/year-trend-chart";
import {
  PortfolioSummary,
  CompanyStats,
  Patent,
  SearchResults,
  calculateGrowthRate,
  getJurisdictionDistribution,
  getTechnologyFields,
} from "@/lib/data";
import { getFolderForCompany, companiesMissingSearchData } from "@/lib/company-folders";
import { deslugify, slugify } from "@/lib/utils";
import {
  FileText,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Users,
  MapPin,
  ExternalLink,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#84cc16", "#22c55e", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899"];

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<CompanyStats | null>(null);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataUnavailable, setDataUnavailable] = useState(false);

  useEffect(() => {
    // Load portfolio summary to get company stats
    fetch("/data/portfolio_summary.json")
      .then((res) => res.json())
      .then((data: PortfolioSummary) => {
        const found = data.companies.find(
          (c) => slugify(c.name) === slug || c.name.toLowerCase() === deslugify(slug).toLowerCase()
        );
        if (found) {
          setCompany(found);
          // Check if data is known to be missing
          if (companiesMissingSearchData.includes(found.name)) {
            setDataUnavailable(true);
          } else {
            loadPatentDetails(found.name);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load company data:", err);
        setLoading(false);
      });
  }, [slug]);

  const loadPatentDetails = async (companyName: string) => {
    // Use the folder mapping first
    const mappedFolder = getFolderForCompany(companyName);

    const folderNames = mappedFolder
      ? [mappedFolder]
      : [
          `2026-01-14_${companyName.toLowerCase().replace(/\s+/g, "_")}_and_2015`,
          `2026-01-14_${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}_and_2015`,
          `2026-01-14_${companyName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_and_2015`,
        ];

    for (const folderName of folderNames) {
      try {
        const res = await fetch(`/data/searches/${folderName}/results.json`);
        if (res.ok) {
          const data: SearchResults = await res.json();
          setPatents(data.docs || []);
          return;
        }
      } catch {
        continue;
      }
    }
    // No data found
    setDataUnavailable(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header title="Company Not Found" />
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <p className="text-[var(--muted-foreground)]">
            Could not find company: {deslugify(slug)}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const yearlyData = Object.entries(company.yearly)
    .map(([year, patents]) => ({ year, patents }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const growthRate = calculateGrowthRate(company.yearly);
  const jurisdictions = getJurisdictionDistribution(patents);
  const techFields = getTechnologyFields(patents);

  // Get top inventors from patents
  const inventorCounts: Record<string, number> = {};
  patents.forEach((patent) => {
    patent.inventors?.forEach((inv) => {
      inventorCounts[inv] = (inventorCounts[inv] || 0) + 1;
    });
  });
  const topInventors = Object.entries(inventorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title={company.name}
        description="Patent portfolio analysis"
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio Overview
        </Link>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Patents"
            value={company.total_patents}
            icon={FileText}
          />
          <KPICard
            title="YoY Growth"
            value={`${growthRate > 0 ? "+" : ""}${growthRate}%`}
            icon={TrendingUp}
            description={growthRate > 0 ? "Growing" : growthRate < 0 ? "Declining" : "Stable"}
          />
          <KPICard
            title="Filing Years"
            value={Object.keys(company.yearly).length}
            icon={Calendar}
            description="Active years"
          />
          <KPICard
            title="Jurisdictions"
            value={jurisdictions.length || "-"}
            icon={MapPin}
            description="Countries"
          />
        </div>

        {/* Data Unavailable Notice */}
        {dataUnavailable && patents.length === 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Detailed patent data not yet available</p>
                <p className="text-sm text-amber-600">
                  Patent statistics are available, but individual patent records have not been retrieved for this company.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filing Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--primary)]" />
              Patent Filing Timeline
            </CardTitle>
            <CardDescription>Year-over-year patent publications</CardDescription>
          </CardHeader>
          <CardContent>
            <YearTrendChart data={yearlyData} />
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Jurisdiction Distribution */}
          {jurisdictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--primary)]" />
                  Jurisdiction Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={jurisdictions.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {jurisdictions.slice(0, 6).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e4e4e7",
                        borderRadius: "8px",
                        color: "#1a1a1a",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Technology Fields */}
          {techFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
                  Technology Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={techFields.slice(0, 5)}
                    layout="vertical"
                    margin={{ left: 100, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis type="number" stroke="#71717a" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={10}
                      width={100}
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
                    <Bar dataKey="value" fill="#84cc16" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Inventors */}
        {topInventors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--primary)]" />
                Top Inventors
              </CardTitle>
              <CardDescription>Most prolific inventors at {company.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {topInventors.map(([name, count], idx) => (
                  <div
                    key={name}
                    className="flex flex-col items-center p-4 rounded-lg bg-[var(--secondary)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-bold">
                      {idx + 1}
                    </div>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)] text-center">
                      {name.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {count} patents
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Patents Table */}
        {patents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Patents</CardTitle>
              <CardDescription>
                Showing {Math.min(20, patents.length)} of {patents.length} patents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--secondary)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                        Patent ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[var(--muted-foreground)]">
                        Claims
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-[var(--muted-foreground)]">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {patents.slice(0, 20).map((patent) => (
                      <tr
                        key={patent.id}
                        className="bg-[var(--card)] hover:bg-[var(--secondary)] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-[var(--primary)]">
                          {patent.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)] max-w-md truncate">
                          {patent.title?.[0] || "Untitled"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {patent.publicationDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">
                          {patent.claimsCount || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={`https://patents.google.com/patent/${patent.publicationNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Query Info */}
        {company.note && (
          <div className="text-sm text-[var(--muted-foreground)] italic">
            Note: {company.note}
          </div>
        )}
      </div>
    </div>
  );
}
