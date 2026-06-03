"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  AYUDA_TYPE_LABELS,
  AYUDA_STATUS_LABELS,
  AYUDA_SOURCE_LABELS,
  AYUDA_DISTRIBUTION_STATUS_LABELS,
} from "@/lib/constants"
import { formatResidentName, formatShortDate, formatPeso } from "@/lib/utils"
import { AddBeneficiaryDialog } from "@/components/ayuda/add-beneficiary-dialog"

// ── Types ─────────────────────────────────────────────────────────────────────

type DistributionStatus = "PENDING" | "CLAIMED" | "UNCLAIMED" | "RETURNED"

interface Distribution {
  id: string
  ayudaProgramId: string
  residentId: string
  barangayId: string
  amount: string | null
  items: string | null
  quantity: string | null
  unit: string | null
  status: DistributionStatus
  claimedAt: Date | string | null
  claimedByName: string | null
  remarks: string | null
  encodedById: string | null
  createdAt: Date | string
  updatedAt: Date | string
  resident: {
    id: string
    firstName: string
    middleName?: string | null
    lastName: string
    suffix?: string | null
  }
  encodedBy?: { id: string; name: string } | null
}

interface AyudaProgramSerialized {
  id: string
  barangayId: string
  name: string
  type: string
  source: string
  description: string | null
  totalBudget: string | null
  status: string
  startDate: Date | string | null
  endDate: Date | string | null
  createdById: string | null
  createdAt: Date | string
  updatedAt: Date | string
  createdBy?: { id: string; name: string } | null
  distributions: Distribution[]
}

interface Props {
  program: AyudaProgramSerialized
  canEdit: boolean
  canDelete: boolean
  canManage: boolean
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PLANNED: "outline",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
}

const DIST_STATUS_ICON: Record<DistributionStatus, React.ElementType> = {
  PENDING: Clock,
  CLAIMED: CheckCircle2,
  UNCLAIMED: XCircle,
  RETURNED: RotateCcw,
}

const DIST_STATUS_COLOR: Record<DistributionStatus, string> = {
  PENDING: "text-yellow-600",
  CLAIMED: "text-green-600",
  UNCLAIMED: "text-red-500",
  RETURNED: "text-muted-foreground",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AyudaDetail({ program, canEdit, canDelete, canManage }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [distributions, setDistributions] = useState<Distribution[]>(
    program.distributions
  )
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Per-row state for status update
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  // Inline claimedByName editing when setting CLAIMED
  const [claimedByMap, setClaimedByMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    program.distributions.forEach((d) => {
      if (d.claimedByName) m[d.id] = d.claimedByName
    })
    return m
  })

  // Stats
  const total = distributions.length
  const claimed = distributions.filter((d) => d.status === "CLAIMED").length
  const pending = distributions.filter((d) => d.status === "PENDING").length
  const unclaimed = distributions.filter((d) => d.status === "UNCLAIMED").length
  const pct = total > 0 ? Math.round((claimed / total) * 100) : 0

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleStatusChange(distId: string, newStatus: DistributionStatus) {
    setUpdatingId(distId)
    try {
      const claimedByName =
        newStatus === "CLAIMED" ? (claimedByMap[distId] ?? null) : null
      const res = await fetch(
        `/api/ayuda/${program.id}/distributions/${distId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, claimedByName }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to update status")
        return
      }
      setDistributions((prev) =>
        prev.map((d) => (d.id === distId ? { ...d, ...data } : d))
      )
      toast.success("Status updated")
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRemoveBeneficiary(distId: string) {
    setUpdatingId(distId)
    try {
      const res = await fetch(
        `/api/ayuda/${program.id}/distributions/${distId}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to remove beneficiary")
        return
      }
      setDistributions((prev) => prev.filter((d) => d.id !== distId))
      toast.success("Beneficiary removed")
    } finally {
      setUpdatingId(null)
    }
  }

  function handleAdded(newDist: unknown) {
    setDistributions((prev) => [...prev, newDist as Distribution])
  }

  async function handleDeleteProgram() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/ayuda/${program.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to delete program")
        return
      }
      toast.success("Program deleted")
      startTransition(() => {
        router.push("/ayuda")
        router.refresh()
      })
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link href="/ayuda">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[program.status] ?? "outline"}>
              {AYUDA_STATUS_LABELS[program.status] ?? program.status}
            </Badge>
            <Badge variant="secondary">
              {AYUDA_TYPE_LABELS[program.type] ?? program.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {AYUDA_SOURCE_LABELS[program.source] ?? program.source}
            {program.totalBudget && ` · Budget: ${formatPeso(program.totalBudget)}`}
            {program.startDate &&
              ` · From ${formatShortDate(program.startDate as string)}`}
            {program.endDate &&
              ` to ${formatShortDate(program.endDate as string)}`}
          </p>
          {program.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {program.description}
            </p>
          )}
        </div>
        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/ayuda/${program.id}/edit`}>
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-green-600 uppercase tracking-wide">
              Claimed
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-green-600">{claimed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-yellow-600 uppercase tracking-wide">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-yellow-600">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-red-500 uppercase tracking-wide">
              Unclaimed
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-red-500">{unclaimed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Claim Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Distributions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Beneficiaries</CardTitle>
          {canManage && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Beneficiary
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {distributions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No beneficiaries yet.{" "}
              {canManage && (
                <button
                  type="button"
                  className="underline"
                  onClick={() => setAddOpen(true)}
                >
                  Add one
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Resident
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Amount / Items
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Claimed By
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Date
                    </th>
                    {(canManage || canEdit) && (
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((dist) => {
                    const Icon = DIST_STATUS_ICON[dist.status]
                    const colorClass = DIST_STATUS_COLOR[dist.status]
                    const isUpdating = updatingId === dist.id

                    return (
                      <tr
                        key={dist.id}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        {/* Resident */}
                        <td className="px-4 py-3 font-medium">
                          {formatResidentName(dist.resident)}
                        </td>

                        {/* Amount / Items */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <div>
                            {dist.amount && (
                              <span className="font-medium text-foreground">
                                {formatPeso(dist.amount)}
                              </span>
                            )}
                            {dist.items && (
                              <div className="text-xs">{dist.items}</div>
                            )}
                            {dist.quantity && (
                              <div className="text-xs">
                                {dist.quantity} {dist.unit ?? ""}
                              </div>
                            )}
                            {!dist.amount && !dist.items && !dist.quantity && (
                              <span className="text-xs text-muted-foreground/60">
                                —
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status dropdown */}
                        <td className="px-4 py-3">
                          {canEdit ? (
                            <div className="space-y-1">
                              <Select
                                value={dist.status}
                                onValueChange={(v) =>
                                  handleStatusChange(
                                    dist.id,
                                    v as DistributionStatus
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(
                                    AYUDA_DISTRIBUTION_STATUS_LABELS
                                  ).map(([v, l]) => (
                                    <SelectItem
                                      key={v}
                                      value={v}
                                      className="text-xs"
                                    >
                                      {l}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {/* Show claimedByName input when CLAIMED */}
                              {dist.status === "CLAIMED" && (
                                <Input
                                  className="h-6 text-xs w-32"
                                  placeholder="Received by..."
                                  value={claimedByMap[dist.id] ?? ""}
                                  onChange={(e) =>
                                    setClaimedByMap((prev) => ({
                                      ...prev,
                                      [dist.id]: e.target.value,
                                    }))
                                  }
                                  onBlur={() =>
                                    handleStatusChange(dist.id, "CLAIMED")
                                  }
                                />
                              )}
                            </div>
                          ) : (
                            <div
                              className={`flex items-center gap-1 ${colorClass}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                {AYUDA_DISTRIBUTION_STATUS_LABELS[dist.status]}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Claimed By */}
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {dist.claimedByName ?? "—"}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {dist.claimedAt
                            ? formatShortDate(dist.claimedAt as string)
                            : "—"}
                        </td>

                        {/* Actions */}
                        {(canManage || canEdit) && (
                          <td className="px-4 py-3 text-right">
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleRemoveBeneficiary(dist.id)
                                }
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta info */}
      <div className="text-xs text-muted-foreground">
        {program.createdBy && <span>Created by {program.createdBy.name}</span>}
      </div>

      {/* Add Beneficiary Dialog */}
      <AddBeneficiaryDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        programId={program.id}
        onAdded={handleAdded}
      />

      {/* Delete Program Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ayuda Program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{program.name}&quot; and all its{" "}
              {total} beneficiar{total === 1 ? "y" : "ies"}. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProgram}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
