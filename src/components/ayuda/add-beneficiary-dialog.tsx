"use client"

import { useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import { Loader2, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatResidentName } from "@/lib/utils"

interface ResidentResult {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  householdId?: string | null
  household?: {
    id: string
    houseNo?: string | null
    purok?: { name: string } | null
  } | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId: string
  onAdded: (distribution: unknown) => void
}

export function AddBeneficiaryDialog({
  open,
  onOpenChange,
  programId,
  onAdded,
}: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ResidentResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<ResidentResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [amount, setAmount] = useState("")
  const [items, setItems] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [remarks, setRemarks] = useState("")

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (q.length < 2) {
      setResults([])
      return
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `/api/residents/search?q=${encodeURIComponent(q)}`
        )
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [])

  function handleSelect(resident: ResidentResult) {
    setSelected(resident)
    setQuery(formatResidentName(resident))
    setResults([])
  }

  function resetForm() {
    setQuery("")
    setResults([])
    setSelected(null)
    setAmount("")
    setItems("")
    setQuantity("")
    setUnit("")
    setRemarks("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) {
      toast.error("Please select a resident first.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ayuda/${programId}/distributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: selected.id,
          amount: amount ? Number(amount) : null,
          items: items || null,
          quantity: quantity ? Number(quantity) : null,
          unit: unit || null,
          remarks: remarks || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to add beneficiary")
        return
      }
      toast.success(`${formatResidentName(selected)} added as beneficiary`)
      onAdded(data)
      resetForm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose(open: boolean) {
    if (!open) resetForm()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Beneficiary
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resident search */}
          <div className="space-y-1.5">
            <Label>Search Resident *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9"
                placeholder="Type a name..."
                value={query}
                onChange={(e) => {
                  setSelected(null)
                  handleSearch(e.target.value)
                }}
                autoComplete="off"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {results.length > 0 && (
              <div className="border rounded-md shadow-sm bg-background max-h-48 overflow-y-auto z-10">
                {results.map((r) => {
                  const purok = r.household?.purok?.name
                  const houseNo = r.household?.houseNo
                  const sub = [houseNo, purok ? `Purok ${purok}` : null]
                    .filter(Boolean)
                    .join(", ")
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                      onClick={() => handleSelect(r)}
                    >
                      <div className="font-medium">{formatResidentName(r)}</div>
                      {sub && (
                        <div className="text-xs text-muted-foreground">{sub}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            {selected && (
              <p className="text-xs text-green-600 font-medium">
                Selected: {formatResidentName(selected)}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (&#8369;)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {/* Items */}
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="items">Items Description</Label>
              <Input
                id="items"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                placeholder="e.g. Rice, canned goods, medicines..."
              />
            </div>

            {/* Quantity + Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. kg, pcs, packs"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !selected}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Beneficiary
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
