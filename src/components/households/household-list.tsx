"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Search,
  Users,
} from "lucide-react"
import { useState, useCallback } from "react"
import type { Purok, Household, Resident } from "@/generated/prisma/client"

type HouseholdWithRelations = Household & {
  purok: Purok
  residents: Pick<Resident, "id" | "firstName" | "lastName" | "suffix" | "isHouseholdHead">[]
  _count: { residents: number }
}

interface Props {
  households: HouseholdWithRelations[]
  puroks: Purok[]
  page: number
  totalPages: number
  total: number
}

export function HouseholdList({
  households,
  puroks,
  page,
  totalPages,
  total,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value) current.set(key, value)
        else current.delete(key)
      }
      current.delete("page")
      return current.toString()
    },
    [searchParams]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`${pathname}?${createQueryString({ search })}`)
  }

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by house no. or street..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <Select
          value={searchParams.get("purokId") || "all"}
          onValueChange={(v) =>
            router.push(
              `${pathname}?${createQueryString({ purokId: v === "all" ? "" : v })}`
            )
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Purok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Puroks</SelectItem>
            {puroks.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {households.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            No households found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {households.map((hh) => {
            const head = hh.residents.find((r) => r.isHouseholdHead)
            return (
              <Link key={hh.id} href={`/households/${hh.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        <Home className="mr-2 inline h-4 w-4" />
                        House #{hh.houseNo ?? "N/A"}
                      </CardTitle>
                      <Badge variant="outline">{hh.purok.name}</Badge>
                    </div>
                    {hh.streetSitio && (
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hh.streetSitio}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {hh._count.residents} member
                        {hh._count.residents !== 1 ? "s" : ""}
                      </div>
                      {head && (
                        <span className="text-xs text-muted-foreground">
                          Head: {head.firstName} {head.lastName}
                          {head.suffix ? ` ${head.suffix}` : ""}
                        </span>
                      )}
                    </div>
                    {hh.is4PsBeneficiary && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        4Ps Beneficiary
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

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
