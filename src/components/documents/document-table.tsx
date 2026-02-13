"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileDown,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { formatResidentName, formatShortDate } from "@/lib/utils"
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from "@/lib/constants"
import { toast } from "sonner"
import type { DocumentRequestWithResident } from "@/types"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  PROCESSING: "secondary",
  READY: "default",
  RELEASED: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
}

interface Props {
  documents: DocumentRequestWithResident[]
  page: number
  totalPages: number
  total: number
}

export function DocumentTable({ documents, page, totalPages, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      toast.success(`Status updated to ${DOCUMENT_STATUS_LABELS[status]}`)
      router.refresh()
    } else {
      toast.error("Failed to update status")
    }
  }

  async function generatePdf(id: string) {
    window.open(`/api/documents/${id}/generate`, "_blank")
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Control No.</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-mono text-xs">
                    {doc.controlNo}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatResidentName(doc.resident)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {DOCUMENT_TYPE_LABELS[doc.documentType] ??
                      doc.documentType}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm">
                    {doc.purpose}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[doc.status] ?? "outline"}>
                      {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatShortDate(doc.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => generatePdf(doc.id)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Generate PDF
                        </DropdownMenuItem>
                        {doc.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(doc.id, "PROCESSING")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Processing
                          </DropdownMenuItem>
                        )}
                        {doc.status === "PROCESSING" && (
                          <DropdownMenuItem
                            onClick={() => updateStatus(doc.id, "READY")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Ready
                          </DropdownMenuItem>
                        )}
                        {doc.status === "READY" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(doc.id, "RELEASED")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Released
                          </DropdownMenuItem>
                        )}
                        {(doc.status === "PENDING" ||
                          doc.status === "PROCESSING") && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(doc.id, "CANCELLED")
                            }
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    </div>
  )
}
