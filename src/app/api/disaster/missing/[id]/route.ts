import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const foundSchema = z.object({
  foundAt: z.string().datetime().optional(),
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
  const body = await req.json().catch(() => ({}))
  const parsed = foundSchema.safeParse(body)

  const foundAt = parsed.success && parsed.data.foundAt
    ? new Date(parsed.data.foundAt)
    : new Date()

  const report = await prisma.missingPersonReport.findUnique({
    where: { id },
  })
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }
  if (report.foundAt) {
    return NextResponse.json(
      { error: "Person already marked as found" },
      { status: 409 }
    )
  }

  const updated = await prisma.missingPersonReport.update({
    where: { id },
    data: { foundAt },
  })

  return NextResponse.json(updated)
}
