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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

const riskLevelConfig = {
  count: {
    label: "Households",
    color: "hsl(38, 92%, 50%)",
  },
  HIGH: { label: "High", color: "hsl(0, 84%, 60%)" },
  MEDIUM: { label: "Medium", color: "hsl(38, 92%, 50%)" },
  LOW: { label: "Low", color: "hsl(142, 76%, 36%)" },
  SAFE: { label: "Safe", color: "hsl(221, 83%, 53%)" },
} satisfies ChartConfig

const summaryConfig = {
  count: {
    label: "Count",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig

type RiskLevelData = { level: string; count: number }

type ActiveEvent = { id: string; title: string; type: string | null } | null

type DisasterPrepChartsProps = {
  riskDistribution: RiskLevelData[]
  totalEvacuated: number
  missingCount: number
  evacuationCentersCount: number
  activeEvent?: ActiveEvent
}

export function DisasterPrepCharts({
  riskDistribution,
  totalEvacuated,
  missingCount,
  evacuationCentersCount,
  activeEvent,
}: DisasterPrepChartsProps) {
  const summaryData = [
    { name: "Evacuated", count: totalEvacuated },
    { name: "Missing", count: missingCount },
    { name: "Evac centers", count: evacuationCentersCount },
  ]

  const activeEventLabel = activeEvent
    ? `${activeEvent.title}${activeEvent.type ? ` (${activeEvent.type})` : ""}`
    : null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Household Risk Levels</CardTitle>
          <CardDescription>
            Disaster preparedness profiles by risk level
            {activeEventLabel && (
              <span className="mt-1 block font-medium text-foreground">
                Active event: {activeEventLabel}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={riskLevelConfig} className="h-[300px] w-full">
            <BarChart data={riskDistribution} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="level" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evacuation & Missing Overview</CardTitle>
          <CardDescription>
            Current evacuees, missing persons, and active evacuation centers
            {activeEventLabel && (
              <span className="mt-1 block font-medium text-foreground">
                Active event: {activeEventLabel}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={summaryConfig} className="h-[300px] w-full">
            <BarChart data={summaryData} accessibilityLayer layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
