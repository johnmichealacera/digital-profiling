import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"
import { canPerformAction } from "@/lib/permissions"
import type { UserRole } from "@/generated/prisma/client"

const patchSchema = z.object({
  status: z.enum(["PENDING", "CLAIMED", "UNCLAIMED", "RETURNED"]),
  claimedByName: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
  items: z.string().optional().nullable(),
  quantity: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; distId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "ayuda", "update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { id: ayudaProgramId, distId } = await params

  const program = await prisma.ayudaProgram.findFirst({
    where: { id: ayudaProgramId, ...(bid ? { barangayId: bid } : {}) },
    select: { id: true },
  })
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 })

  const dist = await prisma.ayudaDistribution.findFirst({
    where: { id: distId, ayudaProgramId },
  })
  if (!dist) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await prisma.ayudaDistribution.update({
    where: { id: distId },
    data: {
      status: parsed.data.status,
      claimedByName: parsed.data.claimedByName ?? null,
      remarks: parsed.data.remarks ?? null,
      amount: parsed.data.amount ?? null,
      items: parsed.data.items ?? null,
      quantity: parsed.data.quantity ?? null,
      unit: parsed.data.unit ?? null,
      claimedAt: parsed.data.status === "CLAIMED" ? new Date() : null,
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
  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; distId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "ayuda", "delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { id: ayudaProgramId, distId } = await params

  const program = await prisma.ayudaProgram.findFirst({
    where: { id: ayudaProgramId, ...(bid ? { barangayId: bid } : {}) },
    select: { id: true },
  })
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 })

  await prisma.ayudaDistribution.deleteMany({
    where: { id: distId, ayudaProgramId },
  })
  return new NextResponse(null, { status: 204 })
}
