import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { blotterSchema } from "@/lib/validations/blotter.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateControlNo } from "@/lib/utils"
import { Prisma } from "@/generated/prisma/client"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const status = searchParams.get("status") || ""
  const search = searchParams.get("search") || ""

  const where: Prisma.BlotterWhereInput = {}
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

  const body = await req.json()
  const parsed = blotterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const count = await prisma.blotter.count({
    where: {
      createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
  })
  const blotterNo = generateControlNo("BLT", count + 1)

  const { incidentDate, ...rest } = parsed.data

  const blotter = await prisma.blotter.create({
    data: {
      ...rest,
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
