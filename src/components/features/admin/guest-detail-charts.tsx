"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Clock } from "lucide-react";

export interface GuestDailyChartItem {
  date: string; // MM-DD
  visitCount: number;
  stayMinutes: number;
}

interface GuestDetailChartsProps {
  data: GuestDailyChartItem[];
}

export function GuestDetailCharts({ data }: GuestDetailChartsProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            日次訪問回数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              visits: { label: "訪問回数", color: "hsl(var(--chart-1))" },
            }}
            className="h-64"
          >
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                width={30}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="visitCount"
                fill="var(--color-visits)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            日次滞在時間
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              stay: { label: "滞在分", color: "hsl(var(--chart-2))" },
            }}
            className="h-64"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="stayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-stay)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-stay)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                width={30}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="stayMinutes"
                stroke="var(--color-stay)"
                fillOpacity={1}
                fill="url(#stayGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
