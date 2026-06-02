"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Camera, Loader2, Trash2, Upload, UserCircle } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"

interface Props {
  residentId: string
  residentName: string
  initials: string
  photoUrl: string | null
}

export function ResidentPhotoUpload({
  residentId,
  residentName,
  initials,
  photoUrl: initialPhotoUrl,
}: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleCancel() {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    try {
      const { url } = await uploadToCloudinary(selectedFile, {
        cloudinaryUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL ?? "",
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? "",
      })

      const res = await fetch(`/api/residents/${residentId}/photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to save photo")
        return
      }
      toast.success("Profile photo updated")
      setPhotoUrl(url)
      setPreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      router.refresh()
    } catch {
      toast.error("Failed to upload photo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    const res = await fetch(`/api/residents/${residentId}/photo`, {
      method: "DELETE",
    })
    setRemoving(false)
    if (!res.ok) {
      toast.error("Failed to remove photo")
      return
    }
    toast.success("Profile photo removed")
    setPhotoUrl(null)
    router.refresh()
  }

  const displayPhoto = preview ?? photoUrl

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleCancel()
        setOpen(o)
      }}
    >
      {/* Trigger: the avatar itself with a camera overlay */}
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Change profile photo"
        >
          <Avatar className="h-20 w-20 ring-2 ring-border">
            {displayPhoto && (
              <AvatarImage
                src={displayPhoto}
                alt={residentName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Preview avatar */}
          <div className="relative group">
            <Avatar className="h-28 w-28 ring-2 ring-border">
              {displayPhoto && (
                <AvatarImage
                  src={displayPhoto}
                  alt={residentName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-3xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Upload className="h-6 w-6 text-white" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          <p className="text-center text-sm font-medium">{residentName}</p>

          {/* Actions */}
          {preview ? (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Photo
              </Button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <UserCircle className="mr-2 h-4 w-4" />
                {photoUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {photoUrl && (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleRemove}
                  disabled={removing}
                >
                  {removing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Remove Photo
                </Button>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Supported formats: JPEG, PNG, WebP
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
