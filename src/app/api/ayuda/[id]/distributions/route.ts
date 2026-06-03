import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"
import { canPerformAction } from "@/lib/permissions"
import type { UserRole } from "@/generated/prisma/client"

const schema = z.object({
  residentId: z.string().min(1),
  amount: z.coerce.number().optional().nullable(),
  items: z.string().optional().nullable(),
  quantity: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "ayuda", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { id: ayudaProgramId } = await params

  const program = await prisma.ayudaProgram.findFirst({
    where: { id: ayudaProgramId, ...(bid ? { barangayId: bid } : {}) },
    select: { id: true, barangayId: true },
  })
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Verify resident exists
  const resident = await prisma.resident.findUnique({
    where: { id: parsed.data.residentId },
    select: { id: true, barangayId: true, householdId: true },
  })
  if (!resident) return NextResponse.json({ error: "Resident not found" }, { status: 404 })

  // Prevent duplicate
  const existing = await prisma.ayudaDistribution.findUnique({
    where: {
      ayudaProgramId_residentId: {
        ayudaProgramId,
        residentId: parsed.data.residentId,
      },
    },
  })
  if (existing) {
    return NextResponse.json(
      { error: "This resident is already a beneficiary of this program." },
      { status: 409 }
    )
  }

  const distribution = await prisma.ayudaDistribution.create({
    data: {
      ayudaProgramId,
      residentId: parsed.data.residentId,
      barangayId: program.barangayId,
      amount: parsed.data.amount ?? null,
      items: parsed.data.items ?? null,
      quantity: parsed.data.quantity ?? null,
      unit: parsed.data.unit ?? null,
      remarks: parsed.data.remarks ?? null,
      encodedById: session.user.id,
    },
    include: {
      resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          suffix: true,
        },
      },
    },
  })
  return NextResponse.json(distribution, { status: 201 })
}
