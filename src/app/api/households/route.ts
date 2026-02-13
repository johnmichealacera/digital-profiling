import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { householdSchema } from "@/lib/validations/household.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@/generated/prisma/client"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const purokId = searchParams.get("purokId") || ""
  const search = searchParams.get("search") || ""

  const where: Prisma.HouseholdWhereInput = {}

  if (purokId) where.purokId = purokId
  if (search) {
    where.OR = [
      { houseNo: { contains: search, mode: "insensitive" } },
      { streetSitio: { contains: search, mode: "insensitive" } },
    ]
  }

  const [households, total] = await Promise.all([
    prisma.household.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ purok: { order: "asc" } }, { houseNo: "asc" }],
      include: {
        purok: true,
        residents: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isHouseholdHead: true,
          },
        },
        _count: { select: { residents: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.household.count({ where }),
  ])

  return NextResponse.json({
    data: households,
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
  const parsed = householdSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const household = await prisma.household.create({
    data: parsed.data,
    include: { purok: true },
  })

  return NextResponse.json(household, { status: 201 })
}
