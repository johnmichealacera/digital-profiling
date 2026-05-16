import { NextRequest, NextResponse } from "next/server"
import type { Session } from "next-auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { z } from "zod"
import type { UserRole } from "@/generated/prisma/client"

const STAFF_ROLES = [
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "KAGAWAD",
  "SK_CHAIRMAN",
] as const

const userRoleEnum = z.enum([
  "SUPER_ADMIN",
  "BARANGAY_ADMIN",
  "CAPTAIN",
  "SECRETARY",
  "TREASURER",
  "KAGAWAD",
  "SK_CHAIRMAN",
])

const createUserSchema = z
  .object({
    email: z.string().email().max(320),
    name: z.string().min(1).max(200),
    password: z.string().min(8).max(128),
    role: userRoleEnum,
    position: z.string().max(200).optional().nullable(),
    accessScope: z.enum(["global", "barangay", "municipality"]),
    barangayId: z.string().optional().nullable(),
    municipalityId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "SUPER_ADMIN") {
      if (data.accessScope !== "global") {
        ctx.addIssue({
          code: "custom",
          message: "Super Admin accounts must use system-wide (global) access.",
          path: ["accessScope"],
        })
      }
      return
    }
    if (data.accessScope === "global") {
      ctx.addIssue({
        code: "custom",
        message: "Choose barangay or municipality access for this role.",
        path: ["accessScope"],
      })
      return
    }
    if (data.accessScope === "barangay" && !data.barangayId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Select a barangay.",
        path: ["barangayId"],
      })
    }
    if (data.accessScope === "municipality" && !data.municipalityId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Select a municipality.",
        path: ["municipalityId"],
      })
    }
  })

function getCallerRole(session: Session | null): UserRole | null {
  return (session?.user?.role as UserRole) ?? null
}

function isSuperAdmin(session: Session | null) {
  return getCallerRole(session) === "SUPER_ADMIN"
}

function isBarangayAdmin(session: Session | null) {
  return getCallerRole(session) === "BARANGAY_ADMIN"
}

function canManageUsers(session: Session | null) {
  return isSuperAdmin(session) || isBarangayAdmin(session)
}

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  position: true,
  isActive: true,
  barangayId: true,
  municipalityId: true,
  createdAt: true,
  barangay: {
    select: {
      name: true,
      municipality: { select: { name: true, province: true } },
    },
  },
  municipalityScope: {
    select: { name: true, province: true },
  },
} as const

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!canManageUsers(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // BARANGAY_ADMIN only sees users scoped to their own barangay
  if (isBarangayAdmin(session)) {
    const barangayId = session!.user.barangayId
    if (!barangayId) {
      return NextResponse.json({ error: "No barangay assigned to this admin." }, { status: 400 })
    }
    const users = await prisma.user.findMany({
      where: { barangayId },
      orderBy: { createdAt: "desc" },
      select: USER_SELECT,
    })
    return NextResponse.json(users)
  }

  // SUPER_ADMIN sees everyone
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: USER_SELECT,
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!canManageUsers(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, name, password, role, position, accessScope, barangayId: rawBarangay, municipalityId: rawMuni } =
    parsed.data

  // BARANGAY_ADMIN restrictions: can only create staff roles, always in their barangay
  if (isBarangayAdmin(session)) {
    const callerBarangayId = session!.user.barangayId
    if (!callerBarangayId) {
      return NextResponse.json({ error: "No barangay assigned to this admin." }, { status: 400 })
    }
    const isStaffRole = (STAFF_ROLES as readonly string[]).includes(role)
    if (!isStaffRole) {
      return NextResponse.json(
        { error: "Barangay administrators can only create staff accounts." },
        { status: 403 }
      )
    }
    // Force the new user into the admin's own barangay regardless of what was submitted
    return await createUser({ email, name, password, role: role as UserRole, position, barangayId: callerBarangayId, municipalityId: null })
  }

  // SUPER_ADMIN: full control
  let barangayId: string | null = null
  let municipalityId: string | null = null

  if (role === "SUPER_ADMIN") {
    barangayId = null
    municipalityId = null
  } else if (accessScope === "barangay") {
    const bid = rawBarangay!.trim()
    const brgy = await prisma.barangay.findUnique({ where: { id: bid }, select: { id: true } })
    if (!brgy) return NextResponse.json({ error: "Barangay not found." }, { status: 400 })
    barangayId = brgy.id
  } else {
    const mid = rawMuni!.trim()
    const muni = await prisma.municipality.findUnique({ where: { id: mid }, select: { id: true } })
    if (!muni) return NextResponse.json({ error: "Municipality not found." }, { status: 400 })
    municipalityId = muni.id
  }

  return await createUser({ email, name, password, role: role as UserRole, position, barangayId, municipalityId })
}

async function createUser(data: {
  email: string
  name: string
  password: string
  role: UserRole
  position?: string | null
  barangayId: string | null
  municipalityId: string | null
}) {
  const emailNorm = data.email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: emailNorm }, select: { id: true } })
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
  }

  const hashedPassword = await hash(data.password, 12)
  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      name: data.name.trim(),
      password: hashedPassword,
      role: data.role,
      position: data.position?.trim() || null,
      barangayId: data.barangayId,
      municipalityId: data.municipalityId,
    },
    select: USER_SELECT,
  })

  return NextResponse.json(user, { status: 201 })
}
