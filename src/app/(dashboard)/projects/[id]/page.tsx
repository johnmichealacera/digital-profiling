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
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Plus } from "lucide-react"
import { formatPeso, formatDate, formatShortDate } from "@/lib/utils"
import { PROJECT_STATUS_LABELS } from "@/lib/constants"

type ProjectDetail = {
  id: string
  title: string
  description?: string | null
  category: string
  location?: string | null
  status: string
  startDate?: string | null
  targetEndDate?: string | null
  actualEndDate?: string | null
  budget?: string | number | null
  fundSource?: string | null
  contractor?: string | null
  progressPercent: number
  beneficiaries?: number | null
  createdAt: string
  createdBy?: { id: string; name: string } | null
  updates: {
    id: string
    updateDate: string
    narrative: string
    progressPercent?: number | null
  }[]
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PLANNED: "outline",
  ONGOING: "secondary",
  COMPLETED: "default",
  SUSPENDED: "destructive",
  CANCELLED: "destructive",
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Status update
  const [newStatus, setNewStatus] = useState("")
  const [updating, setUpdating] = useState(false)

  // Add update
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateNarrative, setUpdateNarrative] = useState("")
  const [updateProgress, setUpdateProgress] = useState("")
  const [addingUpdate, setAddingUpdate] = useState(false)

  async function fetchProject() {
    const res = await fetch(`/api/projects/${id}`)
    if (!res.ok) {
      toast.error("Failed to load project")
      return
    }
    const data = await res.json()
    setProject(data)
    setNewStatus(data.status)
  }

  useEffect(() => {
    fetchProject().finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusUpdate() {
    if (!newStatus || newStatus === project?.status) return
    setUpdating(true)
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdating(false)
    if (!res.ok) {
      toast.error("Failed to update status")
      return
    }
    toast.success("Status updated")
    fetchProject()
  }

  async function handleAddUpdate() {
    if (!updateNarrative) return
    setAddingUpdate(true)
    const res = await fetch(`/api/projects/${id}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        narrative: updateNarrative,
        progressPercent: updateProgress ? parseInt(updateProgress) : null,
      }),
    })
    setAddingUpdate(false)
    if (!res.ok) {
      toast.error("Failed to add update")
      return
    }
    toast.success("Update added")
    setShowUpdateForm(false)
    setUpdateNarrative("")
    setUpdateProgress("")
    fetchProject()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={STATUS_VARIANT[project.status] ?? "outline"}>
              {PROJECT_STATUS_LABELS[project.status] ?? project.status}
            </Badge>
            <Badge variant="outline">{project.category}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{project.progressPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-3 rounded-full bg-primary transition-all"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {project.location && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm">{project.location}</p>
                  </div>
                )}
                {project.fundSource && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fund Source</p>
                    <p className="text-sm">{project.fundSource}</p>
                  </div>
                )}
                {project.budget && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                    <p className="text-sm font-semibold">{formatPeso(Number(project.budget))}</p>
                  </div>
                )}
                {project.contractor && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contractor</p>
                    <p className="text-sm">{project.contractor}</p>
                  </div>
                )}
                {project.beneficiaries && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Beneficiaries</p>
                    <p className="text-sm">{project.beneficiaries.toLocaleString()}</p>
                  </div>
                )}
                {project.startDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-sm">{formatDate(project.startDate)}</p>
                  </div>
                )}
                {project.targetEndDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target End Date</p>
                    <p className="text-sm">{formatDate(project.targetEndDate)}</p>
                  </div>
                )}
                {project.actualEndDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Actual End Date</p>
                    <p className="text-sm">{formatDate(project.actualEndDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Updates Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Progress Updates</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowUpdateForm(!showUpdateForm)}>
                <Plus className="mr-1 h-4 w-4" /> Add Update
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showUpdateForm && (
                <div className="space-y-3 rounded-md border p-4">
                  <div>
                    <label className="text-sm font-medium">Narrative *</label>
                    <Textarea
                      value={updateNarrative}
                      onChange={(e) => setUpdateNarrative(e.target.value)}
                      placeholder="Describe the progress..."
                    />
                  </div>
                  <div className="max-w-[200px]">
                    <label className="text-sm font-medium">Progress (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={updateProgress}
                      onChange={(e) => setUpdateProgress(e.target.value)}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={addingUpdate || !updateNarrative} onClick={handleAddUpdate}>
                      {addingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Update
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowUpdateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {project.updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                <div className="space-y-3">
                  {project.updates.map((u) => (
                    <div key={u.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold">
                          {formatShortDate(u.updateDate)}
                        </p>
                        {u.progressPercent != null && (
                          <Badge variant="secondary">{u.progressPercent}%</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{u.narrative}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={updating || newStatus === project.status}
                onClick={handleStatusUpdate}
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatShortDate(project.createdAt)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updates</span>
                <span>{project.updates.length}</span>
              </div>
              {project.createdBy && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by</span>
                    <span>{project.createdBy.name}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
