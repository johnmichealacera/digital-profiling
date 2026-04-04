import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTenantBarangayIds } from "@/lib/tenant"
import { z } from "zod"

const createBarangaySchema = z.object({
  municipalityId: z.string().min(1),
  name: z.string().min(1).max(200).trim(),
  /** Defaults to the municipality's province when omitted. */
  province: z.string().min(1).max(200).trim().optional(),
  zipCode: z.string().max(32).trim().optional().nullable(),
  region: z.string().max(200).trim().optional().nullable(),
  mapCenterLat: z.coerce.number().finite().optional().nullable(),
  mapCenterLng: z.coerce.number().finite().optional().nullable(),
  mapDefaultZoom: z.coerce.number().int().min(1).max(22).optional(),
  code: z.string().max(16).trim().optional().nullable(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)

  if (tenantIds === null) {
    const rows = await prisma.barangay.findMany({
      orderBy: { name: "asc" },
      include: { municipality: true },
    })
    return NextResponse.json(rows)
  }

  if (tenantIds.length === 0) {
    return NextResponse.json([])
  }

  const rows = await prisma.barangay.findMany({
    where: { id: { in: tenantIds } },
    orderBy: { name: "asc" },
    include: { municipality: true },
  })
  return NextResponse.json(rows)
}

/**
 * Super admin: create a barangay under a municipality and a default "Purok 1"
 * so households can be registered immediately.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createBarangaySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const muni = await prisma.municipality.findUnique({
    where: { id: parsed.data.municipalityId },
    select: { id: true, name: true, province: true, region: true },
  })
  if (!muni) {
    return NextResponse.json({ error: "Municipality not found." }, { status: 400 })
  }

  const province = parsed.data.province?.trim() || muni.province
  const region =
    parsed.data.region?.trim() || muni.region || null
  const name = parsed.data.name

  const duplicate = await prisma.barangay.findUnique({
    where: {
      municipalityId_name: {
        municipalityId: muni.id,
        name,
      },
    },
    select: { id: true },
  })
  if (duplicate) {
    return NextResponse.json(
      { error: "A barangay with this name already exists in that municipality." },
      { status: 409 }
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const brgy = await tx.barangay.create({
      data: {
        name,
        municipalityId: muni.id,
        province,
        zipCode: parsed.data.zipCode?.trim() || null,
        region,
        mapCenterLat: parsed.data.mapCenterLat ?? null,
        mapCenterLng: parsed.data.mapCenterLng ?? null,
        mapDefaultZoom: parsed.data.mapDefaultZoom ?? 15,
        code: parsed.data.code?.trim() || null,
      },
      include: { municipality: true },
    })

    await tx.purok.create({
      data: {
        barangayId: brgy.id,
        name: "Purok 1",
        description: "Default purok — add or rename puroks as needed.",
        order: 0,
      },
    })

    return brgy
  })

  return NextResponse.json(result, { status: 201 })
}
