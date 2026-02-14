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
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      updates: { orderBy: { updateDate: "desc" } },
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(project)
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
  const stringFields = [
    "title", "description", "category", "location",
    "status", "fundSource", "contractor",
  ]
  for (const f of stringFields) {
    if (body[f] !== undefined) updateData[f] = body[f]
  }
  if (body.budget !== undefined) updateData.budget = body.budget
  if (body.beneficiaries !== undefined) updateData.beneficiaries = body.beneficiaries
  if (body.progressPercent !== undefined) updateData.progressPercent = body.progressPercent
  if (body.startDate) updateData.startDate = new Date(body.startDate)
  if (body.targetEndDate) updateData.targetEndDate = new Date(body.targetEndDate)
  if (body.actualEndDate) updateData.actualEndDate = new Date(body.actualEndDate)
  if (body.status === "COMPLETED" && !body.actualEndDate) {
    updateData.actualEndDate = new Date()
    updateData.progressPercent = 100
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(project)
}
