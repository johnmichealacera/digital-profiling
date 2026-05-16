"use client"

import { useCallback, useEffect, useState } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Pencil, Trash2, UserPlus } from "lucide-react"
import { USER_ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/generated/prisma/client"
import { useSession } from "next-auth/react"

type BarangayOption = {
  id: string
  name: string
  municipality: { name: string; province: string }
}

type MunicipalityOption = {
  id: string
  name: string
  province: string
}

type UserRow = {
  id: string
  email: string
  name: string
  role: UserRole
  position: string | null
  isActive: boolean
  barangayId: string | null
  municipalityId: string | null
  createdAt: string
  barangay: { name: string; municipality: { name: string; province: string } } | null
  municipalityScope: { name: string; province: string } | null
}

// Roles a SUPER_ADMIN can create
const SUPER_ADMIN_ROLES: UserRole[] = [
  "BARANGAY_ADMIN",
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "KAGAWAD",
  "SK_CHAIRMAN",
]

// Roles a BARANGAY_ADMIN can create (no admin-level roles)
const STAFF_ROLES: UserRole[] = [
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "KAGAWAD",
  "SK_CHAIRMAN",
]

function scopeLabel(u: UserRow): string {
  if (u.role === "SUPER_ADMIN") return "System-wide"
  if (u.barangay) return `${u.barangay.name} (${u.barangay.municipality.name})`
  if (u.municipalityScope) return `Municipality: ${u.municipalityScope.name}, ${u.municipalityScope.province}`
  return "—"
}

interface Props {
  callerRole: "SUPER_ADMIN" | "BARANGAY_ADMIN"
  callerBarangayId: string | null
}

export function UserManagementClient({ callerRole, callerBarangayId }: Props) {
  const isSuperAdmin = callerRole === "SUPER_ADMIN"
  const { data: session } = useSession()

  const [users, setUsers] = useState<UserRow[]>([])
  const [barangays, setBarangays] = useState<BarangayOption[]>([])
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [editTarget, setEditTarget] = useState<UserRow | null>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState<UserRole>("SECRETARY")
  const [editPosition, setEditPosition] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)
  const [editPassword, setEditPassword] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>(isSuperAdmin ? "BARANGAY_ADMIN" : "SECRETARY")
  const [position, setPosition] = useState("")
  const [accessScope, setAccessScope] = useState<"global" | "barangay" | "municipality">("barangay")
  const [barangayId, setBarangayId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")

  const availableRoles = isSuperAdmin ? SUPER_ADMIN_ROLES : STAFF_ROLES

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const fetches: Promise<Response>[] = [fetch("/api/users"), fetch("/api/barangays")]
      if (isSuperAdmin) fetches.push(fetch("/api/municipalities"))

      const [uRes, bRes, mRes] = await Promise.all(fetches)
      if (uRes.ok) setUsers(await uRes.json())
      else toast.error("Could not load users")
      if (bRes.ok) setBarangays(await bRes.json())
      if (mRes?.ok) setMunicipalities(await mRes.json())
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin])

  useEffect(() => { load() }, [load])

  // When role changes to SUPER_ADMIN (only possible for isSuperAdmin callers), force global scope
  useEffect(() => {
    if (role === "SUPER_ADMIN") setAccessScope("global")
  }, [role])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    // Client-side guard: barangay is required for any non-global role
    if (isSuperAdmin && role !== "SUPER_ADMIN" && accessScope === "barangay" && !barangayId) {
      toast.error("Please select a barangay for this account.")
      return
    }
    if (isSuperAdmin && role !== "SUPER_ADMIN" && accessScope === "municipality" && !municipalityId) {
      toast.error("Please select a municipality for this account.")
      return
    }

    setSubmitting(true)

    const body = isSuperAdmin
      ? {
          email,
          name,
          password,
          role,
          position: position.trim() || null,
          accessScope: role === "SUPER_ADMIN" ? "global" : accessScope,
          barangayId: accessScope === "barangay" ? barangayId : null,
          municipalityId: accessScope === "municipality" ? municipalityId : null,
        }
      : {
          // BARANGAY_ADMIN: role + their barangay auto-assigned on the server
          email,
          name,
          password,
          role,
          position: position.trim() || null,
          accessScope: "barangay",
          barangayId: callerBarangayId,
          municipalityId: null,
        }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)

    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not create user. Check the form.")
      return
    }

    toast.success(`Account for ${data.email} created`)
    setEmail("")
    setName("")
    setPassword("")
    setPosition("")
    setBarangayId("")
    setMunicipalityId("")
    setRole(isSuperAdmin ? "BARANGAY_ADMIN" : "SECRETARY")
    load()
  }

  function openEdit(u: UserRow) {
    setEditTarget(u)
    setEditName(u.name)
    setEditRole(u.role)
    setEditPosition(u.position ?? "")
    setEditIsActive(u.isActive)
    setEditPassword("")
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setEditSubmitting(true)

    const res = await fetch(`/api/users/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        role: editRole,
        position: editPosition.trim() || null,
        isActive: editIsActive,
        newPassword: editPassword || null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    setEditSubmitting(false)

    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not update account.")
      return
    }

    toast.success(`Account for ${data.email} updated.`)
    setEditTarget(null)
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false)

    if (res.status === 204) {
      toast.success(`Account for ${deleteTarget.email} deleted.`)
      setDeleteTarget(null)
      load()
      return
    }

    const data = await res.json().catch(() => ({}))
    toast.error(typeof data.error === "string" ? data.error : "Could not delete account.")
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* ── Create form ── */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            New account
          </CardTitle>
          <CardDescription>
            {isSuperAdmin
              ? "Barangay staff are limited to one barangay. Municipal access includes all barangays under that municipality."
              : "Create staff accounts for your barangay. All accounts will be scoped to your barangay."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="um-email">Email</Label>
              <Input
                id="um-email"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="um-name">Full name</Label>
              <Input
                id="um-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="um-password">Temporary password (min 8 characters)</Label>
              <Input
                id="um-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {USER_ROLE_LABELS[r] ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="um-position">Position (optional)</Label>
              <Input
                id="um-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Barangay Secretary"
              />
            </div>

            {/* Access scope — only shown to SUPER_ADMIN for non-superadmin roles */}
            {isSuperAdmin && role !== "SUPER_ADMIN" && (
              <>
                <div className="space-y-2">
                  <Label>Access</Label>
                  <Select
                    value={accessScope}
                    onValueChange={(v) => setAccessScope(v as "barangay" | "municipality")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barangay">Single barangay</SelectItem>
                      <SelectItem value="municipality">Whole municipality (all barangays)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {accessScope === "barangay" && (
                  <div className="space-y-2">
                    <Label>
                      Barangay <span className="text-destructive">*</span>
                    </Label>
                    <Select value={barangayId} onValueChange={setBarangayId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select barangay" />
                      </SelectTrigger>
                      <SelectContent>
                        {barangays.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name} — {b.municipality.name}, {b.municipality.province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {accessScope === "municipality" && (
                  <div className="space-y-2">
                    <Label>
                      Municipality <span className="text-destructive">*</span>
                    </Label>
                    <Select value={municipalityId} onValueChange={setMunicipalityId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select municipality" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}, {m.province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* For BARANGAY_ADMIN: show which barangay the account will be created in */}
            {!isSuperAdmin && (
              <p className="text-xs text-muted-foreground">
                This account will be scoped to your barangay.
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Users table ── */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Accounts</CardTitle>
          <CardDescription>{users.length} user(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {USER_ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                      {scopeLabel(u)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "secondary"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {u.id !== session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
            <DialogDescription>
              {editTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full name</Label>
              <Input
                id="edit-name"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(isSuperAdmin ? SUPER_ADMIN_ROLES : STAFF_ROLES).map((r) => (
                    <SelectItem key={r} value={r}>
                      {USER_ROLE_LABELS[r] ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-position">Position (optional)</Label>
              <Input
                id="edit-position"
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value)}
                placeholder="e.g. Barangay Secretary"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editIsActive ? "active" : "inactive"}
                onValueChange={(v) => setEditIsActive(v === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">New password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={editSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This will permanently delete the account for{" "}
              <span className="font-medium">{deleteTarget?.name}</span> ({deleteTarget?.email}).
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
