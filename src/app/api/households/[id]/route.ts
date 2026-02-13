import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { householdSchema } from "@/lib/validations/household.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const household = await prisma.household.findUnique({
    where: { id },
    include: {
      purok: true,
      residents: {
        where: { status: "ACTIVE" },
        orderBy: [{ isHouseholdHead: "desc" }, { lastName: "asc" }],
      },
      disasterProfile: true,
    },
  })

  if (!household) {
    return NextResponse.json(
      { error: "Household not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(household)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = householdSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const household = await prisma.household.update({
    where: { id },
    data: parsed.data,
    include: { purok: true },
  })

  return NextResponse.json(household)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const residentCount = await prisma.resident.count({
    where: { householdId: id, status: "ACTIVE" },
  })

  if (residentCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete household with active residents" },
      { status: 400 }
    )
  }

  await prisma.household.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
