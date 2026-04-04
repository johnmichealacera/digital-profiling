import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { residentSchema } from "@/lib/validations/resident.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { assertResidentInTenant, getTenantBarangayIds } from "@/lib/tenant"

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

  if (!(await assertResidentInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      household: { include: { purok: true } },
      documentRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      healthRecords: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!resident) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  return NextResponse.json(resident)
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

  if (!(await assertResidentInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = residentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const householdId = parsed.data.householdId
  if (householdId) {
    const hh = await prisma.household.findUnique({
      where: { id: householdId },
      select: { barangayId: true },
    })
    if (
      !hh ||
      (tenantIds !== null && !tenantIds.includes(hh.barangayId))
    ) {
      return NextResponse.json(
        { error: "Household not found or not in your barangay" },
        { status: 400 }
      )
    }
  }

  const { dateOfBirth, monthlyIncome, emailAddress, ...rest } = parsed.data

  const resident = await prisma.resident.update({
    where: { id },
    data: {
      ...rest,
      dateOfBirth: new Date(dateOfBirth),
      monthlyIncome: monthlyIncome ?? undefined,
      emailAddress: emailAddress || null,
    },
    include: {
      household: { include: { purok: true } },
    },
  })

  return NextResponse.json(resident)
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

  await prisma.resident.update({
    where: { id },
    data: { status: "INACTIVE" },
  })

  return NextResponse.json({ success: true })
}
