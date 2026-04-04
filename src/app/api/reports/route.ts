import { NextRequest, NextResponse } from "next/server"
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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const rWhere = { status: "ACTIVE" as const, ...residentWhereForTenant(tenantIds) }
  const hhWhere = householdWhereForTenant(tenantIds)
  const ecBarangay = barangayIdFilter(tenantIds)

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "population"

  if (type === "population") {
    const [
      total,
      bySex,
      byCivilStatus,
      byPurok,
      byEducation,
      byEmployment,
      voters,
      seniorCitizens,
      pwd,
      soloParents,
      fourPs,
      minors,
    ] = await Promise.all([
      prisma.resident.count({ where: rWhere }),
      prisma.resident.groupBy({ by: ["sex"], where: rWhere, _count: true }),
      prisma.resident.groupBy({ by: ["civilStatus"], where: rWhere, _count: true }),
      prisma.resident.findMany({
        where: rWhere,
        select: { household: { select: { purok: { select: { name: true } } } } },
      }),
      prisma.resident.groupBy({ by: ["educationalAttainment"], where: rWhere, _count: true }),
      prisma.resident.groupBy({ by: ["employmentStatus"], where: rWhere, _count: true }),
      prisma.resident.count({ where: { ...rWhere, voterStatus: true } }),
      prisma.resident.count({ where: { ...rWhere, isSeniorCitizen: true } }),
      prisma.resident.count({ where: { ...rWhere, isPwd: true } }),
      prisma.resident.count({ where: { ...rWhere, isSoloParent: true } }),
      prisma.resident.count({ where: { ...rWhere, is4PsBeneficiary: true } }),
      prisma.resident.count({
        where: {
          ...rWhere,
          dateOfBirth: { gt: new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()) },
        },
      }),
    ])

    // Aggregate by purok
    const purokCounts: Record<string, number> = {}
    for (const r of byPurok) {
      const name = r.household?.purok?.name ?? "Unknown"
      purokCounts[name] = (purokCounts[name] ?? 0) + 1
    }

    return NextResponse.json({
      type: "population",
      total,
      bySex: Object.fromEntries(bySex.map((r) => [r.sex, r._count])),
      byCivilStatus: Object.fromEntries(byCivilStatus.map((r) => [r.civilStatus, r._count])),
      byPurok: purokCounts,
      byEducation: Object.fromEntries(
        byEducation
          .filter((r) => r.educationalAttainment)
          .map((r) => [r.educationalAttainment, r._count])
      ),
      byEmployment: Object.fromEntries(
        byEmployment
          .filter((r) => r.employmentStatus)
          .map((r) => [r.employmentStatus, r._count])
      ),
      classifications: { voters, seniorCitizens, pwd, soloParents, fourPs, minors },
    })
  }

  if (type === "households") {
    const [total, byPurok, fourPsHouseholds] = await Promise.all([
      prisma.household.count({ where: hhWhere }),
      prisma.household.findMany({
        where: hhWhere,
        select: { purok: { select: { name: true } }, _count: { select: { residents: true } } },
      }),
      prisma.household.count({ where: { ...hhWhere, is4PsBeneficiary: true } }),
    ])

    const purokData: Record<string, { count: number; members: number }> = {}
    for (const h of byPurok) {
      const name = h.purok.name
      if (!purokData[name]) purokData[name] = { count: 0, members: 0 }
      purokData[name].count++
      purokData[name].members += h._count.residents
    }

    return NextResponse.json({
      type: "households",
      total,
      fourPsHouseholds,
      byPurok: purokData,
    })
  }

  if (type === "disaster") {
    const missResFilter = residentWhereForTenant(tenantIds)
    const missingReportWhere: Prisma.MissingPersonReportWhereInput = {
      foundAt: null,
      ...(Object.keys(missResFilter).length > 0
        ? { resident: { is: missResFilter } }
        : {}),
    }

    const [profiles, evacuationCentersRaw, riskCounts, missingCount, missingList] =
      await Promise.all([
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
        prisma.missingPersonReport.findMany({
          where: missingReportWhere,
          orderBy: { reportedAt: "desc" },
          include: {
            resident: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
                suffix: true,
                household: {
                  select: {
                    houseNo: true,
                    purok: { select: { name: true } },
                  },
                },
              },
            },
          },
        }),
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
      currentEvacuees: ec.evacuatedProfiles.reduce(
        (s, p) => s + p.household._count.residents,
        0
      ),
    }))

    const summary = {
      totalProfiles: profiles.length,
      riskCounts: Object.fromEntries(riskCounts.map((r) => [r.riskLevel, r._count])),
      vulnerableHouseholds: profiles.filter(
        (p) =>
          p.hasPWD ||
          p.hasSenior ||
          p.hasPregnant ||
          p.hasInfant ||
          p.hasChronicIll
      ).length,
      evacuationCenters: evacuationCenters.length,
      totalEvacuated,
      missingCount,
    }

    const missingPersons = missingList.map((r) => ({
      id: r.id,
      residentName: [
        r.resident.firstName,
        r.resident.middleName,
        r.resident.lastName,
        r.resident.suffix,
      ]
        .filter(Boolean)
        .join(" "),
      household: r.resident.household
        ? `#${r.resident.household.houseNo ?? "?"} - ${r.resident.household.purok.name}`
        : null,
      reportedAt: r.reportedAt.toISOString(),
      notes: r.notes,
    }))

    return NextResponse.json({
      type: "disaster",
      summary,
      profiles,
      evacuationCenters,
      missingPersons,
    })
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 })
}
