import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1),
  type: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "STANDDOWN", "DRILL", "ENDED"]).default("ACTIVE"),
  startedAt: z.string().min(1),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const where = status
    ? { status: status as "ACTIVE" | "STANDDOWN" | "DRILL" | "ENDED" }
    : undefined

  const events = await prisma.disasterEvent.findMany({
    where,
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      startedAt: true,
      endedAt: true,
      notes: true,
      createdAt: true,
      _count: { select: { missingReports: true } },
    },
  })

  const list = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    status: e.status,
    startedAt: e.startedAt.toISOString(),
    endedAt: e.endedAt?.toISOString() ?? null,
    notes: e.notes,
    createdAt: e.createdAt.toISOString(),
    missingCount: e._count.missingReports,
  }))

  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const startedAt = new Date(parsed.data.startedAt)

  const event = await prisma.disasterEvent.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type ?? null,
      status: parsed.data.status,
      startedAt,
      notes: parsed.data.notes ?? null,
    },
  })

  return NextResponse.json(
    {
      id: event.id,
      title: event.title,
      type: event.type,
      status: event.status,
      startedAt: event.startedAt.toISOString(),
      endedAt: event.endedAt?.toISOString() ?? null,
      notes: event.notes,
      createdAt: event.createdAt.toISOString(),
    },
    { status: 201 }
  )
}
