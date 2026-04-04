"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { Loader2, MapPin } from "lucide-react"

export type BarangayOption = { id: string; label: string }

type Props = {
  /** Omit when loadBarangays is true (super admin: fetch /api/barangays). */
  barangayOptions?: BarangayOption[]
  /** When only one barangay, selection is fixed to this id. */
  fixedBarangayId?: string | null
  /** Fetch barangay list from API after mount. */
  loadBarangays?: boolean
  onSuccess?: () => void
}

type ApiBarangay = {
  id: string
  name: string
  municipality: { name: string }
}

export function AddPurokForm({
  barangayOptions: optionsProp,
  fixedBarangayId,
  loadBarangays,
  onSuccess,
}: Props) {
  const router = useRouter()
  const [fetched, setFetched] = useState<BarangayOption[]>([])
  const [fetching, setFetching] = useState(!!loadBarangays)
  const barangayOptions = loadBarangays ? fetched : (optionsProp ?? [])

  useEffect(() => {
    if (!loadBarangays) return
    let cancelled = false
    fetch("/api/barangays")
      .then((r) => r.json())
      .then((rows: ApiBarangay[]) => {
        if (cancelled || !Array.isArray(rows)) return
        setFetched(
          rows.map((b) => ({
            id: b.id,
            label: `${b.name} — ${b.municipality?.name ?? "—"}`,
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setFetched([])
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadBarangays])

  const [submitting, setSubmitting] = useState(false)
  const singleId =
    fixedBarangayId ??
    (barangayOptions.length === 1 ? barangayOptions[0]!.id : "")
  const [barangayId, setBarangayId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [order, setOrder] = useState("")

  const showBarangaySelect =
    !fixedBarangayId && barangayOptions.length > 1

  const firstOptionId = barangayOptions[0]?.id
  useEffect(() => {
    if (showBarangaySelect && firstOptionId && !barangayId) {
      setBarangayId(firstOptionId)
    }
  }, [showBarangaySelect, firstOptionId, barangayId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const bid = showBarangaySelect ? barangayId : singleId
    if (!bid) {
      toast.error("Select a barangay")
      return
    }
    if (!name.trim()) {
      toast.error("Enter a purok name")
      return
    }

    setSubmitting(true)
    const orderNum = order.trim() ? parseInt(order, 10) : undefined
    const res = await fetch("/api/puroks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barangayId: bid,
        name: name.trim(),
        description: description.trim() || null,
        ...(orderNum != null && !Number.isNaN(orderNum)
          ? { order: orderNum }
          : {}),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)

    if (!res.ok) {
      toast.error(
        typeof data.error === "string" ? data.error : "Could not create purok"
      )
      return
    }

    toast.success(`Purok "${data.name}" created`)
    setName("")
    setDescription("")
    setOrder("")
    onSuccess?.()
    router.refresh()
  }

  if (fetching) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading barangays…
      </div>
    )
  }

  if (barangayOptions.length === 0 && !fixedBarangayId) {
    return (
      <p className="text-muted-foreground text-sm">
        No barangay available. Create a barangay first.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showBarangaySelect ? (
        <div className="space-y-2">
          <Label>Barangay</Label>
          <Select value={barangayId} onValueChange={setBarangayId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select barangay" />
            </SelectTrigger>
            <SelectContent>
              {barangayOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="purok-name">Purok name</Label>
        <Input
          id="purok-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Purok 2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purok-desc">Description (optional)</Label>
        <Input
          id="purok-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short note"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purok-order">Sort order (optional)</Label>
        <Input
          id="purok-order"
          type="number"
          min={0}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Leave empty to append last"
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        Add purok
      </Button>
    </form>
  )
}
