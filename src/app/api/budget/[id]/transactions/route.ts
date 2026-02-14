import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "PERSONAL_SERVICES",
    "MAINTENANCE_AND_OTHER_OPERATING_EXPENSES",
    "CAPITAL_OUTLAY",
    "TRUST_FUND",
  ]),
  particulars: z.string().min(1),
  amount: z.coerce.number().min(0),
  officialReceipt: z.string().optional().nullable(),
  transactionDate: z.string().min(1),
  remarks: z.string().optional().nullable(),
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
  const parsed = transactionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const transaction = await prisma.budgetTransaction.create({
    data: {
      budgetYearId: id,
      ...parsed.data,
      transactionDate: new Date(parsed.data.transactionDate),
      encodedById: session.user.id,
    },
  })

  return NextResponse.json(transaction, { status: 201 })
}
