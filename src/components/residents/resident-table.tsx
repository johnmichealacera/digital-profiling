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
import { formatResidentName, computeAge } from "@/lib/utils"
import { CIVIL_STATUS_LABELS, SEX_LABELS } from "@/lib/constants"
import type { ResidentWithHousehold } from "@/types"

interface Props {
  residents: ResidentWithHousehold[]
  page: number
  totalPages: number
  total: number
}

export function ResidentTable({ residents, page, totalPages, total }: Props) {
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No residents found.
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
                <TableRow key={resident.id}>
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
    </div>
  )
}
