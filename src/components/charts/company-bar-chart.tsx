"use client";

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
import { CompanyStats } from "@/lib/data";

interface CompanyBarChartProps {
  data: CompanyStats[];
  limit?: number;
}

export function CompanyBarChart({ data, limit = 15 }: CompanyBarChartProps) {
  const chartData = data.slice(0, limit).map((company) => ({
    name: company.name.length > 18 ? company.name.substring(0, 18) + "..." : company.name,
    fullName: company.name,
    patents: company.total_patents,
  }));

  // Dynamic height based on number of items
  const chartHeight = Math.max(300, limit * 28);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
        <XAxis type="number" stroke="#71717a" fontSize={12} />
        <YAxis
          type="category"
          dataKey="name"
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
          formatter={(value, _, props) => [
            `${value ?? 0} patents`,
            props.payload?.fullName ?? "",
          ]}
          labelFormatter={() => ""}
        />
        <Bar dataKey="patents" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#84cc16" : index < 3 ? "#22c55e" : "#a1a1aa"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
