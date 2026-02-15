import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [householdsWithProfile, evacuationCentersRaw] = await Promise.all([
    prisma.household.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        disasterProfile: { isNot: null },
      },
      include: {
        purok: { select: { id: true, name: true } },
        disasterProfile: {
          include: {
            evacuationCenterRef: { select: { id: true, name: true } },
          },
        },
        _count: { select: { residents: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.evacuationCenter.findMany({
      where: { isActive: true, latitude: { not: null }, longitude: { not: null } },
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
  ])

  const mapHouseholds = householdsWithProfile.map((hh) => {
    const profile = hh.disasterProfile!
    return {
      id: hh.id,
      houseNo: hh.houseNo,
      latitude: hh.latitude!,
      longitude: hh.longitude!,
      purok: hh.purok,
      residentCount: hh._count.residents,
      riskLevel: profile.riskLevel,
      evacuatedAt: profile.evacuatedAt,
      evacuationCenterId: profile.evacuationCenterId,
      evacuationCenterName: profile.evacuationCenterRef?.name ?? profile.evacuationCenter ?? null,
      hasPWD: profile.hasPWD,
      hasSenior: profile.hasSenior,
      hasPregnant: profile.hasPregnant,
      hasInfant: profile.hasInfant,
      hasChronicIll: profile.hasChronicIll,
    }
  })

  const evacuationCenters = evacuationCentersRaw.map((ec) => ({
    id: ec.id,
    name: ec.name,
    address: ec.address,
    latitude: ec.latitude!,
    longitude: ec.longitude!,
    capacity: ec.capacity,
    currentEvacuees: ec.evacuatedProfiles.reduce(
      (s, p) => s + p.household._count.residents,
      0
    ),
  }))

  return NextResponse.json({
    households: mapHouseholds,
    evacuationCenters,
  })
}
