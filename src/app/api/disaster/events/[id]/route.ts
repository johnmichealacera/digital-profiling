import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "STANDDOWN", "DRILL", "ENDED"]).optional(),
  startedAt: z.string().min(1).optional(),
  endedAt: z.union([z.string(), z.null(), z.literal("")]).optional(),
  notes: z.string().optional().nullable(),
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

  const existing = await prisma.disasterEvent.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  const data: {
    title?: string
    type?: string | null
    status?: "ACTIVE" | "STANDDOWN" | "DRILL" | "ENDED"
    startedAt?: Date
    endedAt?: Date | null
    notes?: string | null
  } = {}

  if (parsed.data.title != null) data.title = parsed.data.title
  if (parsed.data.type !== undefined) data.type = parsed.data.type
  if (parsed.data.status != null) data.status = parsed.data.status
  if (parsed.data.startedAt != null) data.startedAt = new Date(parsed.data.startedAt)
  if (parsed.data.endedAt !== undefined) {
    data.endedAt =
      parsed.data.endedAt === "" || parsed.data.endedAt === null
        ? null
        : new Date(parsed.data.endedAt as string)
  }
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes

  const updated = await prisma.disasterEvent.update({
    where: { id },
    data,
  })

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    type: updated.type,
    status: updated.status,
    startedAt: updated.startedAt.toISOString(),
    endedAt: updated.endedAt?.toISOString() ?? null,
    notes: updated.notes,
    updatedAt: updated.updatedAt.toISOString(),
  })
}
