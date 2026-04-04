import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { assertOfficialInTenant, getTenantBarangayIds } from "@/lib/tenant"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertOfficialInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Official not found" }, { status: 404 })
  }

  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  const fields = [
    "firstName", "middleName", "lastName", "suffix",
    "position", "committee", "contactNo", "isIncumbent", "photoUrl",
  ]
  for (const f of fields) {
    if (body[f] !== undefined) {
      if (f === "photoUrl") {
        const u = body[f]
        updateData[f] =
          typeof u === "string" && u.trim() !== "" ? u.trim() : null
      } else {
        updateData[f] = body[f]
      }
    }
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

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertOfficialInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Official not found" }, { status: 404 })
  }

  await prisma.barangayOfficial.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
