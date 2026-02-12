"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartDataYear = [
  { label: "Jan", views: 186, leads: 80 },
  { label: "Feb", views: 305, leads: 200 },
  { label: "Mar", views: 237, leads: 120 },
  { label: "Apr", views: 73, leads: 190 },
  { label: "May", views: 209, leads: 130 },
  { label: "Jun", views: 214, leads: 140 },
  { label: "Jul", views: 350, leads: 250 },
  { label: "Aug", views: 400, leads: 310 },
  { label: "Sep", views: 300, leads: 220 },
  { label: "Oct", views: 200, leads: 110 },
  { label: "Nov", views: 300, leads: 260 },
  { label: "Dec", views: 400, leads: 320 },
];

const chartDataMonth = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  views: Math.floor(Math.random() * 50) + 10,
  leads: Math.floor(Math.random() * 20) + 5,
}));

const chartConfig = {
  views: {
    label: "Page Views",
    color: "var(--color-red)",
  },
  leads: {
    label: "Contact Leads",
    color: "var(--color-black)",
  },
} satisfies ChartConfig;

const ChartLine = () => {
  const [timeRange, setTimeRange] = useState<"month" | "year">("year");

  const data = timeRange === "year" ? chartDataYear : chartDataMonth;

  return (
    <Card className="rounded-2xl shadow-sm border cs-outline-gray">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="cs-typography text-xl!">
            Performance Overview
          </CardTitle>
          <CardDescription className="cs-paragraph-gray text-base!">
            {timeRange === "year"
              ? "Comparing Views vs Leads (Jan - Dec)"
              : "Daily Performance (Last 30 Days)"}
          </CardDescription>
        </div>
        <div className="flex cs-bg-gray p-1 rounded-lg bg-opacity-10 bg-gray-100">
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              timeRange === "month"
                ? "bg-white shadow-sm main-color-red"
                : "text-white hover:text-black"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              timeRange === "year"
                ? "bg-white shadow-sm main-color-red"
                : "text-white hover:text-black"
            }`}
          >
            Year
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-red)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-red)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-black)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-black)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--color-gray)" // used gray variable
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--color-gray)", fontSize: 12 }}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="leads"
              type="monotone"
              fill="url(#fillLeads)"
              fillOpacity={0.4}
              stroke="var(--color-black)"
              strokeWidth={2}
              name="Contact Leads"
            />
            <Area
              dataKey="views"
              type="monotone"
              fill="url(#fillViews)"
              fillOpacity={0.4}
              stroke="var(--color-red)"
              strokeWidth={2}
              name="Page Views"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ChartLine;
