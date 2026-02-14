import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
      prisma.resident.count({ where: { status: "ACTIVE" } }),
      prisma.resident.groupBy({ by: ["sex"], where: { status: "ACTIVE" }, _count: true }),
      prisma.resident.groupBy({ by: ["civilStatus"], where: { status: "ACTIVE" }, _count: true }),
      prisma.resident.findMany({
        where: { status: "ACTIVE" },
        select: { household: { select: { purok: { select: { name: true } } } } },
      }),
      prisma.resident.groupBy({ by: ["educationalAttainment"], where: { status: "ACTIVE" }, _count: true }),
      prisma.resident.groupBy({ by: ["employmentStatus"], where: { status: "ACTIVE" }, _count: true }),
      prisma.resident.count({ where: { status: "ACTIVE", voterStatus: true } }),
      prisma.resident.count({ where: { status: "ACTIVE", isSeniorCitizen: true } }),
      prisma.resident.count({ where: { status: "ACTIVE", isPwd: true } }),
      prisma.resident.count({ where: { status: "ACTIVE", isSoloParent: true } }),
      prisma.resident.count({ where: { status: "ACTIVE", is4PsBeneficiary: true } }),
      prisma.resident.count({
        where: {
          status: "ACTIVE",
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
      prisma.household.count(),
      prisma.household.findMany({
        select: { purok: { select: { name: true } }, _count: { select: { residents: true } } },
      }),
      prisma.household.count({ where: { is4PsBeneficiary: true } }),
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

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 })
}
