"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus, MapPin, Calendar } from "lucide-react"
import { formatPeso, formatShortDate } from "@/lib/utils"
import { PROJECT_STATUS_LABELS } from "@/lib/constants"

type Project = {
  id: string
  title: string
  description?: string | null
  category: string
  location?: string | null
  status: string
  startDate?: string | null
  targetEndDate?: string | null
  budget?: string | number | null
  fundSource?: string | null
  progressPercent: number
  beneficiaries?: number | null
  createdAt: string
  createdBy?: { id: string; name: string } | null
  _count: { updates: number }
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PLANNED: "outline",
  ONGOING: "secondary",
  COMPLETED: "default",
  SUSPENDED: "destructive",
  CANCELLED: "destructive",
}

const PROJECT_CATEGORIES = [
  "Infrastructure",
  "Health",
  "Education",
  "Livelihood",
  "Environment",
  "Peace & Order",
  "Social Services",
  "Youth Development",
  "Other",
]

export function ProjectList({ projects: initial }: { projects: Project[] }) {
  const router = useRouter()
  const [projects, setProjects] = useState(initial)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Infrastructure",
    location: "",
    startDate: "",
    targetEndDate: "",
    budget: "",
    fundSource: "",
    contractor: "",
    beneficiaries: "",
  })

  const filtered = filter === "all"
    ? projects
    : projects.filter((p) => p.status === filter)

  async function handleCreate() {
    if (!form.title || !form.category) {
      toast.error("Title and category are required")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        budget: form.budget ? parseFloat(form.budget) : null,
        beneficiaries: form.beneficiaries ? parseInt(form.beneficiaries) : null,
        description: form.description || null,
        location: form.location || null,
        startDate: form.startDate || null,
        targetEndDate: form.targetEndDate || null,
        fundSource: form.fundSource || null,
        contractor: form.contractor || null,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      toast.error("Failed to create project")
      return
    }
    toast.success("Project created")
    setDialogOpen(false)
    setForm({ title: "", description: "", category: "Infrastructure", location: "", startDate: "", targetEndDate: "", budget: "", fundSource: "", contractor: "", beneficiaries: "" })
    router.refresh()
    const listRes = await fetch("/api/projects")
    if (listRes.ok) setProjects(await listRes.json())
  }

  // Summary counts
  const counts = {
    PLANNED: projects.filter((p) => p.status === "PLANNED").length,
    ONGOING: projects.filter((p) => p.status === "ONGOING").length,
    COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Planned</p>
            <p className="text-2xl font-bold">{counts.PLANNED}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ongoing</p>
            <p className="text-2xl font-bold text-blue-600">{counts.ONGOING}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{counts.COMPLETED}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Target End Date</label>
                  <Input type="date" value={form.targetEndDate} onChange={(e) => setForm({ ...form, targetEndDate: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Budget (PHP)</label>
                  <Input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Fund Source</label>
                  <Input value={form.fundSource} onChange={(e) => setForm({ ...form, fundSource: e.target.value })} placeholder="GAD, SK Fund, etc." />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Contractor</label>
                  <Input value={form.contractor} onChange={(e) => setForm({ ...form, contractor: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Beneficiaries</label>
                  <Input type="number" value={form.beneficiaries} onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No projects found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:border-primary/50 transition-colors">
              <Link href={`/projects/${p.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{p.title}</CardTitle>
                    <Badge variant={STATUS_VARIANT[p.status] ?? "outline"} className="shrink-0">
                      {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">{p.category}</Badge>
                  {p.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </div>
                  )}
                  {/* Progress bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{p.progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${p.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {p.budget && <span>{formatPeso(Number(p.budget))}</span>}
                    {p.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatShortDate(p.startDate)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p._count.updates} update{p._count.updates !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
