import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { residentSchema } from "@/lib/validations/resident.schema"
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
  const search = searchParams.get("search") || ""
  const purokId = searchParams.get("purokId") || ""
  const sex = searchParams.get("sex") || ""
  const civilStatus = searchParams.get("civilStatus") || ""
  const isSeniorCitizen = searchParams.get("isSeniorCitizen")
  const isPwd = searchParams.get("isPwd")
  const is4PsBeneficiary = searchParams.get("is4PsBeneficiary")
  const status = searchParams.get("status") || "ACTIVE"

  const where: Prisma.ResidentWhereInput = {
    status: status as Prisma.EnumResidentStatusFilter["equals"],
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { middleName: { contains: search, mode: "insensitive" } },
    ]
  }

  if (purokId) {
    where.household = { purokId }
  }

  if (sex) {
    where.sex = sex as Prisma.EnumSexFilter["equals"]
  }

  if (civilStatus) {
    where.civilStatus = civilStatus as Prisma.EnumCivilStatusFilter["equals"]
  }

  if (isSeniorCitizen === "true") where.isSeniorCitizen = true
  if (isPwd === "true") where.isPwd = true
  if (is4PsBeneficiary === "true") where.is4PsBeneficiary = true

  const skip = (page - 1) * limit

  const [residents, total] = await Promise.all([
    prisma.resident.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        household: {
          include: { purok: true },
        },
      },
    }),
    prisma.resident.count({ where }),
  ])

  return NextResponse.json({
    data: residents,
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
  const parsed = residentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { dateOfBirth, monthlyIncome, emailAddress, ...rest } = parsed.data

  const resident = await prisma.resident.create({
    data: {
      ...rest,
      dateOfBirth: new Date(dateOfBirth),
      monthlyIncome: monthlyIncome ?? undefined,
      emailAddress: emailAddress || null,
    },
    include: {
      household: { include: { purok: true } },
    },
  })

  return NextResponse.json(resident, { status: 201 })
}
