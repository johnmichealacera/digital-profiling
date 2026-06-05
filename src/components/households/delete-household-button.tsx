"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

export function DeleteHouseholdButton({ householdId }: { householdId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/households/${householdId}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Failed to delete household")
      setOpen(false)
      return
    }
    toast.success("Household deleted")
    router.push("/households")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete household</DialogTitle>
          <DialogDescription>
            This will permanently delete the household record. Remove all active
            members first. Any disaster risk profile for this household will also
            be removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete household
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
