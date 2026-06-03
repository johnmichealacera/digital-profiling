import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"
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
  source: z.enum([
    "BARANGAY_FUND",
    "MUNICIPAL_FUND",
    "PROVINCIAL_FUND",
    "NATIONAL_FUND",
    "DSWD",
    "NGO",
    "OTHER",
  ]),
  description: z.string().optional().nullable(),
  totalBudget: z.coerce.number().optional().nullable(),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
})

async function getProgramForTenant(id: string, bid: unknown) {
  return prisma.ayudaProgram.findFirst({
    where: { id, ...(bid ? { barangayId: bid as string } : {}) },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { id } = await params

  const program = await prisma.ayudaProgram.findFirst({
    where: { id, ...(bid ? { barangayId: bid } : {}) },
    include: {
      createdBy: { select: { id: true, name: true } },
      distributions: {
        orderBy: { createdAt: "asc" },
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
          encodedBy: { select: { id: true, name: true } },
        },
      },
    },
  })
  if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(program)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "ayuda", "update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { id } = await params

  const existing = await getProgramForTenant(id, bid)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await prisma.ayudaProgram.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      source: parsed.data.source,
      description: parsed.data.description ?? null,
      totalBudget: parsed.data.totalBudget ?? null,
      status: parsed.data.status,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "ayuda", "delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)
  const { id } = await params

  const existing = await getProgramForTenant(id, bid)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.ayudaProgram.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
