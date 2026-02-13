"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  Home,
  UserCheck,
  Heart,
  Accessibility,
  HandCoins,
  FileText,
  AlertTriangle,
} from "lucide-react"

type Stats = {
  totalPopulation: number
  totalHouseholds: number
  maleCount: number
  femaleCount: number
  seniorCitizenCount: number
  pwdCount: number
  fourPsCount: number
  registeredVoters: number
  pendingDocuments: number
  activeBlotters: number
}

export function DashboardStatCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: "Total Population",
      value: stats.totalPopulation,
      description: `${stats.maleCount} Male / ${stats.femaleCount} Female`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Households",
      value: stats.totalHouseholds,
      description: "Registered households",
      icon: Home,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Registered Voters",
      value: stats.registeredVoters,
      description: `${stats.totalPopulation > 0 ? ((stats.registeredVoters / stats.totalPopulation) * 100).toFixed(1) : 0}% of population`,
      icon: UserCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Senior Citizens",
      value: stats.seniorCitizenCount,
      description: "60 years and above",
      icon: Heart,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "PWD",
      value: stats.pwdCount,
      description: "Persons with disability",
      icon: Accessibility,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "4Ps Beneficiaries",
      value: stats.fourPsCount,
      description: "Pantawid members",
      icon: HandCoins,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments,
      description: "Awaiting processing",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active Blotters",
      value: stats.activeBlotters,
      description: "Filed & under mediation",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
