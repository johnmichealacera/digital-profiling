"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Phone, Pencil, Trash2, User } from "lucide-react"
import { formatResidentName, formatShortDate } from "@/lib/utils"

const OFFICIAL_POSITIONS = [
  "Punong Barangay",
  "Barangay Kagawad",
  "Barangay Secretary",
  "Barangay Treasurer",
  "SK Chairperson",
  "SK Kagawad",
  "SK Secretary",
  "SK Treasurer",
]

type Official = {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  suffix?: string | null
  position: string
  committee?: string | null
  termStart: string
  termEnd: string
  isIncumbent: boolean
  contactNo?: string | null
}

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  position: "Barangay Kagawad",
  committee: "",
  termStart: "",
  termEnd: "",
  isIncumbent: true,
  contactNo: "",
}

export function OfficialsDirectory({ officials: initialOfficials }: { officials: Official[] }) {
  const router = useRouter()
  const [officials, setOfficials] = useState(initialOfficials)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const incumbent = officials.filter((o) => o.isIncumbent)
  const past = officials.filter((o) => !o.isIncumbent)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(o: Official) {
    setEditingId(o.id)
    setForm({
      firstName: o.firstName,
      middleName: o.middleName ?? "",
      lastName: o.lastName,
      suffix: o.suffix ?? "",
      position: o.position,
      committee: o.committee ?? "",
      termStart: o.termStart.slice(0, 10),
      termEnd: o.termEnd.slice(0, 10),
      isIncumbent: o.isIncumbent,
      contactNo: o.contactNo ?? "",
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.termStart || !form.termEnd) {
      toast.error("Please fill in required fields")
      return
    }
    setSubmitting(true)
    const payload = {
      ...form,
      middleName: form.middleName || null,
      suffix: form.suffix || null,
      committee: form.committee || null,
      contactNo: form.contactNo || null,
    }

    const res = editingId
      ? await fetch(`/api/officials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/officials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

    setSubmitting(false)
    if (!res.ok) {
      toast.error("Failed to save official")
      return
    }
    toast.success(editingId ? "Official updated" : "Official added")
    setDialogOpen(false)
    router.refresh()
    // Re-fetch
    const listRes = await fetch("/api/officials")
    if (listRes.ok) setOfficials(await listRes.json())
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this official?")) return
    const res = await fetch(`/api/officials/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to delete")
      return
    }
    toast.success("Official removed")
    setOfficials((prev) => prev.filter((o) => o.id !== id))
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function renderOfficialCard(o: Official) {
    return (
      <Card key={o.id}>
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{formatResidentName(o)}</p>
            <p className="text-sm text-primary">{o.position}</p>
            {o.committee && (
              <p className="text-xs text-muted-foreground">Committee: {o.committee}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                Term: {formatShortDate(o.termStart)} – {formatShortDate(o.termEnd)}
              </span>
              {o.contactNo && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {o.contactNo}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(o)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Official
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Official" : "Add Official"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Middle Name</label>
                  <Input value={form.middleName} onChange={(e) => updateField("middleName", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Suffix</label>
                  <Input value={form.suffix} onChange={(e) => updateField("suffix", e.target.value)} placeholder="Jr., Sr., III" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Position *</label>
                  <Select value={form.position} onValueChange={(v) => updateField("position", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OFFICIAL_POSITIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Committee</label>
                  <Input value={form.committee} onChange={(e) => updateField("committee", e.target.value)} placeholder="Peace & Order" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Term Start *</label>
                  <Input type="date" value={form.termStart} onChange={(e) => updateField("termStart", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Term End *</label>
                  <Input type="date" value={form.termEnd} onChange={(e) => updateField("termEnd", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Contact No.</label>
                  <Input value={form.contactNo} onChange={(e) => updateField("contactNo", e.target.value)} placeholder="09XX-XXX-XXXX" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isIncumbent}
                      onChange={(e) => updateField("isIncumbent", e.target.checked)}
                      className="h-4 w-4"
                    />
                    Currently Incumbent
                  </label>
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Official"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Incumbent Officials */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Current Officials
          <Badge variant="secondary" className="ml-2">{incumbent.length}</Badge>
        </h2>
        {incumbent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No incumbent officials.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incumbent.map(renderOfficialCard)}
          </div>
        )}
      </div>

      {/* Past Officials */}
      {past.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Past Officials
            <Badge variant="outline" className="ml-2">{past.length}</Badge>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {past.map(renderOfficialCard)}
          </div>
        </div>
      )}
    </div>
  )
}
