import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { z } from "zod"
import type { UserRole } from "@/generated/prisma/client"

function callerRole(session: Awaited<ReturnType<typeof getServerSession>>): UserRole | null {
  return (session?.user?.role as UserRole) ?? null
}

const STAFF_ROLES: UserRole[] = ["CAPTAIN", "SECRETARY", "TREASURER", "KAGAWAD", "SK_CHAIRMAN"]

const patchSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.enum(["SUPER_ADMIN", "BARANGAY_ADMIN", "CAPTAIN", "SECRETARY", "TREASURER", "KAGAWAD", "SK_CHAIRMAN"]),
  position: z.string().max(200).optional().nullable(),
  isActive: z.boolean(),
  newPassword: z.string().min(8).max(128).optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const role = callerRole(session)

  if (role !== "SUPER_ADMIN" && role !== "BARANGAY_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, barangayId: true },
  })

  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  // BARANGAY_ADMIN: can only edit staff in their own barangay
  if (role === "BARANGAY_ADMIN") {
    const adminBarangayId = session!.user.barangayId
    if (!STAFF_ROLES.includes(target.role) || target.barangayId !== adminBarangayId) {
      return NextResponse.json(
        { error: "You can only edit staff accounts in your barangay." },
        { status: 403 }
      )
    }
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, role: newRole, position, isActive, newPassword } = parsed.data

  // BARANGAY_ADMIN cannot escalate roles beyond staff
  if (role === "BARANGAY_ADMIN" && !STAFF_ROLES.includes(newRole as UserRole)) {
    return NextResponse.json({ error: "You cannot assign this role." }, { status: 403 })
  }

  // Prevent deactivating / demoting the last SUPER_ADMIN
  if (target.role === "SUPER_ADMIN" && (newRole !== "SUPER_ADMIN" || !isActive)) {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } })
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot demote or deactivate the last active Super Admin." },
        { status: 400 }
      )
    }
  }

  const updateData: Parameters<typeof prisma.user.update>[0]["data"] = {
    name: name.trim(),
    role: newRole as UserRole,
    position: position?.trim() || null,
    isActive,
  }

  if (newPassword) {
    updateData.password = await hash(newPassword, 12)
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, role: true, position: true, isActive: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const role = callerRole(session)

  if (role !== "SUPER_ADMIN" && role !== "BARANGAY_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  if (id === session!.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, barangayId: true },
  })

  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  // BARANGAY_ADMIN: can only delete staff in their own barangay
  if (role === "BARANGAY_ADMIN") {
    const adminBarangayId = session!.user.barangayId
    const staffRoles: UserRole[] = ["CAPTAIN", "SECRETARY", "TREASURER", "KAGAWAD", "SK_CHAIRMAN"]
    if (!staffRoles.includes(target.role) || target.barangayId !== adminBarangayId) {
      return NextResponse.json(
        { error: "You can only delete staff accounts in your barangay." },
        { status: 403 }
      )
    }
  }

  // Prevent deleting the last SUPER_ADMIN
  if (target.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } })
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last Super Admin account." },
        { status: 400 }
      )
    }
  }

  // Nullify optional FK references before deleting to avoid constraint errors
  await prisma.$transaction([
    prisma.documentRequest.updateMany({
      where: { encodedById: id },
      data: { encodedById: null },
    }),
    prisma.documentRequest.updateMany({
      where: { issuedById: id },
      data: { issuedById: null },
    }),
    prisma.blotter.updateMany({
      where: { filedById: id },
      data: { filedById: null },
    }),
    prisma.budgetTransaction.updateMany({
      where: { encodedById: id },
      data: { encodedById: null },
    }),
    prisma.user.delete({ where: { id } }),
  ])

  return new NextResponse(null, { status: 204 })
}
