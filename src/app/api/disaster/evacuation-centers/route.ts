import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const evacuationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  capacity: z.coerce.number().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  contactNo: z.string().optional().nullable(),
  facilities: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = evacuationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const center = await prisma.evacuationCenter.create({
    data: parsed.data,
  })

  return NextResponse.json(center, { status: 201 })
}
