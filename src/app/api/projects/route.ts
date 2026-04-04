import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"
import { resolveWriteBarangayId } from "@/lib/resolve-barangay-write"

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().min(1),
  location: z.string().optional().nullable(),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "SUSPENDED", "CANCELLED"]).default("PLANNED"),
  startDate: z.string().optional().nullable(),
  targetEndDate: z.string().optional().nullable(),
  budget: z.coerce.number().optional().nullable(),
  fundSource: z.string().optional().nullable(),
  contractor: z.string().optional().nullable(),
  beneficiaries: z.coerce.number().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {
    ...(bid ? { barangayId: bid } : {}),
  }
  if (status) where.status = status

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { updates: true } },
    },
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const wr = resolveWriteBarangayId(
    session,
    (body as { barangayId?: string }).barangayId
  )
  if (!wr.ok) return wr.response

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      barangayId: wr.barangayId,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      targetEndDate: parsed.data.targetEndDate ? new Date(parsed.data.targetEndDate) : null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
