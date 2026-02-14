"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, ArrowLeft, Plus } from "lucide-react"
import { formatPeso, formatShortDate } from "@/lib/utils"
import { BUDGET_CATEGORY_LABELS } from "@/lib/constants"

type Allocation = {
  id: string
  category: string
  particulars: string
  allocatedAmount: string | number
}

type Transaction = {
  id: string
  type: string
  category: string
  particulars: string
  amount: string | number
  officialReceipt?: string | null
  transactionDate: string
  remarks?: string | null
  encodedBy?: { id: string; name: string } | null
}

type BudgetDetail = {
  id: string
  year: number
  totalBudget: string | number
  status: string
  approvedAt?: string | null
  allocations: Allocation[]
  transactions: Transaction[]
}

const CATEGORIES = Object.keys(BUDGET_CATEGORY_LABELS)

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<BudgetDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Allocation dialog
  const [alloOpen, setAlloOpen] = useState(false)
  const [alloCategory, setAlloCategory] = useState(CATEGORIES[0])
  const [alloParticulars, setAlloParticulars] = useState("")
  const [alloAmount, setAlloAmount] = useState("")
  const [alloSubmitting, setAlloSubmitting] = useState(false)

  // Transaction dialog
  const [txOpen, setTxOpen] = useState(false)
  const [txType, setTxType] = useState("EXPENSE")
  const [txCategory, setTxCategory] = useState(CATEGORIES[0])
  const [txParticulars, setTxParticulars] = useState("")
  const [txAmount, setTxAmount] = useState("")
  const [txDate, setTxDate] = useState("")
  const [txOR, setTxOR] = useState("")
  const [txRemarks, setTxRemarks] = useState("")
  const [txSubmitting, setTxSubmitting] = useState(false)

  async function fetchData() {
    const res = await fetch(`/api/budget/${id}`)
    if (!res.ok) {
      toast.error("Failed to load budget data")
      return
    }
    setData(await res.json())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData().finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddAllocation() {
    if (!alloParticulars || !alloAmount) return
    setAlloSubmitting(true)
    const res = await fetch(`/api/budget/${id}/allocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: alloCategory,
        particulars: alloParticulars,
        allocatedAmount: parseFloat(alloAmount),
      }),
    })
    setAlloSubmitting(false)
    if (!res.ok) {
      toast.error("Failed to add allocation")
      return
    }
    toast.success("Allocation added")
    setAlloOpen(false)
    setAlloParticulars("")
    setAlloAmount("")
    fetchData()
  }

  async function handleAddTransaction() {
    if (!txParticulars || !txAmount || !txDate) return
    setTxSubmitting(true)
    const res = await fetch(`/api/budget/${id}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: txType,
        category: txCategory,
        particulars: txParticulars,
        amount: parseFloat(txAmount),
        transactionDate: txDate,
        officialReceipt: txOR || null,
        remarks: txRemarks || null,
      }),
    })
    setTxSubmitting(false)
    if (!res.ok) {
      toast.error("Failed to add transaction")
      return
    }
    toast.success("Transaction recorded")
    setTxOpen(false)
    setTxParticulars("")
    setTxAmount("")
    setTxDate("")
    setTxOR("")
    setTxRemarks("")
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Budget year not found.</p>
      </div>
    )
  }

  const totalBudget = Number(data.totalBudget)
  const totalAllocated = data.allocations.reduce((s, a) => s + Number(a.allocatedAmount), 0)
  const totalIncome = data.transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = data.transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/budget")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Budget Year {data.year}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={data.status === "APPROVED" ? "default" : "outline"}>
              {data.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Total Budget: {formatPeso(totalBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-lg font-bold">{formatPeso(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Allocated</p>
            <p className="text-lg font-bold">{formatPeso(totalAllocated)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-lg font-bold text-green-600">{formatPeso(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-red-600">{formatPeso(totalExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Allocations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Budget Allocations</CardTitle>
          <Dialog open={alloOpen} onOpenChange={setAlloOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Add Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Allocation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={alloCategory} onValueChange={setAlloCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {BUDGET_CATEGORY_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Particulars *</label>
                  <Input
                    value={alloParticulars}
                    onChange={(e) => setAlloParticulars(e.target.value)}
                    placeholder="Salaries, Honorarium, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount (PHP) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={alloAmount}
                    onChange={(e) => setAlloAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddAllocation} disabled={alloSubmitting} className="w-full">
                  {alloSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Allocation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {data.allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No allocations yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.allocations.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {BUDGET_CATEGORY_LABELS[a.category] ?? a.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.particulars}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatPeso(Number(a.allocatedAmount))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">
                      Total Allocated
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatPeso(totalAllocated)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <Dialog open={txOpen} onOpenChange={setTxOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Type *</label>
                    <Select value={txType} onValueChange={setTxType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <Select value={txCategory} onValueChange={setTxCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {BUDGET_CATEGORY_LABELS[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Particulars *</label>
                  <Input
                    value={txParticulars}
                    onChange={(e) => setTxParticulars(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Amount (PHP) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Official Receipt No.</label>
                  <Input
                    value={txOR}
                    onChange={(e) => setTxOR(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Remarks</label>
                  <Textarea
                    value={txRemarks}
                    onChange={(e) => setTxRemarks(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
                <Button onClick={handleAddTransaction} disabled={txSubmitting} className="w-full">
                  {txSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {data.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Particulars</TableHead>
                    <TableHead>OR No.</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">
                        {formatShortDate(t.transactionDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.type === "INCOME" ? "default" : "destructive"}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {BUDGET_CATEGORY_LABELS[t.category] ?? t.category}
                      </TableCell>
                      <TableCell className="text-sm">{t.particulars}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {t.officialReceipt ?? "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          t.type === "INCOME" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "-"}{formatPeso(Number(t.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
