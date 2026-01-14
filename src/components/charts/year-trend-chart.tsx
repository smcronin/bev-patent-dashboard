"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface YearTrendData {
  year: string;
  patents: number;
}

interface YearTrendChartProps {
  data: YearTrendData[];
}

export function YearTrendChart({ data }: YearTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPatents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="year"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            color: "#1a1a1a",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ color: "#71717a" }}
        />
        <Area
          type="monotone"
          dataKey="patents"
          stroke="#84cc16"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPatents)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
