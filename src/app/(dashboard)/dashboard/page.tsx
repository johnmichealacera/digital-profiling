import { prisma } from "@/lib/prisma"
import { computeAge } from "@/lib/utils"
import { CIVIL_STATUS_LABELS } from "@/lib/constants"
import { DashboardStatCards } from "@/components/dashboard/stat-cards"
import { AgeDistributionChart } from "@/components/dashboard/age-distribution-chart"
import { SexRatioChart } from "@/components/dashboard/sex-ratio-chart"
import { PurokPopulationChart } from "@/components/dashboard/purok-population-chart"
import { CivilStatusChart } from "@/components/dashboard/civil-status-chart"
import { DisasterPrepCharts } from "@/components/dashboard/disaster-prep-charts"

async function getDashboardData() {
  const [
    residents,
    households,
    puroks,
    pendingDocs,
    activeBlotters,
    disasterRiskCounts,
    evacuationCentersCount,
    missingCount,
    evacuatedProfiles,
    activeDisasterEvent,
  ] = await Promise.all([
    prisma.resident.findMany({
      where: { status: "ACTIVE" },
      select: {
        sex: true,
        dateOfBirth: true,
        civilStatus: true,
        isSeniorCitizen: true,
        isPwd: true,
        is4PsBeneficiary: true,
        isSoloParent: true,
        voterStatus: true,
        isOFW: true,
        householdId: true,
        household: { select: { purokId: true, purok: { select: { name: true } } } },
      },
    }),
    prisma.household.count(),
    prisma.purok.findMany({ orderBy: { order: "asc" } }),
    prisma.documentRequest.count({ where: { status: "PENDING" } }),
    prisma.blotter.count({
      where: { status: { in: ["FILED", "UNDER_MEDIATION"] } },
    }),
    prisma.householdDisasterProfile.groupBy({
      by: ["riskLevel"],
      _count: true,
    }),
    prisma.evacuationCenter.count({ where: { isActive: true } }),
    prisma.missingPersonReport.count({ where: { foundAt: null } }),
    prisma.householdDisasterProfile.findMany({
      where: { evacuatedAt: { not: null } },
      include: {
        household: { select: { _count: { select: { residents: true } } } },
      },
    }),
    prisma.disasterEvent.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
      select: { id: true, title: true, type: true },
    }),
  ])

  const maleCount = residents.filter((r) => r.sex === "MALE").length
  const femaleCount = residents.filter((r) => r.sex === "FEMALE").length

  // Age brackets
  const ageBrackets = [
    { bracket: "0-14", min: 0, max: 14 },
    { bracket: "15-30", min: 15, max: 30 },
    { bracket: "31-59", min: 31, max: 59 },
    { bracket: "60+", min: 60, max: 200 },
  ].map(({ bracket, min, max }) => {
    const inRange = residents.filter((r) => {
      const age = computeAge(r.dateOfBirth)
      return age >= min && age <= max
    })
    return {
      bracket,
      male: inRange.filter((r) => r.sex === "MALE").length,
      female: inRange.filter((r) => r.sex === "FEMALE").length,
    }
  })

  // Population by purok
  const populationByPurok = puroks.map((purok) => ({
    purok: purok.name,
    count: residents.filter((r) => r.household?.purokId === purok.id).length,
  }))

  // Civil status
  const civilStatusMap = new Map<string, number>()
  residents.forEach((r) => {
    const label = CIVIL_STATUS_LABELS[r.civilStatus] || r.civilStatus
    civilStatusMap.set(label, (civilStatusMap.get(label) || 0) + 1)
  })
  const civilStatusDistribution = Array.from(civilStatusMap.entries()).map(
    ([status, count]) => ({ status, count })
  )

  // Disaster prep: risk level distribution (order HIGH, MEDIUM, LOW, SAFE)
  const riskLevelOrder = ["HIGH", "MEDIUM", "LOW", "SAFE"] as const
  const riskLevelCountsMap = new Map(
    disasterRiskCounts.map((r) => [r.riskLevel, r._count])
  )
  const disasterRiskDistribution = riskLevelOrder.map((level) => ({
    level,
    count: riskLevelCountsMap.get(level) ?? 0,
  }))

  const totalEvacuated = evacuatedProfiles.reduce(
    (sum, p) => sum + p.household._count.residents,
    0
  )

  return {
    totalPopulation: residents.length,
    totalHouseholds: households,
    maleCount,
    femaleCount,
    seniorCitizenCount: residents.filter((r) => r.isSeniorCitizen).length,
    pwdCount: residents.filter((r) => r.isPwd).length,
    fourPsCount: residents.filter((r) => r.is4PsBeneficiary).length,
    soloParentCount: residents.filter((r) => r.isSoloParent).length,
    registeredVoters: residents.filter((r) => r.voterStatus).length,
    ofwCount: residents.filter((r) => r.isOFW).length,
    pendingDocuments: pendingDocs,
    activeBlotters,
    ageBrackets,
    populationByPurok,
    civilStatusDistribution,
    disasterRiskDistribution,
    totalEvacuated,
    evacuationCentersCount,
    missingCount,
    activeDisasterEvent: activeDisasterEvent
      ? {
          id: activeDisasterEvent.id,
          title: activeDisasterEvent.title,
          type: activeDisasterEvent.type,
        }
      : null,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Barangay Taruc digital profiling data
        </p>
      </div>

      <DashboardStatCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <AgeDistributionChart data={stats.ageBrackets} />
        <SexRatioChart male={stats.maleCount} female={stats.femaleCount} />
      </div>

      <DisasterPrepCharts
        riskDistribution={stats.disasterRiskDistribution}
        totalEvacuated={stats.totalEvacuated}
        missingCount={stats.missingCount}
        evacuationCentersCount={stats.evacuationCentersCount}
        activeEvent={stats.activeDisasterEvent}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <PurokPopulationChart data={stats.populationByPurok} />
        <CivilStatusChart data={stats.civilStatusDistribution} />
      </div>
    </div>
  )
}
