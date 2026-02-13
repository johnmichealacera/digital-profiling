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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

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

type AgeData = { bracket: string; male: number; female: number }

export function AgeDistributionChart({ data }: { data: AgeData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Age Distribution</CardTitle>
        <CardDescription>Population by age bracket and sex</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bracket" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="male" fill="var(--color-male)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="female" fill="var(--color-female)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
