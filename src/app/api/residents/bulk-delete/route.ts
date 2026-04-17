import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { compare } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canPerformAction } from "@/lib/permissions"
import { getTenantBarangayIds } from "@/lib/tenant"

const bulkDeleteSchema = z.object({
  residentIds: z.array(z.string().min(1)).min(1),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!canPerformAction(session.user.role, "residents", "delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = bulkDeleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, isActive: true },
  })
  if (!user?.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const passwordMatches = await compare(parsed.data.password, user.password)
  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Password verification failed" },
      { status: 401 }
    )
  }

  const tenantIds = await getTenantBarangayIds(session)
  const uniqueIds = Array.from(new Set(parsed.data.residentIds))

  const rows = await prisma.resident.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      householdId: true,
      barangayId: true,
      household: { select: { barangayId: true } },
    },
  })

  const foundIdSet = new Set(rows.map((r) => r.id))
  if (foundIdSet.size !== uniqueIds.length) {
    return NextResponse.json(
      { error: "One or more selected residents were not found" },
      { status: 404 }
    )
  }

  if (tenantIds !== null) {
    const outOfScope = rows.some((r) => {
      if (r.householdId && r.household) return !tenantIds.includes(r.household.barangayId)
      if (r.barangayId) return !tenantIds.includes(r.barangayId)
      return true
    })
    if (outOfScope) {
      return NextResponse.json(
        { error: "One or more selected residents are outside your scope" },
        { status: 403 }
      )
    }
  }

  const result = await prisma.resident.updateMany({
    where: {
      id: { in: uniqueIds },
      status: "ACTIVE",
    },
    data: { status: "INACTIVE" },
  })

  return NextResponse.json({
    deletedCount: result.count,
  })
}

