"use client"

import Link from "next/link"
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
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { formatResidentName, formatShortDate } from "@/lib/utils"
import { BLOTTER_NATURE_LABELS, BLOTTER_STATUS_LABELS } from "@/lib/constants"
import type { Blotter, Resident, User } from "@/generated/prisma/client"

type BlotterRow = Blotter & {
  complainant: Pick<Resident, "id" | "firstName" | "lastName" | "suffix" | "middleName"> | null
  respondent: Pick<Resident, "id" | "firstName" | "lastName" | "suffix" | "middleName"> | null
  filedBy: Pick<User, "id" | "name"> | null
  _count: { hearings: number }
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  FILED: "outline",
  UNDER_MEDIATION: "secondary",
  SETTLED: "default",
  ESCALATED: "destructive",
  CLOSED: "default",
  WITHDRAWN: "secondary",
}

interface Props {
  blotters: BlotterRow[]
  page: number
  totalPages: number
  total: number
}

export function BlotterTable({ blotters, page, totalPages, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case No.</TableHead>
              <TableHead>Complainant</TableHead>
              <TableHead>Respondent</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blotters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No blotter records found.
                </TableCell>
              </TableRow>
            ) : (
              blotters.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">
                    {b.blotterNo}
                  </TableCell>
                  <TableCell>
                    {b.complainant
                      ? formatResidentName(b.complainant)
                      : b.complainantName ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    {b.respondent
                      ? formatResidentName(b.respondent)
                      : b.respondentName ?? "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {BLOTTER_NATURE_LABELS[b.nature] ?? b.nature}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[b.status] ?? "outline"}>
                      {BLOTTER_STATUS_LABELS[b.status] ?? b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatShortDate(b.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/blotter/${b.id}`}>
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
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
