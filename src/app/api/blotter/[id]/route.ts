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

  const blotter = await prisma.blotter.findUnique({
    where: { id },
    include: {
      complainant: true,
      respondent: true,
      filedBy: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
      hearings: { orderBy: { hearingDate: "asc" } },
    },
  })

  if (!blotter) {
    return NextResponse.json({ error: "Blotter not found" }, { status: 404 })
  }

  return NextResponse.json(blotter)
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

  const updateData: Record<string, unknown> = {}

  if (body.status) updateData.status = body.status
  if (body.resolution !== undefined) updateData.resolution = body.resolution

  if (body.status === "SETTLED" || body.status === "CLOSED") {
    updateData.resolvedAt = new Date()
    updateData.resolvedById = session.user.id
  }

  const blotter = await prisma.blotter.update({
    where: { id },
    data: updateData,
    include: {
      complainant: true,
      respondent: true,
      filedBy: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
      hearings: { orderBy: { hearingDate: "asc" } },
    },
  })

  return NextResponse.json(blotter)
}
