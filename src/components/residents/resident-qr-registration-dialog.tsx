"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Copy, Loader2, Printer, QrCode } from "lucide-react"
import { toast } from "sonner"

type BarangayOption = {
  id: string
  name: string
  municipalityName: string
  province: string
}

type Props = {
  barangays: BarangayOption[]
}

export function ResidentQrRegistrationDialog({ barangays }: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [selectedBarangayId, setSelectedBarangayId] = useState("")

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
  const needsBarangaySelection =
    isSuperAdmin ||
    barangays.length > 1 ||
    (!session?.user?.barangayId && barangays.length > 0)

  const activeBarangayId = needsBarangaySelection
    ? selectedBarangayId
    : barangays[0]?.id ?? session?.user?.barangayId ?? ""

  const activeBarangay = barangays.find((b) => b.id === activeBarangayId)

  const registrationUrl = useMemo(() => {
    if (!activeBarangayId || typeof window === "undefined") return ""
    return `${window.location.origin}/register/${activeBarangayId}`
  }, [activeBarangayId, open])

  useEffect(() => {
    if (!open) return
    if (needsBarangaySelection && !selectedBarangayId && barangays.length === 1) {
      setSelectedBarangayId(barangays[0]!.id)
    } else if (
      !needsBarangaySelection &&
      barangays.length === 1 &&
      !selectedBarangayId
    ) {
      setSelectedBarangayId(barangays[0]!.id)
    } else if (session?.user?.barangayId && !selectedBarangayId) {
      setSelectedBarangayId(session.user.barangayId)
    }
  }, [open, needsBarangaySelection, barangays, selectedBarangayId, session])

  useEffect(() => {
    if (!open || !registrationUrl) {
      setQrDataUrl(null)
      return
    }

    let cancelled = false
    setGenerating(true)
    QRCode.toDataURL(registrationUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to generate QR code")
      })
      .finally(() => {
        if (!cancelled) setGenerating(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, registrationUrl])

  async function copyLink() {
    if (!registrationUrl) return
    try {
      await navigator.clipboard.writeText(registrationUrl)
      toast.success("Registration link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  function printQr() {
    if (!qrDataUrl || !activeBarangay) return
    const printWindow = window.open("", "_blank", "noopener,noreferrer")
    if (!printWindow) {
      toast.error("Pop-up blocked. Allow pop-ups to print.")
      return
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resident QR Registration — Brgy. ${activeBarangay.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
            p { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0; }
            img { margin: 1.5rem auto; display: block; }
            .url { font-size: 0.75rem; word-break: break-all; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <h1>Barangay Resident Registration</h1>
          <p>Brgy. ${activeBarangay.name}</p>
          <p>${activeBarangay.municipalityName}, ${activeBarangay.province}</p>
          <img src="${qrDataUrl}" width="280" height="280" alt="QR code" />
          <p>Scan to register online</p>
          <p class="url">${registrationUrl}</p>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          QR Registration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resident QR Registration</DialogTitle>
          <DialogDescription>
            Residents scan this code to open the public registration form for
            your barangay. Staff can review submissions and assign households
            afterward.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {needsBarangaySelection && barangays.length > 1 ? (
            <div className="space-y-2">
              <Label>Barangay</Label>
              <Select
                value={selectedBarangayId}
                onValueChange={setSelectedBarangayId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      Brgy. {b.name} — {b.municipalityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : activeBarangay ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Barangay: </span>
              <span className="font-medium">
                Brgy. {activeBarangay.name}, {activeBarangay.municipalityName}
              </span>
            </p>
          ) : null}

          <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-6">
            {generating || !qrDataUrl ? (
              <div className="flex h-[280px] w-[280px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Resident registration QR code"
                width={280}
                height={280}
                className="rounded-md"
              />
            )}
            {activeBarangay ? (
              <p className="text-muted-foreground text-center text-xs">
                Scan to register at Brgy. {activeBarangay.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Registration link</Label>
            <div className="flex gap-2">
              <Input readOnly value={registrationUrl} className="text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyLink}
                disabled={!registrationUrl}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={printQr}
              disabled={!qrDataUrl}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
