"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react"

type ImportError = { row: number; messages: string[] }

export function ResidentImportDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setFile(null)
  }

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
    setSubmitting(true)
    const fd = new FormData()
    fd.set("file", file)
    const res = await fetch("/api/residents/import", { method: "POST", body: fd })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)

    if (!res.ok) {
      toast.error(data.error || "Import failed")
      return
    }

    const created = data.created as number
    const failed = data.failed as number
    const errors = (data.errors as ImportError[]) ?? []

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
      const preview = errors
        .slice(0, 5)
        .map((e) => `Row ${e.row}: ${e.messages.join("; ")}`)
        .join("\n")
      toast.error(
        errors.length > 5
          ? `${preview}\n… and ${errors.length - 5} more`
          : preview,
        { duration: 12_000 }
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import residents from Excel</DialogTitle>
          <DialogDescription>
            Use the template so column names match. The first sheet should be
            named <span className="font-medium">Residents</span> (or use the
            first sheet). Data starts on row 2.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
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
            .
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
            disabled={submitting || !file}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
