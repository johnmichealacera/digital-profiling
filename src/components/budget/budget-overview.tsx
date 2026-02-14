"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus, Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { formatPeso } from "@/lib/utils"
import Link from "next/link"

type BudgetYearSummary = {
  id: string
  year: number
  totalBudget: number
  status: string
  approvedAt?: string | null
  totalAllocated: number
  totalIncome: number
  totalExpense: number
  transactionCount: number
}

export function BudgetOverview({ budgetYears: initial }: { budgetYears: BudgetYearSummary[] }) {
  const router = useRouter()
  const [budgetYears, setBudgetYears] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString())
  const [newBudget, setNewBudget] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    if (!newYear || !newBudget) {
      toast.error("Please fill in all fields")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: parseInt(newYear), totalBudget: parseFloat(newBudget) }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || "Failed to create budget year")
      return
    }
    toast.success("Budget year created")
    setDialogOpen(false)
    setNewYear(new Date().getFullYear().toString())
    setNewBudget("")
    router.refresh()
    // Re-fetch
    const listRes = await fetch("/api/budget")
    if (listRes.ok) setBudgetYears(await listRes.json())
  }

  // Overall summary from latest year
  const latest = budgetYears[0]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {latest && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget ({latest.year})</p>
                <p className="text-xl font-bold">{formatPeso(latest.totalBudget)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold">{formatPeso(latest.totalIncome)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">{formatPeso(latest.totalExpense)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900">
                <PiggyBank className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-xl font-bold">
                  {formatPeso(latest.totalBudget + latest.totalIncome - latest.totalExpense)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Year List */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Budget Years</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Budget Year
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Budget Year</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Year *</label>
                <Input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Budget (PHP) *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgetYears.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No budget years created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetYears.map((by) => {
            const utilization = by.totalBudget > 0
              ? Math.round((by.totalExpense / by.totalBudget) * 100)
              : 0
            return (
              <Card key={by.id} className="hover:border-primary/50 transition-colors">
                <Link href={`/budget/${by.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{by.year}</CardTitle>
                      <Badge variant={by.status === "APPROVED" ? "default" : "outline"}>
                        {by.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{formatPeso(by.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Allocated</span>
                      <span className="font-medium">{formatPeso(by.totalAllocated)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">{formatPeso(by.totalExpense)}</span>
                    </div>
                    {/* Utilization bar */}
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Utilization</span>
                        <span>{utilization}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {by.transactionCount} transaction{by.transactionCount !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
