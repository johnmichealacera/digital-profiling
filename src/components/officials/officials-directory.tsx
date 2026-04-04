"use client"

import { useState } from "react"
import Image from "next/image"
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
import { Loader2, Plus, Phone, Pencil, Trash2, User, Upload, X } from "lucide-react"
import { formatResidentName, formatShortDate } from "@/lib/utils"
import {
  isCloudinaryBrowserUploadConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary-upload"
import {
  bucketOfficialsByLayoutTier,
  segmentOfficialsByBarangay,
  sortOfficialsByHierarchy,
} from "@/lib/official-rank"

const OFFICIAL_POSITIONS = [
  "Punong Barangay",
  "Barangay Captain",
  "Barangay Secretary",
  "Barangay Treasurer",
  "Barangay Kagawad",
  "SK Chairperson",
  "SK Chairman",
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
  photoUrl?: string | null
  barangay?: { name: string }
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
  photoUrl: "",
}

export function OfficialsDirectory({
  officials: initialOfficials,
  showBarangayLabel = false,
}: {
  officials: Official[]
  showBarangayLabel?: boolean
}) {
  const router = useRouter()
  const [officials, setOfficials] = useState(initialOfficials)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const incumbent = officials.filter((o) => o.isIncumbent)
  const past = officials.filter((o) => !o.isIncumbent)

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
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
      photoUrl: o.photoUrl ?? "",
    })
    setDialogOpen(true)
  }

  async function handlePhotoFile(file: File) {
    setUploadingPhoto(true)
    try {
      if (isCloudinaryBrowserUploadConfigured()) {
        const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL ?? ""
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ""
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? ""
        const result = await uploadToCloudinary(file, {
          cloudinaryUrl,
          uploadPreset,
          apiKey,
        })
        setForm((prev) => ({ ...prev, photoUrl: result.url }))
        toast.success("Photo uploaded")
        return
      }

      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Upload failed"
        )
        return
      }
      if (typeof data.url === "string") {
        setForm((prev) => ({ ...prev, photoUrl: data.url }))
        toast.success("Photo uploaded")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploadingPhoto(false)
    }
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
      photoUrl: form.photoUrl?.trim() || null,
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

  function renderOfficialCard(
    o: Official,
    opts?: { prominent?: boolean; compact?: boolean }
  ) {
    const prominent = opts?.prominent ?? false
    const compact = opts?.compact ?? false
    const avatarClass = prominent
      ? "h-[4.5rem] w-[4.5rem]"
      : compact
        ? "h-12 w-12"
        : "h-14 w-14"
    const imgSizes = prominent ? "72px" : compact ? "48px" : "56px"
    const iconClass = prominent ? "h-9 w-9" : compact ? "h-6 w-6" : "h-7 w-7"

    return (
      <Card
        key={o.id}
        className={
          prominent
            ? "border-primary/25 bg-primary/[0.03] shadow-sm"
            : undefined
        }
      >
        <CardContent className="flex items-start gap-4 p-4">
          <div
            className={`relative shrink-0 overflow-hidden rounded-full border bg-muted ${avatarClass}`}
          >
            {o.photoUrl ? (
              <Image
                src={o.photoUrl}
                alt=""
                fill
                className="object-cover"
                sizes={imgSizes}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10">
                <User className={`${iconClass} text-primary`} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={
                prominent ? "text-lg font-semibold" : "font-semibold"
              }
            >
              {formatResidentName(o)}
            </p>
            <p className="text-sm text-primary">{o.position}</p>
            {showBarangayLabel && o.barangay?.name ? (
              <p className="text-xs text-muted-foreground">
                Brgy. {o.barangay.name}
              </p>
            ) : null}
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

  function renderHierarchyForList(list: Official[]) {
    const segments = segmentOfficialsByBarangay(list)
    const showBarangayHeading = segments.length > 1

    return segments.map((segment, segIdx) => {
      const tiers = bucketOfficialsByLayoutTier(
        sortOfficialsByHierarchy(segment)
      )
      const brgyName = segment[0]?.barangay?.name

      return (
        <div key={segIdx} className="space-y-8">
          {showBarangayHeading && brgyName ? (
            <div className="border-b pb-2">
              <h3 className="text-base font-semibold tracking-tight">
                Brgy. {brgyName}
              </h3>
              <p className="text-muted-foreground text-xs">
                Officials listed by role (captain through SK).
              </p>
            </div>
          ) : null}
          <div className="space-y-8">
            {tiers.map((section) => (
              <div key={section.tierRank} className="space-y-3">
                <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {section.title}
                </h4>
                {section.layout === "full" ? (
                  <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {section.members.map((o) =>
                      renderOfficialCard(o, {
                        prominent: section.tierRank === 0,
                      })
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {section.members.map((o) =>
                      renderOfficialCard(o, { compact: true })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    })
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
                    {form.photoUrl ? (
                      <Image
                        src={form.photoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={uploadingPhoto}
                      onClick={() =>
                        document.getElementById("official-photo-input")?.click()
                      }
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </Button>
                    {form.photoUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateField("photoUrl", "")}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <input
                    id="official-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ""
                      if (f) void handlePhotoFile(f)
                    }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Browser upload uses{" "}
                  <code className="rounded bg-muted px-1">
                    NEXT_PUBLIC_CLOUDINARY_URL
                  </code>
                  ,{" "}
                  <code className="rounded bg-muted px-1">
                    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                  </code>
                  , and{" "}
                  <code className="rounded bg-muted px-1">
                    NEXT_PUBLIC_CLOUDINARY_API_KEY
                  </code>
                  . If those are unset, the app falls back to the server route (
                  <code className="rounded bg-muted px-1">CLOUDINARY_*</code>
                  ).
                </p>
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
        <h2 className="mb-4 text-lg font-semibold">
          Current Officials
          <Badge variant="secondary" className="ml-2">
            {incumbent.length}
          </Badge>
        </h2>
        {incumbent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No incumbent officials.</p>
        ) : (
          renderHierarchyForList(incumbent)
        )}
      </div>

      {/* Past Officials */}
      {past.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Past Officials
            <Badge variant="outline" className="ml-2">
              {past.length}
            </Badge>
          </h2>
          {renderHierarchyForList(past)}
        </div>
      )}
    </div>
  )
}
