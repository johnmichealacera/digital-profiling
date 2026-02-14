import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const budgetYearSchema = z.object({
  year: z.coerce.number().min(2000).max(2100),
  totalBudget: z.coerce.number().min(0),
  status: z.string().default("ACTIVE"),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const budgetYears = await prisma.budgetYear.findMany({
    orderBy: { year: "desc" },
    include: {
      allocations: true,
      _count: { select: { transactions: true } },
    },
  })

  // Compute summary per budget year
  const result = await Promise.all(
    budgetYears.map(async (by) => {
      const income = await prisma.budgetTransaction.aggregate({
        where: { budgetYearId: by.id, type: "INCOME" },
        _sum: { amount: true },
      })
      const expense = await prisma.budgetTransaction.aggregate({
        where: { budgetYearId: by.id, type: "EXPENSE" },
        _sum: { amount: true },
      })

      const totalAllocated = by.allocations.reduce(
        (sum, a) => sum + Number(a.allocatedAmount),
        0
      )

      return {
        ...by,
        totalAllocated,
        totalIncome: Number(income._sum.amount ?? 0),
        totalExpense: Number(expense._sum.amount ?? 0),
      }
    })
  )

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = budgetYearSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const existing = await prisma.budgetYear.findUnique({
    where: { year: parsed.data.year },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Budget year ${parsed.data.year} already exists` },
      { status: 409 }
    )
  }

  const budgetYear = await prisma.budgetYear.create({
    data: {
      year: parsed.data.year,
      totalBudget: parsed.data.totalBudget,
      status: parsed.data.status,
    },
  })

  return NextResponse.json(budgetYear, { status: 201 })
}
