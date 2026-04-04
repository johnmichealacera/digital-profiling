import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveWriteBarangayId } from "@/lib/resolve-barangay-write"
import { z } from "zod"

const evacuationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  capacity: z.coerce.number().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  contactNo: z.string().optional().nullable(),
  facilities: z.array(z.string()).default([]),
  barangayId: z.string().optional().nullable(),
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

  const wr = resolveWriteBarangayId(session, parsed.data.barangayId)
  if (!wr.ok) return wr.response

  const { barangayId: _fromBody, ...fields } = parsed.data
  void _fromBody
  const center = await prisma.evacuationCenter.create({
    data: { ...fields, barangayId: wr.barangayId },
  })

  return NextResponse.json(center, { status: 201 })
}
