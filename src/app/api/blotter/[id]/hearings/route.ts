import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const hearingSchema = z.object({
  hearingDate: z.string().min(1),
  venue: z.string().default("Barangay Hall"),
  notes: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = hearingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const hearing = await prisma.blotterHearing.create({
    data: {
      blotterId: id,
      hearingDate: new Date(parsed.data.hearingDate),
      venue: parsed.data.venue,
      notes: parsed.data.notes,
      outcome: parsed.data.outcome,
    },
  })

  // Update blotter status to under mediation if still filed
  await prisma.blotter.update({
    where: { id, status: "FILED" },
    data: { status: "UNDER_MEDIATION" },
  })

  return NextResponse.json(hearing, { status: 201 })
}
