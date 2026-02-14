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

  const budgetYear = await prisma.budgetYear.findUnique({
    where: { id },
    include: {
      allocations: { orderBy: { category: "asc" } },
      transactions: {
        orderBy: { transactionDate: "desc" },
        include: { encodedBy: { select: { id: true, name: true } } },
      },
    },
  })

  if (!budgetYear) {
    return NextResponse.json({ error: "Budget year not found" }, { status: 404 })
  }

  return NextResponse.json(budgetYear)
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
  if (body.totalBudget !== undefined) updateData.totalBudget = body.totalBudget
  if (body.status) updateData.status = body.status
  if (body.status === "APPROVED") updateData.approvedAt = new Date()

  const budgetYear = await prisma.budgetYear.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(budgetYear)
}
