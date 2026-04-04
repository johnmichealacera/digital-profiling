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
import { Loader2, UserPlus } from "lucide-react"
import { USER_ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/generated/prisma/client"

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
  barangay: {
    name: string
    municipality: { name: string; province: string }
  } | null
  municipalityScope: { name: string; province: string } | null
}

const STAFF_ROLES: UserRole[] = [
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "KAGAWAD",
  "SK_CHAIRMAN",
]

function scopeLabel(u: UserRow): string {
  if (u.role === "SUPER_ADMIN") return "System-wide"
  if (u.barangay) {
    return `${u.barangay.name} (${u.barangay.municipality.name})`
  }
  if (u.municipalityScope) {
    return `Municipality: ${u.municipalityScope.name}, ${u.municipalityScope.province}`
  }
  return "—"
}

export function UserManagementClient() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [barangays, setBarangays] = useState<BarangayOption[]>([])
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("SECRETARY")
  const [position, setPosition] = useState("")
  const [accessScope, setAccessScope] = useState<"global" | "barangay" | "municipality">(
    "barangay"
  )
  const [barangayId, setBarangayId] = useState("")
  const [municipalityId, setMunicipalityId] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, bRes, mRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/barangays"),
        fetch("/api/municipalities"),
      ])
      if (uRes.ok) setUsers(await uRes.json())
      else toast.error("Could not load users")
      if (bRes.ok) setBarangays(await bRes.json())
      else toast.error("Could not load barangays")
      if (mRes.ok) setMunicipalities(await mRes.json())
      else toast.error("Could not load municipalities")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      setAccessScope("global")
    }
  }, [role])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        password,
        role,
        position: position.trim() || null,
        accessScope: role === "SUPER_ADMIN" ? "global" : accessScope,
        barangayId: accessScope === "barangay" ? barangayId : null,
        municipalityId: accessScope === "municipality" ? municipalityId : null,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)
    if (!res.ok) {
      toast.error(
        typeof data.error === "string"
          ? data.error
          : "Could not create user. Check the form."
      )
      return
    }
    toast.success(`User ${data.email} created`)
    setEmail("")
    setName("")
    setPassword("")
    setPosition("")
    setBarangayId("")
    setMunicipalityId("")
    load()
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            New account
          </CardTitle>
          <CardDescription>
            Barangay staff are limited to one barangay. Municipal access includes
            all barangays under that municipality.
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
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">
                    {USER_ROLE_LABELS.SUPER_ADMIN}
                  </SelectItem>
                  {STAFF_ROLES.map((r) => (
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

            {role !== "SUPER_ADMIN" && (
              <>
                <div className="space-y-2">
                  <Label>Access</Label>
                  <Select
                    value={accessScope}
                    onValueChange={(v) =>
                      setAccessScope(v as "barangay" | "municipality")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barangay">Single barangay</SelectItem>
                      <SelectItem value="municipality">
                        Whole municipality (all barangays)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {accessScope === "barangay" && (
                  <div className="space-y-2">
                    <Label>Barangay</Label>
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
                    <Label>Municipality</Label>
                    <Select
                      value={municipalityId}
                      onValueChange={setMunicipalityId}
                    >
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

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.email}
                    </TableCell>
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
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
