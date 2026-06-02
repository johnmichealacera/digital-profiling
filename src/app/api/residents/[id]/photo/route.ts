import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assertResidentInTenant, getTenantBarangayIds } from "@/lib/tenant"
import { z } from "zod"

const bodySchema = z.object({
  photoUrl: z.string().url(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertResidentInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid photoUrl" }, { status: 400 })
  }

  await prisma.resident.update({
    where: { id },
    data: { photoUrl: parsed.data.photoUrl },
  })

  return NextResponse.json({ photoUrl: parsed.data.photoUrl })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantIds = await getTenantBarangayIds(session)
  const { id } = await params

  if (!(await assertResidentInTenant(id, tenantIds))) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 })
  }

  await prisma.resident.update({
    where: { id },
    data: { photoUrl: null },
  })

  return new NextResponse(null, { status: 204 })
}
