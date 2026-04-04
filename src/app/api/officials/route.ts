import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"
import { resolveWriteBarangayId } from "@/lib/resolve-barangay-write"
import { sortOfficialsForScope } from "@/lib/official-rank"

const officialSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1),
  suffix: z.string().optional().nullable(),
  position: z.string().min(1),
  committee: z.string().optional().nullable(),
  termStart: z.string().min(1),
  termEnd: z.string().min(1),
  isIncumbent: z.boolean().default(true),
  contactNo: z.string().optional().nullable(),
  photoUrl: z.string().max(2048).optional().nullable(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const bid = barangayIdFilter(tenantIds)

  const rows = await prisma.barangayOfficial.findMany({
    where: bid ? { barangayId: bid } : {},
    include: {
      barangay: {
        select: { name: true },
      },
    },
    orderBy: [{ isIncumbent: "desc" }, { lastName: "asc" }],
  })

  const officials = sortOfficialsForScope(rows)

  return NextResponse.json(officials)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = officialSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const wr = resolveWriteBarangayId(
    session,
    (body as { barangayId?: string }).barangayId
  )
  if (!wr.ok) return wr.response

  const { photoUrl, ...rest } = parsed.data
  const official = await prisma.barangayOfficial.create({
    data: {
      ...rest,
      barangayId: wr.barangayId,
      termStart: new Date(parsed.data.termStart),
      termEnd: new Date(parsed.data.termEnd),
      photoUrl: photoUrl?.trim() || null,
    },
  })

  return NextResponse.json(official, { status: 201 })
}
