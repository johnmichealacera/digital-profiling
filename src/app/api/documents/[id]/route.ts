import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const document = await prisma.documentRequest.findUnique({
    where: { id },
    include: {
      resident: {
        include: { household: { include: { purok: true } } },
      },
      encodedBy: { select: { id: true, name: true } },
      issuedBy: { select: { id: true, name: true } },
    },
  })

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  return NextResponse.json(document)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const document = await prisma.documentRequest.update({
    where: { id },
    data: {
      status: body.status,
      remarks: body.remarks,
      issuedById:
        body.status === "READY" ? session.user.id : undefined,
      releasedAt:
        body.status === "RELEASED" ? new Date() : undefined,
    },
    include: {
      resident: true,
      encodedBy: { select: { id: true, name: true } },
      issuedBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(document)
}
