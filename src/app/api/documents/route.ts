import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { documentRequestSchema } from "@/lib/validations/document.schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DOCUMENT_TYPE_PREFIXES } from "@/lib/constants"
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
  const documentType = searchParams.get("documentType") || ""
  const search = searchParams.get("search") || ""

  const where: Prisma.DocumentRequestWhereInput = {}

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

  const body = await req.json()
  const parsed = documentRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Generate control number
  const prefix = DOCUMENT_TYPE_PREFIXES[parsed.data.documentType] || "DOC"
  const count = await prisma.documentRequest.count({
    where: {
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
