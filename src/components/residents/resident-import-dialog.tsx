"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react"

type ImportError = { row: number; messages: string[] }

type BarangayOption = { id: string; name: string }

export function ResidentImportDialog() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [barangays, setBarangays] = useState<BarangayOption[]>([])
  const [barangaysLoading, setBarangaysLoading] = useState(false)
  const [selectedBarangayId, setSelectedBarangayId] = useState("")
  const [lastImportResult, setLastImportResult] = useState<{
    created: number
    failed: number
    errors: ImportError[]
  } | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [showAllErrorRows, setShowAllErrorRows] = useState(false)

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
  const needsBarangaySelection =
    isSuperAdmin ||
    (!session?.user?.barangayId &&
      (session?.user?.municipalityId != null || session?.user?.role != null))

  function reset() {
    setFile(null)
    if (needsBarangaySelection) setSelectedBarangayId("")
    setLastImportResult(null)
    setShowErrorDetails(false)
    setShowAllErrorRows(false)
  }

  function prettifyImportMessage(message: string): string {
    return message
      .replace(/^possible duplicate:\s*/i, "Duplicate: ")
      .replace(/^duplicate within import file:\s*/i, "Duplicate in file: ")
      .replace("resident with same full name, birth date, and sex already exists", "same name, birth date, and sex already exists")
      .replace("seniorCitizenIdNo", "Senior Citizen ID No.")
      .replace("philhealthNo", "PhilHealth No.")
      .replace("sssNo", "SSS No.")
      .replace("pagibigNo", "Pag-IBIG No.")
      .replace("tinNo", "TIN")
      .replace("nationalIdNo", "National ID No.")
      .replace("voterIdNo", "Voter ID No.")
      .replace("pwdIdNo", "PWD ID No.")
      .replace("soloParentIdNo", "Solo Parent ID No.")
  }

  useEffect(() => {
    if (!open || !needsBarangaySelection) return
    let cancelled = false
    setBarangaysLoading(true)
    fetch("/api/barangays")
      .then((res) => res.json())
      .then(
        (
          data:
            | {
                id: string
                name: string
                municipality?: { name: string } | null
              }[]
            | { error?: string }
        ) => {
        if (cancelled) return
        if (Array.isArray(data)) {
          setBarangays(
            data.map((row) => ({
              id: row.id,
              name: row.municipality?.name
                ? `${row.municipality.name} — ${row.name}`
                : row.name,
            }))
          )
        } else {
          toast.error(data.error || "Could not load barangays")
          setBarangays([])
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Could not load barangays")
          setBarangays([])
        }
      })
      .finally(() => {
        if (!cancelled) setBarangaysLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, needsBarangaySelection])

  async function downloadTemplate() {
    const res = await fetch("/api/residents/import/template")
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Could not download template")
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resident-import-template.xlsx"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Template downloaded")
  }

  async function handleImport() {
    if (!file) {
      toast.error("Choose an Excel file first")
      return
    }
    const effectiveBarangayId =
      selectedBarangayId || (barangays.length === 1 ? barangays[0]!.id : "")
    if (needsBarangaySelection && !effectiveBarangayId) {
      toast.error("Select a barangay for this import")
      return
    }
    setSubmitting(true)
    const fd = new FormData()
    fd.set("file", file)
    const url =
      needsBarangaySelection && effectiveBarangayId
        ? `/api/residents/import?barangayId=${encodeURIComponent(effectiveBarangayId)}`
        : "/api/residents/import"
    const res = await fetch(url, { method: "POST", body: fd })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)

    if (!res.ok) {
      toast.error(data.error || "Import failed")
      return
    }

    const created = data.created as number
    const failed = data.failed as number
    const errors = (data.errors as ImportError[]) ?? []
    setLastImportResult({
      created: created ?? 0,
      failed: failed ?? 0,
      errors,
    })
    setShowErrorDetails(false)
    setShowAllErrorRows(false)

    if (created > 0) {
      toast.success(
        `Imported ${created} resident${created === 1 ? "" : "s"}${
          failed ? ` (${failed} row${failed === 1 ? "" : "s"} failed)` : ""
        }`
      )
    } else if (failed === 0) {
      toast.message("No data rows found (only headers or empty sheet).")
    }

    if (errors.length > 0) {
      toast.error(
        `${failed} row${failed === 1 ? "" : "s"} skipped. See details below.`,
        { duration: 6000 }
      )
    }

    if (created > 0) {
      setOpen(false)
      reset()
      router.refresh()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,640px)] min-h-0 w-full flex-col gap-0 overflow-hidden p-6 sm:max-w-md">
        <DialogHeader className="shrink-0 space-y-2 pr-8 pb-4 text-left">
          <DialogTitle>Import residents from Excel</DialogTitle>
          <DialogDescription>
            Use the template so column names match. The first sheet should be
            named <span className="font-medium">Residents</span> (or use the
            first sheet). Data starts on row 2.{" "}
            <span className="font-medium">household_house_no</span> and{" "}
            <span className="font-medium">household_purok_name</span> are
            optional. If provided, they must match an existing household.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-4">
          {needsBarangaySelection && (
            <div className="space-y-2">
              <Label htmlFor="import-barangay">Barangay</Label>
              <Select
                value={selectedBarangayId}
                onValueChange={setSelectedBarangayId}
                disabled={submitting || barangaysLoading || sessionStatus !== "authenticated"}
              >
                <SelectTrigger id="import-barangay" className="w-full">
                  <SelectValue
                    placeholder={
                      barangaysLoading ? "Loading barangays…" : "Select barangay"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Imports are scoped to the selected barangay.
              </p>
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start"
            onClick={downloadTemplate}
          >
            <Download className="mr-2 h-4 w-4 shrink-0" />
            Download template (.xlsx)
          </Button>
          <p className="text-muted-foreground text-xs">
            A matching sample file is also in{" "}
            <a
              href="/resident-import-sample.xlsx"
              className="text-primary underline-offset-4 hover:underline"
              download
            >
              /resident-import-sample.xlsx
            </a>
            . The generated template downloaded above now keeps household columns
            blank by default, so residents import as unassigned unless you
            intentionally fill household values.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Excel file</label>
            <Input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={submitting}
            />
          </div>
          <Button
            type="button"
            onClick={handleImport}
            disabled={
              submitting ||
              !file ||
              (needsBarangaySelection &&
                (!(selectedBarangayId || barangays.length === 1) || barangaysLoading))
            }
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import
          </Button>

          {lastImportResult && (
            <div className="flex min-h-0 flex-col space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Import Result</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Created: {lastImportResult.created}</Badge>
                  <Badge
                    variant={lastImportResult.failed > 0 ? "destructive" : "outline"}
                  >
                    Failed: {lastImportResult.failed}
                  </Badge>
                </div>
              </div>

              {lastImportResult.failed > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Duplicate/validation rows were skipped. Review details only if needed.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setShowErrorDetails((v) => !v)}
                  >
                    {showErrorDetails
                      ? "Hide error details"
                      : `Show error details (${lastImportResult.errors.length} rows)`}
                  </Button>

                  {showErrorDetails && (
                    <div className="flex min-h-0 flex-col gap-2">
                      <div className="flex shrink-0 items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          Showing{" "}
                          {showAllErrorRows
                            ? lastImportResult.errors.length
                            : Math.min(10, lastImportResult.errors.length)}{" "}
                          of {lastImportResult.errors.length} failed rows
                        </p>
                        {lastImportResult.errors.length > 10 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 shrink-0 px-2 text-xs"
                            onClick={() => setShowAllErrorRows((v) => !v)}
                          >
                            {showAllErrorRows ? "Show less" : "Show all"}
                          </Button>
                        )}
                      </div>

                      <div className="max-h-[min(11rem,26vh)] min-h-0 overflow-y-auto overflow-x-auto rounded border bg-muted/20">
                        <div className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2 border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          <span>Row</span>
                          <span>Issue</span>
                          <span>More</span>
                        </div>
                        {(showAllErrorRows
                          ? lastImportResult.errors
                          : lastImportResult.errors.slice(0, 10)
                        ).map((err) => {
                          const first = err.messages[0]
                          const remaining = err.messages.length - 1
                          return (
                            <div
                              key={`row-${err.row}`}
                              className="grid min-h-0 grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2 border-b px-3 py-2 text-xs last:border-b-0"
                            >
                              <p className="font-medium text-foreground">Row {err.row}</p>
                              <p
                                className="truncate text-muted-foreground"
                                title={prettifyImportMessage(first ?? "Validation error")}
                              >
                                {prettifyImportMessage(first ?? "Validation error")}
                              </p>
                              <span className="text-muted-foreground">
                                {remaining > 0 ? `+${remaining}` : "—"}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No row-level errors.</p>
              )}
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
