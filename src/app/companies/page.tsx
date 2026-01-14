"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyTable } from "@/components/company-table";
import { PortfolioSummary } from "@/lib/data";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading companies...</p>
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

  const companiesWithPatents = data.companies.filter((c) => c.total_patents > 0);
  const companiesWithoutPatents = data.companies.filter((c) => c.total_patents === 0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header
        title="Portfolio Companies"
        description={`${companiesWithPatents.length} companies with patents in the BEV portfolio`}
      />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-sm text-[var(--muted-foreground)]">Total Companies</p>
            <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {data.metadata.total_companies_searched}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-sm text-[var(--muted-foreground)]">With Patents</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {companiesWithPatents.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="text-sm text-[var(--muted-foreground)]">Without Patents</p>
            <p className="mt-2 text-3xl font-bold text-[var(--muted-foreground)]">
              {companiesWithoutPatents.length}
            </p>
          </div>
        </div>

        {/* Companies with Patents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--primary)]" />
              Companies with Patents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyTable companies={data.companies} />
          </CardContent>
        </Card>

        {/* Companies without Patents */}
        {companiesWithoutPatents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Companies Without Patents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {companiesWithoutPatents.map((company) => (
                  <span
                    key={company.name}
                    className="rounded-full bg-[var(--secondary)] px-3 py-1 text-sm text-[var(--muted-foreground)]"
                  >
                    {company.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                These companies may be early-stage, have patents under different entity names,
                or focus on non-patentable innovations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
