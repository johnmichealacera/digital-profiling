import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"
import { resolveWriteBarangayId } from "@/lib/resolve-barangay-write"
import { canPerformAction } from "@/lib/permissions"
import type { UserRole } from "@/generated/prisma/client"

const schema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum([
    "CASH",
    "FOOD_PACK",
    "MEDICAL",
    "EDUCATIONAL",
    "LIVELIHOOD",
    "CALAMITY_RELIEF",
    "SENIOR_CITIZEN",
    "PWD_ASSISTANCE",
    "SOLO_PARENT",
    "SCHOLARSHIP",
    "OTHER",
  ]),
  source: z
    .enum([
      "BARANGAY_FUND",
      "MUNICIPAL_FUND",
      "PROVINCIAL_FUND",
      "NATIONAL_FUND",
      "DSWD",
      "NGO",
      "OTHER",
    ])
    .default("BARANGAY_FUND"),
  description: z.string().optional().nullable(),
  totalBudget: z.coerce.number().optional().nullable(),
  status: z
    .enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"])
    .default("PLANNED"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  barangayId: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = { ...(bid ? { barangayId: bid } : {}) }
  if (status) where.status = status

  const programs = await prisma.ayudaProgram.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { distributions: true } },
    },
  })
  return NextResponse.json(programs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "ayuda", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const wr = resolveWriteBarangayId(session, parsed.data.barangayId)
  if (!wr.ok) return wr.response

  const program = await prisma.ayudaProgram.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      source: parsed.data.source,
      description: parsed.data.description ?? null,
      totalBudget: parsed.data.totalBudget ?? null,
      status: parsed.data.status,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      barangayId: wr.barangayId,
      createdById: session.user.id,
    },
  })
  return NextResponse.json(program, { status: 201 })
}
