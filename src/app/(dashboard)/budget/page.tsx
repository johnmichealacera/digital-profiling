import { prisma } from "@/lib/prisma"
import { BudgetOverview } from "@/components/budget/budget-overview"

export default async function BudgetPage() {
  const budgetYears = await prisma.budgetYear.findMany({
    orderBy: { year: "desc" },
    include: {
      allocations: true,
      _count: { select: { transactions: true } },
    },
  })

  // Compute summary
  const enriched = await Promise.all(
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
        totalBudget: Number(by.totalBudget),
        totalAllocated,
        totalIncome: Number(income._sum.amount ?? 0),
        totalExpense: Number(expense._sum.amount ?? 0),
        transactionCount: by._count.transactions,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget & Finance</h1>
        <p className="text-muted-foreground">
          Manage annual budget, allocations, and transactions
        </p>
      </div>
      <BudgetOverview budgetYears={JSON.parse(JSON.stringify(enriched))} />
    </div>
  )
}
