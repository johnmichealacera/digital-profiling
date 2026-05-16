import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTenantBarangayIds } from "@/lib/tenant"

const CAN_DELETE = new Set(["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY"])

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!CAN_DELETE.has(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const purok = await prisma.purok.findUnique({
    where: { id },
    select: { id: true, barangayId: true },
  })
  if (!purok) {
    return NextResponse.json({ error: "Purok not found." }, { status: 404 })
  }

  // Scope check: caller must have access to this barangay
  const tenantIds = await getTenantBarangayIds(session)
  if (tenantIds !== null && !tenantIds.includes(purok.barangayId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Prevent deletion if residents or households are still assigned
  const [residentCount, householdCount] = await Promise.all([
    prisma.resident.count({ where: { household: { purokId: id } } }),
    prisma.household.count({ where: { purokId: id } }),
  ])

  if (residentCount > 0 || householdCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${residentCount} resident(s) and ${householdCount} household(s) are still assigned to this purok.`,
      },
      { status: 409 }
    )
  }

  await prisma.purok.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
