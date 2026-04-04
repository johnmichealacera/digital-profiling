import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { documentRequestSchema } from "@/lib/validations/document.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DOCUMENT_TYPE_PREFIXES } from "@/lib/constants"
import { generateControlNo } from "@/lib/utils"
import { Prisma } from "@/generated/prisma/client"
import { assertResidentInTenant, barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"

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
  const documentType = searchParams.get("documentType") || ""
  const search = searchParams.get("search") || ""

  const where: Prisma.DocumentRequestWhereInput = {
    ...(bid ? { barangayId: bid } : {}),
  }

  if (status) {
    where.status = status as Prisma.EnumDocumentStatusFilter["equals"]
  }
  if (documentType) {
    where.documentType = documentType as Prisma.EnumDocumentTypeFilter["equals"]
  }
  if (search) {
    where.OR = [
      { controlNo: { contains: search, mode: "insensitive" } },
      { resident: { firstName: { contains: search, mode: "insensitive" } } },
      { resident: { lastName: { contains: search, mode: "insensitive" } } },
    ]
  }

  const [documents, total] = await Promise.all([
    prisma.documentRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        resident: true,
        encodedBy: { select: { id: true, name: true } },
        issuedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.documentRequest.count({ where }),
  ])

  return NextResponse.json({
    data: documents,
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
  const parsed = documentRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (
    !(await assertResidentInTenant(parsed.data.residentId, tenantIds))
  ) {
    return NextResponse.json(
      { error: "Resident not found or not in your barangay" },
      { status: 400 }
    )
  }

  const resident = await prisma.resident.findUnique({
    where: { id: parsed.data.residentId },
    select: {
      household: { select: { barangayId: true } },
    },
  })
  const barangayId = resident?.household?.barangayId
  if (!barangayId) {
    return NextResponse.json(
      { error: "Resident must belong to a household to request documents" },
      { status: 400 }
    )
  }

  const prefix = DOCUMENT_TYPE_PREFIXES[parsed.data.documentType] || "DOC"
  const count = await prisma.documentRequest.count({
    where: {
      barangayId,
      documentType: parsed.data.documentType as Prisma.EnumDocumentTypeFilter["equals"],
      createdAt: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      },
    },
  })
  const controlNo = generateControlNo(prefix, count + 1)

  const document = await prisma.documentRequest.create({
    data: {
      ...parsed.data,
      barangayId,
      controlNo,
      encodedById: session.user.id,
      feeAmount: parsed.data.feeAmount ?? undefined,
    },
    include: {
      resident: true,
      encodedBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(document, { status: 201 })
}
