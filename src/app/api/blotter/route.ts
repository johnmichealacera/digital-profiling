import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { blotterSchema } from "@/lib/validations/blotter.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateControlNo } from "@/lib/utils"
import { Prisma } from "@/generated/prisma/client"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"

async function barangayIdFromParty(
  complainantId: string | null | undefined,
  respondentId: string | null | undefined
): Promise<string | null> {
  for (const rid of [complainantId, respondentId]) {
    if (!rid) continue
    const r = await prisma.resident.findUnique({
      where: { id: rid },
      select: { household: { select: { barangayId: true } } },
    })
    if (r?.household?.barangayId) return r.household.barangayId
  }
  return null
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const status = searchParams.get("status") || ""
  const search = searchParams.get("search") || ""

  const where: Prisma.BlotterWhereInput = {
    ...(bid ? { barangayId: bid } : {}),
  }
  if (status) where.status = status as Prisma.EnumBlotterStatusFilter["equals"]
  if (search) {
    where.OR = [
      { blotterNo: { contains: search, mode: "insensitive" } },
      { complainantName: { contains: search, mode: "insensitive" } },
      { respondentName: { contains: search, mode: "insensitive" } },
      { narrative: { contains: search, mode: "insensitive" } },
    ]
  }

  const [blotters, total] = await Promise.all([
    prisma.blotter.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        complainant: { select: { id: true, firstName: true, lastName: true, suffix: true } },
        respondent: { select: { id: true, firstName: true, lastName: true, suffix: true } },
        filedBy: { select: { id: true, name: true } },
        _count: { select: { hearings: true } },
      },
    }),
    prisma.blotter.count({ where }),
  ])

  return NextResponse.json({
    data: blotters,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const body = await req.json()
  const parsed = blotterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  let barangayId =
    (await barangayIdFromParty(
      parsed.data.complainantId,
      parsed.data.respondentId
    )) ?? null

  const rawBarangay = (body as { barangayId?: string }).barangayId?.trim()
  if (!barangayId) {
    if (session.user.role === "SUPER_ADMIN" && rawBarangay) {
      barangayId = rawBarangay
    } else if (session.user.barangayId) {
      barangayId = session.user.barangayId
    }
  }

  if (!barangayId) {
    return NextResponse.json(
      {
        error:
          "Could not determine barangay (link a complainant/respondent resident, or pass barangayId as super admin).",
      },
      { status: 400 }
    )
  }

  if (tenantIds !== null && !tenantIds.includes(barangayId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const count = await prisma.blotter.count({
    where: {
      barangayId,
      createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
  })
  const blotterNo = generateControlNo("BLT", count + 1)

  const { incidentDate, ...rest } = parsed.data

  const blotter = await prisma.blotter.create({
    data: {
      ...rest,
      barangayId,
      blotterNo,
      incidentDate: new Date(incidentDate),
      filedById: session.user.id,
    },
    include: {
      complainant: true,
      respondent: true,
      filedBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(blotter, { status: 201 })
}
