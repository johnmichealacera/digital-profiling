import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  const fields = [
    "firstName", "middleName", "lastName", "suffix",
    "position", "committee", "contactNo", "isIncumbent",
  ]
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f]
  }
  if (body.termStart) updateData.termStart = new Date(body.termStart)
  if (body.termEnd) updateData.termEnd = new Date(body.termEnd)

  const official = await prisma.barangayOfficial.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(official)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.barangayOfficial.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
