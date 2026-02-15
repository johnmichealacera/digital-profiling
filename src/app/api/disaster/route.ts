import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [profiles, evacuationCentersRaw, riskCounts, missingCount] = await Promise.all([
    prisma.householdDisasterProfile.findMany({
      include: {
        household: {
          select: {
            id: true,
            houseNo: true,
            purok: { select: { name: true } },
            _count: { select: { residents: true } },
          },
        },
        evacuationCenterRef: { select: { id: true, name: true } },
      },
      orderBy: { riskLevel: "asc" },
    }),
    prisma.evacuationCenter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        evacuatedProfiles: {
          where: { evacuatedAt: { not: null } },
          include: {
            household: { select: { _count: { select: { residents: true } } } },
          },
        },
      },
    }),
    prisma.householdDisasterProfile.groupBy({
      by: ["riskLevel"],
      _count: true,
    }),
    prisma.missingPersonReport.count({ where: { foundAt: null } }),
  ])

  const evacuatedProfiles = profiles.filter((p) => p.evacuatedAt != null)
  const totalEvacuated = evacuatedProfiles.reduce(
    (sum, p) => sum + p.household._count.residents,
    0
  )

  const evacuationCenters = evacuationCentersRaw.map((ec) => ({
    id: ec.id,
    name: ec.name,
    address: ec.address,
    capacity: ec.capacity,
    latitude: ec.latitude,
    longitude: ec.longitude,
    contactNo: ec.contactNo,
    facilities: ec.facilities,
    isActive: ec.isActive,
    currentEvacuees: ec.evacuatedProfiles.reduce(
      (s, p) => s + p.household._count.residents,
      0
    ),
  }))

  const summary = {
    totalProfiles: profiles.length,
    riskCounts: Object.fromEntries(riskCounts.map((r) => [r.riskLevel, r._count])),
    vulnerableHouseholds: profiles.filter(
      (p) => p.hasPWD || p.hasSenior || p.hasPregnant || p.hasInfant || p.hasChronicIll
    ).length,
    evacuationCenters: evacuationCenters.length,
    totalEvacuated,
    missingCount,
  }

  return NextResponse.json({
    profiles,
    evacuationCenters,
    summary,
  })
}
