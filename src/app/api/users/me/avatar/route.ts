import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  avatarUrl: z.string().url(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid avatarUrl" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: parsed.data.avatarUrl },
  })

  return NextResponse.json({ avatarUrl: parsed.data.avatarUrl })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: null },
  })

  return new NextResponse(null, { status: 204 })
}
