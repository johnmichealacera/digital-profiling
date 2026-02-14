import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

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
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const officials = await prisma.barangayOfficial.findMany({
    orderBy: [{ isIncumbent: "desc" }, { position: "asc" }, { lastName: "asc" }],
  })

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

  const official = await prisma.barangayOfficial.create({
    data: {
      ...parsed.data,
      termStart: new Date(parsed.data.termStart),
      termEnd: new Date(parsed.data.termEnd),
    },
  })

  return NextResponse.json(official, { status: 201 })
}
