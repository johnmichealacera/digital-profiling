import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [profiles, evacuationCenters, riskCounts] = await Promise.all([
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
      },
      orderBy: { riskLevel: "asc" },
    }),
    prisma.evacuationCenter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.householdDisasterProfile.groupBy({
      by: ["riskLevel"],
      _count: true,
    }),
  ])

  const summary = {
    totalProfiles: profiles.length,
    riskCounts: Object.fromEntries(riskCounts.map((r) => [r.riskLevel, r._count])),
    vulnerableHouseholds: profiles.filter(
      (p) => p.hasPWD || p.hasSenior || p.hasPregnant || p.hasInfant || p.hasChronicIll
    ).length,
    evacuationCenters: evacuationCenters.length,
  }

  return NextResponse.json({ profiles, evacuationCenters, summary })
}
