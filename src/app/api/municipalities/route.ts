import { NextRequest, NextResponse } from "next/server"
import type { Session } from "next-auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function requireSuperAdmin(session: Session | null) {
  return session?.user?.role === "SUPER_ADMIN"
}

const createMunicipalitySchema = z.object({
  name: z.string().min(1).max(200).trim(),
  province: z.string().min(1).max(200).trim(),
  region: z.string().max(200).trim().optional().nullable(),
})

/** Super admin: list municipalities for assigning municipal-scoped users. */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!requireSuperAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const rows = await prisma.municipality.findMany({
    orderBy: [{ name: "asc" }, { province: "asc" }],
    select: {
      id: true,
      name: true,
      province: true,
      region: true,
    },
  })

  return NextResponse.json(rows)
}

/** Super admin: create a municipality (unique name + province). */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!requireSuperAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createMunicipalitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, province, region } = parsed.data

  const existing = await prisma.municipality.findUnique({
    where: {
      name_province: { name, province },
    },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json(
      { error: "A municipality with this name and province already exists." },
      { status: 409 }
    )
  }

  const muni = await prisma.municipality.create({
    data: {
      name,
      province,
      region: region?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      province: true,
      region: true,
    },
  })

  return NextResponse.json(muni, { status: 201 })
}
