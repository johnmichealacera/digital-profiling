"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useCallback, useState } from "react"
import { BLOTTER_STATUS_LABELS } from "@/lib/constants"

export function BlotterFilters() {
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

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <form onSubmit={handleSearch} className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by case no. or name..."
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
        value={searchParams.get("status") || "all"}
        onValueChange={(v) =>
          router.push(
            `${pathname}?${createQueryString({ status: v === "all" ? "" : v })}`
          )
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(BLOTTER_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("")
            router.push(pathname)
          }}
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
