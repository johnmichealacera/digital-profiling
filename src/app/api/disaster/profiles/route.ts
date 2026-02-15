import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  householdId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const household = await prisma.household.findUnique({
    where: { id: parsed.data.householdId },
  })
  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 })
  }

  const existing = await prisma.householdDisasterProfile.findUnique({
    where: { householdId: parsed.data.householdId },
  })
  if (existing) {
    return NextResponse.json(
      { error: "This household already has a disaster profile" },
      { status: 409 }
    )
  }

  const profile = await prisma.householdDisasterProfile.create({
    data: {
      householdId: parsed.data.householdId,
      riskLevel: "LOW",
      hazardTypes: [],
    },
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
  })

  return NextResponse.json(profile, { status: 201 })
}
