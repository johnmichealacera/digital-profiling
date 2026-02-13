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
import { Pie, PieChart, Cell } from "recharts"

const chartConfig = {
  male: {
    label: "Male",
    color: "hsl(221, 83%, 53%)",
  },
  female: {
    label: "Female",
    color: "hsl(330, 81%, 60%)",
  },
} satisfies ChartConfig

export function SexRatioChart({
  male,
  female,
}: {
  male: number
  female: number
}) {
  const data = [
    { name: "Male", value: male, fill: "var(--color-male)" },
    { name: "Female", value: female, fill: "var(--color-female)" },
  ]

  const total = male + female

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sex Distribution</CardTitle>
        <CardDescription>
          Male vs Female ratio ({total > 0 ? ((male / total) * 100).toFixed(1) : 0}% /{" "}
          {total > 0 ? ((female / total) * 100).toFixed(1) : 0}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[300px] w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
              label={({ name, value }) => `${name}: ${value}`}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
