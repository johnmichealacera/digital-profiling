import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTenantBarangayIds } from "@/lib/tenant"
import { z } from "zod"
import { Prisma } from "@/generated/prisma/client"

const createPurokSchema = z.object({
  barangayId: z.string().min(1),
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(500).trim().optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
})

const CAN_CREATE = new Set(["SUPER_ADMIN", "CAPTAIN", "SECRETARY"])

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!CAN_CREATE.has(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = createPurokSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { barangayId, name, description } = parsed.data
  const tenantIds = await getTenantBarangayIds(session)

  if (tenantIds !== null && !tenantIds.includes(barangayId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const barangay = await prisma.barangay.findUnique({
    where: { id: barangayId },
    select: { id: true },
  })
  if (!barangay) {
    return NextResponse.json({ error: "Barangay not found" }, { status: 404 })
  }

  let order = parsed.data.order
  if (order === undefined) {
    const agg = await prisma.purok.aggregate({
      where: { barangayId },
      _max: { order: true },
    })
    order = (agg._max.order ?? -1) + 1
  }

  try {
    const purok = await prisma.purok.create({
      data: {
        barangayId,
        name,
        description: description?.trim() || null,
        order,
      },
    })
    return NextResponse.json(purok, { status: 201 })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A purok with this name already exists in this barangay." },
        { status: 409 }
      )
    }
    throw e
  }
}
