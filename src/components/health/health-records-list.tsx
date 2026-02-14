"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
import { Loader2, Plus, Search, ChevronLeft, ChevronRight, HeartPulse, Baby, Eye, UserCheck } from "lucide-react"
import { formatResidentName, formatShortDate, computeAge } from "@/lib/utils"

const HEALTH_CATEGORY_LABELS: Record<string, string> = {
  SENIOR_CITIZEN: "Senior Citizen",
  PWD: "PWD",
  PREGNANT: "Pregnant",
  LACTATING: "Lactating",
  CHILD_0_TO_5: "Child (0-5)",
  MALNOURISHED: "Malnourished",
  HYPERTENSIVE: "Hypertensive",
  DIABETIC: "Diabetic",
}

const CATEGORY_ICONS: Record<string, typeof HeartPulse> = {
  SENIOR_CITIZEN: UserCheck,
  PWD: Eye,
  PREGNANT: Baby,
}

type SearchResult = {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
}

type HealthRecord = {
  id: string
  category: string
  seniorCategory?: string | null
  disabilityType?: string | null
  weightKg?: string | number | null
  heightCm?: string | number | null
  nutritionalStatus?: string | null
  notes?: string | null
  createdAt: string
  resident: {
    id: string
    firstName: string
    middleName?: string | null
    lastName: string
    suffix?: string | null
    dateOfBirth: string
    sex: string
  }
}

interface Props {
  summary: Record<string, number>
}

export function HealthRecordsList({ summary }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [records, setRecords] = useState<HealthRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const page = parseInt(searchParams.get("page") || "1")
  const category = searchParams.get("category") || ""
  const [search, setSearch] = useState(searchParams.get("search") || "")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [residentQuery, setResidentQuery] = useState("")
  const [residentResults, setResidentResults] = useState<SearchResult[]>([])
  const [selectedResident, setSelectedResident] = useState<SearchResult | null>(null)
  const [formCategory, setFormCategory] = useState("SENIOR_CITIZEN")
  const [formNotes, setFormNotes] = useState("")
  const [formWeight, setFormWeight] = useState("")
  const [formHeight, setFormHeight] = useState("")
  const [formDisabilityType, setFormDisabilityType] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (searchParams.get("search")) params.set("search", searchParams.get("search")!)
    params.set("page", String(page))
    const res = await fetch(`/api/health?${params}`)
    if (res.ok) {
      const data = await res.json()
      setRecords(data.records)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }
    setLoading(false)
  }, [category, page, searchParams])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Resident search for form
  useEffect(() => {
    if (residentQuery.length < 2) { setResidentResults([]); return }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/residents/search?q=${encodeURIComponent(residentQuery)}`)
      if (res.ok) setResidentResults(await res.json())
    }, 300)
    return () => clearTimeout(timeout)
  }, [residentQuery])

  function updateParams(params: Record<string, string>) {
    const current = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(params)) {
      if (value) current.set(key, value)
      else current.delete(key)
    }
    current.delete("page")
    router.push(`${pathname}?${current}`)
  }

  async function handleCreate() {
    if (!selectedResident) {
      toast.error("Please select a resident")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentId: selectedResident.id,
        category: formCategory,
        notes: formNotes || null,
        weightKg: formWeight ? parseFloat(formWeight) : null,
        heightCm: formHeight ? parseFloat(formHeight) : null,
        disabilityType: formDisabilityType || null,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      toast.error("Failed to create record")
      return
    }
    toast.success("Health record created")
    setDialogOpen(false)
    setSelectedResident(null)
    setResidentQuery("")
    setFormNotes("")
    setFormWeight("")
    setFormHeight("")
    setFormDisabilityType("")
    fetchRecords()
  }

  const totalRecords = Object.values(summary).reduce((s, c) => s + c, 0)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {Object.entries(HEALTH_CATEGORY_LABELS).slice(0, 4).map(([key, label]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{summary[key] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); updateParams({ search }) }}
          className="flex flex-1 gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by resident name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <Select
          value={category || "all"}
          onValueChange={(v) => updateParams({ category: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(HEALTH_CATEGORY_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Health Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Resident search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Resident *</label>
                <div className="relative">
                  <Input
                    placeholder="Search resident..."
                    value={residentQuery}
                    onChange={(e) => {
                      setResidentQuery(e.target.value)
                      if (selectedResident) setSelectedResident(null)
                    }}
                  />
                  {residentResults.length > 0 && !selectedResident && (
                    <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-popover shadow-md">
                      {residentResults.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                          onClick={() => {
                            setSelectedResident(r)
                            setResidentQuery(formatResidentName(r))
                            setResidentResults([])
                          }}
                        >
                          {formatResidentName(r)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedResident && (
                  <p className="text-xs text-emerald-600">Selected: {formatResidentName(selectedResident)}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(HEALTH_CATEGORY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formCategory === "PWD" && (
                <div>
                  <label className="text-sm font-medium">Disability Type</label>
                  <Input
                    value={formDisabilityType}
                    onChange={(e) => setFormDisabilityType(e.target.value)}
                    placeholder="Visual, Hearing, etc."
                  />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input type="number" step="0.1" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Height (cm)</label>
                  <Input type="number" step="0.1" value={formHeight} onChange={(e) => setFormHeight(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>

              <Button onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Records Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No health records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {formatResidentName(r.resident)}
                  </TableCell>
                  <TableCell>{computeAge(new Date(r.resident.dateOfBirth))}</TableCell>
                  <TableCell>{r.resident.sex}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {HEALTH_CATEGORY_LABELS[r.category] ?? r.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {r.disabilityType || r.nutritionalStatus || r.notes || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatShortDate(r.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
