import { NextRequest, NextResponse } from "next/server"
import type { Session } from "next-auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { z } from "zod"
import type { UserRole } from "@/generated/prisma/client"

const userRoleEnum = z.enum([
  "SUPER_ADMIN",
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
      if (data.barangayId?.trim() || data.municipalityId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Do not set barangay or municipality for Super Admin.",
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
    if (data.accessScope === "barangay") {
      if (!data.barangayId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Select a barangay.",
          path: ["barangayId"],
        })
      }
    }
    if (data.accessScope === "municipality") {
      if (!data.municipalityId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Select a municipality.",
          path: ["municipalityId"],
        })
      }
    }
  })

function assertSuperAdmin(session: Session | null) {
  return session?.user?.role === "SUPER_ADMIN"
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!assertSuperAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
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
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!assertSuperAdmin(session)) {
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

  const {
    email,
    name,
    password,
    role,
    position,
    accessScope,
    barangayId: rawBarangay,
    municipalityId: rawMuni,
  } = parsed.data

  const emailNorm = email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({
    where: { email: emailNorm },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    )
  }

  let barangayId: string | null = null
  let municipalityId: string | null = null

  if (role === "SUPER_ADMIN") {
    barangayId = null
    municipalityId = null
  } else if (accessScope === "barangay") {
    const bid = rawBarangay!.trim()
    const brgy = await prisma.barangay.findUnique({
      where: { id: bid },
      select: { id: true },
    })
    if (!brgy) {
      return NextResponse.json({ error: "Barangay not found." }, { status: 400 })
    }
    barangayId = brgy.id
    municipalityId = null
  } else {
    const mid = rawMuni!.trim()
    const muni = await prisma.municipality.findUnique({
      where: { id: mid },
      select: { id: true },
    })
    if (!muni) {
      return NextResponse.json({ error: "Municipality not found." }, { status: 400 })
    }
    barangayId = null
    municipalityId = muni.id
  }

  const hashedPassword = await hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      name: name.trim(),
      password: hashedPassword,
      role: role as UserRole,
      position: position?.trim() || null,
      barangayId,
      municipalityId,
    },
    select: {
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
    },
  })

  return NextResponse.json(user, { status: 201 })
}
