import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const allocationSchema = z.object({
  category: z.enum([
    "PERSONAL_SERVICES",
    "MAINTENANCE_AND_OTHER_OPERATING_EXPENSES",
    "CAPITAL_OUTLAY",
    "TRUST_FUND",
  ]),
  particulars: z.string().min(1),
  allocatedAmount: z.coerce.number().min(0),
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
  const parsed = allocationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const allocation = await prisma.budgetAllocation.create({
    data: {
      budgetYearId: id,
      ...parsed.data,
    },
  })

  return NextResponse.json(allocation, { status: 201 })
}
