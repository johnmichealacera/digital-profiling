"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(330, 81%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(12, 76%, 61%)",
]

type CivilStatusData = { status: string; count: number }

export function CivilStatusChart({ data }: { data: CivilStatusData[] }) {
  const chartData = data.map((item, i) => ({
    ...item,
    fill: COLORS[i % COLORS.length],
  }))

  const chartConfig = data.reduce(
    (acc, item, i) => ({
      ...acc,
      [item.status]: {
        label: item.status,
        color: COLORS[i % COLORS.length],
      },
    }),
    { count: { label: "Count" } } as ChartConfig
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Civil Status Distribution</CardTitle>
        <CardDescription>Breakdown by civil status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[300px] w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ status, count }) => `${status}: ${count}`}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
