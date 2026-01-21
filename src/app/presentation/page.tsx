"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  PortfolioSummary,
  getYearlyTrends,
  getTechnologyDistribution,
  getTopCompanies,
} from "@/lib/data";
import {
  X,
  ChevronDown,
  ArrowRight,
  Zap,
  TrendingUp,
  Building2,
  Brain,
  Layers,
  Activity,
  Sparkles,
} from "lucide-react";

// AI Analysis types
interface AIAnalysisData {
  total_ai_patents_found: number;
  overall_ai_percentage: number;
  total_patents_analyzed: number;
  summary_by_company: {
    company: string;
    total_patents: number;
    ai_patent_count: number;
    ai_percentage: number;
  }[];
}

const CHART_COLORS = ["#84cc16", "#22c55e", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"];

// Slide configuration with insights
interface SlideConfig {
  id: string;
  title: string;
  subtitle?: string;
  insight: string;
  insightHighlight?: string;
  type: "intro" | "chart" | "kpi" | "gaps" | "recommendations" | "outro";
  icon?: React.ElementType;
}

const SLIDES: SlideConfig[] = [
  {
    id: "intro",
    title: "BEV Patent Portfolio",
    subtitle: "Strategic Intelligence Report",
    insight: "A comprehensive analysis of Breakthrough Energy Ventures' intellectual property landscape across 89 portfolio companies.",
    type: "intro",
    icon: Zap,
  },
  {
    id: "overview",
    title: "Portfolio at a Glance",
    subtitle: "Key Metrics",
    insight: "The BEV portfolio represents a significant IP moat in clean energy innovation.",
    insightHighlight: "7,847 patent families across 68 active companies",
    type: "kpi",
    icon: Sparkles,
  },
  {
    id: "trends",
    title: "Filing Momentum",
    subtitle: "2015 - 2026",
    insight: "Patent filings have accelerated dramatically, with 2024-2025 showing the highest activity in portfolio history.",
    insightHighlight: "Filing velocity has tripled since 2019",
    type: "chart",
    icon: TrendingUp,
  },
  {
    id: "technology",
    title: "Technology Focus",
    subtitle: "Sector Distribution",
    insight: "Energy Storage dominates the portfolio, reflecting BEV's thesis on electrification and grid modernization.",
    insightHighlight: "Energy Storage captures the largest share of IP investment",
    type: "chart",
    icon: Layers,
  },
  {
    id: "leaders",
    title: "Innovation Leaders",
    subtitle: "Top Patent Holders",
    insight: "IonQ, QuantumScape, and Form Energy lead with substantial portfolios, demonstrating deep technical moats in quantum computing and next-gen batteries.",
    insightHighlight: "Top 3 companies hold 23% of all portfolio patents",
    type: "chart",
    icon: Building2,
  },
  {
    id: "top5",
    title: "Competitive Dynamics",
    subtitle: "Top 5 Filing Patterns",
    insight: "Filing patterns reveal distinct IP strategies—some companies maintain steady output while others show explosive recent growth.",
    insightHighlight: "Form Energy's filings increased 6x from 2020 to 2025",
    type: "chart",
    icon: Activity,
  },
  {
    id: "growth",
    title: "Fastest Growing",
    subtitle: "Acceleration Leaders",
    insight: "Companies like Dioxycle and Redwood Materials show remarkable filing acceleration, signaling strategic IP build-out ahead of commercialization.",
    insightHighlight: "Dioxycle leads with +2800% 3-year growth",
    type: "chart",
    icon: TrendingUp,
  },
  {
    id: "ai-overview",
    title: "AI & Machine Learning",
    subtitle: "Embedded Intelligence",
    insight: "AI-related patents are strategically distributed across the portfolio, indicating integration of intelligent systems into clean energy technologies.",
    insightHighlight: "93 AI patents found across 11 companies",
    type: "kpi",
    icon: Brain,
  },
  {
    id: "ai-leaders",
    title: "AI Patent Leaders",
    subtitle: "Companies Leveraging AI",
    insight: "Sortera Alloys leads with 61% AI patent density, using machine learning for materials sorting—a competitive differentiator in recycling.",
    insightHighlight: "Sortera's AI focus is 5x higher than the next competitor",
    type: "chart",
    icon: Brain,
  },
  {
    id: "ip-gaps",
    title: "Strategic IP Gaps",
    subtitle: "Opportunities for Growth",
    insight: "21 portfolio companies (24%) have zero patents, representing significant untapped IP potential and competitive risk exposure.",
    insightHighlight: "Closing these gaps could add 100+ patent families to the portfolio",
    type: "gaps",
    icon: TrendingUp,
  },
  {
    id: "recommendations",
    title: "ipCG Recommendations",
    subtitle: "Strategic Action Plan",
    insight: "Proactive IP development is essential to protect BEV's investments and the groundbreaking innovations these companies are creating.",
    insightHighlight: "Without patent protection, competitors can patent similar innovations first",
    type: "recommendations",
    icon: Zap,
  },
  {
    id: "outro",
    title: "Strategic Insight",
    subtitle: "ipCapital Group Analysis",
    insight: "The BEV portfolio demonstrates sophisticated IP strategy with concentrated positions in transformative technologies and emerging AI integration.",
    insightHighlight: "This analysis powered by Frix.ai patent intelligence",
    type: "outro",
    icon: Zap,
  },
];

export default function PresentationPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioSummary | null>(null);
  const [aiData, setAiData] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/data/portfolio_summary.json").then((r) => r.json()),
      fetch("/data/ai_patent_analysis.json").then((r) => r.json()),
    ])
      .then(([portfolio, ai]) => {
        setPortfolioData(portfolio);
        setAiData(ai);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  // Computed data
  const yearlyTrends = useMemo(() => {
    if (!portfolioData) return [];
    return getYearlyTrends(portfolioData.companies);
  }, [portfolioData]);

  const technologyDistribution = useMemo(() => {
    if (!portfolioData) return [];
    return getTechnologyDistribution(portfolioData.companies);
  }, [portfolioData]);

  const topCompanies = useMemo(() => {
    if (!portfolioData) return [];
    return getTopCompanies(portfolioData.companies, 10);
  }, [portfolioData]);

  const top5Companies = useMemo(() => {
    if (!portfolioData) return [];
    return getTopCompanies(portfolioData.companies, 5);
  }, [portfolioData]);

  const topCompanyTrends = useMemo(() => {
    if (!portfolioData) return [];
    const top5 = getTopCompanies(portfolioData.companies, 5);
    const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
    return years.map((year) => {
      const entry: Record<string, number | string> = { year };
      top5.forEach((company) => {
        entry[company.name] = company.yearly[year] || 0;
      });
      return entry;
    });
  }, [portfolioData]);

  const growthLeaders = useMemo(() => {
    if (!portfolioData) return [];
    return portfolioData.companies
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
      .slice(0, 8);
  }, [portfolioData]);

  const aiCompanies = useMemo(() => {
    if (!aiData) return [];
    return aiData.summary_by_company
      .filter((c) => c.ai_patent_count > 0)
      .sort((a, b) => b.ai_patent_count - a.ai_patent_count);
  }, [aiData]);

  // Zero patent companies (excluding generic name exclusions)
  const zeroPatentCompanies = useMemo(() => {
    if (!portfolioData) return [];
    return portfolioData.companies
      .filter((c) => c.total_patents === 0 && !c.note?.includes("Excluded"))
      .map((c) => c.name);
  }, [portfolioData]);

  // Companies with declining filing trends
  const decliningCompanies = useMemo(() => {
    if (!portfolioData) return [];
    return portfolioData.companies
      .filter((c) => c.total_patents >= 50)
      .map((company) => {
        const y2025 = company.yearly["2025"] || 0;
        const y2024 = company.yearly["2024"] || 0;
        const y2023 = company.yearly["2023"] || 0;
        const recent = y2025;
        const prior = (y2024 + y2023) / 2;
        const trend = prior > 0 ? ((recent - prior) / prior) * 100 : 0;
        return { name: company.name, trend: Math.round(trend), recent: y2025, prior: Math.round(prior) };
      })
      .filter((c) => c.trend < -20)
      .sort((a, b) => a.trend - b.trend)
      .slice(0, 5);
  }, [portfolioData]);

  // Underrepresented tech sectors (fewer patents than average)
  const underrepresentedSectors = useMemo(() => {
    if (technologyDistribution.length === 0) return [];
    const avgPatents = technologyDistribution.reduce((sum, t) => sum + t.value, 0) / technologyDistribution.length;
    return technologyDistribution
      .filter((t) => t.value < avgPatents * 0.5)
      .sort((a, b) => a.value - b.value);
  }, [technologyDistribution]);

  // Calculate YoY growth
  const yoyGrowth = useMemo(() => {
    const year2025 = yearlyTrends.find((y) => y.year === "2025")?.patents || 0;
    const year2024 = yearlyTrends.find((y) => y.year === "2024")?.patents || 0;
    if (year2024 === 0) return 0;
    return Math.round(((year2025 - year2024) / year2024) * 100);
  }, [yearlyTrends]);

  // Navigate slides
  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    setIsAnimating((animating) => {
      if (animating) return animating;
      setCurrentSlide((current) => {
        if (index === current) return current;
        setTimeout(() => setIsAnimating(false), 600);
        return index;
      });
      return true;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((current) => {
          if (current < SLIDES.length - 1) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 600);
            return current + 1;
          }
          return current;
        });
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((current) => {
          if (current > 0) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 600);
            return current - 1;
          }
          return current;
        });
      } else if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Scroll navigation
  useEffect(() => {
    if (loading) return; // Wait until content is loaded

    let lastScrollTime = 0;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime < 800) return; // Debounce
      lastScrollTime = now;
      if (e.deltaY > 0) {
        setCurrentSlide((current) => {
          if (current < SLIDES.length - 1) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 600);
            return current + 1;
          }
          return current;
        });
      } else {
        setCurrentSlide((current) => {
          if (current > 0) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 600);
            return current - 1;
          }
          return current;
        });
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-lime-500/20" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-t-lime-500 animate-spin" />
          </div>
          <p className="text-lime-500/60 text-sm tracking-[0.3em] uppercase">Loading Presentation</p>
        </div>
      </div>
    );
  }

  const slide = SLIDES[currentSlide];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, #84cc16 0%, transparent 50%)",
            transform: `translate(${currentSlide * 5}%, ${currentSlide * 3}%)`,
            transition: "transform 1.5s ease-out",
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-[0.02]"
          style={{
            background: "radial-gradient(circle, #22c55e 0%, transparent 50%)",
            transform: `translate(${-currentSlide * 3}%, ${-currentSlide * 5}%)`,
            transition: "transform 1.5s ease-out",
          }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
      >
        <X className="h-5 w-5 text-white/40 group-hover:text-white/80 transition-colors" />
      </button>

      {/* Progress indicator */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
        <span className="text-white/30 text-xs tracking-[0.2em] uppercase font-medium">
          {String(currentSlide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentSlide
                  ? "w-8 bg-lime-500"
                  : i < currentSlide
                  ? "w-2 bg-lime-500/40"
                  : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide content */}
      <div className="relative h-full flex items-center justify-center px-16 py-16">
        <div
          key={slide.id}
          className="w-full max-w-6xl animate-slideIn mt-12"
          style={{
            animation: "slideIn 0.6s ease-out",
          }}
        >
          {/* Intro slide */}
          {slide.type === "intro" && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-8 p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20">
                <Zap className="h-12 w-12 text-lime-500" />
              </div>
              <h1 className="text-6xl md:text-7xl font-light text-white tracking-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-2xl text-lime-500 font-light tracking-wide mb-12">
                {slide.subtitle}
              </p>
              <p className="text-xl text-white/50 max-w-2xl leading-relaxed mb-12">
                {slide.insight}
              </p>

              {/* Prepared by section */}
              <div className="flex flex-col items-center gap-3 mb-12">
                <p className="text-sm text-white/40 tracking-wide">Prepared by</p>
                <img
                  src="/ipcg-logo.png"
                  alt="ipCapital Group - Strategy Advisors"
                  className="h-12 w-auto"
                />
                <p className="text-sm text-white/40">for <span className="text-white/60 font-medium">Mary Haas</span></p>
              </div>

              <div className="flex items-center gap-2 text-white/30 animate-bounce">
                <span className="text-sm tracking-wide">Scroll to explore</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* KPI Overview slide */}
          {slide.id === "overview" && portfolioData && (
            <div className="space-y-12">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-6">
                  {slide.icon && <slide.icon className="h-4 w-4 text-lime-500" />}
                  <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Patent Families", value: portfolioData.portfolio_totals.total_patent_families.toLocaleString() },
                  { label: "Companies", value: portfolioData.metadata.companies_with_patents },
                  { label: "YoY Growth", value: `${yoyGrowth > 0 ? "+" : ""}${yoyGrowth}%` },
                  { label: "Tech Sectors", value: technologyDistribution.length },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <p className="text-4xl md:text-5xl font-light text-white mb-2">{item.value}</p>
                    <p className="text-white/40 text-sm tracking-wide">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Trends chart slide */}
          {slide.id === "trends" && (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-4">
                    <TrendingUp className="h-4 w-4 text-lime-500" />
                    <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={yearlyTrends}>
                    <defs>
                      <linearGradient id="gradientTrends" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="year" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #ffffff20",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="patents"
                      stroke="#84cc16"
                      strokeWidth={3}
                      fill="url(#gradientTrends)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Technology distribution */}
          {slide.id === "technology" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-4">
                  <Layers className="h-4 w-4 text-lime-500" />
                  <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={technologyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      innerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {technologyDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #ffffff20",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(value, name) => [`${value} patents`, name]}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ color: "#ffffff80", fontSize: "14px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Top companies */}
          {slide.id === "leaders" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-4">
                  <Building2 className="h-4 w-4 text-lime-500" />
                  <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={topCompanies.map((c) => ({
                      name: c.name.length > 16 ? c.name.slice(0, 16) + "..." : c.name,
                      fullName: c.name,
                      patents: c.total_patents,
                    }))}
                    layout="vertical"
                    margin={{ left: 120, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                    <XAxis type="number" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#ffffff60"
                      fontSize={12}
                      width={120}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #ffffff20",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(value, _, props) => [`${value} patents`, props.payload?.fullName || ""]}
                      labelFormatter={() => ""}
                    />
                    <Bar dataKey="patents" radius={[0, 6, 6, 0]}>
                      {topCompanies.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#84cc16" : index < 3 ? "#22c55e" : "#ffffff20"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Top 5 comparison */}
          {slide.id === "top5" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-4">
                  <Activity className="h-4 w-4 text-lime-500" />
                  <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={topCompanyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="year" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #ffffff20",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ color: "#ffffff80" }} />
                    {top5Companies.map((company, idx) => (
                      <Line
                        key={company.name}
                        type="monotone"
                        dataKey={company.name}
                        stroke={CHART_COLORS[idx]}
                        strokeWidth={3}
                        dot={{ r: 4, fill: CHART_COLORS[idx] }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Growth leaders */}
          {slide.id === "growth" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-4">
                  <TrendingUp className="h-4 w-4 text-lime-500" />
                  <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {growthLeaders.map((company, idx) => (
                  <div
                    key={company.name}
                    className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-500/20 text-xs font-bold text-lime-500">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-1 truncate">{company.name}</p>
                    <p className="text-white/40 text-sm mb-3">{company.total} patents</p>
                    <p className={`text-2xl font-light ${company.growthRate > 0 ? "text-lime-400" : "text-red-400"}`}>
                      {company.growthRate > 0 ? "+" : ""}{company.growthRate}%
                    </p>
                    <p className="text-white/30 text-xs">3-year growth</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* AI Overview */}
          {slide.id === "ai-overview" && aiData && (
            <div className="space-y-12">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mt-6">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "AI Patents Found", value: aiData.total_ai_patents_found, color: "purple" },
                  { label: "Companies with AI", value: aiCompanies.length, color: "cyan" },
                  { label: "AI Percentage", value: `${aiData.overall_ai_percentage}%`, color: "purple" },
                  { label: "Patents Scanned", value: aiData.total_patents_analyzed.toLocaleString(), color: "lime" },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center"
                  >
                    <p className={`text-4xl md:text-5xl font-light mb-2 ${
                      item.color === "purple" ? "text-purple-400" :
                      item.color === "cyan" ? "text-cyan-400" : "text-lime-400"
                    }`}>
                      {item.value}
                    </p>
                    <p className="text-white/40 text-sm tracking-wide">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 via-transparent to-transparent border-l-2 border-purple-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-purple-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* AI Leaders */}
          {slide.id === "ai-leaders" && aiData && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mt-4">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={aiCompanies.map((c) => ({
                      name: c.company,
                      aiPatents: c.ai_patent_count,
                      aiPercentage: c.ai_percentage,
                    }))}
                    layout="vertical"
                    margin={{ left: 140, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                    <XAxis type="number" stroke="#ffffff30" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#ffffff60"
                      fontSize={12}
                      width={140}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #ffffff20",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(value, _, props) => [
                        `${value} AI patents (${props.payload?.aiPercentage}% of portfolio)`,
                        props.payload?.name,
                      ]}
                    />
                    <Bar dataKey="aiPatents" radius={[0, 6, 6, 0]}>
                      {aiCompanies.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#a855f7" : index < 3 ? "#8b5cf6" : "#6366f1"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 via-transparent to-transparent border-l-2 border-purple-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-purple-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* IP Gaps slide */}
          {slide.id === "ip-gaps" && portfolioData && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mt-4">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zero Patent Companies */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 text-lg font-bold">{zeroPatentCompanies.length}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Companies Without Patents</h3>
                      <p className="text-white/40 text-sm">Critical IP exposure</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {zeroPatentCompanies.map((name) => (
                      <span key={name} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact Projection */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-lime-500/20 flex items-center justify-center">
                      <span className="text-lime-400 text-lg font-bold">+{zeroPatentCompanies.length * 5}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Potential Portfolio Growth</h3>
                      <p className="text-white/40 text-sm">If each company files 5 patents in 2026</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Current Portfolio</span>
                      <span className="text-white">{portfolioData.portfolio_totals.total_patent_families.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Projected Addition</span>
                      <span className="text-lime-400">+{zeroPatentCompanies.length * 5}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/10">
                      <span className="text-white/60">New Total</span>
                      <span className="text-white">{(portfolioData.portfolio_totals.total_patent_families + zeroPatentCompanies.length * 5).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Opportunity */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">AI Integration Opportunity</h3>
                      <p className="text-white/40 text-sm">Only {aiData?.overall_ai_percentage || 1.2}% AI coverage</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    Most portfolio companies could integrate AI/ML into their innovations.
                    Companies like IonQ, Sortera, and QuantumScape lead the way—others should follow.
                  </p>
                </div>

                {/* Declining Filers */}
                {decliningCompanies.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Declining Filing Momentum</h3>
                        <p className="text-white/40 text-sm">Companies slowing down</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {decliningCompanies.slice(0, 3).map((company) => (
                        <div key={company.name} className="flex justify-between items-center text-sm">
                          <span className="text-white/70 truncate">{company.name}</span>
                          <span className="text-amber-400">{company.trend}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent border-l-2 border-amber-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-amber-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations slide */}
          {slide.id === "recommendations" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{slide.title}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mt-4">
                  <Zap className="h-4 w-4 text-lime-500" />
                  <span className="text-lime-500 text-sm tracking-wide">{slide.subtitle}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recommendation 1 */}
                <div className="bg-gradient-to-br from-lime-500/10 to-transparent border border-lime-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-500 text-black font-bold text-sm">1</span>
                    <h3 className="text-white font-medium">Launch IP Programs</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    Initiate patent filing programs for the {zeroPatentCompanies.length} companies with zero patents.
                    Priority targets:
                  </p>
                  <ul className="space-y-1">
                    {["Pachama", "Mangrove Lithium", "H2Site", "44.01"].map((name) => (
                      <li key={name} className="text-lime-400 text-sm flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation 2 */}
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-sm">2</span>
                    <h3 className="text-white font-medium">Accelerate AI Filings</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    Expand AI/ML patent coverage from {aiData?.overall_ai_percentage || 1.2}% to 5%+.
                    Focus areas:
                  </p>
                  <ul className="space-y-1">
                    {["Predictive maintenance", "Process optimization", "Autonomous systems", "Data analytics"].map((area) => (
                      <li key={area} className="text-purple-400 text-sm flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation 3 */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-black font-bold text-sm">3</span>
                    <h3 className="text-white font-medium">Dominate Hot Sectors</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    Double down on high-growth areas to build insurmountable IP moats:
                  </p>
                  <ul className="space-y-1">
                    {["Hydrogen production", "Carbon capture", "Grid-scale storage", "Fusion energy"].map((sector) => (
                      <li key={sector} className="text-cyan-400 text-sm flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {sector}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Warning */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-red-400 font-medium mb-2">Risk of Inaction</h3>
                    <p className="text-white/60 text-sm">
                      Without patent protection, BEV's investments face significant risks: competitors can file first,
                      creating freedom-to-operate issues; company valuations suffer without IP moats; and the groundbreaking
                      innovations these companies create may not be defensible in the market.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-lime-500/10 via-transparent to-transparent border-l-2 border-lime-500 p-6 rounded-r-xl">
                <p className="text-white/70 text-lg">
                  {slide.insightHighlight && (
                    <span className="text-lime-400 font-medium">{slide.insightHighlight}. </span>
                  )}
                  {slide.insight}
                </p>
              </div>
            </div>
          )}

          {/* Outro slide */}
          {slide.type === "outro" && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-8 p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20">
                <Zap className="h-12 w-12 text-lime-500" />
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-xl text-white/50 max-w-2xl leading-relaxed mb-8">
                {slide.insight}
              </p>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-lime-500/10 border border-lime-500/20 mb-12">
                <span className="text-lime-400 text-sm">{slide.insightHighlight}</span>
              </div>

              <div className="flex flex-col items-center gap-6 mt-8">
                <img
                  src="/ipcg-logo.png"
                  alt="ipCapital Group - Strategy Advisors"
                  className="h-16 w-auto"
                />
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-black font-medium transition-colors"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide navigation arrows */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2">
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="h-5 w-5 text-white/60 rotate-90" />
        </button>
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={currentSlide === SLIDES.length - 1}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="h-5 w-5 text-white/60 -rotate-90" />
        </button>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
