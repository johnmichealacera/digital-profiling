"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, UserPlus } from "lucide-react"
import { formatResidentName } from "@/lib/utils"
import { RELATIONSHIPS_TO_HEAD } from "@/lib/constants"

type SearchResident = {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  householdId?: string | null
  household?: {
    id: string
    houseNo: string | null
    purok: { name: string }
  } | null
}

const RELATIONSHIP_OPTIONS = ["Member", ...RELATIONSHIPS_TO_HEAD]

export function AddHouseholdMemberDialog({
  householdId,
}: {
  householdId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResident[]>([])
  const [selected, setSelected] = useState<SearchResident | null>(null)
  const [relationship, setRelationship] = useState("Member")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      fetch(`/api/residents/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function resetDialog() {
    setQuery("")
    setResults([])
    setSelected(null)
    setRelationship("Member")
  }

  async function handleAdd() {
    if (!selected) return
    setSubmitting(true)
    const res = await fetch(`/api/households/${householdId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentId: selected.id,
        relationshipToHead: relationship === "Member" ? "Member" : relationship,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)
    if (!res.ok) {
      toast.error(data.error || "Failed to add member")
      return
    }
    toast.success(`${formatResidentName(selected)} added to household`)
    setOpen(false)
    resetDialog()
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          <Plus className="mr-1 h-3 w-3" />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add member to household
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Search for an existing resident in the barangay. They must not
            already belong to another household.
          </p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Search by name</label>
            <Input
              placeholder="Type at least 2 characters..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
              }}
            />
            {results.length > 0 && (
              <div className="mt-2 max-h-48 overflow-auto rounded-md border p-1">
                {results.map((r) => {
                  const inThisHousehold = r.householdId === householdId
                  const inOtherHousehold =
                    r.householdId != null && r.householdId !== householdId
                  const disabled = inThisHousehold || inOtherHousehold
                  const hhLabel = r.household
                    ? `House #${r.household.houseNo ?? "?"} · ${r.household.purok.name}`
                    : null
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={disabled}
                      className={`flex w-full flex-col items-start rounded px-2 py-2 text-left text-sm ${
                        disabled
                          ? "cursor-not-allowed opacity-60"
                          : "hover:bg-accent"
                      } ${selected?.id === r.id ? "bg-accent" : ""}`}
                      onClick={() => {
                        if (disabled) return
                        setSelected(r)
                        setQuery(formatResidentName(r))
                      }}
                    >
                      <span>{formatResidentName(r)}</span>
                      {inThisHousehold && (
                        <span className="text-xs text-muted-foreground">
                          Already in this household
                        </span>
                      )}
                      {inOtherHousehold && hhLabel && (
                        <span className="text-xs text-amber-600 dark:text-amber-500">
                          Other household: {hhLabel}
                        </span>
                      )}
                      {!r.householdId && (
                        <span className="text-xs text-muted-foreground">
                          No household assigned
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {selected && (
            <div>
              <label className="text-sm font-medium">Relationship to head</label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1001]">
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={!selected || submitting}
            onClick={handleAdd}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to household
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
