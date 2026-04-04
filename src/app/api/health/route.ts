import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { HealthCategory, Prisma } from "@/generated/prisma/client"
import { assertResidentInTenant, getTenantBarangayIds, residentWhereForTenant } from "@/lib/tenant"
import { z } from "zod"

const healthRecordSchema = z.object({
  residentId: z.string().min(1),
  category: z.enum([
    "SENIOR_CITIZEN", "PWD", "PREGNANT", "LACTATING",
    "CHILD_0_TO_5", "MALNOURISHED", "HYPERTENSIVE", "DIABETIC",
  ]),
  seniorCategory: z.string().optional().nullable(),
  disabilityType: z.string().optional().nullable(),
  disabilityCause: z.string().optional().nullable(),
  lastMenstrualPeriod: z.string().optional().nullable(),
  expectedDueDate: z.string().optional().nullable(),
  weightKg: z.coerce.number().optional().nullable(),
  heightCm: z.coerce.number().optional().nullable(),
  nutritionalStatus: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 20

  const resFilter = residentWhereForTenant(tenantIds)
  const residentParts: Prisma.ResidentWhereInput[] = []
  if (Object.keys(resFilter).length > 0) residentParts.push(resFilter)
  if (search) {
    residentParts.push({
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    })
  }

  const where: Prisma.HealthRecordWhereInput = {
    isActive: true,
    ...(category ? { category: category as HealthCategory } : {}),
    ...(residentParts.length > 0
      ? {
          resident: {
            is:
              residentParts.length === 1
                ? residentParts[0]!
                : { AND: residentParts },
          },
        }
      : {}),
  }

  const [records, total] = await Promise.all([
    prisma.healthRecord.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        resident: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            suffix: true,
            dateOfBirth: true,
            sex: true,
          },
        },
      },
    }),
    prisma.healthRecord.count({ where }),
  ])

  return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)

  const body = await req.json()
  const parsed = healthRecordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!(await assertResidentInTenant(parsed.data.residentId, tenantIds))) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  const record = await prisma.healthRecord.create({
    data: {
      ...parsed.data,
      lastMenstrualPeriod: parsed.data.lastMenstrualPeriod
        ? new Date(parsed.data.lastMenstrualPeriod) : null,
      expectedDueDate: parsed.data.expectedDueDate
        ? new Date(parsed.data.expectedDueDate) : null,
    },
  })

  return NextResponse.json(record, { status: 201 })
}
