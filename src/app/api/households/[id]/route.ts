import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { householdSchema } from "@/lib/validations/household.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  assertHouseholdInTenant,
  assertPurokInTenant,
  getTenantBarangayIds,
} from "@/lib/tenant"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertHouseholdInTenant(id, tenantIds))) {
    return NextResponse.json(
      { error: "Household not found" },
      { status: 404 }
    )
  }

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

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertHouseholdInTenant(id, tenantIds))) {
    return NextResponse.json(
      { error: "Household not found" },
      { status: 404 }
    )
  }

  const body = await req.json()
  const parsed = householdSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (
    !(await assertPurokInTenant(parsed.data.purokId, tenantIds))
  ) {
    return NextResponse.json(
      { error: "Purok not found or not in your barangay" },
      { status: 400 }
    )
  }

  const existing = await prisma.household.findUnique({
    where: { id },
    select: { barangayId: true },
  })
  const newPurok = await prisma.purok.findUnique({
    where: { id: parsed.data.purokId },
    select: { barangayId: true },
  })
  if (!existing || !newPurok || newPurok.barangayId !== existing.barangayId) {
    return NextResponse.json(
      {
        error:
          "Purok must belong to the same barangay as this household (cross-barangay moves are not supported here).",
      },
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
