import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { formatResidentName } from "@/lib/utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const households = await prisma.household.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      purok: true,
      residents: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          suffix: true,
          isHouseholdHead: true,
        },
      },
      _count: { select: { residents: { where: { status: "ACTIVE" } } } },
    },
  })

  const mapData = households.map((hh) => {
    const head = hh.residents.find((r) => r.isHouseholdHead)
    return {
      id: hh.id,
      houseNo: hh.houseNo,
      latitude: hh.latitude!,
      longitude: hh.longitude!,
      purok: { id: hh.purok.id, name: hh.purok.name },
      residentCount: hh._count.residents,
      headOfHousehold: head ? formatResidentName(head) : null,
      is4PsBeneficiary: hh.is4PsBeneficiary,
    }
  })

  return NextResponse.json(mapData)
}
