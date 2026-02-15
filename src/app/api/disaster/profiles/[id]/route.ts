import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  evacuationCenterId: z.string().nullable(),
  evacuatedAt: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const profile = await prisma.householdDisasterProfile.findUnique({
    where: { id },
  })
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const evacuatedAt = parsed.data.evacuationCenterId
    ? parsed.data.evacuatedAt
      ? new Date(parsed.data.evacuatedAt)
      : new Date()
    : null

  const updated = await prisma.householdDisasterProfile.update({
    where: { id },
    data: {
      evacuationCenterId: parsed.data.evacuationCenterId,
      evacuatedAt,
    },
  })

  return NextResponse.json(updated)
}
