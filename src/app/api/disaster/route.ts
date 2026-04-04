import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"
import {
  barangayIdFilter,
  getTenantBarangayIds,
  householdWhereForTenant,
  residentWhereForTenant,
} from "@/lib/tenant"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const ecBarangay = barangayIdFilter(tenantIds)
  const hhWhere = householdWhereForTenant(tenantIds)
  const missResFilter = residentWhereForTenant(tenantIds)
  const missingReportWhere: Prisma.MissingPersonReportWhereInput = {
    foundAt: null,
    ...(Object.keys(missResFilter).length > 0
      ? { resident: { is: missResFilter } }
      : {}),
  }

  const [profiles, evacuationCentersRaw, riskCounts, missingCount] = await Promise.all([
    prisma.householdDisasterProfile.findMany({
      where: { household: { is: hhWhere } },
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
      where: {
        ...(ecBarangay ? { barangayId: ecBarangay } : {}),
        isActive: true,
      },
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
      where: { household: { is: hhWhere } },
      _count: true,
    }),
    prisma.missingPersonReport.count({ where: missingReportWhere }),
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
