import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canPerformAction } from "@/lib/permissions"
import type { UserRole } from "@/generated/prisma/client"
import { z } from "zod"

const bodySchema = z.object({
  residentId: z.string().min(1),
  relationshipToHead: z.string().optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as UserRole
  if (!canPerformAction(role, "households", "update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: householdId } = await params
  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const household = await prisma.household.findUnique({
    where: { id: householdId },
  })
  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 })
  }

  const resident = await prisma.resident.findUnique({
    where: { id: parsed.data.residentId },
  })
  if (!resident || resident.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Resident not found or inactive" },
      { status: 404 }
    )
  }

  if (resident.householdId === householdId) {
    return NextResponse.json(
      { error: "This resident is already a member of this household" },
      { status: 409 }
    )
  }

  if (resident.householdId != null && resident.householdId !== householdId) {
    return NextResponse.json(
      {
        error:
          "This resident is already assigned to another household. Remove them from that household first.",
      },
      { status: 409 }
    )
  }

  const relationshipToHead =
    parsed.data.relationshipToHead?.trim() || "Member"

  const updated = await prisma.resident.update({
    where: { id: resident.id },
    data: {
      householdId,
      relationshipToHead,
      isHouseholdHead: false,
    },
    include: {
      household: { include: { purok: true } },
    },
  })

  return NextResponse.json(updated)
}
