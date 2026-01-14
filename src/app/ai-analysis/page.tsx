"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Brain, Building2, Percent, ChevronDown, ChevronRight, FileText } from "lucide-react";

interface AIPatent {
  patent_id: string;
  title: string;
  publication_date: string;
  ai_terms_found: string[];
  ai_term_count: number;
}

interface CompanyAIData {
  total_patents: number;
  ai_patent_count: number;
  ai_patents: AIPatent[];
}

interface AIAnalysisData {
  analysis_date: string;
  ai_terms_searched: string[];
  total_companies_analyzed: number;
  total_patents_analyzed: number;
  total_ai_patents_found: number;
  overall_ai_percentage: number;
  summary_by_company: {
    company: string;
    total_patents: number;
    ai_patent_count: number;
    ai_percentage: number;
  }[];
  detailed_results: Record<string, CompanyAIData>;
}

const COLORS = ["#84cc16", "#22c55e", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"];

export default function AIAnalysisPage() {
  const [data, setData] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/data/ai_patent_analysis.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load AI analysis data:", err);
        setLoading(false);
      });
  }, []);

  const companiesWithAI = useMemo(() => {
    if (!data) return [];
    return data.summary_by_company
      .filter((c) => c.ai_patent_count > 0)
      .sort((a, b) => b.ai_patent_count - a.ai_patent_count);
  }, [data]);

  const chartData = useMemo(() => {
    return companiesWithAI.map((company) => ({
      name: company.company.length > 15 ? company.company.slice(0, 15) + "..." : company.company,
      fullName: company.company,
      aiPatents: company.ai_patent_count,
      totalPatents: company.total_patents,
      aiPercentage: company.ai_percentage,
    }));
  }, [companiesWithAI]);

  const toggleExpanded = (company: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(company)) {
      newExpanded.delete(company);
    } else {
      newExpanded.add(company);
    }
    setExpandedCompanies(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading AI analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Failed to load AI analysis data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title="AI Patent Analysis"
        description="Analysis of AI/ML-related patents across the Breakthrough Energy portfolio"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <Brain className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {data.total_ai_patents_found}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">AI Patents Found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Building2 className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {companiesWithAI.length}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">Companies with AI Patents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Percent className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {data.overall_ai_percentage}%
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">Overall AI Percentage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <FileText className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {data.total_patents_analyzed.toLocaleString()}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">Total Patents Scanned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart - Companies by AI Patent Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[var(--primary)]" />
              Companies by AI Patent Count
            </CardTitle>
            <CardDescription>
              {companiesWithAI.length} companies have patents mentioning AI/ML terminology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="fullName"
                  stroke="#71717a"
                  fontSize={11}
                  width={120}
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
                  formatter={(value, name, props) => {
                    if (name === "aiPatents") {
                      const payload = props.payload;
                      return [
                        `${value} AI patents (${payload?.aiPercentage ?? 0}% of ${payload?.totalPatents ?? 0} total)`,
                        "AI Patents",
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="aiPatents" name="AI Patents" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Company Table with Expandable Patents */}
        <Card>
          <CardHeader>
            <CardTitle>AI Patent Details by Company</CardTitle>
            <CardDescription>
              Click on a company to view individual AI-related patents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companiesWithAI.map((company, idx) => {
                const isExpanded = expandedCompanies.has(company.company);
                const companyDetails = data.detailed_results[company.company];

                return (
                  <div key={company.company} className="border border-[var(--border)] rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleExpanded(company.company)}
                      className="w-full flex items-center justify-between p-4 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        >
                          {idx + 1}
                        </span>
                        <div className="text-left">
                          <p className="font-medium text-[var(--foreground)]">{company.company}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {company.ai_patent_count} AI patents / {company.total_patents} total ({company.ai_percentage}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--primary)]">
                          {company.ai_patent_count} patents
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && companyDetails && (
                      <div className="p-4 bg-[var(--card)] border-t border-[var(--border)]">
                        <div className="space-y-3">
                          {companyDetails.ai_patents.slice(0, 20).map((patent) => (
                            <div
                              key={patent.patent_id}
                              className="p-3 rounded-lg bg-[var(--secondary)]"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-[var(--foreground)]">
                                    {patent.title}
                                  </p>
                                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                    {patent.patent_id} | {patent.publication_date}
                                  </p>
                                </div>
                                <a
                                  href={`https://patents.google.com/patent/${patent.patent_id.replace(/-/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[var(--primary)] hover:underline whitespace-nowrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Patent
                                </a>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {patent.ai_terms_found.slice(0, 5).map((term) => (
                                  <span
                                    key={term}
                                    className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]"
                                  >
                                    {term}
                                  </span>
                                ))}
                                {patent.ai_terms_found.length > 5 && (
                                  <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                                    +{patent.ai_terms_found.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {companyDetails.ai_patents.length > 20 && (
                            <p className="text-sm text-center text-[var(--muted-foreground)]">
                              Showing 20 of {companyDetails.ai_patents.length} AI patents
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Terms Reference */}
        <Card>
          <CardHeader>
            <CardTitle>AI/ML Terms Searched</CardTitle>
            <CardDescription>
              {data.ai_terms_searched.length} terms used to identify AI-related patents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.ai_terms_searched.map((term) => (
                <span
                  key={term}
                  className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                >
                  {term}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Metadata */}
        <div className="text-center text-xs text-[var(--muted-foreground)]">
          Analysis performed on {new Date(data.analysis_date).toLocaleDateString()} |
          {data.total_companies_analyzed} companies analyzed |
          {data.total_patents_analyzed.toLocaleString()} patents scanned
        </div>
      </div>
    </div>
  );
}
