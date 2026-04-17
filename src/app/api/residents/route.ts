import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { residentSchema } from "@/lib/validations/resident.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@/generated/prisma/client"
import { getTenantBarangayIds, householdWhereForTenant, residentWhereForTenant } from "@/lib/tenant"
import { canPerformAction } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)

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

  const hhScoped = householdWhereForTenant(tenantIds)
  if (tenantIds !== null) {
    if (purokId) {
      where.household = {
        is: {
          ...hhScoped,
          purokId,
        },
      }
    } else {
      Object.assign(where, residentWhereForTenant(tenantIds))
    }
  } else if (purokId) {
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

  if (!canPerformAction(session.user.role, "residents", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = residentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const tenantIds = await getTenantBarangayIds(session)
  const householdId = parsed.data.householdId
  let residentBarangayId: string | null = null
  if (householdId) {
    const hh = await prisma.household.findUnique({
      where: { id: householdId },
      select: { barangayId: true },
    })
    if (
      !hh ||
      (tenantIds !== null && !tenantIds.includes(hh.barangayId))
    ) {
      return NextResponse.json(
        { error: "Household not found or not in your barangay" },
        { status: 400 }
      )
    }
    residentBarangayId = hh.barangayId
  } else if (session.user.barangayId) {
    residentBarangayId = session.user.barangayId
  } else if (tenantIds !== null && tenantIds.length === 1) {
    residentBarangayId = tenantIds[0]!
  }

  const { dateOfBirth, monthlyIncome, emailAddress, ...rest } = parsed.data

  const createData: Prisma.ResidentUncheckedCreateInput = {
    ...rest,
    dateOfBirth: new Date(dateOfBirth),
    monthlyIncome: monthlyIncome ?? undefined,
    emailAddress: emailAddress || null,
    ...(residentBarangayId ? { barangayId: residentBarangayId } : {}),
  }

  const resident = await prisma.resident.create({
    data: createData,
    include: {
      household: { include: { purok: true } },
    },
  })

  return NextResponse.json(resident, { status: 201 })
}
