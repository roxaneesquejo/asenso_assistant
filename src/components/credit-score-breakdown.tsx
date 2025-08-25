
'use client';

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils";

type BreakdownItem = {
  factor: string;
  points: number;
};

type CreditScoreBreakdownProps = {
  breakdown: BreakdownItem[];
};

export function CreditScoreBreakdown({ breakdown }: CreditScoreBreakdownProps) {
  const chartData = breakdown.map(item => ({
    name: item.factor,
    value: item.points,
  }));

  const chartConfig = {
    value: {
      label: "Points",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Score Breakdown</CardTitle>
        <CardDescription>
          An analysis of the factors contributing to the applicant's credit score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 20)}
              className="text-sm"
              width={120}
            />
            <XAxis dataKey="value" type="number" hide />
            <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="value" layout="vertical" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          This chart visualizes the points assigned to each credit scoring factor.
        </div>
        <div className="leading-none text-muted-foreground">
          Higher points indicate a more positive impact on the overall score.
        </div>
      </CardFooter>
    </Card>
  )
}
