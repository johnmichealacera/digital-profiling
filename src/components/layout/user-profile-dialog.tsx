"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Upload, UserCircle } from "lucide-react"
import { USER_ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/generated/prisma/client"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name: string
    email: string
    role: string
    position?: string | null
  }
  avatarUrl: string | null
  initials: string
  onAvatarChange: (url: string | null) => void
}

export function UserProfileDialog({
  open,
  onOpenChange,
  user,
  avatarUrl,
  initials,
  onAvatarChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
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

      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to save avatar")
        return
      }
      toast.success("Profile picture updated")
      onAvatarChange(url)
      setPreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    const res = await fetch("/api/users/me/avatar", { method: "DELETE" })
    setRemoving(false)
    if (!res.ok) {
      toast.error("Failed to remove profile picture")
      return
    }
    toast.success("Profile picture removed")
    onAvatarChange(null)
  }

  const displayAvatar = preview ?? avatarUrl
  const roleLabel = USER_ROLE_LABELS[user.role as UserRole] ?? user.role

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); onOpenChange(o) }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-2 ring-border">
              {displayAvatar && (
                <AvatarImage
                  src={displayAvatar}
                  alt={user.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
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

          {/* User info */}
          <div className="text-center space-y-0.5">
            <p className="font-semibold text-base">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
            {user.position && (
              <p className="text-xs text-muted-foreground">{user.position}</p>
            )}
          </div>

          {/* Actions */}
          {preview ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={uploading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Photo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <UserCircle className="mr-2 h-4 w-4" />
                {avatarUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {avatarUrl && !preview && (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleRemove}
                  disabled={removing}
                >
                  {removing
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Trash2 className="mr-2 h-4 w-4" />
                  }
                  Remove Photo
                </Button>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Supported formats: JPEG, PNG, WebP
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
