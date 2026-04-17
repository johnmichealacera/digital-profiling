"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Eye, Loader2, Trash2 } from "lucide-react"
import { formatResidentName, computeAge } from "@/lib/utils"
import { CIVIL_STATUS_LABELS, SEX_LABELS } from "@/lib/constants"
import type { ResidentWithHouseholdClient } from "@/types"

interface Props {
  residents: ResidentWithHouseholdClient[]
  page: number
  totalPages: number
  total: number
  canBulkDelete?: boolean
}

export function ResidentTable({
  residents,
  page,
  totalPages,
  total,
  canBulkDelete = false,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const currentIds = useMemo(() => residents.map((r) => r.id), [residents])
  const selectedOnPage = useMemo(
    () => selectedIds.filter((id) => currentIds.includes(id)),
    [selectedIds, currentIds]
  )
  const allSelectedOnPage =
    currentIds.length > 0 && selectedOnPage.length === currentIds.length
  const someSelectedOnPage =
    selectedOnPage.length > 0 && selectedOnPage.length < currentIds.length

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    )
  }

  function toggleSelectAllOnPage(checked: boolean) {
    setSelectedIds((prev) => {
      if (!checked) return prev.filter((id) => !currentIds.includes(id))
      return Array.from(new Set([...prev, ...currentIds]))
    })
  }

  async function handleBulkDelete() {
    if (selectedOnPage.length === 0) {
      toast.error("Select at least one resident")
      return
    }
    if (!password) {
      toast.error("Password is required")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/residents/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentIds: selectedOnPage,
        password,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)
    if (!res.ok) {
      toast.error(data.error || "Bulk delete failed")
      return
    }
    toast.success(
      `Deleted ${data.deletedCount ?? selectedOnPage.length} resident${
        (data.deletedCount ?? selectedOnPage.length) === 1 ? "" : "s"
      }`
    )
    setSelectedIds((prev) => prev.filter((id) => !selectedOnPage.includes(id)))
    setConfirmOpen(false)
    setPassword("")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {canBulkDelete && (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
          <p className="text-sm text-muted-foreground">
            {selectedOnPage.length} selected on this page
          </p>
          <Button
            variant="destructive"
            size="sm"
            disabled={selectedOnPage.length === 0}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {canBulkDelete && (
                <TableHead className="w-[42px]">
                  <Checkbox
                    checked={allSelectedOnPage ? true : someSelectedOnPage ? "indeterminate" : false}
                    onCheckedChange={(v) => toggleSelectAllOnPage(v === true)}
                    aria-label="Select all residents on page"
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Civil Status</TableHead>
              <TableHead>Purok</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canBulkDelete ? 8 : 7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No residents found.
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
                <TableRow key={resident.id}>
                  {canBulkDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(resident.id)}
                        onCheckedChange={(v) =>
                          toggleSelect(resident.id, v === true)
                        }
                        aria-label={`Select ${formatResidentName(resident)}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <Link
                      href={`/residents/${resident.id}`}
                      className="hover:underline"
                    >
                      {formatResidentName(resident)}
                    </Link>
                    {resident.isHouseholdHead && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Head
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{SEX_LABELS[resident.sex]}</TableCell>
                  <TableCell>{computeAge(resident.dateOfBirth)}</TableCell>
                  <TableCell>
                    {CIVIL_STATUS_LABELS[resident.civilStatus]}
                  </TableCell>
                  <TableCell>
                    {resident.household?.purok.name ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resident.isSeniorCitizen && (
                        <Badge variant="secondary" className="text-xs">
                          Senior
                        </Badge>
                      )}
                      {resident.isPwd && (
                        <Badge variant="secondary" className="text-xs">
                          PWD
                        </Badge>
                      )}
                      {resident.is4PsBeneficiary && (
                        <Badge variant="secondary" className="text-xs">
                          4Ps
                        </Badge>
                      )}
                      {resident.isSoloParent && (
                        <Badge variant="secondary" className="text-xs">
                          Solo Parent
                        </Badge>
                      )}
                      {resident.isOFW && (
                        <Badge variant="secondary" className="text-xs">
                          OFW
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/residents/${resident.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of{" "}
            {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm bulk delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will mark <span className="font-medium">{selectedOnPage.length}</span>{" "}
              resident{selectedOnPage.length === 1 ? "" : "s"} as inactive.
              Enter your password to continue.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                disabled={submitting}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false)
                  setPassword("")
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={submitting || !password || selectedOnPage.length === 0}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
