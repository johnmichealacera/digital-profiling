import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  narrative: z.string().min(1),
  progressPercent: z.coerce.number().min(0).max(100).optional().nullable(),
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
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const projectUpdate = await prisma.projectUpdate.create({
    data: {
      projectId: id,
      narrative: parsed.data.narrative,
      progressPercent: parsed.data.progressPercent,
    },
  })

  // Update project progress if provided
  if (parsed.data.progressPercent != null) {
    await prisma.project.update({
      where: { id },
      data: { progressPercent: parsed.data.progressPercent },
    })
  }

  return NextResponse.json(projectUpdate, { status: 201 })
}
