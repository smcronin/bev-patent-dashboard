export interface CompanyStats {
  name: string;
  total_patents: number;
  search_query: string;
  yearly: Record<string, number>;
  note?: string;
}

export interface PortfolioSummary {
  metadata: {
    generated: string;
    source: string;
    query_period: string;
    total_companies_searched: number;
    companies_with_patents: number;
    companies_without_patents: number;
  };
  portfolio_totals: {
    total_patent_families: number;
    note?: string;
  };
  companies: CompanyStats[];
}

export interface Patent {
  id: string;
  title: string[];
  abstract: string;
  publicationNumber: string;
  publicationDate: string;
  assignee: string[];
  inventors: string[];
  applicationDate: string;
  claimsCount: number;
  independentClaimsCount: number;
  technologyFields: string[];
  score: number;
}

export interface SearchResults {
  count: number;
  numFound: number;
  docs: Patent[];
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await fetch("/data/portfolio_summary.json");
  return res.json();
}

export function getYearlyTrends(companies: CompanyStats[]): { year: string; patents: number }[] {
  const yearlyTotals: Record<string, number> = {};

  companies.forEach((company) => {
    Object.entries(company.yearly).forEach(([year, count]) => {
      yearlyTotals[year] = (yearlyTotals[year] || 0) + count;
    });
  });

  return Object.entries(yearlyTotals)
    .map(([year, patents]) => ({ year, patents }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

export function getTechnologyDistribution(companies: CompanyStats[]): { name: string; value: number }[] {
  // Group companies by technology sector (simplified categorization)
  const categories: Record<string, number> = {
    "Energy Storage": 0,
    "Clean Electricity": 0,
    "Carbon Capture": 0,
    "Sustainable Materials": 0,
    "Agriculture & Food": 0,
    "Transportation": 0,
    "Computing & Other": 0,
  };

  const categoryMapping: Record<string, string> = {
    // Energy Storage
    "QuantumScape": "Energy Storage",
    "Form Energy": "Energy Storage",
    "ESS Inc": "Energy Storage",
    "Malta Inc": "Energy Storage",
    "Our Next Energy": "Energy Storage",
    "Antora Energy": "Energy Storage",
    "Rondo Energy": "Energy Storage",
    "Fourth Power": "Energy Storage",
    "Quidnet Energy": "Energy Storage",

    // Clean Electricity
    "CubicPV": "Clean Electricity",
    "Commonwealth Fusion Systems": "Clean Electricity",
    "Fervo Energy": "Clean Electricity",
    "Dandelion Geothermal": "Clean Electricity",
    "Zap Energy": "Clean Electricity",
    "Natel Energy": "Clean Electricity",
    "Reactive Technologies": "Clean Electricity",
    "TS Conductor": "Clean Electricity",
    "VEIR": "Clean Electricity",
    "Terabase Energy": "Clean Electricity",
    "Planted Solar": "Clean Electricity",
    "1366 Technologies": "Clean Electricity",

    // Carbon Capture
    "CarbonCure Technologies": "Carbon Capture",
    "Solidia Technologies": "Carbon Capture",
    "Heirloom Carbon Technologies": "Carbon Capture",
    "Verdox": "Carbon Capture",
    "Sustaera": "Carbon Capture",
    "Terra CO2 Technologies": "Carbon Capture",
    "Mission Zero": "Carbon Capture",
    "Dioxycle": "Carbon Capture",

    // Sustainable Materials
    "Boston Metal": "Sustainable Materials",
    "Brimstone": "Sustainable Materials",
    "Sublime Systems": "Sustainable Materials",
    "Ecocem Ireland": "Sustainable Materials",
    "Redwood Materials": "Sustainable Materials",
    "Sortera Alloys": "Sustainable Materials",
    "Lilac Solutions": "Sustainable Materials",
    "Electra": "Sustainable Materials",
    "Circ": "Sustainable Materials",
    "LuxWall": "Sustainable Materials",
    "Niron Magnetics": "Sustainable Materials",
    "enVerid Systems": "Sustainable Materials",

    // Agriculture & Food
    "Pivot Bio": "Agriculture & Food",
    "Nature's Fynd": "Agriculture & Food",
    "Biomilq": "Agriculture & Food",
    "C16 Biosciences": "Agriculture & Food",
    "Motif FoodWorks": "Agriculture & Food",
    "Nobell Foods": "Agriculture & Food",
    "Rumin8": "Agriculture & Food",
    "ArkeaBio": "Agriculture & Food",
    "Iron Ox": "Agriculture & Food",
    "Prolific Machines": "Agriculture & Food",
    "Windfall Bio": "Agriculture & Food",
    "Savor": "Agriculture & Food",
    "Bloom Biorenewables": "Agriculture & Food",

    // Transportation
    "ZeroAvia": "Transportation",
    "Heart Aerospace": "Transportation",
    "Turntide Technologies": "Transportation",
    "ClearFlame Engine Technologies": "Transportation",
    "Stoke Space Technologies": "Transportation",
    "Electric Hydrogen": "Transportation",
    "H2Pro": "Transportation",

    // Computing & Other
    "IonQ": "Computing & Other",
    "KoBold Metals": "Computing & Other",
    "SOURCE": "Computing & Other",
    "Blue Frontier": "Computing & Other",
    "Weave Grid": "Computing & Other",
    "Yard Stick": "Computing & Other",
  };

  companies.forEach((company) => {
    const category = categoryMapping[company.name] || "Computing & Other";
    categories[category] += company.total_patents;
  });

  return Object.entries(categories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTopCompanies(companies: CompanyStats[], limit: number = 15): CompanyStats[] {
  return [...companies]
    .filter((c) => c.total_patents > 0)
    .sort((a, b) => b.total_patents - a.total_patents)
    .slice(0, limit);
}

export function getCompanyByName(companies: CompanyStats[], name: string): CompanyStats | undefined {
  return companies.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() ||
           c.name.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-") === name.toLowerCase()
  );
}

export function calculateGrowthRate(yearly: Record<string, number>): number {
  const years = Object.keys(yearly).sort();
  if (years.length < 2) return 0;

  const recentYear = years[years.length - 1];
  const previousYear = years[years.length - 2];

  const recent = yearly[recentYear] || 0;
  const previous = yearly[previousYear] || 0;

  if (previous === 0) return 0;
  return Math.round(((recent - previous) / previous) * 100);
}

export function getJurisdictionDistribution(patents: Patent[]): { name: string; value: number }[] {
  const jurisdictions: Record<string, number> = {};

  patents.forEach((patent) => {
    const jurisdiction = patent.id.split("-")[0];
    jurisdictions[jurisdiction] = (jurisdictions[jurisdiction] || 0) + 1;
  });

  return Object.entries(jurisdictions)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTechnologyFields(patents: Patent[]): { name: string; value: number }[] {
  const fields: Record<string, number> = {};

  patents.forEach((patent) => {
    patent.technologyFields?.forEach((field) => {
      fields[field] = (fields[field] || 0) + 1;
    });
  });

  return Object.entries(fields)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
